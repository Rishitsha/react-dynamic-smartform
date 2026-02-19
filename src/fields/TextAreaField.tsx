import React from "react";
import { FieldProps } from "../types";

const TextareaField = ({
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
  rows = 4,
}: FieldProps & { rows?: number }) => (
  <div className="sf-field">
    <label htmlFor={name} className="sf-label">
      {label}
      {required && <span className="sf-required" aria-hidden="true"> *</span>}
    </label>
    <textarea
      id={name}
      name={name}
      className={`sf-input sf-textarea${error ? " sf-input--error" : ""}`}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
    />
    {helpText && !error && (
      <p id={`${name}-help`} className="sf-help">{helpText}</p>
    )}
    {error && (
      <p id={`${name}-error`} className="sf-error" role="alert">{error}</p>
    )}
  </div>
);

export default TextareaField;