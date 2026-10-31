import { createRouter } from "@tanstack/react-router";
import { createDependencies } from "./services/di";
import { routeTree } from "./routeTree.gen";

/** Singleton: services are stateless, so SSR requests can share them; state lives in React. */
const dependencies = createDependencies();

export function getRouter() {
  return createRouter({ routeTree, context: { dependencies }, scrollRestoration: true });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
