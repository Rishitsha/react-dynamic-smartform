import React from "react";
import { FieldProps, SelectOption } from "../types";
import { useOptions } from "../useOptions";

interface SelectFieldProps extends FieldProps {
  options?: string[] | SelectOption[];
  optionsUrl?: string;
}

const SelectField = ({
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
  options: staticOptions,
  optionsUrl,
}: SelectFieldProps) => {
  const { options, loading } = useOptions(staticOptions, optionsUrl);
  return (
    <div className="sf-field">
      <label htmlFor={name} className="sf-label">
        {label}
        {required && <span className="sf-required" aria-hidden="true"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        className={`sf-input sf-select${error ? " sf-input--error" : ""}`}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled || loading}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
      >
        <option value="">{loading ? "Loading…" : (placeholder || "Select an option")}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {helpText && !error && (
        <p id={`${name}-help`} className="sf-help">{helpText}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="sf-error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default SelectField;