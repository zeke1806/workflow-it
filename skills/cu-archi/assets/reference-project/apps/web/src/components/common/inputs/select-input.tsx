import type { SelectHTMLAttributes } from "react";
import "../theme.css";

export function SelectInput({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { readonly label: string }) {
  return (
    <label className="ui-input">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}
