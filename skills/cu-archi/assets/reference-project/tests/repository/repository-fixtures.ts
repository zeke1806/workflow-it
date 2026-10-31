import type Database from "better-sqlite3";
import type { IdService } from "../../apps/api/src/services/adapters/id/id-types.js";
import {
  createSQLiteRepositoryService,
  migrateSQLiteDatabase,
} from "../../apps/api/src/services/adapters/repository/sqlite-repository-service.js";
import type { TodoRepository } from "../../apps/api/src/services/adapters/repository/repository-types.js";

/** Runs against the Todo repository of a fresh in-memory SQLite double. */
export async function withRepository(
  run: (repository: TodoRepository) => Promise<void>,
): Promise<void> {
  const database = new MemorySQLite();

  try {
    await run(
      createSQLiteRepositoryService(
        createSequentialIdService(),
        migrateSQLiteDatabase(database.client),
      ).todo,
    );
  } finally {
    database.close();
  }
}

/** Deterministic id adapter: "id-1", "id-2"... */
export function createSequentialIdService(prefix = "id"): IdService {
  let count = 0;

  return Object.freeze({
    create: () => {
      count += 1;

      return `${prefix}-${count}`;
    },
  });
}

type Row = {
  readonly id: string;
  readonly title: string;
  readonly completed: number;
  readonly projectId: string | null;
};

export type DatabaseState = {
  version: number;
  table: boolean;
  rows: Map<string, Row>;
  retained?: string;
  projects: Map<string, { readonly id: string; readonly name: string; readonly archived: number }>;
};

/** Scripted driver boundary, not a SQL engine or a proof of SQLite durability. */
export class MemorySQLite {
  readonly client = this as unknown as Database.Database;
  open = true;
  private queryOnly = false;
  private readonly state: DatabaseState;
  private readonly verbose: (sql: string) => void;

  constructor(state = createDatabaseState(), verbose: (sql: string) => void = () => {}) {
    this.state = state;
    this.verbose = verbose;
  }

  close(): void {
    this.open = false;
  }

  pragma(sql: string): number | undefined {
    this.record(sql);
    if (sql === "user_version") {
      return this.state.version;
    }

    if (sql === "user_version = 3") {
      this.state.version = 3;
      return;
    }

    if (sql === "query_only = ON" || sql === "query_only = OFF") {
      this.queryOnly = sql.endsWith("ON");
      return;
    }

    throw new Error(`Unexpected pragma: ${sql}`);
  }

  exec(sql: string): void {
    this.record(sql);
    this.assertWritable();
    if (sql === "CREATE TABLE retained (value TEXT); INSERT INTO retained VALUES ('keep');") {
      this.state.retained = "keep";
      return;
    }

    for (const part of sql.split(";")) {
      const statement = part.trim();

      if (!statement) {
        continue;
      }

      if (statement.startsWith("CREATE TABLE IF NOT EXISTS todos (")) {
        this.state.table = true;
      } else if (statement === "PRAGMA user_version = 1") {
        this.state.version = 1;
      } else if (
        statement.startsWith("CREATE TABLE projects (") ||
        statement.startsWith("ALTER TABLE todos ADD COLUMN projectId")
      ) {
        // This is a scripted boundary; real migration syntax is checked separately.
      } else if (statement === "PRAGMA user_version = 2") {
        this.state.version = 2;
      } else {
        throw new Error(`Unexpected exec: ${statement}`);
      }
    }
  }

  transaction(action: () => void): { immediate: () => void } {
    return {
      immediate: () => {
        const before = {
          ...this.state,
          rows: new Map(this.state.rows),
          projects: new Map(this.state.projects),
        };
        try {
          action();
        } catch (error) {
          Object.assign(this.state, before);
          throw error;
        }
      },
    };
  }

  prepare(raw: string) {
    this.record(raw);
    const sql = raw.replace(/\s+/g, " ").trim();

    return {
      all: (parameters?: { search: string; projectId: string | null }) => {
        if (sql === "SELECT id, name, archived FROM projects ORDER BY rowid") {
          return [...this.state.projects.values()];
        }

        const { search = "", projectId = null } = parameters ?? {};
        if (!sql.startsWith("SELECT id, title, completed, projectId FROM todos WHERE instr")) {
          throw new Error(`Unexpected list: ${sql}`);
        }

        return [...this.state.rows.values()].filter(
          (row) =>
            row.title.toLowerCase().includes(search.toLowerCase()) &&
            (projectId === null || row.projectId === projectId),
        );
      },

      get: (
        parameters?:
          | string
          | {
              id: string;
              title?: string | null;
              completed?: number | null;
              projectId?: string | null;
              setProject?: number;
              name?: string | null;
              archived?: number | null;
            },
      ) => {
        if (typeof parameters === "string") {
          if (sql === "SELECT id, name, archived FROM projects WHERE id = ?") {
            return this.state.projects.get(parameters);
          }

          if (sql === "SELECT id, title, completed, projectId FROM todos WHERE id = ?") {
            return this.state.rows.get(parameters);
          }

          throw new Error(`Unexpected find: ${sql}`);
        }

        if (sql === "SELECT value FROM retained") {
          return { value: this.state.retained };
        }

        if (sql === "SELECT name FROM sqlite_master WHERE name = 'todos'") {
          return this.state.table ? { name: "todos" } : undefined;
        }

        this.assertWritable();
        if (!parameters) {
          throw new Error(`Missing parameters: ${sql}`);
        }

        if (sql.startsWith("INSERT INTO projects")) {
          const row = { id: parameters.id, name: parameters.name!, archived: 0 };
          this.state.projects.set(row.id, row);

          return { ...row };
        }

        if (sql.startsWith("UPDATE projects SET")) {
          const before = this.state.projects.get(parameters.id);
          if (!before) {
            return undefined;
          }

          const row = {
            ...before,
            name: parameters.name ?? before.name,
            archived: parameters.archived ?? before.archived,
          };
          this.state.projects.set(row.id, row);

          return { ...row };
        }

        if (sql.startsWith("INSERT INTO todos (id, title, completed, projectId) VALUES")) {
          const row = {
            id: parameters.id,
            title: parameters.title!,
            completed: parameters.completed!,
            projectId: parameters.projectId ?? null,
          };
          this.state.rows.set(row.id, row);

          return { ...row };
        }

        if (sql.startsWith("UPDATE todos SET title = COALESCE")) {
          const before = this.state.rows.get(parameters.id);
          if (!before) {
            return undefined;
          }

          const row = {
            ...before,
            title: parameters.title ?? before.title,
            completed: parameters.completed ?? before.completed,
            projectId: parameters.setProject ? (parameters.projectId ?? null) : before.projectId,
          };
          this.state.rows.set(row.id, row);

          return { ...row };
        }

        throw new Error(`Unexpected get: ${sql}`);
      },

      run: (id: string) => {
        this.assertWritable();
        if (sql !== "DELETE FROM todos WHERE id = ?") {
          throw new Error(`Unexpected run: ${sql}`);
        }

        return { changes: Number(this.state.rows.delete(id)) };
      },
    };
  }

  private record(sql: string): void {
    if (!this.open) {
      throw new Error("Closed connection");
    }

    this.verbose(sql);
  }

  private assertWritable(): void {
    if (this.queryOnly) {
      throw new Error("Read-only connection");
    }
  }
}

export function createDatabaseState(): DatabaseState {
  return { version: 0, table: false, rows: new Map(), projects: new Map() };
}
