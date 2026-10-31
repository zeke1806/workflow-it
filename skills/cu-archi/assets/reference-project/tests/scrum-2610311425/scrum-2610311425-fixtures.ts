import type { TodoService } from "@cu-archi/core";
import { createTodoService } from "../../apps/web/src/services/todo/todo-service/index";
import type {
  TodoBindings,
  TodoState,
  TodoUiService,
} from "../../apps/web/src/services/todo/todo-types";

/** Todo presentation service over a scripted API, connected to a local state port. */
export function createFixture(
  overrides: Partial<TodoService>,
  bindings: TodoBindings = {},
  initialId?: string,
) {
  const api = {
    todo: {
      list: async () => {
        return [];
      },

      create: async () => {
        throw new Error("Not configured");
      },

      update: async () => {
        throw new Error("Not configured");
      },

      delete: async () => {},

      ...overrides,
    } satisfies TodoService,
  };

  return createConnection(
    createTodoService(api.todo, {
      listOptions: async () => {
        return [];
      },
    }),
    { ...bindings, initialId },
  );
}

/** Connects a Todo presentation service to a local state port that ignores writes once inactive. */
export function createConnection(todoService: TodoUiService, bindings: TodoBindings = {}) {
  let active = true;
  let state: TodoState = todoService.createInitialState(bindings);

  const actions = todoService.connect({
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

    bindings,
  });

  return {
    actions,

    deactivate: () => {
      active = false;
      actions.cancelLoad();
    },

    state: () => {
      return state;
    },
  };
}
