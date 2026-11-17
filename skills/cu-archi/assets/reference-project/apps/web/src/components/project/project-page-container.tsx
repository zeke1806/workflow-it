import {
  useConnectedService,
  useServiceLifecycle,
} from "../../services/adapters/state-connector/react-state-connector-service";
import type { ProjectUiService } from "../../services/project/project-types";
import { ProjectPage } from "./project-page";

/** Câble la page des projets au service front ; la route fournit le service. */
export function ProjectPageContainer({
  projectService,
}: {
  readonly projectService: ProjectUiService;
}) {
  const { state, actions } = useConnectedService(projectService);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <ProjectPage state={state} actions={actions} />;
}
