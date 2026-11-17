import {
  useConnectedService,
  useServiceLifecycle,
} from "../../services/adapters/state-connector/react-state-connector-service";
import type { TodoBindings, TodoUiService } from "../../services/todo/todo-types";
import { TodoManagePage } from "./todo-manage-page";

/** Câble le formulaire au service front ; la route fournit le service, l'id et la navigation. */
export function TodoManagePageContainer({
  todoService,
  bindings,
}: {
  readonly todoService: TodoUiService;
  readonly bindings: TodoBindings;
}) {
  const { state, actions } = useConnectedService(todoService, bindings);

  useServiceLifecycle(actions.initializeForm, actions.cancelLoad);

  return <TodoManagePage state={state} actions={actions} />;
}
