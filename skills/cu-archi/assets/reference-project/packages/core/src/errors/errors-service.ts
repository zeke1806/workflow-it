import {
  appErrorSchema,
  type AppError,
  type AppErrorDefinition,
  type ErrorsService,
  type ErrorTexts,
} from "./errors-types.ts";

export function createErrorsService(): ErrorsService {
  return { createAppError, isAppError, readErrorText };
}

function createAppError(error: AppErrorDefinition, description: string): AppError {
  return { message: error.message, description, status: error.status };
}

function isAppError(value: unknown): value is AppError {
  return appErrorSchema.safeParse(value).success;
}

function readErrorText({
  error,
  texts,
  fallback,
}: {
  readonly error: unknown;
  readonly texts: ErrorTexts;
  readonly fallback: string;
}): string {
  if (isAppError(error)) {
    // Messages outside the catalog (another API version) fall back.
    return texts[error.message as keyof ErrorTexts] ?? fallback;
  }

  return fallback;
}
