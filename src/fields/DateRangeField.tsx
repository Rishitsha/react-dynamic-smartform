import React from "react";
import { FieldProps } from "../types";

interface DateRangeValue {
  start: string;
  end: string;
}

interface DateRangeFieldProps extends Omit<FieldProps, "value"> {
  value: DateRangeValue | null;
  startLabel?: string;
  endLabel?: string;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  startLabel = "Start Date",
  endLabel = "End Date",
}) => {
  const start = value?.start ?? "";
  const end = value?.end ?? "";

  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ start: e.target.value, end });
  };

  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ start, end: e.target.value });
  };

  return (
    <div className="sf-field">
      <label className="sf-label">
        {label}
        {required && <span className="sf-required"> *</span>}
      </label>
      <div className="sf-daterange">
        <div className="sf-daterange__group">
          <label className="sf-daterange__sublabel">{startLabel}</label>
          <input
            id={`${name}-start`}
            type="date"
            className={`sf-input${error ? " sf-input--error" : ""}`}
            value={start}
            max={end || undefined}
            onChange={handleStart}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={!!error}
          />
        </div>
        <div className="sf-daterange__separator">→</div>
        <div className="sf-daterange__group">
          <label className="sf-daterange__sublabel">{endLabel}</label>
          <input
            id={`${name}-end`}
            type="date"
            className={`sf-input${error ? " sf-input--error" : ""}`}
            value={end}
            min={start || undefined}
            onChange={handleEnd}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={!!error}
          />
        </div>
      </div>
      {helpText && !error && <p className="sf-help">{helpText}</p>}
      {error && <p className="sf-error" role="alert">{error}</p>}
    </div>
  );
};

export default DateRangeField;