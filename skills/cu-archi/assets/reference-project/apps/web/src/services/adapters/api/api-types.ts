import type { ProjectService } from "@cu-archi/core/project";
import { todoSchema, type TodoService } from "@cu-archi/core/todo";

export const apiTodoListSchema = todoSchema.array().readonly();

export interface Api {
  readonly todo: TodoService;
  readonly project: Pick<ProjectService, "list" | "create" | "update">;
}

export type ApiOptions = {
  readonly baseUrl?: string;
  readonly fetchClient?: typeof fetch;
};
