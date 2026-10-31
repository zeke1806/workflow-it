import type { Todo } from "@cu-archi/core";
import type { TodoRepository } from "../../adapters/repository/repository-types.js";

export function deleteTodo(repository: TodoRepository, id: Todo["id"]): Promise<void> {
  return repository.delete(id);
}
