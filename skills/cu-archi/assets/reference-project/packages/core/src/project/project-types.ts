import { z } from "zod";

export const projectIdSchema = z.string();

export const projectNameSchema = z.string().trim().min(1, { error: "Saisissez un nom de projet." });

const projectObjectSchema = z.object({
  id: projectIdSchema,
  name: projectNameSchema,
  archived: z.boolean(),
});

export const projectSchema = projectObjectSchema.readonly();

export type Project = z.infer<typeof projectSchema>;

export const createProjectInputSchema = projectObjectSchema.pick({ name: true }).readonly();

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const updateProjectInputSchema = z
  .object({
    name: projectNameSchema.optional(),
    archived: z.literal(true).optional(),
  })
  .readonly();

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export interface ProjectService {
  readonly list: () => Promise<readonly Project[]>;
  readonly create: (input: CreateProjectInput) => Promise<Project>;
  readonly update: (id: string, input: UpdateProjectInput) => Promise<Project>;
  readonly assertAssignable: (id: string) => Promise<void>;
}
