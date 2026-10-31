import { projectIdSchema } from "../project/project-types.ts";
import { z } from "zod";

export const todoIdSchema = z.string();

export const todoTitleSchema = z.string().trim().min(1, { error: "Saisissez un titre." });

const todoObjectSchema = z.object({
  id: todoIdSchema,
  title: todoTitleSchema,
  completed: z.boolean(),
  projectId: projectIdSchema.nullable().default(null),
});

export const todoSchema = todoObjectSchema.readonly();

export type Todo = z.infer<typeof todoSchema>;

export const listTodosInputSchema = z
  .object({
    search: z.string().optional(),
    projectId: projectIdSchema.optional(),
  })
  .readonly();

export type ListTodosInput = z.infer<typeof listTodosInputSchema>;

export const createTodoInputSchema = todoObjectSchema
  .omit({ id: true })
  .partial({ completed: true })
  .readonly();

export type CreateTodoInput = z.input<typeof createTodoInputSchema>;

export const updateTodoInputSchema = todoObjectSchema
  .omit({ id: true })
  .extend({ projectId: projectIdSchema.nullable() })
  .partial()
  .readonly();

export type UpdateTodoInput = z.input<typeof updateTodoInputSchema>;

export interface TodoService {
  readonly list: (input?: ListTodosInput) => Promise<readonly Todo[]>;
  readonly create: (input: CreateTodoInput) => Promise<Todo>;
  readonly update: (id: string, input: UpdateTodoInput) => Promise<Todo>;
  readonly delete: (id: string) => Promise<void>;
}
