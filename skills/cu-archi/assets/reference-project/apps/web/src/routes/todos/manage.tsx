import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { todoIdSchema } from "@cu-archi/core";
import { z } from "zod";
import { TodoManagePage } from "../../components/todo/todo-manage-page";
import {
  useStatefulService,
  useServiceLifecycle,
} from "../../services/adapters/stateful/react-stateful-service";
import type { TodoBindings, TodoUiService } from "../../services/todo/todo-types";

const searchSchema = z.object({ id: todoIdSchema.optional() });

export const Route = createFileRoute("/todos/manage")({
  validateSearch: (search) => {
    return searchSchema.parse(search);
  },

  component: Manage,
});

function Manage() {
  const { dependencies } = Route.useRouteContext();
  const { id } = Route.useSearch();

  return (
    <TodoManageRoutePage
      key={id === undefined ? "create" : `edit:${id}`}
      todoService={dependencies.todo}
      initialId={id}
    />
  );
}

/** Page de création et d'édition : câble la vue au service front. */
export function TodoManageRoutePage({
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
