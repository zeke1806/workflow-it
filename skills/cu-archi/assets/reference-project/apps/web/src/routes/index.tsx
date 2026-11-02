import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TodoListPage } from "../components/todo/todo-list-page";
import {
  useConnectedService,
  useServiceLifecycle,
} from "../services/adapters/state-connector/react-state-connector-service";
import type { TodoBindings, TodoUiService } from "../services/todo/todo-types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { dependencies } = Route.useRouteContext();

  return <TodoListRoutePage todoService={dependencies.todo} />;
}

/** Exportée pour les tests et les démos. */
export function TodoListRoutePage({ todoService }: { readonly todoService: TodoUiService }) {
  const navigate = useNavigate();

  const bindings: TodoBindings = {
    openCreate: () => {
      void navigate({ to: "/todos/manage" });
    },

    openEdit: (id) => {
      void navigate({ to: "/todos/manage", search: { id } });
    },
  };

  const { state, actions } = useConnectedService(todoService, bindings);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <TodoListPage state={state} actions={actions} />;
}
