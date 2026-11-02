import { isAppError } from "@cu-archi/core";
import type { ErrorTexts } from "./errors-types";

export function readErrorText({
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
