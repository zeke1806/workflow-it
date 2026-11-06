import { core } from "@cu-archi/core";
import { appErrors } from "@cu-archi/core/errors";
import {
  createProjectInputSchema,
  updateProjectInputSchema,
  projectIdSchema,
  type ProjectService,
} from "@cu-archi/core/project";
import type { ProjectRepository } from "../adapters/repository/repository-types.js";

export function createProjectService(repository: ProjectRepository): ProjectService {
  return Object.freeze({
    list: () => {
      return repository.list();
    },

    create: (input) => {
      return repository.create(createProjectInputSchema.parse(input));
    },

    update: (id, input) => {
      return repository.update(projectIdSchema.parse(id), updateProjectInputSchema.parse(input));
    },

    assertAssignable: async (id) => {
      const project = await repository.find(projectIdSchema.parse(id));

      if (project.archived) {
        throw core.errorsService.createAppError(appErrors.projectArchived, `id: ${id}`);
      }
    },
  } satisfies ProjectService);
}
