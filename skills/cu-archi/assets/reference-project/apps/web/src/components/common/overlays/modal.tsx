import { useEffect, useRef, type ReactNode } from "react";
import "../theme.css";

export function Modal({
  title,
  children,
  open,
  onClose,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const dialogRef = useNativeDialog(open);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="ui-modal"
    >
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}

/** Technical DOM synchronization only; open remains owned by the caller's state. */
function useNativeDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node || !open) {
      return;
    }

    const previousFocus = document.activeElement;

    if (!node.open) {
      node.showModal();
    }

    return () => {
      node.close();

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [open]);

  return ref;
}
