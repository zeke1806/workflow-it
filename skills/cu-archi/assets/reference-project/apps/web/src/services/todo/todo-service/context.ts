import type { ProjectUiService } from "../../project/project-types";
import type { Api } from "../../adapters/api/api-types";
import { appErrors } from "@cu-archi/core";
import { readErrorText } from "../../errors/errors-service";
import type { ErrorTexts } from "../../errors/errors-types";
import type { StateConnector } from "../../adapters/state-connector/state-connector-types";
import type { TodoBindings, TodoState } from "../todo-types";

export type TodoContext = {
  readonly todoApi: Api["todo"];
  readonly project: Pick<ProjectUiService, "listAllOptions">;
  readonly connector: StateConnector<TodoState, TodoBindings>;
};

export function reportError(context: TodoContext, error: unknown) {
  const { connector } = context;

  if (!connector.isActive()) {
    return;
  }

  const text = readErrorText({
    error,
    texts: todoErrorTexts(connector.getState().form.projectId),
    fallback: "Une erreur est survenue.",
  });
  connector.setState((state) => ({ ...state, error: text }));
}

export function isCurrentLoad(context: TodoContext, version: number) {
  const { connector } = context;

  return version === connector.getState().loadVersion && connector.isActive();
}

export function startLoad(context: TodoContext) {
  const { connector } = context;

  connector.setState((state) => ({ ...state, loadVersion: state.loadVersion + 1 }));

  return connector.getState().loadVersion;
}

export function returnToList(context: TodoContext) {
  const { connector } = context;

  if (connector.isActive()) {
    connector.bindings.returnToList?.();
  }
}

function todoErrorTexts(projectId: string | null): ErrorTexts {
  return {
    [appErrors.todoNotFound.message]: "Cette tâche n’existe pas.",
    [appErrors.projectNotFound.message]: `Ce projet n’existe pas : ${projectId}`,
    [appErrors.projectArchived.message]:
      `Ce projet est archivé : ${projectId}. Choisissez un projet actif.`,
  };
}
