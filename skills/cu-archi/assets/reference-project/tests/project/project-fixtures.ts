import type { Api } from "../../apps/web/src/services/adapters/api/api-types";
import { createProjectService } from "../../apps/web/src/services/project/project-service";

/** Connects a Project presentation service to a local state port; `deactivate` simulates unmounting. */
export function connectProject(
  overrides: Partial<Api["project"]>,
  service = createProjectService({
    list: async () => {
      return [];
    },

    create: async () => {
      throw new Error("Unexpected write");
    },

    update: async () => {
      throw new Error("Unexpected write");
    },

    ...overrides,
  }),
) {
  let state = service.createInitialState(undefined);
  let active = true;

  const actions = service.connect({
    isActive: () => {
      return active;
    },

    getState: () => {
      return state;
    },

    setState: (update) => {
      if (active) {
        state = update(state);
      }
    },

    bindings: undefined,
  });

  return {
    actions,

    state: () => {
      return state;
    },

    deactivate: () => {
      active = false;
      actions.cancelLoad();
    },
  };
}
