import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TodoListPage } from "../components/todo/todo-list-page";
import {
  useStatefulService,
  useServiceLifecycle,
} from "../services/adapters/stateful/react-stateful-service";
import type { TodoBindings, TodoUiService } from "../services/todo/todo-types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { dependencies } = Route.useRouteContext();

  return <TodoListRoutePage todoService={dependencies.todo} />;
}

/** Page de liste : câble la vue au service front. Exportée pour les tests et les démos. */
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

  const { state, actions } = useStatefulService(todoService, bindings);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <TodoListPage state={state} actions={actions} />;
}
