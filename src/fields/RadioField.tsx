import React from "react";
import { FieldProps, SelectOption } from "../types";
import { normalizeOptions } from "../useOptions";

interface RadioFieldProps extends FieldProps {
  options?: string[] | SelectOption[];
}

const RadioField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  options: rawOptions = [],
}: RadioFieldProps) => {
  const options = normalizeOptions(rawOptions);

  return (
    <div className="sf-field" role="group" aria-labelledby={`${name}-legend`}>
      <span id={`${name}-legend`} className="sf-label">
        {label}
        {required && <span className="sf-required" aria-hidden="true"> *</span>}
      </span>
      <div className="sf-radio-group">
        {options.map(opt => (
          <label key={opt.value} className="sf-label--radio">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              onBlur={onBlur}
              disabled={disabled}
              className="sf-radio"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {helpText && !error && (
        <p className="sf-help">{helpText}</p>
      )}
      {error && (
        <p className="sf-error" role="alert">{error}</p>
      )}
    </div>
  );
};

export default RadioField;