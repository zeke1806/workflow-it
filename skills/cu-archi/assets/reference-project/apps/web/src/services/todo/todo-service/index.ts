import type { ProjectUiService } from "../../project/project-types";
import type { Api } from "../../adapters/api/api-types";
import {
  todoStateSchema,
  type TodoBindings,
  type TodoState,
  type TodoUiService,
  type TodoActions,
} from "../todo-types";
import { emptyForm, startLoad, type TodoContext } from "./context";
import { changeProjectFilter, changeSearch, loadTodos, toggleTodo } from "./list";
import {
  cancel,
  changeProject,
  changeTitle,
  edit,
  initializeForm,
  newTodo,
  openTodo,
  submit,
} from "./form";
import { cancelRemove, confirmRemove, requestRemove } from "./remove";

export function createTodoService(
  todoApi: Api["todo"],
  project: Pick<ProjectUiService, "listOptions">,
): TodoUiService {
  return Object.freeze({
    createInitialState: (bindings) => {
      return createInitialState(bindings);
    },

    connect: (connector) => {
      return createTodoActions({ todoApi, project, stateful: connector });
    },
  } satisfies TodoUiService);
}

function createTodoActions(context: TodoContext): TodoActions {
  return Object.freeze({
    load: () => {
      return loadTodos(context);
    },

    cancelLoad: () => {
      startLoad(context);
    },

    changeSearch: (search) => {
      return changeSearch(context, search);
    },

    changeProjectFilter: (id) => {
      return changeProjectFilter(context, id);
    },

    changeProject: (id) => {
      return changeProject(context, id);
    },

    changeTitle: (title) => {
      return changeTitle(context, title);
    },

    newTodo: () => {
      return newTodo(context);
    },

    initializeForm: () => {
      return initializeForm(context);
    },

    openTodo: (id) => {
      return openTodo(context, id);
    },

    edit: (id) => {
      return edit(context, id);
    },

    cancel: () => {
      return cancel(context);
    },

    submit: () => {
      return submit(context);
    },

    toggle: (id) => {
      return toggleTodo(context, id);
    },

    requestRemove: (id) => {
      return requestRemove(context, id);
    },

    cancelRemove: () => {
      return cancelRemove(context);
    },

    confirmRemove: () => {
      return confirmRemove(context);
    },
  } satisfies TodoActions);
}

function createInitialState(bindings: TodoBindings): TodoState {
  const { initialId } = bindings;

  return todoStateSchema.parse({
    todos: [],
    search: "",
    projects: [],
    projectFilter: null,
    form: { ...emptyForm, id: initialId ?? null },
    formReady: initialId === undefined,
    loading: initialId !== undefined,
    saving: false,
    busyIds: [],
    error: null,
    deletingId: null,
    loadVersion: 0,
  });
}
