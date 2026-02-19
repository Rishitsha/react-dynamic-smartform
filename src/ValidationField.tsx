import { ValidationRule } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(
  value: any,
  rules: ValidationRule,
  allValues: Record<string, any>
): string | undefined {
  if (!rules) return undefined;

  // Required
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (rules.required) {
    if (isEmpty) {
      return typeof rules.required === "string"
        ? rules.required
        : "This field is required";
    }
  }

  if (isEmpty) return undefined; // Skip other rules if empty and not required

  // Email
  if (rules.email && !EMAIL_REGEX.test(value)) {
    return typeof rules.email === "string" ? rules.email : "Invalid email address";
  }

  // Min/Max for numbers
  if (typeof value === "number") {
    if (rules.min !== undefined && value < Number(rules.min)) {
      return typeof rules.min === "string" ? rules.min : `Minimum value is ${rules.min}`;
    }
    if (rules.max !== undefined && value > Number(rules.max)) {
      return typeof rules.max === "string" ? rules.max : `Maximum value is ${rules.max}`;
    }
  }

  // MinLength / MaxLength for strings
  if (typeof value === "string") {
    if (rules.minLength !== undefined && value.length < Number(rules.minLength)) {
      return typeof rules.minLength === "string"
        ? rules.minLength
        : `Minimum ${rules.minLength} characters required`;
    }
    if (rules.maxLength !== undefined && value.length > Number(rules.maxLength)) {
      return typeof rules.maxLength === "string"
        ? rules.maxLength
        : `Maximum ${rules.maxLength} characters allowed`;
    }

    // Pattern
    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }
  }

  // Custom validate function
  if (rules.validate) {
    const result = rules.validate(value, allValues);
    if (result !== true) return result;
  }

  return undefined;
}

export function validateForm(
  schema: Array<{ name: string; validation?: ValidationRule; showIf?: (v: any) => boolean }>,
  values: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema) {
    // Skip hidden fields
    if (field.showIf && !field.showIf(values)) continue;

    if (field.validation) {
      const error = validateField(values[field.name], field.validation, values);
      if (error) errors[field.name] = error;
    }
  }

  return errors;
}