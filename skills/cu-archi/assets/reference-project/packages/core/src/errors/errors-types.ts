import { z } from "zod";

export type AppError = {
  readonly message: string;
  readonly description: string;
  readonly status?: number;
};

export type AppErrorDefinition = {
  readonly message: string;
  readonly status: number;
};

/** Single source of business errors: short English message and HTTP status. */
export const appErrors = {
  invalidInput: { message: "Invalid input", status: 400 },
  routeNotFound: { message: "Route not found", status: 404 },
  todoNotFound: { message: "Todo not found", status: 404 },
  projectNotFound: { message: "Project not found", status: 404 },
  projectArchived: { message: "Project archived", status: 409 },
  internal: { message: "Internal error", status: 500 },
} as const satisfies Record<string, AppErrorDefinition>;

export type AppErrorMessage = (typeof appErrors)[keyof typeof appErrors]["message"];

export const appErrorSchema = z
  .object({
    message: z.string(),
    description: z.string(),
    status: z.number().int().optional(),
  })
  .readonly() satisfies z.ZodType<AppError>;
