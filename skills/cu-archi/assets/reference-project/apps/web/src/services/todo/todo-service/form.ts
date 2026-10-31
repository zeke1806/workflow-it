import { appErrors, createAppError, todoTitleSchema } from "@cu-archi/core";
import {
  emptyForm,
  isCurrentLoad,
  reportError,
  returnToList,
  startLoad,
  type TodoContext,
} from "./context";
import { loadTodos } from "./list";

export function newTodo(context: TodoContext) {
  const { stateful } = context;

  if (stateful.isActive()) {
    stateful.bindings.openCreate?.();
  }
}

export function edit(context: TodoContext, id: string) {
  const { stateful } = context;

  if (stateful.isActive()) {
    stateful.bindings.openEdit?.(id);
  }
}

export function initializeForm(context: TodoContext) {
  return openTodo(context, context.stateful.bindings.initialId);
}

export function changeTitle(context: TodoContext, title: string) {
  return context.stateful.setState((state) => ({ ...state, form: { ...state.form, title } }));
}

export function changeProject(context: TodoContext, id: string | null) {
  return context.stateful.setState((state) => ({
    ...state,
    form: { ...state.form, projectId: id },
  }));
}

export function cancel(context: TodoContext) {
  const { getState, setState } = context.stateful;

  if (getState().saving) {
    return;
  }

  setState((state) => ({ ...state, form: emptyForm }));
  returnToList(context);
}

export async function submit(context: TodoContext) {
  const { todoApi, stateful } = context;
  const { getState, setState } = stateful;

  if (!stateful.isActive() || getState().saving || getState().loading || !getState().formReady) {
    return;
  }

  const { id, title, projectId } = getState().form;
  const parsedTitle = todoTitleSchema.safeParse(title);

  if (!parsedTitle.success) {
    const error = parsedTitle.error.issues[0]?.message ?? "Titre invalide.";
    setState((state) => ({ ...state, error }));
    return;
  }

  setState((state) => ({ ...state, saving: true, error: null }));

  try {
    if (id === null) {
      await todoApi.create({ title: parsedTitle.data, projectId });
    } else {
      await todoApi.update(id, { title: parsedTitle.data, projectId });
    }

    if (!stateful.isActive()) {
      return;
    }

    setState((state) => ({ ...state, form: emptyForm }));
    await loadTodos(context);
    returnToList(context);
  } catch (error) {
    reportError(context, error);
  } finally {
    setState((state) => ({ ...state, saving: false }));
  }
}

export async function openTodo(context: TodoContext, id?: string) {
  const { todoApi, project, stateful } = context;
  const { setState } = stateful;

  if (!stateful.isActive()) {
    return;
  }

  const version = startLoad(context);
  setState((state) => ({
    ...state,
    loading: true,
    formReady: false,
    error: null,
    form: { ...emptyForm, id: id ?? null },
  }));

  try {
    const [projects, todos] = await Promise.all([
      project.listOptions({ includeArchived: true }),
      id === undefined ? Promise.resolve([]) : todoApi.list(),
    ]);
    const todo = todos.find((item) => item.id === id);

    if (id !== undefined && !todo) {
      throw createAppError(appErrors.todoNotFound, `id: ${id}`);
    }

    if (isCurrentLoad(context, version)) {
      setState((state) => ({
        ...state,
        projects,
        todos,
        formReady: true,
        form: {
          id: id ?? null,
          title: todo?.title ?? "",
          projectId: todo?.projectId ?? null,
        },
      }));
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
