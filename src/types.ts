export type FieldType =
  | "text"
  | "number"
  | "select"
  | "email"
  | "password"
  | "textarea"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  // ── NEW ──
  | "daterange"
  | "signature"
  | "rating"
  | "slider"
  | "colorpicker"
  | "otp"
  | "repeatable"
  | "group"; // used inside repeatable rows

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ValidationRule {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: { value: RegExp; message: string };
  validate?: (value: any, allValues: Record<string, any>) => true | string;
  email?: boolean | string;
  // File-specific
  maxSize?: number;         // bytes
  accept?: string[];        // e.g. ["image/png","image/jpeg"]
  // OTP
  length?: number;
  // Repeatable
  minRows?: number;
  maxRows?: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

// ── Repeatable sub-field (trimmed FieldSchema without nesting) ──
export interface SubFieldSchema {
  name: string;
  label: string;
  type: Exclude<FieldType, "repeatable">;
  placeholder?: string;
  defaultValue?: any;
  col?: ColSpan;
  validation?: ValidationRule;
  options?: string[] | SelectOption[];
  optionsUrl?: string;
  disabled?: boolean | ((values: Record<string, any>) => boolean);
  helpText?: string;
  rows?: number;
}

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  col?: ColSpan;
  validation?: ValidationRule;
  options?: string[] | SelectOption[];
  optionsUrl?: string;
  showIf?: (values: Record<string, any>) => boolean;
  disabled?: boolean | ((values: Record<string, any>) => boolean);
  transform?: (value: any) => any;
  helpText?: string;
  rows?: number;

  // ── DateRange ──
  startLabel?: string;
  endLabel?: string;

  // ── File upload ──
  multiple?: boolean;
  accept?: string;           // HTML accept attr, e.g. "image/*,.pdf"
  maxSize?: number;          // bytes

  // ── Rating ──
  stars?: number;            // default 5

  // ── Slider ──
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;

  // ── OTP ──
  otpLength?: number;        // default 6

  // ── Repeatable ──
  fields?: SubFieldSchema[]; // sub-schema for each row
  addLabel?: string;
  removeLabel?: string;
}

// ── Multi-step ──
export interface StepSchema {
  title: string;
  description?: string;
  fields: FieldSchema[];
}

export interface SmartFormProps {
  schema?: FieldSchema[];
  steps?: StepSchema[];        // multi-step mode
  onSubmit: (data: Record<string, any>) => void;
  onChange?: (data: Record<string, any>) => void;
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  className?: string;
  gridCols?: number;
}

export interface FieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  helpText?: string;
  required?: boolean;
}