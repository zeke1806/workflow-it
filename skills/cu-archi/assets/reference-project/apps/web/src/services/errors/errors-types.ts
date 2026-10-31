import type { AppErrorMessage } from "@cu-archi/core";

/** Texts a front service shows for business error messages; missing ones use the fallback. */
export type ErrorTexts = Readonly<Partial<Record<AppErrorMessage, string>>>;
