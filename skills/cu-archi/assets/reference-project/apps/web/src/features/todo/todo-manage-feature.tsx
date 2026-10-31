import { TodoManagePage } from "../../components/todo/todo-manage-page";
import {
  useStatefulService,
  useServiceLifecycle,
} from "../../services/adapters/stateful/react-stateful-service";
import { useNavigate } from "@tanstack/react-router";
import type { TodoBindings, TodoUiService } from "../../services/todo/todo-types";

export function TodoManageFeature({
  todoService,
  initialId,
}: {
  readonly todoService: TodoUiService;
  readonly initialId?: string;
}) {
  const navigate = useNavigate();

  const bindings: TodoBindings = {
    initialId,
    returnToList: () => {
      void navigate({ to: "/" });
    },
  };

  const { state, actions } = useStatefulService(todoService, bindings);

  useServiceLifecycle(actions.initializeForm, actions.cancelLoad);

  return <TodoManagePage state={state} actions={actions} />;
}
