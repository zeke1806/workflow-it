import { createApiService } from "./adapters/api/api-service";
import type { Api } from "./adapters/api/api-types";
import { createTodoService } from "./todo/todo-service/index";
import { createProjectService } from "./project/project-service";

export type DependencyOverrides = {
  readonly api?: Api;
};

export function createDependencies(overrides: DependencyOverrides = {}) {
  const api = overrides.api ?? createApiService();
  const project = createProjectService(api.project);
  const todo = createTodoService(api.todo, project);

  return Object.freeze({ todo, project });
}

export type Dependencies = ReturnType<typeof createDependencies>;
