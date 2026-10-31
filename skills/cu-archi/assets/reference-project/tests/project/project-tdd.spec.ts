import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  createProjectInputSchema,
  updateProjectInputSchema,
  projectSchema,
  updateTodoInputSchema,
  type Project,
} from "@cu-archi/core";
import { createProjectService } from "../../apps/web/src/services/project/project-service";
import { connectProject } from "./project-fixtures";

describe("Project", () => {
  describe("core", () => {
    describe("1. Contrats partagés", () => {
      it("1.1 partage la validation des noms et conserve les mises à jour partielles", () => {
        for (const name of ["", "   ", "\t\n"]) {
          assert.equal(createProjectInputSchema.safeParse({ name }).success, false);
          assert.equal(updateProjectInputSchema.safeParse({ name }).success, false);
        }

        assert.deepEqual(createProjectInputSchema.parse({ name: "  Maison  " }), {
          name: "Maison",
        });
        assert.deepEqual(updateProjectInputSchema.parse({ archived: true }), { archived: true });
        assert.equal(updateProjectInputSchema.safeParse({ archived: false }).success, false);
        assert.deepEqual(updateTodoInputSchema.parse({ title: "Renommer" }), { title: "Renommer" });
        assert.deepEqual(updateTodoInputSchema.parse({ projectId: null }), { projectId: null });
      });

      it("1.2 retourne un projet readonly sans modifier son entrée", () => {
        const input = { id: "home", name: "Maison", archived: false };
        const project = projectSchema.parse(input);
        input.name = "Travail";
        assert.equal(project.name, "Maison");
        assert.equal(Object.isFrozen(project), true);
      });
    });
  });

  describe("web", () => {
    describe("1. Service de présentation", () => {
      it("1.1 conserve le brouillon après échec et empêche les doubles soumissions", async () => {
        let writes = 0;
        let rejectWrite: (error: Error) => void = () => {};
        const fixture = connectProject({
          create: () => {
            writes++;

            return new Promise((_resolve, reject) => {
              rejectWrite = reject;
            });
          },
        });
        await fixture.actions.submit();
        assert.equal(writes, 0);
        assert.equal(fixture.state().error, "Saisissez un nom de projet.");

        fixture.actions.changeName("Maison");
        const before = fixture.state();
        const pending = fixture.actions.submit();
        await fixture.actions.submit();
        fixture.actions.cancel();
        assert.equal(writes, 1);

        rejectWrite(new Error("Hors ligne"));
        await pending;
        assert.equal(fixture.state().form.name, "Maison");
        assert.equal(fixture.state().saving, false);
        assert.equal(fixture.state().error, "Hors ligne");
        assert.equal(before.error, "Saisissez un nom de projet.");
      });

      it("1.2 ignore les chargements obsolètes, annulés et les écritures après démontage", async () => {
        const requests: ((projects: readonly Project[]) => void)[] = [];
        let resolveWrite: (project: Project) => void = () => {};
        const fixture = connectProject({
          list: () => {
            return new Promise((resolve) => {
              requests.push(resolve);
            });
          },
          create: () => {
            return new Promise((resolve) => {
              resolveWrite = resolve;
            });
          },
        });
        const first = fixture.actions.load();
        const second = fixture.actions.load();
        const project = { id: "home", name: "Maison", archived: false };
        requests[1]!([project]);
        await second;
        requests[0]!([]);
        await first;
        assert.deepEqual(fixture.state().projects, [project]);

        const cancelled = fixture.actions.load();
        fixture.actions.cancelLoad();
        requests[2]!([]);
        await cancelled;
        assert.deepEqual(fixture.state().projects, [project]);

        // A fresh load completes before the next interaction.
        const refreshed = fixture.actions.load();
        requests[3]!([project]);
        await refreshed;
        fixture.actions.changeName("Travail");
        const saving = fixture.actions.submit();
        const last = fixture.state();
        fixture.deactivate();
        resolveWrite({ id: "work", name: "Travail", archived: false });
        await saving;
        assert.equal(fixture.state(), last);
      });

      it("1.3 isole les brouillons de deux connexions et filtre les choix dans Project", async () => {
        const active = { id: "home", name: "Maison", archived: false };
        const archived = { id: "work", name: "Travail", archived: true };
        const service = createProjectService({
          list: async () => {
            return [active, archived];
          },
          create: async () => {
            throw new Error("Unexpected write");
          },
          update: async () => {
            throw new Error("Unexpected write");
          },
        });
        assert.deepEqual(await service.listOptions(), [active]);
        assert.deepEqual(await service.listOptions({ includeArchived: true }), [active, archived]);

        const first = connectProject({}, service);
        const second = connectProject({}, service);
        first.actions.changeName("Un brouillon");
        assert.equal(second.state().form.name, "");
        assert.notEqual(first.state().form, second.state().form);
      });
    });
  });
});
