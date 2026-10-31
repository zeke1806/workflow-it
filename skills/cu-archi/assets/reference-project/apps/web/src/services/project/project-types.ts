import { projectSchema } from "@cu-archi/core";
import { z } from "zod";
import type { StatefulService } from "../adapters/stateful/stateful-types";

export const projectStateSchema = z
  .object({
    projects: projectSchema.array().readonly(),
    form: z.object({ id: z.string().nullable(), name: z.string() }).readonly(),
    loading: z.boolean(),
    saving: z.boolean(),
    busyId: z.string().nullable(),
    error: z.string().nullable(),
    loadVersion: z.number().int(),
  })
  .readonly();

export type ProjectState = z.infer<typeof projectStateSchema>;

export interface ProjectActions {
  readonly load: () => Promise<void>;
  readonly cancelLoad: () => void;
  readonly changeName: (name: string) => void;
  readonly edit: (id: string) => void;
  readonly cancel: () => void;
  readonly submit: () => Promise<void>;
  readonly archive: (id: string) => Promise<void>;
}

export interface ProjectUiService extends StatefulService<ProjectState, ProjectActions> {
  readonly listOptions: (options?: {
    readonly includeArchived?: boolean;
  }) => Promise<ProjectState["projects"]>;
}
