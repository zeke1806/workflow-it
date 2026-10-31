import { todoSchema, projectSchema } from "@cu-archi/core";
import { z } from "zod";
import type { StatefulService } from "../adapters/stateful/stateful-types";

export const todoStateSchema = z
  .object({
    todos: todoSchema.array().readonly(),
    search: z.string(),
    projects: projectSchema.array().readonly(),
    projectFilter: z.string().nullable(),
    form: z
      .object({ id: z.string().nullable(), title: z.string(), projectId: z.string().nullable() })
      .readonly(),
    loading: z.boolean(),
    formReady: z.boolean(),
    saving: z.boolean(),
    busyIds: z.string().array().readonly(),
    error: z.string().nullable(),
    deletingId: z.string().nullable(),
    loadVersion: z.number().int(),
  })
  .readonly();

export type TodoState = z.infer<typeof todoStateSchema>;

export type TodoBindings = {
  readonly initialId?: string;
  readonly openCreate?: () => void;
  readonly openEdit?: (id: string) => void;
  readonly returnToList?: () => void;
};

export type TodoUiService = StatefulService<TodoState, TodoActions, TodoBindings>;

export interface TodoActions {
  readonly load: () => Promise<void>;
  readonly cancelLoad: () => void;
  readonly changeSearch: (search: string) => void;
  readonly changeProjectFilter: (id: string | null) => Promise<void>;
  readonly changeProject: (id: string | null) => void;
  readonly changeTitle: (title: string) => void;
  readonly newTodo: () => void;
  readonly initializeForm: () => Promise<void>;
  readonly openTodo: (id?: string) => Promise<void>;
  readonly edit: (id: string) => void;
  readonly cancel: () => void;
  readonly submit: () => Promise<void>;
  readonly toggle: (id: string) => Promise<void>;
  readonly requestRemove: (id: string) => void;
  readonly cancelRemove: () => void;
  readonly confirmRemove: () => Promise<void>;
}
