import { useMemo } from "react";
import { FieldSchema } from "../types";
import { useSmartForm } from "../useSmartForm";

export interface FormStateSnapshot {
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
export function useFormState(
  schema: FieldSchema[],
  defaultValues?: Record<string, any>,
  onChange?: (data: Record<string, any>) => void
): FormStateSnapshot & ReturnType<typeof useSmartForm> {
  const form = useSmartForm(schema, defaultValues, onChange);
  const { values, errors, touched, isSubmitting } = form;

  const dirty = useMemo(() => {
    const d: Record<string, boolean> = {};
    for (const field of schema) {
      const def = defaultValues?.[field.name] ?? field.defaultValue ?? (field.type === "checkbox" ? false : "");
      d[field.name] = JSON.stringify(values[field.name]) !== JSON.stringify(def);
    }
    return d;
  }, [schema, values, defaultValues]);

  const isDirty = useMemo(() => Object.values(dirty).some(Boolean), [dirty]);

  const isValid = useMemo(
    () => Object.values(errors).every((e) => !e),
    [errors]
  );

  const completionPct = useMemo(() => {
    const required = schema.filter((f) => f.validation?.required);
    if (!required.length) return 100;
    const filled = required.filter((f) => {
      const v = values[f.name];
      return v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0);
    });
    return Math.round((filled.length / required.length) * 100);
  }, [schema, values]);

  return {
    ...form,
    dirty,
    isDirty,
    isValid,
    completionPct,
  };
}