import { createFileRoute } from "@tanstack/react-router";
import { TodoListFeature } from "../features/todo/todo-list-feature";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { dependencies } = Route.useRouteContext();

  return <TodoListFeature todoService={dependencies.todo} />;
}
