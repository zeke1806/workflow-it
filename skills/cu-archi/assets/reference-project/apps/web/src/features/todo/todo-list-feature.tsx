import { TodoListPage } from "../../components/todo/todo-list-page";
import {
  useStatefulService,
  useServiceLifecycle,
} from "../../services/adapters/stateful/react-stateful-service";
import { useNavigate } from "@tanstack/react-router";
import type { TodoBindings, TodoUiService } from "../../services/todo/todo-types";

export function TodoListFeature({ todoService }: { readonly todoService: TodoUiService }) {
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
