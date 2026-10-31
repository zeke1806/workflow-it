import { ProjectPage } from "../../components/project/project-page";
import {
  useStatefulService,
  useServiceLifecycle,
} from "../../services/adapters/stateful/react-stateful-service";
import type { ProjectUiService } from "../../services/project/project-types";

export function ProjectFeature({ projectService }: { readonly projectService: ProjectUiService }) {
  const { state, actions } = useStatefulService(projectService);

  useServiceLifecycle(actions.load, actions.cancelLoad);

  return <ProjectPage state={state} actions={actions} />;
}
