import type { TodoState } from "../todo-types";
import { isCurrentLoad, reportError, startLoad, type TodoContext } from "./context";

export function changeSearch(context: TodoContext, search: string) {
  return context.stateful.setState((state) => ({ ...state, search }));
}

export async function changeProjectFilter(context: TodoContext, id: string | null) {
  context.stateful.setState((state) => ({ ...state, projectFilter: id }));
  await loadTodos(context);
}

export async function toggleTodo(context: TodoContext, id: string) {
  const { todoApi, stateful } = context;

  await mutate(
    context,
    id,
    async () => {
      const previous = stateful.getState().todos.find((item) => item.id === id);

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
    { refresh: false },
  );
}

export async function mutate(
  context: TodoContext,
  id: string,
  action: () => Promise<void>,
  options: { readonly refresh?: boolean } = {},
) {
  const { getState, setState, isActive } = context.stateful;

  if (!isActive() || getState().busyIds.includes(id) || getState().saving) {
    return;
  }

  setState((state) => ({ ...state, busyIds: [...state.busyIds, id], error: null }));

  try {
    await action();

    if (isActive() && options.refresh !== false) {
      await loadTodos(context);
    }
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
  const { stateful } = context;

  if (!stateful.isActive()) {
    return;
  }

  stateful.setState((state) => ({
    ...state,
    todos: state.todos.map((item) => (item.id === todo.id ? todo : item)),
  }));
}

export async function loadTodos(context: TodoContext) {
  const { todoApi, project, stateful } = context;
  const { getState, setState } = stateful;

  if (!stateful.isActive()) {
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
      project.listOptions({ includeArchived: true }),
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
