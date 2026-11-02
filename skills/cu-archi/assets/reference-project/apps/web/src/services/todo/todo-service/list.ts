import type { TodoState } from "../todo-types";
import { isCurrentLoad, reportError, startLoad, type TodoContext } from "./context";

type Mutation = {
  readonly id: string;
  readonly action: () => Promise<void>;
};

export function changeSearch(context: TodoContext, search: string) {
  return context.connector.setState((state) => ({ ...state, search }));
}

export async function changeProjectFilter(context: TodoContext, id: string | null) {
  context.connector.setState((state) => ({ ...state, projectFilter: id }));
  await loadTodos(context);
}

export async function toggleTodo(context: TodoContext, id: string) {
  const { todoApi, connector } = context;

  await mutate(context, {
    id,
    action: async () => {
      const previous = connector.getState().todos.find((item) => item.id === id);

      if (!previous) {
        return;
      }

      const optimistic = { ...previous, completed: !previous.completed };
      replaceTodo(context, optimistic);

      try {
        const saved = await todoApi.update(id, { completed: optimistic.completed });
        replaceTodo(context, saved);
      } catch (error) {
        replaceTodo(context, previous);
        throw error;
      }
    },
  });
}

export async function mutateAndReload(context: TodoContext, { id, action }: Mutation) {
  await mutate(context, {
    id,
    action: async () => {
      await action();
      await loadTodos(context);
    },
  });
}

async function mutate(context: TodoContext, { id, action }: Mutation) {
  const { getState, setState, isActive } = context.connector;

  if (!isActive() || getState().busyIds.includes(id) || getState().saving) {
    return;
  }

  setState((state) => ({ ...state, busyIds: [...state.busyIds, id], error: null }));

  try {
    await action();
  } catch (error) {
    reportError(context, error);
  } finally {
    setState((state) => ({
      ...state,
      busyIds: state.busyIds.filter((item) => item !== id),
    }));
  }
}

function replaceTodo(context: TodoContext, todo: TodoState["todos"][number]) {
  const { connector } = context;

  if (!connector.isActive()) {
    return;
  }

  connector.setState((state) => ({
    ...state,
    todos: state.todos.map((item) => (item.id === todo.id ? todo : item)),
  }));
}

export async function loadTodos(context: TodoContext) {
  const { todoApi, project, connector } = context;
  const { getState, setState } = connector;

  if (!connector.isActive()) {
    return;
  }

  const version = startLoad(context);
  setState((state) => ({ ...state, loading: true, error: null }));

  try {
    const [todos, projects] = await Promise.all([
      todoApi.list({
        search: getState().search,
        projectId: getState().projectFilter ?? undefined,
      }),
      project.listAllOptions(),
    ]);

    if (isCurrentLoad(context, version)) {
      setState((state) => ({ ...state, todos, projects }));
    }
  } catch (error) {
    if (isCurrentLoad(context, version)) {
      reportError(context, error);
    }
  } finally {
    if (isCurrentLoad(context, version)) {
      setState((state) => ({ ...state, loading: false }));
    }
  }
}
