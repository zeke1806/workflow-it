import type { TodoContext } from "./context";
import { mutateAndReload } from "./list";

export function requestRemove(context: TodoContext, id: string) {
  return context.connector.setState((state) => ({ ...state, deletingId: id, error: null }));
}

export function cancelRemove(context: TodoContext) {
  const { getState, setState } = context.connector;

  if (!getState().busyIds.includes(getState().deletingId ?? "")) {
    setState((state) => ({ ...state, deletingId: null, error: null }));
  }
}

export async function confirmRemove(context: TodoContext) {
  const { todoApi, connector } = context;
  const id = connector.getState().deletingId;

  if (id === null) {
    return;
  }

  await mutateAndReload(context, {
    id,
    action: async () => {
      await todoApi.delete(id);
      connector.setState((state) => ({ ...state, deletingId: null }));
    },
  });
}
