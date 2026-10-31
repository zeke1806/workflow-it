import type { InputHTMLAttributes } from "react";
import "../theme.css";

export function Checkbox({
  label,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { readonly label: string }) {
  return (
    <label className="ui-checkbox">
      <input {...props} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}
