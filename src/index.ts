// ── Core components ──────────────────────────────────────────────────────────
export { default as SmartForm } from "./SmartForm";
export { default as SmartFormWizard } from "./SmartFormWizard";
export { FieldRenderer } from "./SmartFormWizard";

// ── Form Builder (visual playground) ─────────────────────────────────────────
export { default as FormBuilder } from "./builder/FormBuilder";

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useSmartForm } from "./useSmartForm";
export { useFormState } from "./hooks/useFormState";

// ── Validation ────────────────────────────────────────────────────────────────
export { validateField, validateForm } from "./ValidationField";

// ── Dev-time schema validation ────────────────────────────────────────────────
export {
  validateSchema,
  useSchemaValidation,
} from "./utils/Schemavalidator";
export type { SchemaWarning } from "./utils/Schemavalidator";

// ── Storybook generator ───────────────────────────────────────────────────────
export {
  generateStories,
  generateStoriesFile,
} from "./utils/storybookGenerator";

// ── Field components (for custom renderers) ───────────────────────────────────
export { default as TextField } from "./fields/TextField";
export { default as SelectField } from "./fields/SelectField";
export { default as NumberField } from "./fields/NumberField";
export { default as CheckboxField } from "./fields/CheckboxField";
export { default as RadioField } from "./fields/RadioField";
export { default as DateRangeField } from "./fields/DateRangeField";
export { default as FileUploadField } from "./fields/FileUploadField";
export { default as SignaturePad } from "./fields/SignaturePad";
export { default as RatingField, SliderField } from "./fields/RatingField";
export { default as ColorPickerField } from "./fields/ColorPickerField";
export { default as OTPField } from "./fields/OTPField";
export { default as RepeatableField } from "./fields/RepeatableField";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  FieldSchema,
  SubFieldSchema,
  FieldType,
  FieldProps,
  SelectOption,
  ValidationRule,
  SmartFormProps,
  StepSchema,
  ColSpan,
} from "./types";

export type { FormStateSnapshot } from "./hooks/useFormState";