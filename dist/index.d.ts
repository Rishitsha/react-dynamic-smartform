import * as React from 'react';
import React__default from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type FieldType = "text" | "number" | "select" | "email" | "password" | "textarea" | "checkbox" | "radio" | "date" | "file" | "daterange" | "signature" | "rating" | "slider" | "colorpicker" | "otp" | "repeatable" | "group";
type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
interface ValidationRule {
    required?: boolean | string;
    min?: number | string;
    max?: number | string;
    minLength?: number | string;
    maxLength?: number | string;
    pattern?: {
        value: RegExp;
        message: string;
    };
    validate?: (value: any, allValues: Record<string, any>) => true | string;
    email?: boolean | string;
    maxSize?: number;
    accept?: string[];
    length?: number;
    minRows?: number;
    maxRows?: number;
}
interface SelectOption {
    label: string;
    value: string;
}
interface SubFieldSchema {
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
interface FieldSchema {
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
    startLabel?: string;
    endLabel?: string;
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
    stars?: number;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    otpLength?: number;
    fields?: SubFieldSchema[];
    addLabel?: string;
    removeLabel?: string;
}
interface StepSchema {
    title: string;
    description?: string;
    fields: FieldSchema[];
}
interface SmartFormProps {
    schema?: FieldSchema[];
    steps?: StepSchema[];
    onSubmit: (data: Record<string, any>) => void;
    onChange?: (data: Record<string, any>) => void;
    defaultValues?: Record<string, any>;
    submitLabel?: string;
    className?: string;
    gridCols?: number;
}
interface FieldProps {
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

declare const SmartForm: React__default.FC<SmartFormProps>;

interface WizardProps extends Omit<SmartFormProps, "schema"> {
    steps: StepSchema[];
    onStepChange?: (step: number) => void;
}
declare const SmartFormWizard: React__default.FC<WizardProps>;
declare const FieldRenderer: React__default.FC<{
    field: FieldSchema;
    value: any;
    error?: string;
    onChange: (v: any) => void;
    onBlur: () => void;
    isDisabled: boolean;
    values: Record<string, any>;
}>;

declare const FormBuilder: React__default.FC<{
    initialSchema?: FieldSchema[];
    onChange?: (schema: FieldSchema[]) => void;
}>;

declare function useSmartForm(schema: FieldSchema[], defaultValues?: Record<string, any>, onChange?: (data: Record<string, any>) => void, debounceMs?: number): {
    values: Record<string, any>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    handleChange: (name: string, rawValue: any) => void;
    handleBlur: (name: string) => void;
    validate: () => boolean;
    reset: () => void;
};

interface FormStateSnapshot {
    /** Current field values */
    values: Record<string, any>;
    /** Current validation errors */
    errors: Record<string, string>;
    /** Which fields have been interacted with */
    touched: Record<string, boolean>;
    /** Fields whose value differs from defaultValues */
    dirty: Record<string, boolean>;
    /** True if any field is dirty */
    isDirty: boolean;
    /** True if all touched fields pass validation */
    isValid: boolean;
    /** True if the form is in the process of submitting */
    isSubmitting: boolean;
    /** Percentage of required fields that are filled (0-100) */
    completionPct: number;
}
/**
 * useFormState
 *
 * A read-only view of form internals, decoupled from rendering.
 * Useful for progress bars, save indicators, conditional UI outside the form, etc.
 *
 * @example
 * const { isDirty, completionPct, isValid } = useFormState(schema, defaultValues);
 */
declare function useFormState(schema: FieldSchema[], defaultValues?: Record<string, any>, onChange?: (data: Record<string, any>) => void): FormStateSnapshot & ReturnType<typeof useSmartForm>;

declare function validateField(value: any, rules: ValidationRule, allValues: Record<string, any>): string | undefined;
declare function validateForm(schema: Array<{
    name: string;
    validation?: ValidationRule;
    showIf?: (v: any) => boolean;
}>, values: Record<string, any>): Record<string, string>;

interface SchemaWarning {
    field: string;
    message: string;
    severity: "error" | "warning";
}
/**
 * validateSchema
 *
 * Call at dev time (e.g. inside useEffect with process.env.NODE_ENV === "development")
 * to surface schema mistakes early.
 *
 * @returns Array of SchemaWarning objects
 */
declare function validateSchema(schema: FieldSchema[] | StepSchema[]): SchemaWarning[];
/**
 * useSchemaValidation
 *
 * Hook that runs validateSchema in development and logs warnings to the console.
 */
declare function useSchemaValidation(schema: FieldSchema[] | StepSchema[]): void;

/**
 * generateStories
 *
 * Generates Storybook CSF (Component Story Format v3) story source code
 * from a SmartForm schema. Outputs a string you can write to `<Name>.stories.tsx`.
 *
 * @example
 * // In your build script or a CLI tool:
 * const code = generateStories(schema, "ContactForm");
 * fs.writeFileSync("ContactForm.stories.tsx", code);
 */
declare function generateStories(schema: FieldSchema[] | StepSchema[], componentName?: string, importPath?: string): string;
/**
 * generateStoriesFile
 *
 * Convenience wrapper — returns the stories content ready to write to disk.
 */
declare function generateStoriesFile(schema: FieldSchema[] | StepSchema[], componentName: string, importPath?: string): {
    filename: string;
    content: string;
};

declare const TextField: ({ name, label, value, onChange, onBlur, error, placeholder, disabled, helpText, required, type, }: FieldProps & {
    type?: string;
}) => react_jsx_runtime.JSX.Element;

interface SelectFieldProps extends FieldProps {
    options?: string[] | SelectOption[];
    optionsUrl?: string;
}
declare const SelectField: ({ name, label, value, onChange, onBlur, error, placeholder, disabled, helpText, required, options: staticOptions, optionsUrl, }: SelectFieldProps) => react_jsx_runtime.JSX.Element;

declare const NumberField: ({ name, label, value, onChange, onBlur, error, placeholder, disabled, helpText, required, }: FieldProps) => react_jsx_runtime.JSX.Element;

declare const CheckboxField: ({ name, label, value, onChange, onBlur, error, disabled, helpText, }: FieldProps) => react_jsx_runtime.JSX.Element;

interface RadioFieldProps extends FieldProps {
    options?: string[] | SelectOption[];
}
declare const RadioField: ({ name, label, value, onChange, onBlur, error, disabled, helpText, required, options: rawOptions, }: RadioFieldProps) => react_jsx_runtime.JSX.Element;

interface DateRangeValue {
    start: string;
    end: string;
}
interface DateRangeFieldProps extends Omit<FieldProps, "value"> {
    value: DateRangeValue | null;
    startLabel?: string;
    endLabel?: string;
}
declare const DateRangeField: React__default.FC<DateRangeFieldProps>;

interface FileUploadFieldProps extends FieldProps {
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
}
declare const FileUploadField: React__default.FC<FileUploadFieldProps>;

declare const SignaturePad: React__default.FC<FieldProps>;

interface RatingFieldProps extends FieldProps {
    stars?: number;
}
declare const RatingField: React__default.FC<RatingFieldProps>;
interface SliderFieldProps extends FieldProps {
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
}
declare const SliderField: React__default.FC<SliderFieldProps>;

declare const ColorPickerField: React__default.FC<FieldProps>;

interface OTPFieldProps extends FieldProps {
    otpLength?: number;
}
declare const OTPField: React__default.FC<OTPFieldProps>;

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
declare const RepeatableField: React__default.FC<RepeatableFieldProps>;

export { CheckboxField, type ColSpan, ColorPickerField, DateRangeField, type FieldProps, FieldRenderer, type FieldSchema, type FieldType, FileUploadField, FormBuilder, type FormStateSnapshot, NumberField, OTPField, RadioField, RatingField, RepeatableField, type SchemaWarning, SelectField, type SelectOption, SignaturePad, SliderField, SmartForm, type SmartFormProps, SmartFormWizard, type StepSchema, type SubFieldSchema, TextField, type ValidationRule, generateStories, generateStoriesFile, useFormState, useSchemaValidation, useSmartForm, validateField, validateForm, validateSchema };
