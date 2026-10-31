import type { ReactNode } from "react";
import "../theme.css";

export function PageContainer({
  title,
  children,
  header,
  footer,
  description,
  action,
}: {
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly header?: ReactNode;
  readonly footer?: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <main className="ui" lang="fr">
      <div className="ui-shell">
        {header && <header className="ui-header">{header}</header>}
        <div className="ui-intro">
          <div>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
        <div className="ui-work">{children}</div>
        {footer && <footer className="ui-footer">{footer}</footer>}
      </div>
    </main>
  );
}
