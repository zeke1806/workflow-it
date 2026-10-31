import type { TodoContext } from "./context";
import { mutate } from "./list";

export function requestRemove(context: TodoContext, id: string) {
  return context.stateful.setState((state) => ({ ...state, deletingId: id, error: null }));
}

export function cancelRemove(context: TodoContext) {
  const { getState, setState } = context.stateful;

  if (!getState().busyIds.includes(getState().deletingId ?? "")) {
    setState((state) => ({ ...state, deletingId: null, error: null }));
  }
}

export async function confirmRemove(context: TodoContext) {
  const { todoApi, stateful } = context;
  const id = stateful.getState().deletingId;

  if (id === null) {
    return;
  }

  await mutate(context, id, async () => {
    await todoApi.delete(id);
    stateful.setState((state) => ({ ...state, deletingId: null }));
  });
}
