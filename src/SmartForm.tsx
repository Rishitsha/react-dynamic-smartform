import React, { useCallback } from "react";
import { FieldSchema, SmartFormProps } from "./types";
import { useSmartForm } from "./useSmartForm";
import TextField from "./fields/TextField";
import SelectField from "./fields/SelectField";
import NumberField from "./fields/NumberField";
import TextareaField from "./fields/TextAreaField";
import RadioField from "./fields/RadioField";
import CheckboxField from "./fields/CheckboxField";


const SmartForm: React.FC<SmartFormProps> = ({
  schema,
  onSubmit,
  onChange,
  defaultValues,
  submitLabel = "Submit",
  className = "",
  gridCols = 12,
}) => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validate,
    reset,
  } = useSmartForm(schema, defaultValues, onChange);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, values, setIsSubmitting]
  );

  const renderField = useCallback(
    (field: FieldSchema) => {
      // Conditional visibility
      if (field.showIf && !field.showIf(values)) return null;

      const isDisabled =
        typeof field.disabled === "function"
          ? field.disabled(values)
          : !!field.disabled;

      const commonProps = {
        name: field.name,
        label: field.label,
        value: values[field.name],
        onChange: (v: any) => handleChange(field.name, v),
        onBlur: () => handleBlur(field.name),
        error: touched[field.name] ? errors[field.name] : undefined,
        placeholder: field.placeholder,
        disabled: isDisabled,
        helpText: field.helpText,
        required: !!field.validation?.required,
      };

      const colStyle = field.col
        ? { gridColumn: `span ${field.col}` }
        : undefined;

      let fieldEl: React.ReactNode;

      switch (field.type) {
        case "text":
          fieldEl = <TextField {...commonProps} />;
          break;
        case "email":
          fieldEl = <TextField {...commonProps} type="email" />;
          break;
        case "password":
          fieldEl = <TextField {...commonProps} type="password" />;
          break;
        case "date":
          fieldEl = <TextField {...commonProps} type="date" />;
          break;
        case "number":
          fieldEl = <NumberField {...commonProps} />;
          break;
        case "textarea":
          fieldEl = <TextareaField {...commonProps} rows={field.rows} />;
          break;
        case "select":
          fieldEl = (
            <SelectField
              {...commonProps}
              options={field.options}
              optionsUrl={field.optionsUrl}
            />
          );
          break;
        case "radio":
          fieldEl = <RadioField {...commonProps} options={field.options} />;
          break;
        case "checkbox":
          fieldEl = <CheckboxField {...commonProps} />;
          break;
        default:
          fieldEl = <TextField {...commonProps} />;
      }

      return (
        <div key={field.name} className="sf-field-wrapper" style={colStyle}>
          {fieldEl}
        </div>
      );
    },
    [values, errors, touched, handleChange, handleBlur]
  );

  return (
    <form
      className={`sf-form ${className}`.trim()}
      onSubmit={handleSubmit}
      noValidate
      style={{ "--sf-grid-cols": gridCols } as React.CSSProperties}
    >
      <div className="sf-grid">
        {schema.map(renderField)}
      </div>
      <div className="sf-actions">
        <button
          type="submit"
          className="sf-btn sf-btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : submitLabel}
        </button>
        <button
          type="button"
          className="sf-btn sf-btn--ghost"
          onClick={reset}
          disabled={isSubmitting}
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default SmartForm;