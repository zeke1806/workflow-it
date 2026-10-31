import type { ProjectActions, ProjectState } from "../../services/project/project-types";

// Données fixes des stories Project : aucun appel à la DI ni au service.
export const storyProjectState: ProjectState = {
  projects: [],
  form: { id: null, name: "" },
  loading: false,
  saving: false,
  busyId: null,
  error: null,
  loadVersion: 0,
};

export const storyProjectActions: ProjectActions = {
  load: async () => {},

  cancelLoad: () => {},

  changeName: () => {},

  edit: () => {},

  cancel: () => {},

  submit: async () => {},

  archive: async () => {},
};

export const storyProjects: ProjectState["projects"] = [
  { id: "home", name: "Maison", archived: false },
  { id: "work", name: "Travail", archived: false },
  { id: "holidays", name: "Vacances", archived: true },
];
