import { createFileRoute } from "@tanstack/react-router";
import { ProjectPageContainer } from "../components/project/project-page-container";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  const { dependencies } = Route.useRouteContext();

  return <ProjectPageContainer projectService={dependencies.project} />;
}
