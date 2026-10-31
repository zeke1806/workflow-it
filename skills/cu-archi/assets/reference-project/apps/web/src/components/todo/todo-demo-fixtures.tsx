import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import type { Todo, TodoService } from "@cu-archi/core";
import { createDependencies } from "../../services/di";
import { TodoListFeature } from "../../features/todo/todo-list-feature";

/** Tâche de test, surchargeable champ par champ. */
export function createTodo(overrides: Partial<Todo> = {}): Todo {
  return { id: "1", title: "Première tâche", completed: false, projectId: null, ...overrides };
}

/** Api mockée en mémoire : `update` renvoie la tâche modifiée, sans réseau. */
export function createMockApi(todos: readonly Todo[], overrides: Partial<TodoService> = {}) {
  return {
    todo: {
      list: async () => {
        return todos;
      },

      create: async () => {
        throw new Error("Not configured");
      },

      update: async (id, input) => {
        const found = todos.find((todo) => todo.id === id);

        if (!found) {
          throw new Error("Not found");
        }

        return { ...found, ...input };
      },

      delete: async () => {},

      ...overrides,
    } satisfies TodoService,
    project: {
      list: async () => {
        return [];
      },

      create: async () => {
        throw new Error("Not configured");
      },

      update: async () => {
        throw new Error("Not configured");
      },
    },
  };
}

/** Feature de liste dans un routeur en mémoire ; la route de gestion est un simple repère. */
export function TodoListFeatureInMemory({
  api,
}: {
  readonly api: ReturnType<typeof createMockApi>;
}) {
  const { todo } = createDependencies({ api });
  const rootRoute = createRootRoute({ component: Outlet });

  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <TodoListFeature todoService={todo} />,
  });

  const manageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/todos/manage",
    component: () => <p>Écran de gestion</p>,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([listRoute, manageRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return <RouterProvider router={router as never} />;
}
