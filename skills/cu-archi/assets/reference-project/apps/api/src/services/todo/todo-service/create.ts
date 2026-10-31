import {
  createTodoInputSchema,
  type CreateTodoInput,
  type Todo,
  type ProjectService,
} from "@cu-archi/core";
import type { TodoRepository } from "../../adapters/repository/repository-types.js";

export async function createTodo(
  repository: TodoRepository,
  project: Pick<ProjectService, "assertAssignable">,
  input: CreateTodoInput,
): Promise<Todo> {
  const data = createTodoInputSchema.parse(input);

  if (data.projectId !== null) {
    await project.assertAssignable(data.projectId);
  }

  return repository.create(data);
}
