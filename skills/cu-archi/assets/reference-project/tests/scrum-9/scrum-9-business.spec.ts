import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { isAppError } from "@cu-archi/core";
import { createDependencies as createWebDependencies } from "../../apps/web/src/services/di.js";
import { createMemoryApi } from "../api/api-fixtures.js";
import { connectProject } from "../project/project-fixtures.js";
import { createConnection } from "../todo/todo-fixtures.js";

describe("SCRUM-9 : Ajouter les projets et leur injection dans Todo", () => {
  describe("web", () => {
    describe("1. Projets archivés", () => {
      it("1.1 conserve les tâches d'un projet archivé et refuse de nouvelles affectations", async () => {
        const api = createMemoryApi();
        const project = await api.project.create({ name: "  Maison  " });
        assert.equal(project.name, "Maison");

        const todo = await api.todo.create({ title: "Rempoter", projectId: project.id });
        assert.deepEqual(await api.todo.list({ projectId: project.id }), [todo]);

        await api.project.update(project.id, { archived: true });
        await api.todo.update(todo.id, { title: "Rempoter le citronnier", projectId: project.id });
        await api.todo.update(todo.id, { completed: true });
        await assert.rejects(api.todo.create({ title: "Nouvelle tâche", projectId: project.id }), {
          message: "Project archived",
        });
        await assert.rejects(api.todo.create({ title: "Inconnue", projectId: "missing" }), {
          message: "Project not found",
        });
        assert.equal((await api.todo.list({ projectId: project.id }))[0]?.completed, true);

        await api.todo.update(todo.id, { projectId: null });
        assert.deepEqual(await api.todo.list({ projectId: project.id }), []);
        assert.equal((await api.todo.list())[0]?.projectId, null);
      });
    });

    describe("2. Création et filtres", () => {
      it("2.1 crée et renomme un projet puis filtre les tâches par projet et par recherche", async () => {
        const api = createMemoryApi();
        const web = createWebDependencies({ api });
        const projects = connectProject({}, web.project);
        projects.actions.changeName("  Maison  ");
        await projects.actions.submit();
        const project = projects.state().projects[0]!;
        projects.actions.edit(project.id);
        projects.actions.changeName("Jardin");
        await projects.actions.submit();
        assert.equal(projects.state().projects[0]?.name, "Jardin");
        assert.equal(project.name, "Maison");

        const tasks = createConnection(web.todo, {});
        await tasks.actions.initializeForm();
        assert.equal(tasks.state().projects[0]?.name, "Jardin");

        tasks.actions.changeTitle("Rempoter le citronnier");
        tasks.actions.changeProject(project.id);
        await tasks.actions.submit();
        const todo = tasks.state().todos[0]!;
        tasks.actions.changeTitle("Acheter du terreau");
        tasks.actions.changeProject(null);
        await tasks.actions.submit();
        await tasks.actions.changeProjectFilter(project.id);
        assert.deepEqual(tasks.state().todos, [todo]);

        tasks.actions.changeSearch("absent");
        await tasks.actions.load();
        assert.deepEqual(tasks.state().todos, []);

        tasks.actions.changeSearch("citronnier");
        await tasks.actions.load();
        assert.deepEqual(tasks.state().todos, [todo]);

        await projects.actions.archive(project.id);
        assert.deepEqual(await web.project.listOptions(), []);

        await tasks.actions.openTodo(todo.id);
        assert.equal(tasks.state().form.projectId, project.id);
        assert.equal(tasks.state().projects[0]?.archived, true);

        tasks.actions.changeSearch("");
        tasks.actions.changeTitle("Rempoter demain");
        await tasks.actions.submit();
        assert.equal(tasks.state().error, null);

        await tasks.actions.toggle(todo.id);
        assert.equal(tasks.state().todos[0]?.completed, true);
      });
    });

    describe("3. Refus sans effet", () => {
      it("3.1 refuse un projet invalide ou introuvable et une affectation à un projet archivé, sans modifier les données", async () => {
        const api = createMemoryApi();
        await assert.rejects(api.project.create({ name: "   " }));

        const project = await api.project.create({ name: "Travail" });
        await assert.rejects(
          api.project.update("missing", { name: "Absent" }),
          (error: unknown) => isAppError(error) && error.message === "Project not found",
        );
        await assert.rejects(api.project.update(project.id, { name: " " }));

        const todo = await api.todo.create({ title: "Réunion" });
        await api.project.update(project.id, { archived: true });
        await assert.rejects(
          api.todo.update(todo.id, { projectId: project.id }),
          (error: unknown) => isAppError(error) && error.message === "Project archived",
        );
        assert.equal((await api.todo.list())[0]?.projectId, null);
        assert.deepEqual(await api.project.list(), [{ ...project, archived: true }]);
      });
    });
  });
});
