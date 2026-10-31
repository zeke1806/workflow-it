import { createCryptoIdService } from "./adapters/id/crypto-id-service.js";
import type { IdService } from "./adapters/id/id-types.js";
import {
  createSQLiteRepositoryService,
  type SQLiteDatabase,
} from "./adapters/repository/sqlite-repository-service.js";
import type { Repository } from "./adapters/repository/repository-types.js";
import { createProjectService } from "./project/project-service.js";
import { createTodoService } from "./todo/todo-service/index.js";

/** An opened and migrated database, or a ready repository injected in its place. */
export type DependencySource =
  | { readonly database: SQLiteDatabase; readonly id?: IdService }
  | { readonly repository: Repository };

export function createDependencies(source: DependencySource) {
  const repository =
    "repository" in source
      ? source.repository
      : createSQLiteRepositoryService(source.id ?? createCryptoIdService(), source.database);
  const project = createProjectService(repository.project);
  const todo = createTodoService(repository.todo, project);

  return Object.freeze({ todo, project });
}

export type Dependencies = ReturnType<typeof createDependencies>;
