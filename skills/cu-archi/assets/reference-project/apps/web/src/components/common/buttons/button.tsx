import type { ButtonHTMLAttributes } from "react";
import "../theme.css";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={`ui-button ${className}`} />;
}
