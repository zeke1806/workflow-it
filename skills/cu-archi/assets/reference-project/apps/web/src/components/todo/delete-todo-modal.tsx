import { Button } from "../common/buttons/button";
import { Modal } from "../common/overlays/modal";

export function DeleteTodoModal({
  title,
  busy,
  error,
  open,
  onCancel,
  onConfirm,
}: {
  readonly title: string;
  readonly busy: boolean;
  readonly error: string | null;
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <Modal title="Supprimer la tâche ?" open={open} onClose={onCancel}>
      <p>La tâche « {title} » sera supprimée définitivement.</p>
      {error && <p role="alert">{error}</p>}
      <div className="ui-form-actions">
        <Button disabled={busy} onClick={onCancel}>
          Annuler
        </Button>
        <Button className="ui-danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Suppression…" : "Confirmer la suppression"}
        </Button>
      </div>
    </Modal>
  );
}
