import { userEvent } from "storybook/test";

/** Délai entre deux gestes : réaliste dans Storybook, nul sous Vitest pour des tests rapides. */
const demoDelay = import.meta.env.MODE === "test" ? 0 : 700;

/** Utilisateur d'une démo : même parcours à regarder dans Storybook et à rejouer en test UI. */
export function demoUser() {
  return userEvent.setup({ delay: demoDelay });
}
