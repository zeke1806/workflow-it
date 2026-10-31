import { userEvent } from "storybook/test";

/** Lecture ralentie d'une démo : laisse le temps de suivre chaque geste. */
export function slowUser() {
  return userEvent.setup({ delay: 700 });
}
