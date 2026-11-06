import { core } from "@cu-archi/core";
import { appErrors } from "@cu-archi/core/errors";
import { todoTitleSchema } from "@cu-archi/core/todo";
import { isCurrentLoad, reportError, returnToList, startLoad, type TodoContext } from "./context";
import { emptyForm } from "../todo-types";
import { loadTodos } from "./list";

export function newTodo(context: TodoContext) {
  const { connector } = context;

  if (connector.isActive()) {
    connector.bindings.openCreate?.();
  }
}

export function edit(context: TodoContext, id: string) {
  const { connector } = context;

  if (connector.isActive()) {
    connector.bindings.openEdit?.(id);
  }
}

export function initializeForm(context: TodoContext) {
  return openTodo(context, context.connector.bindings.initialId);
}

export function changeTitle(context: TodoContext, title: string) {
  return context.connector.setState((state) => ({ ...state, form: { ...state.form, title } }));
}

export function changeProject(context: TodoContext, id: string | null) {
  return context.connector.setState((state) => ({
    ...state,
    form: { ...state.form, projectId: id },
  }));
}

export function cancel(context: TodoContext) {
  const { getState, setState } = context.connector;

  if (getState().saving) {
    return;
  }

  setState((state) => ({ ...state, form: emptyForm }));
  returnToList(context);
}

export async function submit(context: TodoContext) {
  const { todoApi, connector } = context;
  const { getState, setState } = connector;

  if (!connector.isActive() || getState().saving || getState().loading || !getState().formReady) {
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

    if (!connector.isActive()) {
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
  const { todoApi, project, connector } = context;
  const { setState } = connector;

  if (!connector.isActive()) {
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
      project.listAllOptions(),
      id === undefined ? Promise.resolve([]) : todoApi.list(),
    ]);
    const todo = todos.find((item) => item.id === id);

    if (id !== undefined && !todo) {
      throw core.errorsService.createAppError(appErrors.todoNotFound, `id: ${id}`);
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
