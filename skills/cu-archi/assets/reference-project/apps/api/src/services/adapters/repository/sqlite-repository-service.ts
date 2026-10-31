import Database from "better-sqlite3";
import {
  createProjectInputSchema,
  updateProjectInputSchema,
  projectIdSchema,
  projectSchema,
  appErrors,
  createAppError,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
  createTodoInputSchema,
  listTodosInputSchema,
  todoIdSchema,
  todoSchema,
  updateTodoInputSchema,
  type CreateTodoInput,
  type ListTodosInput,
  type Todo,
  type UpdateTodoInput,
} from "@cu-archi/core";
import {
  sqliteSchemaVersionSchema,
  sqliteTodoRowSchema,
  sqliteProjectRowSchema,
  type Repository,
} from "./repository-types.js";
import type { IdService } from "../id/id-types.js";

/** The SQLite client handled by this adapter. */
export type SQLiteDatabase = Database.Database;

/** Opens the SQLite file and brings its schema to the current version. */
export function openSQLiteDatabase(path: string): Database.Database {
  return migrateSQLiteDatabase(new Database(path));
}

export function createSQLiteRepositoryService(
  ids: IdService,
  database: Database.Database,
): Repository {
  return Object.freeze({
    project: Object.freeze({
      list: async () => {
        const rows = database
          .prepare("SELECT id, name, archived FROM projects ORDER BY rowid")
          .all();

        return Object.freeze(rows.map(readProject));
      },

      find: async (id: string) => {
        const row = database
          .prepare("SELECT id, name, archived FROM projects WHERE id = ?")
          .get(projectIdSchema.parse(id));

        if (row === undefined) {
          throw createAppError(appErrors.projectNotFound, `id: ${id}`);
        }

        return readProject(row);
      },

      create: async (input: CreateProjectInput) => {
        const data = createProjectInputSchema.parse(input);
        const row = database
          .prepare(
            "INSERT INTO projects (id, name, archived) VALUES (@id, @name, 0) RETURNING id, name, archived",
          )
          .get({ id: ids.create(), name: data.name });

        return readProject(row);
      },

      update: async (id: string, input: UpdateProjectInput) => {
        const data = updateProjectInputSchema.parse(input);
        const row = database
          .prepare(
            "UPDATE projects SET name = COALESCE(@name, name), archived = COALESCE(@archived, archived) WHERE id = @id RETURNING id, name, archived",
          )
          .get({
            id: projectIdSchema.parse(id),
            name: data.name ?? null,
            archived: data.archived === undefined ? null : Number(data.archived),
          });

        if (row === undefined) {
          throw createAppError(appErrors.projectNotFound, `id: ${id}`);
        }

        return readProject(row);
      },
    }),

    todo: Object.freeze({
      find: async (id: string) => {
        const row = database
          .prepare("SELECT id, title, completed, projectId FROM todos WHERE id = ?")
          .get(todoIdSchema.parse(id));

        if (row === undefined) {
          throw createAppError(appErrors.todoNotFound, `id: ${id}`);
        }

        return readTodo(row);
      },

      list: async (input?: ListTodosInput) => {
        return listTodos(database, input);
      },

      create: async (input: CreateTodoInput) => {
        return createTodo(database, ids, input);
      },

      update: async (id: string, input: UpdateTodoInput) => {
        return updateTodo(database, id, input);
      },

      delete: async (id: string) => {
        return deleteTodo(database, id);
      },
    }),
  });
}

function listTodos(database: Database.Database, input?: ListTodosInput): readonly Todo[] {
  const { search = "", projectId } = listTodosInputSchema.parse(input ?? {});
  const rows = database
    .prepare(
      `
    SELECT id, title, completed, projectId FROM todos
    WHERE instr(lower(title), lower(@search)) > 0
      AND (@projectId IS NULL OR projectId = @projectId)
    ORDER BY rowid
  `,
    )
    .all({ search, projectId: projectId ?? null });

  return Object.freeze(rows.map(readTodo));
}

function createTodo(database: Database.Database, ids: IdService, input: CreateTodoInput): Todo {
  const data = createTodoInputSchema.parse(input);

  const row = database
    .prepare(
      `
    INSERT INTO todos (id, title, completed, projectId)
    VALUES (@id, @title, @completed, @projectId)
    RETURNING id, title, completed, projectId
  `,
    )
    .get({
      id: ids.create(),
      title: data.title,
      completed: Number(data.completed ?? false),
      projectId: data.projectId,
    });

  return readTodo(row);
}

function updateTodo(database: Database.Database, id: string, input: UpdateTodoInput): Todo {
  const validId = todoIdSchema.parse(id);
  const data = updateTodoInputSchema.parse(input);
  const row = database
    .prepare(
      `
    UPDATE todos
    SET title = COALESCE(@title, title), completed = COALESCE(@completed, completed),
      projectId = CASE WHEN @setProject = 1 THEN @projectId ELSE projectId END
    WHERE id = @id
    RETURNING id, title, completed, projectId
  `,
    )
    .get({
      id: validId,
      setProject: Number(data.projectId !== undefined),
      projectId: data.projectId ?? null,
      title: data.title ?? null,
      completed: data.completed === undefined ? null : Number(data.completed),
    });

  if (row === undefined) {
    throw createAppError(appErrors.todoNotFound, `id: ${validId}`);
  }

  return readTodo(row);
}

function deleteTodo(database: Database.Database, id: string): void {
  const validId = todoIdSchema.parse(id);
  const result = database.prepare("DELETE FROM todos WHERE id = ?").run(validId);

  if (result.changes === 0) {
    throw createAppError(appErrors.todoNotFound, `id: ${validId}`);
  }
}

function readProject(row: unknown): Project {
  const data = sqliteProjectRowSchema.parse(row);

  return projectSchema.parse({ ...data, archived: data.archived === 1 });
}

function readTodo(row: unknown): Todo {
  const data = sqliteTodoRowSchema.parse(row);

  return todoSchema.parse({ ...data, completed: data.completed === 1 });
}

/** Migrates the schema in one transaction; exported so tests drive an in-memory double through it. */
export function migrateSQLiteDatabase(database: Database.Database): Database.Database {
  database
    .transaction(() => {
      const version = sqliteSchemaVersionSchema.parse(
        database.pragma("user_version", { simple: true }),
      );

      if (version > 2) {
        throw createAppError(appErrors.internal, `Unsupported SQLite schema version: ${version}`);
      }

      if (version === 0) {
        migrateToVersionOne(database);
      }

      if (version < 2) {
        migrateToVersionTwo(database);
      }
    })
    .immediate();

  return database;
}

function migrateToVersionOne(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL CHECK (completed IN (0, 1))
    );
    PRAGMA user_version = 1;
  `);
}

function migrateToVersionTwo(database: Database.Database): void {
  database.exec(`
    CREATE TABLE projects (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      archived INTEGER NOT NULL CHECK (archived IN (0, 1))
    );
    ALTER TABLE todos ADD COLUMN projectId TEXT REFERENCES projects(id);
    PRAGMA user_version = 2;
  `);
}
