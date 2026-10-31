import { createFileRoute } from "@tanstack/react-router";
import { ProjectPage } from "../components/project/project-page";
import {
  useStatefulService,
  useServiceLifecycle,
} from "../services/adapters/stateful/react-stateful-service";
import type { ProjectUiService } from "../services/project/project-types";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  const { dependencies } = Route.useRouteContext();

  return <ProjectRoutePage projectService={dependencies.project} />;
}

/** Page des projets : câble la vue au service front. */
export function ProjectRoutePage({
  projectService,
}: {
  readonly projectService: ProjectUiService;
}) {
  const { state, actions } = useStatefulService(projectService);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <ProjectPage state={state} actions={actions} />;
}
