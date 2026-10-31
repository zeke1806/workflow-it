import { createFileRoute } from "@tanstack/react-router";
import { todoIdSchema } from "@cu-archi/core";
import { z } from "zod";
import { TodoManageFeature } from "../../features/todo/todo-manage-feature";

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
    <TodoManageFeature
      key={id === undefined ? "create" : `edit:${id}`}
      todoService={dependencies.todo}
      initialId={id}
    />
  );
}
