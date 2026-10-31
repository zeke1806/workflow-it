import type { InputHTMLAttributes } from "react";
import "../theme.css";

export function TextInput({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { readonly label: string }) {
  return (
    <label className="ui-input">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
