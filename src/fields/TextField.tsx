import React from "react";
import { FieldProps } from "../types";

const TextField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled,
  helpText,
  required,
  type = "text",
}: FieldProps & { type?: string }) => (
  <div className="sf-field">
    <label htmlFor={name} className="sf-label">
      {label}
      {required && <span className="sf-required" aria-hidden="true"> *</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      className={`sf-input${error ? " sf-input--error" : ""}`}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={
        error ? `${name}-error` : helpText ? `${name}-help` : undefined
      }
    />
    {helpText && !error && (
      <p id={`${name}-help`} className="sf-help">{helpText}</p>
    )}
    {error && (
      <p id={`${name}-error`} className="sf-error" role="alert">{error}</p>
    )}
  </div>
);

export default TextField;