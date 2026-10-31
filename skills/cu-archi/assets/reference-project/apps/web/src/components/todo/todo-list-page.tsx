import { todoHeader, todoFooter } from "./todo-chrome";
import { DeleteTodoModal } from "./delete-todo-modal";
import type { TodoState, TodoActions } from "../../services/todo/todo-types";
import { Button } from "../common/buttons/button";
import { TextInput } from "../common/inputs/text-input";
import { SelectInput } from "../common/inputs/select-input";
import { Checkbox } from "../common/inputs/checkbox";
import { PageContainer } from "../common/containers/page-container";

export function TodoListPage({
  state,
  actions,
}: {
  readonly state: TodoState;
  readonly actions: TodoActions;
}) {
  const pending = state.todos.filter((todo) => !todo.completed).length;
  const completed = state.todos.length - pending;

  const deletingTodo = state.todos.find((todo) => todo.id === state.deletingId);

  return (
    <>
      <PageContainer
        title={
          <>
            Une chose
            <br />
            <em>à la fois.</em>
          </>
        }
        description="Vos tâches, l’esprit libre. Notez ce qui compte, puis avancez à votre rythme."
        header={todoHeader}
        footer={todoFooter}
        action={
          <Button className="ui-primary" onClick={actions.newTodo}>
            Nouvelle tâche <span aria-hidden="true">+</span>
          </Button>
        }
      >
        <div className="ui-toolbar">
          <div>
            <h2>Mes tâches</h2>
            <p>
              {pending} à faire · {completed} {completed === 1 ? "terminée" : "terminées"}
              {state.search && " · résultats de recherche"}
            </p>
          </div>
          <div className="ui-list-filters">
            <SelectInput
              label="Projet"
              value={state.projectFilter ?? ""}
              onChange={(event) => void actions.changeProjectFilter(event.target.value || null)}
            >
              <option value="">Tous les projets</option>
              {state.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.archived ? " (archivé)" : ""}
                </option>
              ))}
            </SelectInput>
            <form
              className="ui-filter"
              onSubmit={(event) => {
                event.preventDefault();
                void actions.load();
              }}
            >
              <TextInput
                type="search"
                label="Rechercher"
                value={state.search}
                placeholder="Retrouver une tâche…"
                onChange={(event) => actions.changeSearch(event.target.value)}
              />
              <Button type="submit">Rechercher</Button>
            </form>
          </div>
        </div>
        {state.error && (
          <p className="ui-error" role="alert">
            {state.error}
          </p>
        )}
        {state.loading && (
          <p className="ui-message" role="status">
            Chargement des tâches…
          </p>
        )}
        {!state.loading && state.todos.length === 0 && (
          <div className="ui-empty">
            <h3>
              {state.search || state.projectFilter
                ? "Aucune tâche trouvée."
                : "De la place pour la suite."}
            </h3>
            <p>
              {state.search || state.projectFilter
                ? "Essayez une autre recherche ou un autre projet."
                : "Commencez par noter votre première tâche."}
            </p>
          </div>
        )}
        <ul className="ui-tasks">
          {state.todos.map((todo) => (
            <li key={todo.id} data-completed={todo.completed}>
              <div className="ui-task">
                <div className="ui-task-details">
                  <Checkbox
                    label={todo.title}
                    checked={todo.completed}
                    disabled={state.busyIds.includes(todo.id)}
                    onChange={() => void actions.toggle(todo.id)}
                  />
                  {todo.projectId !== null && (
                    <small className="ui-project-label">
                      {state.projects.find((project) => project.id === todo.projectId)?.name ??
                        "Projet indisponible"}
                      {state.projects.find((project) => project.id === todo.projectId)?.archived
                        ? " · archivé"
                        : ""}
                    </small>
                  )}
                </div>
              </div>
              <div className="ui-row-actions">
                <Button
                  disabled={state.busyIds.includes(todo.id)}
                  onClick={() => actions.edit(todo.id)}
                  aria-label={`Modifier : ${todo.title}`}
                >
                  Modifier
                </Button>
                <Button
                  disabled={state.busyIds.includes(todo.id)}
                  className="ui-danger-text"
                  onClick={() => actions.requestRemove(todo.id)}
                  aria-label={`Supprimer : ${todo.title}`}
                >
                  Supprimer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </PageContainer>
      <DeleteTodoModal
        open={state.deletingId !== null}
        title={deletingTodo?.title ?? ""}
        busy={state.busyIds.includes(state.deletingId ?? "")}
        error={state.error}
        onCancel={actions.cancelRemove}
        onConfirm={actions.confirmRemove}
      />
    </>
  );
}
