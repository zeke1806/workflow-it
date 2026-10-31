import { createFileRoute } from "@tanstack/react-router";
import { ProjectFeature } from "../features/project/project-feature";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  const { dependencies } = Route.useRouteContext();

  return <ProjectFeature projectService={dependencies.project} />;
}
