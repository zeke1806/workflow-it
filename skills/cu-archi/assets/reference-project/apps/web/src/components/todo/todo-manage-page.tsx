import { todoHeader, todoFooter } from "./todo-chrome";
import type { TodoState, TodoActions } from "../../services/todo/todo-types";
import { Button } from "../common/buttons/button";
import { TextInput } from "../common/inputs/text-input";
import { SelectInput } from "../common/inputs/select-input";
import { PageContainer } from "../common/containers/page-container";

export function TodoManagePage({
  state,
  actions,
}: {
  readonly state: TodoState;
  readonly actions: TodoActions;
}) {
  const selectableProjects = state.projects.filter(
    (project) => !project.archived || project.id === state.form.projectId,
  );
  const archivedSelection = state.projects.some(
    (project) => project.id === state.form.projectId && project.archived,
  );

  return (
    <PageContainer
      title={state.form.id === null ? "Créer une tâche" : "Modifier la tâche"}
      header={todoHeader}
      footer={todoFooter}
      description="Une idée à garder, une prochaine étape à noter."
    >
      {state.loading && <p role="status">Chargement…</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {state.error && !state.formReady && (
        <Button onClick={() => void actions.initializeForm()}>Réessayer</Button>
      )}
      <form
        className="ui-form"
        onSubmit={(event) => {
          event.preventDefault();
          void actions.submit();
        }}
      >
        <TextInput
          label="Titre"
          autoFocus
          placeholder="Que souhaitez-vous faire ?"
          value={state.form.title}
          disabled={state.loading || state.saving || !state.formReady}
          onChange={(event) => actions.changeTitle(event.target.value)}
        />
        <SelectInput
          label="Projet"
          value={state.form.projectId ?? ""}
          disabled={state.loading || state.saving || !state.formReady}
          onChange={(event) => actions.changeProject(event.target.value || null)}
        >
          <option value="">Aucun projet</option>
          {selectableProjects.map((project) => (
            <option key={project.id} value={project.id} disabled={project.archived}>
              {project.name}
              {project.archived ? " (archivé)" : ""}
            </option>
          ))}
        </SelectInput>
        {archivedSelection && (
          <p className="ui-project-status">
            Ce projet est archivé. Vous pouvez conserver cette affectation ou choisir un projet
            actif.
          </p>
        )}
        <div className="ui-form-actions">
          <Button
            className="ui-primary"
            type="submit"
            disabled={state.loading || state.saving || !state.formReady}
          >
            {state.saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button disabled={state.saving} onClick={actions.cancel}>
            Retour à la liste
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
