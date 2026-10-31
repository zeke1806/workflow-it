import {
  updateTodoInputSchema,
  todoIdSchema,
  appErrors,
  createAppError,
  type UpdateTodoInput,
  type Todo,
  type ProjectService,
} from "@cu-archi/core";
import type { TodoRepository } from "../../adapters/repository/repository-types.js";

export async function updateTodo(
  repository: TodoRepository,
  project: Pick<ProjectService, "assertAssignable">,
  id: Todo["id"],
  input: UpdateTodoInput,
): Promise<Todo> {
  const validId = todoIdSchema.parse(id);
  const data = updateTodoInputSchema.parse(input);

  if (data.projectId !== undefined && data.projectId !== null) {
    const current = await repository.find(validId);

    if (current === null) {
      throw createAppError(appErrors.todoNotFound, `id: ${validId}`);
    }

    if (current.projectId !== data.projectId) {
      await project.assertAssignable(data.projectId);
    }
  }

  return repository.update(validId, data);
}
