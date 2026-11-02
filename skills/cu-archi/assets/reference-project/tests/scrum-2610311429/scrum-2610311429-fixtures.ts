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
  const database = createMemorySQLite();

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
export function createMemorySQLite(
  sharedState = createDatabaseState(),
  verbose: (sql: string) => void = () => {},
) {
  const state = sharedState;
  let open = true;
  let queryOnly = false;
  const driver = { pragma, exec, transaction, prepare, close };

  return Object.freeze({
    client: driver as unknown as Database.Database,
    close,
    pragma,
    exec,
    prepare,
    isOpen: () => open,
  });

  function close(): void {
    open = false;
  }

  function pragma(sql: string): number | undefined {
    record(sql);
    if (sql === "user_version") {
      return state.version;
    }

    if (sql === "user_version = 3") {
      state.version = 3;
      return;
    }

    if (sql === "query_only = ON" || sql === "query_only = OFF") {
      queryOnly = sql.endsWith("ON");
      return;
    }

    throw new Error(`Unexpected pragma: ${sql}`);
  }

  function exec(sql: string): void {
    record(sql);
    assertWritable();
    if (sql === "CREATE TABLE retained (value TEXT); INSERT INTO retained VALUES ('keep');") {
      state.retained = "keep";
      return;
    }

    for (const part of sql.split(";")) {
      const statement = part.trim();

      if (!statement) {
        continue;
      }

      if (statement.startsWith("CREATE TABLE IF NOT EXISTS todos (")) {
        state.table = true;
      } else if (statement === "PRAGMA user_version = 1") {
        state.version = 1;
      } else if (
        statement.startsWith("CREATE TABLE projects (") ||
        statement.startsWith("ALTER TABLE todos ADD COLUMN projectId")
      ) {
        // This is a scripted boundary; real migration syntax is checked separately.
      } else if (statement === "PRAGMA user_version = 2") {
        state.version = 2;
      } else {
        throw new Error(`Unexpected exec: ${statement}`);
      }
    }
  }

  function transaction(action: () => void): { immediate: () => void } {
    return {
      immediate: () => {
        const before = {
          ...state,
          rows: new Map(state.rows),
          projects: new Map(state.projects),
        };
        try {
          action();
        } catch (error) {
          Object.assign(state, before);
          throw error;
        }
      },
    };
  }

  function prepare(raw: string) {
    record(raw);
    const sql = raw.replace(/\s+/g, " ").trim();

    return {
      all: (parameters?: { search: string; projectId: string | null }) => {
        if (sql === "SELECT id, name, archived FROM projects ORDER BY rowid") {
          return [...state.projects.values()];
        }

        const { search = "", projectId = null } = parameters ?? {};
        if (!sql.startsWith("SELECT id, title, completed, projectId FROM todos WHERE instr")) {
          throw new Error(`Unexpected list: ${sql}`);
        }

        return [...state.rows.values()].filter(
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
            return state.projects.get(parameters);
          }

          if (sql === "SELECT id, title, completed, projectId FROM todos WHERE id = ?") {
            return state.rows.get(parameters);
          }

          throw new Error(`Unexpected find: ${sql}`);
        }

        if (sql === "SELECT value FROM retained") {
          return { value: state.retained };
        }

        if (sql === "SELECT name FROM sqlite_master WHERE name = 'todos'") {
          return state.table ? { name: "todos" } : undefined;
        }

        assertWritable();
        if (!parameters) {
          throw new Error(`Missing parameters: ${sql}`);
        }

        if (sql.startsWith("INSERT INTO projects")) {
          const row = { id: parameters.id, name: parameters.name!, archived: 0 };
          state.projects.set(row.id, row);

          return { ...row };
        }

        if (sql.startsWith("UPDATE projects SET")) {
          const before = state.projects.get(parameters.id);
          if (!before) {
            return undefined;
          }

          const row = {
            ...before,
            name: parameters.name ?? before.name,
            archived: parameters.archived ?? before.archived,
          };
          state.projects.set(row.id, row);

          return { ...row };
        }

        if (sql.startsWith("INSERT INTO todos (id, title, completed, projectId) VALUES")) {
          const row = {
            id: parameters.id,
            title: parameters.title!,
            completed: parameters.completed!,
            projectId: parameters.projectId ?? null,
          };
          state.rows.set(row.id, row);

          return { ...row };
        }

        if (sql.startsWith("UPDATE todos SET title = COALESCE")) {
          const before = state.rows.get(parameters.id);
          if (!before) {
            return undefined;
          }

          const row = {
            ...before,
            title: parameters.title ?? before.title,
            completed: parameters.completed ?? before.completed,
            projectId: parameters.setProject ? (parameters.projectId ?? null) : before.projectId,
          };
          state.rows.set(row.id, row);

          return { ...row };
        }

        throw new Error(`Unexpected get: ${sql}`);
      },

      run: (id: string) => {
        assertWritable();
        if (sql !== "DELETE FROM todos WHERE id = ?") {
          throw new Error(`Unexpected run: ${sql}`);
        }

        return { changes: Number(state.rows.delete(id)) };
      },
    };
  }

  function record(sql: string): void {
    if (!open) {
      throw new Error("Closed connection");
    }

    verbose(sql);
  }

  function assertWritable(): void {
    if (queryOnly) {
      throw new Error("Read-only connection");
    }
  }
}

export function createDatabaseState(): DatabaseState {
  return { version: 0, table: false, rows: new Map(), projects: new Map() };
}
