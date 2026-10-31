import { appErrors, projectNameSchema } from "@cu-archi/core";
import type { Api } from "../adapters/api/api-types";
import { readErrorText } from "../errors/errors-service";
import type { ErrorTexts } from "../errors/errors-types";
import type { StateConnector } from "../adapters/stateful/stateful-types";
import {
  projectStateSchema,
  type ProjectUiService,
  type ProjectState,
  type ProjectActions,
} from "./project-types";

const emptyForm = { id: null, name: "" } as const;

export function createProjectService(api: Api["project"]): ProjectUiService {
  return Object.freeze({
    listOptions: async (options = {}) => {
      const projects = await api.list();
      const visible = projects.filter((project) => options.includeArchived || !project.archived);

      return Object.freeze(visible);
    },

    createInitialState: () => {
      return projectStateSchema.parse({
        projects: [],
        form: emptyForm,
        loading: false,
        saving: false,
        busyId: null,
        error: null,
        loadVersion: 0,
      });
    },

    connect: (connector) => {
      return createProjectActions(api, connector);
    },
  } satisfies ProjectUiService);
}

function createProjectActions(
  api: Api["project"],
  connector: StateConnector<ProjectState>,
): ProjectActions {
  const { getState, setState, isActive } = connector;

  return Object.freeze({
    load,

    cancelLoad: () => {
      startLoad();
    },

    changeName: (name) => {
      if (!isBusy()) {
        setState((state) => ({ ...state, form: { ...state.form, name } }));
      }
    },

    edit: (id) => {
      const project = getState().projects.find((item) => item.id === id);

      if (!isBusy() && project) {
        setState((state) => ({ ...state, form: { id, name: project.name }, error: null }));
      }
    },

    cancel: () => {
      if (!isBusy()) {
        setState((state) => ({ ...state, form: emptyForm, error: null }));
      }
    },

    submit: async () => {
      if (isBusy()) {
        return;
      }

      const { id, name } = getState().form;
      const parsed = projectNameSchema.safeParse(name);

      if (!parsed.success) {
        const error = parsed.error.issues[0]?.message ?? "Nom de projet invalide.";
        setState((state) => ({ ...state, error }));
        return;
      }

      setState((state) => ({ ...state, saving: true, error: null }));

      try {
        const project =
          id === null
            ? await api.create({ name: parsed.data })
            : await api.update(id, { name: parsed.data });

        if (isActive()) {
          setState((state) => {
            const projects =
              id === null
                ? [...state.projects, project]
                : state.projects.map((item) => (item.id === id ? project : item));

            return { ...state, projects, form: emptyForm };
          });
        }
      } catch (error) {
        reportError(error, id);
      } finally {
        if (isActive()) {
          setState((state) => ({ ...state, saving: false }));
        }
      }
    },

    archive: async (id) => {
      if (
        isBusy() ||
        !getState().projects.some((project) => project.id === id && !project.archived)
      ) {
        return;
      }

      setState((state) => ({ ...state, busyId: id, error: null }));

      try {
        const project = await api.update(id, { archived: true });

        if (isActive()) {
          setState((state) => ({
            ...state,
            projects: state.projects.map((item) => (item.id === id ? project : item)),
          }));
        }
      } catch (error) {
        reportError(error, id);
      } finally {
        if (isActive()) {
          setState((state) => ({ ...state, busyId: null }));
        }
      }
    },
  } satisfies ProjectActions);

  async function load() {
    if (!isActive()) {
      return;
    }

    const version = startLoad();
    setState((state) => ({ ...state, loading: true, error: null }));

    try {
      const projects = await api.list();

      if (isActive() && getState().loadVersion === version) {
        setState((state) => ({ ...state, projects }));
      }
    } catch (error) {
      if (getState().loadVersion === version) {
        reportError(error);
      }
    } finally {
      if (isActive() && getState().loadVersion === version) {
        setState((state) => ({ ...state, loading: false }));
      }
    }
  }

  function isBusy() {
    const state = getState();

    return !isActive() || state.saving || state.busyId !== null || state.loading;
  }

  function reportError(error: unknown, id: string | null = null) {
    if (isActive()) {
      const text = readErrorText(
        error,
        projectErrorTexts(id),
        "Une erreur est survenue. Réessayez.",
      );
      setState((state) => ({ ...state, error: text }));
    }
  }

  function startLoad() {
    setState((state) => ({ ...state, loadVersion: state.loadVersion + 1 }));

    return getState().loadVersion;
  }
}

function projectErrorTexts(id: string | null): ErrorTexts {
  return {
    [appErrors.projectNotFound.message]: `Ce projet n’existe pas : ${id}`,
  };
}
