import React, { useCallback } from "react";
import { SubFieldSchema } from "../types";

interface RepeatableFieldProps {
  name: string;
  label: string;
  value: Array<Record<string, any>>;
  onChange: (value: Array<Record<string, any>>) => void;
  onBlur: () => void;
  error?: string | string[];
  disabled?: boolean;
  helpText?: string;
  required?: boolean;
  fields: SubFieldSchema[];
  addLabel?: string;
  removeLabel?: string;
  minRows?: number;
  maxRows?: number;
}

function emptyRow(fields: SubFieldSchema[]): Record<string, any> {
  const row: Record<string, any> = {};
  for (const f of fields) {
    row[f.name] = f.defaultValue ?? (f.type === "checkbox" ? false : "");
  }
  return row;
}

// Lightweight inline renderer for sub-fields inside a repeatable row
const InlineField: React.FC<{
  field: SubFieldSchema;
  value: any;
  onChange: (v: any) => void;
  error?: string;
  disabled?: boolean;
  rowIdx: number;
}> = ({ field, value, onChange, error, disabled, rowIdx }) => {
  const id = `${field.name}-${rowIdx}`;
  const isDisabled =
    typeof field.disabled === "function"
      ? field.disabled({})
      : !!field.disabled || !!disabled;

  const baseProps = {
    id,
    name: id,
    className: `sf-input${error ? " sf-input--error" : ""}`,
    disabled: isDisabled,
    placeholder: field.placeholder,
  };

  let input: React.ReactNode;
  if (field.type === "select") {
    const opts: Array<{ label: string; value: string }> = (field.options || []).map((o) =>
      typeof o === "string" ? { label: o, value: o } : o
    );
    input = (
      <select {...baseProps} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select --</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  } else if (field.type === "checkbox") {
    input = (
      <input
        {...baseProps}
        type="checkbox"
        className="sf-checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  } else if (field.type === "textarea") {
    input = (
      <textarea
        {...baseProps}
        className={`sf-input sf-textarea${error ? " sf-input--error" : ""}`}
        rows={field.rows ?? 2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else {
    input = (
      <input
        {...baseProps}
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className="sf-repeatable__cell" style={{ gridColumn: `span ${field.col ?? 12}` }}>
      <label htmlFor={id} className="sf-repeatable__cell-label">
        {field.label}
        {field.validation?.required && <span className="sf-required"> *</span>}
      </label>
      {input}
      {error && <p className="sf-error">{error}</p>}
    </div>
  );
};

const RepeatableField: React.FC<RepeatableFieldProps> = ({
  name,
  label,
  value = [],
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  fields,
  addLabel = "+ Add Row",
  removeLabel = "Remove",
  minRows = 0,
  maxRows = Infinity,
}) => {
  const addRow = useCallback(() => {
    if (value.length >= maxRows) return;
    onChange([...value, emptyRow(fields)]);
  }, [value, fields, maxRows, onChange]);

  const removeRow = useCallback(
    (idx: number) => {
      if (value.length <= minRows) return;
      const next = value.filter((_, i) => i !== idx);
      onChange(next);
    },
    [value, minRows, onChange]
  );

  const updateCell = useCallback(
    (rowIdx: number, fieldName: string, v: any) => {
      const next = value.map((row, i) =>
        i === rowIdx ? { ...row, [fieldName]: v } : row
      );
      onChange(next);
    },
    [value, onChange]
  );

  // Normalise row-level errors: string[] → index array; string → top-level
  const rowErrors: Record<number, Record<string, string>> = {};

  return (
    <div className="sf-field">
      <div className="sf-repeatable__header">
        <label className="sf-label">
          {label}
          {required && <span className="sf-required"> *</span>}
        </label>
        {value.length < maxRows && (
          <button
            type="button"
            className="sf-btn sf-btn--ghost sf-repeatable__add"
            onClick={addRow}
            disabled={disabled}
          >
            {addLabel}
          </button>
        )}
      </div>

      {value.length === 0 && (
        <div className="sf-repeatable__empty">No rows yet. Click "{addLabel}" to start.</div>
      )}

      <div className="sf-repeatable__rows">
        {value.map((row, rowIdx) => (
          <div key={rowIdx} className="sf-repeatable__row">
            <div className="sf-repeatable__row-index">{rowIdx + 1}</div>
            <div className="sf-repeatable__row-fields">
              {fields.map((f) => (
                <InlineField
                  key={f.name}
                  field={f}
                  value={row[f.name]}
                  onChange={(v) => updateCell(rowIdx, f.name, v)}
                  error={rowErrors[rowIdx]?.[f.name]}
                  disabled={disabled}
                  rowIdx={rowIdx}
                />
              ))}
            </div>
            {value.length > minRows && (
              <button
                type="button"
                className="sf-repeatable__remove"
                onClick={() => removeRow(rowIdx)}
                disabled={disabled}
                title={removeLabel}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {typeof error === "string" && <p className="sf-error" role="alert">{error}</p>}
      {helpText && !error && <p className="sf-help">{helpText}</p>}
    </div>
  );
};

export default RepeatableField;