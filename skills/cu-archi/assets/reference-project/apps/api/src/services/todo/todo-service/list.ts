import type { ListTodosInput, Todo } from "@cu-archi/core";
import type { TodoRepository } from "../../adapters/repository/repository-types.js";

export function listTodos(
  repository: TodoRepository,
  input?: ListTodosInput,
): Promise<readonly Todo[]> {
  return repository.list(input);
}
