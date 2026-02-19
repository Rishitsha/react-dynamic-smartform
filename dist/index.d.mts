import * as react from 'react';
import react__default from 'react';

type FieldType = "text" | "number" | "select" | "email" | "password" | "textarea" | "checkbox" | "radio" | "date" | "file";
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
}
interface SelectOption {
    label: string;
    value: string;
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
}
interface SmartFormProps {
    schema: FieldSchema[];
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

declare const SmartForm: react__default.FC<SmartFormProps>;

declare function useSmartForm(schema: FieldSchema[], defaultValues?: Record<string, any>, onChange?: (data: Record<string, any>) => void, debounceMs?: number): {
    values: Record<string, any>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    setIsSubmitting: react.Dispatch<react.SetStateAction<boolean>>;
    handleChange: (name: string, rawValue: any) => void;
    handleBlur: (name: string) => void;
    validate: () => boolean;
    reset: () => void;
};

declare function validateField(value: any, rules: ValidationRule, allValues: Record<string, any>): string | undefined;
declare function validateForm(schema: Array<{
    name: string;
    validation?: ValidationRule;
    showIf?: (v: any) => boolean;
}>, values: Record<string, any>): Record<string, string>;

export { type ColSpan, type FieldProps, type FieldSchema, type FieldType, type SelectOption, SmartForm, type SmartFormProps, type ValidationRule, useSmartForm, validateField, validateForm };
