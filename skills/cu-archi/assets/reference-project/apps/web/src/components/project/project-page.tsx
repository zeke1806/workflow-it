import { todoHeader, todoFooter } from "../todo/todo-chrome";
import type { ProjectState, ProjectActions } from "../../services/project/project-types";
import { PageContainer } from "../common/containers/page-container";
import { TextInput } from "../common/inputs/text-input";
import { Button } from "../common/buttons/button";

export function ProjectPage({
  state,
  actions,
}: {
  readonly state: ProjectState;
  readonly actions: ProjectActions;
}) {
  const busy = state.loading || state.saving || state.busyId !== null;
  const active = state.projects.filter((project) => !project.archived).length;

  return (
    <PageContainer
      title="Mes projets"
      description="Une place pour chaque envie d’avancer."
      header={todoHeader}
      footer={todoFooter}
    >
      <div className="ui-toolbar">
        <div>
          <h2>Vos projets</h2>
          <p>
            {active} actifs · {state.projects.length - active} archivés
          </p>
        </div>
        <Button disabled={busy} onClick={() => void actions.load()}>
          Actualiser
        </Button>
      </div>
      {state.error && (
        <p className="ui-error" role="alert">
          {state.error}
        </p>
      )}
      {state.loading && (
        <p className="ui-message" role="status">
          Chargement des projets…
        </p>
      )}
      <form
        className="ui-project-form"
        onSubmit={(event) => {
          event.preventDefault();
          void actions.submit();
        }}
      >
        <TextInput
          label={state.form.id === null ? "Nom du projet" : "Renommer le projet"}
          placeholder="Par exemple : Maison"
          value={state.form.name}
          disabled={busy}
          onChange={(event) => actions.changeName(event.target.value)}
        />
        <Button className="ui-primary" type="submit" disabled={busy}>
          {state.saving
            ? "Enregistrement…"
            : state.form.id === null
              ? "Créer le projet"
              : "Enregistrer"}
        </Button>
        {state.form.id !== null && (
          <Button disabled={busy} onClick={actions.cancel}>
            Annuler
          </Button>
        )}
      </form>
      {!state.loading && state.projects.length === 0 && (
        <div className="ui-empty">
          <h3>Votre premier projet commence ici.</h3>
          <p>Donnez-lui un nom, puis regroupez vos tâches.</p>
        </div>
      )}
      <ul className="ui-tasks ui-projects">
        {state.projects.map((project) => (
          <li key={project.id}>
            <div className="ui-task ui-project-title">
              {project.name}
              {project.archived && <small className="ui-project-status">Archivé</small>}
            </div>
            <div className="ui-row-actions">
              <Button
                disabled={busy}
                aria-label={`Renommer : ${project.name}`}
                onClick={() => actions.edit(project.id)}
              >
                Renommer
              </Button>
              {!project.archived && (
                <Button
                  disabled={busy}
                  className="ui-danger-text"
                  aria-label={`Archiver : ${project.name}`}
                  onClick={() => void actions.archive(project.id)}
                >
                  {state.busyId === project.id ? "Archivage…" : "Archiver"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="ui-project-status">Les tâches d’un projet archivé restent accessibles.</p>
    </PageContainer>
  );
}
