import React from "react";
import { FieldProps } from "../types";

const CheckboxField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
}: FieldProps) => (
  <div className="sf-field sf-field--checkbox">
    <label htmlFor={name} className="sf-label sf-label--checkbox">
      <input
        id={name}
        name={name}
        type="checkbox"
        className="sf-checkbox"
        checked={!!value}
        onChange={e => onChange(e.target.checked)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!error}
      />
      <span>{label}</span>
    </label>
    {helpText && !error && (
      <p id={`${name}-help`} className="sf-help">{helpText}</p>
    )}
    {error && (
      <p id={`${name}-error`} className="sf-error" role="alert">{error}</p>
    )}
  </div>
);

export default CheckboxField;