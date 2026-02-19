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
  | "file";

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
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  col?: ColSpan; // grid column span out of 12
  validation?: ValidationRule;
  options?: string[] | SelectOption[];
  optionsUrl?: string; // API-driven options
  showIf?: (values: Record<string, any>) => boolean;
  disabled?: boolean | ((values: Record<string, any>) => boolean);
  transform?: (value: any) => any; // transform value before storing
  helpText?: string;
  rows?: number; // for textarea
}

export interface SmartFormProps {
  schema: FieldSchema[];
  onSubmit: (data: Record<string, any>) => void;
  onChange?: (data: Record<string, any>) => void;
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  className?: string;
  gridCols?: number; // default 12
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