import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TodoListPageContainer } from "../components/todo/todo-list-page-container";
import type { TodoBindings } from "../services/todo/todo-types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { dependencies } = Route.useRouteContext();
  const navigate = useNavigate();

  const bindings: TodoBindings = {
    openCreate: () => {
      void navigate({ to: "/todos/manage" });
    },

    openEdit: (id) => {
      void navigate({ to: "/todos/manage", search: { id } });
    },
  };

  return <TodoListPageContainer todoService={dependencies.todo} bindings={bindings} />;
}
