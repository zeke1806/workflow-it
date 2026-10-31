import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  MemorySQLite,
  createDatabaseState,
  createSequentialIdService,
  withRepository,
} from "./repository-fixtures.js";
import { isAppError, type CreateTodoInput } from "@cu-archi/core";
import {
  createSQLiteRepositoryService,
  migrateSQLiteDatabase,
} from "../../apps/api/src/services/adapters/repository/sqlite-repository-service.js";

describe("Repository", () => {
  describe("api", () => {
    describe("1. Tâches", () => {
      it("1.1 crée des tâches distinctes et immuables en conservant l'état terminé explicite", async () => {
        await withRepository(async (repository) => {
          const first = await repository.create({ title: "First" });
          const second = await repository.create({
            title: "Second",
            completed: true,
            projectId: null,
          });
          assert.notEqual(first.id, second.id);
          assert.equal(first.completed, false);
          assert.equal(second.completed, true);
          assert.equal(Object.isFrozen(first), true);

          const todos = await repository.list();
          assert.deepEqual(todos, [first, second]);
          assert.equal(Object.isFrozen(todos), true);
        });
      });

      it("1.2 cherche les titres comme sous-chaînes littérales, sans interpréter la saisie en SQL", async () => {
        await withRepository(async (repository) => {
          const matching = await repository.create({ title: "Save 100% of tasks" });
          await repository.create({ title: "Save 100 tasks" });
          const quoted = await repository.create({ title: "' OR 1=1 --" });
          assert.deepEqual(await repository.list({ search: "SAVE 100%" }), [matching]);
          assert.deepEqual(await repository.list({ search: "' OR 1=1 --" }), [quoted]);
          assert.deepEqual(await repository.list({ search: "missing" }), []);
        });
      });

      it("1.3 modifie seulement les champs fournis et retourne une nouvelle valeur immuable", async () => {
        await withRepository(async (repository) => {
          const original = await repository.create({
            title: "Original",
            completed: true,
            projectId: null,
          });
          const updated = await repository.update(original.id, { completed: false });
          assert.deepEqual(updated, { ...original, completed: false });
          assert.equal(original.completed, true);
          assert.equal(Object.isFrozen(updated), true);

          const renamed = await repository.update(original.id, { title: "Renamed" });
          assert.deepEqual(renamed, { ...updated, title: "Renamed" });
          assert.deepEqual(await repository.update(original.id, {}), renamed);
          assert.deepEqual(await repository.list(), [renamed]);
        });
      });

      it("1.4 supprime une tâche et rejette Todo not found pour un identifiant absent en écriture", async () => {
        await withRepository(async (repository) => {
          const todo = await repository.create({ title: "Delete me" });
          await repository.delete(todo.id);
          assert.deepEqual(await repository.list(), []);
          assert.equal(await repository.find(todo.id), null);
          await assert.rejects(repository.delete(todo.id), { message: "Todo not found" });
          await assert.rejects(repository.update(todo.id, { title: "Missing" }), {
            message: "Todo not found",
          });
        });
      });

      it("1.5 valide les données externes avant l'écriture", async () => {
        await withRepository(async (repository) => {
          await assert.rejects(repository.create({ title: 123 } as unknown as CreateTodoInput));
          assert.deepEqual(await repository.list(), []);
        });
      });
    });

    describe("2. Connexion et schéma", () => {
      it("2.1 conserve les données entre deux connexions au même stockage simulé", async () => {
        const state = createDatabaseState();
        let database = new MemorySQLite(state);

        try {
          const first = createSQLiteRepositoryService(
            createSequentialIdService(),
            migrateSQLiteDatabase(database.client),
          );
          const todo = await first.todo.create({
            title: "Persisted",
            completed: true,
            projectId: null,
          });
          assert.equal(database.pragma("user_version"), 2);

          database.close();
          const statements: string[] = [];

          database = new MemorySQLite(state, (sql) => {
            statements.push(sql);
          });

          const reopened = createSQLiteRepositoryService(
            createSequentialIdService(),
            migrateSQLiteDatabase(database.client),
          );
          assert.equal(
            statements.some((sql) => /CREATE TABLE|user_version\s*=/i.test(sql)),
            false,
          );
          assert.deepEqual(await reopened.todo.list(), [todo]);
        } finally {
          database.close();
        }
      });

      it("2.2 compose les services sur une connexion déjà préparée sans exécuter de SQL", async () => {
        const statements: string[] = [];

        const database = new MemorySQLite(undefined, (sql) => {
          statements.push(sql);
        });

        try {
          const prepared = migrateSQLiteDatabase(database.client);
          statements.length = 0;
          const first = createSQLiteRepositoryService(createSequentialIdService(), prepared);
          const second = createSQLiteRepositoryService(createSequentialIdService(), prepared);
          assert.deepEqual(statements, []);
          const todo = await first.todo.create({ title: "Shared connection" });
          assert.deepEqual(await second.todo.list(), [todo]);
        } finally {
          database.close();
        }
      });

      it("2.3 refuse un schéma plus récent sans modifier sa version ni ses données", () => {
        const database = new MemorySQLite();

        try {
          database.exec(
            "CREATE TABLE retained (value TEXT); INSERT INTO retained VALUES ('keep');",
          );
          database.pragma("user_version = 3");
          assert.throws(
            () => migrateSQLiteDatabase(database.client),
            (error: unknown) =>
              isAppError(error) &&
              error.message === "Internal error" &&
              /Unsupported SQLite schema version/.test(error.description),
          );
          assert.equal(database.pragma("user_version"), 3);
          assert.deepEqual(database.prepare("SELECT value FROM retained").get(), { value: "keep" });
        } finally {
          database.close();
        }
      });

      it("2.4 annule une initialisation échouée et permet de réessayer", () => {
        const database = new MemorySQLite();

        try {
          database.pragma("query_only = ON");
          assert.throws(() => migrateSQLiteDatabase(database.client));
          assert.equal(database.pragma("user_version"), 0);
          assert.equal(
            database.prepare("SELECT name FROM sqlite_master WHERE name = 'todos'").get(),
            undefined,
          );

          database.pragma("query_only = OFF");
          migrateSQLiteDatabase(database.client);
          assert.equal(database.pragma("user_version"), 2);
        } finally {
          database.close();
        }
      });
    });
  });
});
