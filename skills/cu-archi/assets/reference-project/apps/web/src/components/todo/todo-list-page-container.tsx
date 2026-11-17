import {
  useConnectedService,
  useServiceLifecycle,
} from "../../services/adapters/state-connector/react-state-connector-service";
import type { TodoBindings, TodoUiService } from "../../services/todo/todo-types";
import { TodoListPage } from "./todo-list-page";

/** Câble la liste au service front ; la route fournit le service et la navigation. */
export function TodoListPageContainer({
  todoService,
  bindings,
}: {
  readonly todoService: TodoUiService;
  readonly bindings: TodoBindings;
}) {
  const { state, actions } = useConnectedService(todoService, bindings);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <TodoListPage state={state} actions={actions} />;
}
