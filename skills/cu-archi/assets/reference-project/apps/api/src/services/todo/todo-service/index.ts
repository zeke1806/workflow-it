import type { TodoService, ProjectService } from "@cu-archi/core";
import type { TodoRepository } from "../../adapters/repository/repository-types.js";
import { listTodos } from "./list.js";
import { createTodo } from "./create.js";
import { updateTodo } from "./update.js";
import { deleteTodo } from "./delete.js";

export function createTodoService(
  repository: TodoRepository,
  project: Pick<ProjectService, "assertAssignable">,
): TodoService {
  return Object.freeze({
    list: (input) => {
      return listTodos(repository, input);
    },

    create: (input) => {
      return createTodo(repository, project, input);
    },

    update: (id, input) => {
      return updateTodo(repository, project, id, input);
    },

    delete: (id) => {
      return deleteTodo(repository, id);
    },
  } satisfies TodoService);
}
