import { isAppError } from "@cu-archi/core";
import type { ErrorTexts } from "./errors-types";

export function readErrorText(error: unknown, texts: ErrorTexts, fallback: string): string {
  if (isAppError(error)) {
    // Messages outside the catalog (another API version) fall back.
    return texts[error.message as keyof ErrorTexts] ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
