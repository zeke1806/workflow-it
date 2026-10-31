import { todoSchema, type TodoService, type ProjectService } from "@cu-archi/core";

export const apiTodoListSchema = todoSchema.array().readonly();

export interface Api {
  readonly todo: TodoService;
  readonly project: Pick<ProjectService, "list" | "create" | "update">;
}

export type ApiOptions = {
  readonly baseUrl?: string;
  readonly fetchClient?: typeof fetch;
};
