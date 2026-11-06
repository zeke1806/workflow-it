import type { ProjectService } from "@cu-archi/core/project";
import {
  updateTodoInputSchema,
  todoIdSchema,
  type UpdateTodoInput,
  type Todo,
} from "@cu-archi/core/todo";
import type { TodoRepository } from "../../adapters/repository/repository-types.js";

export async function updateTodo({
  repository,
  project,
  id,
  input,
}: {
  readonly repository: TodoRepository;
  readonly project: Pick<ProjectService, "assertAssignable">;
  readonly id: Todo["id"];
  readonly input: UpdateTodoInput;
}): Promise<Todo> {
  const validId = todoIdSchema.parse(id);
  const data = updateTodoInputSchema.parse(input);

  if (data.projectId !== undefined && data.projectId !== null) {
    const current = await repository.find(validId);

    if (current.projectId !== data.projectId) {
      await project.assertAssignable(data.projectId);
    }
  }

  return repository.update(validId, data);
}
