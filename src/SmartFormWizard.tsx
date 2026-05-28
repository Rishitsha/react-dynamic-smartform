import React, { useState, useCallback } from "react";
import { FieldSchema, StepSchema, SmartFormProps } from "./types";
import { useSmartForm } from "./useSmartForm";
import { validateForm } from "./ValidationField";

interface WizardProps extends Omit<SmartFormProps, "schema"> {
  steps: StepSchema[];
  onStepChange?: (step: number) => void;
}

const SmartFormWizard: React.FC<WizardProps> = ({
  steps,
  onSubmit,
  onChange,
  defaultValues,
  submitLabel = "Submit",
  className = "",
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const allFields = steps.reduce((acc, stepItem) => {
    acc.push(...stepItem.fields);
    return acc;
  }, [] as FieldSchema[]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
  } = useSmartForm(allFields, defaultValues, onChange);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Validate only current step's fields
  const validateStep = useCallback(() => {
    const stepErrors = validateForm(step.fields as any, values);
    return Object.keys(stepErrors).length === 0;
  }, [step.fields, values]);

  const goNext = useCallback(() => {
    if (!validateStep()) {
      // Touch all current step fields to show errors
      step.fields.forEach((f) => handleBlur(f.name));
      return;
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    onStepChange?.(next);
  }, [validateStep, currentStep, step.fields, handleBlur, onStepChange]);

  const goPrev = useCallback(() => {
    const prev = currentStep - 1;
    setCurrentStep(prev);
    onStepChange?.(prev);
  }, [currentStep, onStepChange]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep()) {
        step.fields.forEach((f) => handleBlur(f.name));
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateStep, step.fields, handleBlur, onSubmit, values, setIsSubmitting]
  );

  const progress =
    steps.length <= 1 ? 100 : (currentStep / (steps.length - 1)) * 100;

  return (
    <div className={`sf-wizard ${className}`.trim()}>
      {/* Step indicators */}
      <div className="sf-wizard__steps" role="tablist" aria-label="Form steps">
        {steps.map((s, idx) => {
          const state =
            idx < currentStep ? "done" : idx === currentStep ? "active" : "pending";
          return (
            <React.Fragment key={idx}>
              <div
                className={`sf-wizard__step sf-wizard__step--${state}`}
                role="tab"
                aria-selected={idx === currentStep}
                aria-label={`Step ${idx + 1}: ${s.title}`}
              >
                <div className="sf-wizard__step-circle">
                  {state === "done" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="sf-wizard__step-label">{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`sf-wizard__connector${idx < currentStep ? " sf-wizard__connector--done" : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="sf-wizard__progress-bar" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length}>
        <div className="sf-wizard__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div className="sf-wizard__content">
        {step.description && (
          <p className="sf-wizard__description">{step.description}</p>
        )}
        <form
          onSubmit={isLast ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}
          noValidate
        >
          <div className="sf-grid" style={{ "--sf-grid-cols": 12 } as React.CSSProperties}>
            {step.fields.map((field) => {
              if (field.showIf && !field.showIf(values)) return null;
              const isDisabled =
                typeof field.disabled === "function"
                  ? field.disabled(values)
                  : !!field.disabled;
              const colStyle = field.col ? { gridColumn: `span ${field.col}` } : undefined;
              // Import field rendering from SmartForm's renderField logic
              // We re-export a renderField helper to avoid duplication
              return (
                <div key={field.name} className="sf-field-wrapper" style={colStyle}>
                  <FieldRenderer
                    field={field}
                    value={values[field.name]}
                    error={touched[field.name] ? errors[field.name] : undefined}
                    onChange={(v: any) => handleChange(field.name, v)}
                    onBlur={() => handleBlur(field.name)}
                    isDisabled={isDisabled}
                    values={values}
                  />
                </div>
              );
            })}
          </div>

          <div className="sf-wizard__actions">
            {!isFirst && (
              <button type="button" className="sf-btn sf-btn--ghost" onClick={goPrev}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {!isLast && (
              <button type="submit" className="sf-btn sf-btn--primary">
                Next →
              </button>
            )}
            {isLast && (
              <button type="submit" className="sf-btn sf-btn--primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : submitLabel}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Step counter */}
      <p className="sf-wizard__counter">
        Step {currentStep + 1} of {steps.length}
      </p>
    </div>
  );
};

// ── Thin wrapper to render a single field (avoids duplicating SmartForm logic) ──
// In real package, SmartForm exposes renderField or shares a util — shown here inline.
import TextField from "./fields/TextField";
import SelectField from "./fields/SelectField";
import NumberField from "./fields/NumberField";
import TextareaField from "./fields/TextAreaField";
import RadioField from "./fields/RadioField";
import CheckboxField from "./fields/CheckboxField";
import DateRangeField from "./fields/DateRangeField";
import FileUploadField from "./fields/FileUploadField";
import SignaturePad from "./fields/SignaturePad";
import RatingField, { SliderField } from "./fields/RatingField";
import ColorPickerField from "./fields/ColorPickerField";
import OTPField from "./fields/OTPField";
import RepeatableField from "./fields/RepeatableField";

const FieldRenderer: React.FC<{
  field: FieldSchema;
  value: any;
  error?: string;
  onChange: (v: any) => void;
  onBlur: () => void;
  isDisabled: boolean;
  values: Record<string, any>;
}> = ({ field, value, error, onChange, onBlur, isDisabled, values }) => {
  const common = {
    name: field.name,
    label: field.label,
    value,
    onChange,
    onBlur,
    error,
    placeholder: field.placeholder,
    disabled: isDisabled,
    helpText: field.helpText,
    required: !!field.validation?.required,
  };
  switch (field.type) {
    case "text": return <TextField {...common} />;
    case "email": return <TextField {...common} type="email" />;
    case "password": return <TextField {...common} type="password" />;
    case "date": return <TextField {...common} type="date" />;
    case "number": return <NumberField {...common} />;
    case "textarea": return <TextareaField {...common} rows={field.rows} />;
    case "select": return <SelectField {...common} options={field.options} optionsUrl={field.optionsUrl} />;
    case "radio": return <RadioField {...common} options={field.options} />;
    case "checkbox": return <CheckboxField {...common} />;
    case "daterange": return <DateRangeField {...common} startLabel={field.startLabel} endLabel={field.endLabel} />;
    case "file": return <FileUploadField {...common} multiple={field.multiple} accept={field.accept} maxSize={field.maxSize} />;
    case "signature": return <SignaturePad {...common} />;
    case "rating": return <RatingField {...common} stars={field.stars} />;
    case "slider": return <SliderField {...common} min={field.min} max={field.max} step={field.step} showValue={field.showValue} />;
    case "colorpicker": return <ColorPickerField {...common} />;
    case "otp": return <OTPField {...common} otpLength={field.otpLength} />;
    case "repeatable": return (
      <RepeatableField
        {...common}
        fields={field.fields ?? []}
        addLabel={field.addLabel}
        removeLabel={field.removeLabel}
        minRows={field.validation?.minRows}
        maxRows={field.validation?.maxRows}
      />
    );
    default: return <TextField {...common} />;
  }
};

export { FieldRenderer };
export default SmartFormWizard;
