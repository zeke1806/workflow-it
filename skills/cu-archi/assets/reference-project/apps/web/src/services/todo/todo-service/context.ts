import type { ProjectUiService } from "../../project/project-types";
import type { Api } from "../../adapters/api/api-types";
import { appErrors } from "@cu-archi/core";
import { readErrorText } from "../../errors/errors-service";
import type { ErrorTexts } from "../../errors/errors-types";
import type { StateConnector } from "../../adapters/stateful/stateful-types";
import type { TodoBindings, TodoState } from "../todo-types";

/** Dependencies and state connection shared by the module's internal files. */
export type TodoContext = {
  readonly todoApi: Api["todo"];
  readonly project: Pick<ProjectUiService, "listOptions">;
  readonly stateful: StateConnector<TodoState, TodoBindings>;
};

export const emptyForm = { id: null, title: "", projectId: null } as const;

export function reportError(context: TodoContext, error: unknown) {
  const { stateful } = context;

  if (!stateful.isActive()) {
    return;
  }

  const text = readErrorText(
    error,
    todoErrorTexts(stateful.getState().form.projectId),
    "Une erreur est survenue.",
  );
  stateful.setState((state) => ({ ...state, error: text }));
}

export function isCurrentLoad(context: TodoContext, version: number) {
  const { stateful } = context;

  return version === stateful.getState().loadVersion && stateful.isActive();
}

export function startLoad(context: TodoContext) {
  const { stateful } = context;

  stateful.setState((state) => ({ ...state, loadVersion: state.loadVersion + 1 }));

  return stateful.getState().loadVersion;
}

export function returnToList(context: TodoContext) {
  const { stateful } = context;

  if (stateful.isActive()) {
    stateful.bindings.returnToList?.();
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
