import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { core } from "@cu-archi/core";
import { appErrors } from "@cu-archi/core/errors";
import type { Project } from "@cu-archi/core/project";
import { createProjectService } from "../../../../../apps/web/src/services/project/project-service.js";
import { connectProject } from "./project-service-fixtures.js";

describe("apps/web/services/project/project-service", () => {
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
      assert.equal(fixture.state().error, "Une erreur est survenue. Réessayez.");
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

    it("1.3 isole les brouillons de deux connexions", () => {
      const service = createProjectService({
        list: async () => {
          return [];
        },
        create: async () => {
          throw new Error("Unexpected write");
        },
        update: async () => {
          throw new Error("Unexpected write");
        },
      });
      const first = connectProject({}, service);
      const second = connectProject({}, service);
      first.actions.changeName("Un brouillon");
      assert.equal(second.state().form.name, "");
      assert.notEqual(first.state().form, second.state().form);
    });

    it("1.4 propose aussi les projets archivés dans les choix", async () => {
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

      assert.deepEqual(await service.listAllOptions(), [active, archived]);
    });
  });

  describe("2. Texte des erreurs", () => {
    it("2.1 choisit son texte d'après le message de l'AppError", async () => {
      const project = connectProject({
        list: async () => {
          return [{ id: "home", name: "Maison", archived: false }];
        },

        update: async () => {
          throw core.errorsService.createAppError(appErrors.projectNotFound, "id: home");
        },
      });
      await project.actions.load();
      await project.actions.archive("home");
      assert.equal(project.state().error, "Ce projet n’existe pas : home");

      const failingProject = connectProject({
        list: async () => {
          throw "inconnu";
        },
      });
      await failingProject.actions.load();
      assert.equal(failingProject.state().error, "Une erreur est survenue. Réessayez.");
    });
  });
});
