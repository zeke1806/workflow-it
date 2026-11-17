import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { todoIdSchema } from "@cu-archi/core/todo";
import { z } from "zod";
import { TodoManagePageContainer } from "../../components/todo/todo-manage-page-container";
import type { TodoBindings } from "../../services/todo/todo-types";

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
  const navigate = useNavigate();

  const bindings: TodoBindings = {
    initialId: id,
    returnToList: () => {
      void navigate({ to: "/" });
    },
  };

  return (
    <TodoManagePageContainer
      key={id === undefined ? "create" : `edit:${id}`}
      todoService={dependencies.todo}
      bindings={bindings}
    />
  );
}
