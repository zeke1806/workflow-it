import type { Todo, ListTodosInput, CreateTodoInput, UpdateTodoInput } from "@cu-archi/core";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@cu-archi/core";
import { todoSchema, projectSchema } from "@cu-archi/core";
import { z } from "zod";

export const sqliteSchemaVersionSchema = z.number().int().nonnegative();

export const sqliteTodoRowSchema = todoSchema
  .unwrap()
  .extend({
    completed: z.union([z.literal(0), z.literal(1)]),
  })
  .readonly();

export const sqliteProjectRowSchema = projectSchema
  .unwrap()
  .extend({
    archived: z.union([z.literal(0), z.literal(1)]),
  })
  .readonly();

export interface ProjectRepository {
  readonly list: () => Promise<readonly Project[]>;
  readonly find: (id: string) => Promise<Project | null>;
  readonly create: (input: CreateProjectInput) => Promise<Project>;
  readonly update: (id: string, input: UpdateProjectInput) => Promise<Project>;
}

export interface TodoRepository {
  readonly find: (id: string) => Promise<Todo | null>;
  readonly list: (input?: ListTodosInput) => Promise<readonly Todo[]>;
  readonly create: (input: CreateTodoInput) => Promise<Todo>;
  readonly update: (id: Todo["id"], input: UpdateTodoInput) => Promise<Todo>;
  readonly delete: (id: Todo["id"]) => Promise<void>;
}

export interface Repository {
  readonly todo: TodoRepository;
  readonly project: ProjectRepository;
}
