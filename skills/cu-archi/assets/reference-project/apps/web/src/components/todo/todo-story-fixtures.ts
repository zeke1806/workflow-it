import type { TodoActions, TodoState } from "../../services/todo/todo-types";

// Données fixes des stories Todo : aucun appel à la DI ni au service.
export const storyTodoState: TodoState = {
  todos: [],
  search: "",
  projects: [],
  projectFilter: null,
  form: { id: null, title: "", projectId: null },
  formReady: true,
  loading: false,
  saving: false,
  busyIds: [],
  error: null,
  deletingId: null,
  loadVersion: 0,
};

export const storyTodoActions: TodoActions = {
  load: async () => {},

  cancelLoad: () => {},

  newTodo: () => {},

  initializeForm: async () => {},

  openTodo: async () => {},

  changeSearch: () => {},

  changeTitle: () => {},

  changeProject: () => {},

  changeProjectFilter: async () => {},

  edit: () => {},

  cancel: () => {},

  submit: async () => {},

  toggle: async () => {},

  requestRemove: () => {},

  cancelRemove: () => {},

  confirmRemove: async () => {},
};

export const storyProjects: TodoState["projects"] = [
  { id: "home", name: "Maison", archived: false },
  { id: "work", name: "Travail", archived: false },
  { id: "holidays", name: "Vacances", archived: true },
];
