import { appErrorSchema, type AppError, type AppErrorDefinition } from "./errors-types.ts";

export function createAppError(error: AppErrorDefinition, description: string): AppError {
  return { message: error.message, description, status: error.status };
}

export function isAppError(value: unknown): value is AppError {
  return appErrorSchema.safeParse(value).success;
}
