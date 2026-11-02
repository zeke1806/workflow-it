import { createFileRoute } from "@tanstack/react-router";
import { ProjectPage } from "../components/project/project-page";
import {
  useConnectedService,
  useServiceLifecycle,
} from "../services/adapters/state-connector/react-state-connector-service";
import type { ProjectUiService } from "../services/project/project-types";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  const { dependencies } = Route.useRouteContext();

  return <ProjectRoutePage projectService={dependencies.project} />;
}

export function ProjectRoutePage({
  projectService,
}: {
  readonly projectService: ProjectUiService;
}) {
  const { state, actions } = useConnectedService(projectService);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <ProjectPage state={state} actions={actions} />;
}
