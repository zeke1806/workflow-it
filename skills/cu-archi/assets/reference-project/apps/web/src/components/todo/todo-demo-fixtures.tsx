import type { Todo, TodoService } from "@cu-archi/core/todo";
import { createDependencies } from "../../services/di";
import type { TodoBindings } from "../../services/todo/todo-types";
import { TodoListPageContainer } from "./todo-list-page-container";

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

/** Liste câblée par son container sur une api en mémoire ; la navigation est factice. */
export function TodoListPageInMemory({
  api,
  bindings = {},
}: {
  readonly api: ReturnType<typeof createMockApi>;
  readonly bindings?: TodoBindings;
}) {
  const { todo } = createDependencies({ api });

  return <TodoListPageContainer todoService={todo} bindings={bindings} />;
}
