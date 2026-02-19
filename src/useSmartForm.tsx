import { useState, useCallback, useRef, useEffect } from "react";
import { FieldSchema } from "./types";
import { validateField, validateForm } from "./ValidationField";

function getInitialValues(schema: FieldSchema[], defaultValues?: Record<string, any>) {
  const values: Record<string, any> = {};
  for (const field of schema) {
    values[field.name] =
      defaultValues?.[field.name] ??
      field.defaultValue ??
      (field.type === "checkbox" ? false : "");
  }
  return values;
}

export function useSmartForm(
  schema: FieldSchema[],
  defaultValues?: Record<string, any>,
  onChange?: (data: Record<string, any>) => void,
  debounceMs = 0
) {
  const [values, setValues] = useState<Record<string, any>>(() =>
    getInitialValues(schema, defaultValues)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleChange = useCallback(
    (name: string, rawValue: any) => {
      // Apply transform if defined
      const field = schema.find(f => f.name === name);
      const value = field?.transform ? field.transform(rawValue) : rawValue;

      setValues(prev => {
        const next = { ...prev, [name]: value };

        // Debounced onChange callback
        if (onChangeRef.current) {
          if (debounceMs > 0) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => onChangeRef.current!(next), debounceMs);
          } else {
            onChangeRef.current(next);
          }
        }

        return next;
      });

      // Clear error on change if touched
      if (touched[name] && field?.validation) {
        setValues(prev => {
          const next = { ...prev, [name]: value };
          const error = validateField(value, field.validation!, next);
          setErrors(e => ({ ...e, [name]: error || "" }));
          return next;
        });
      }
    },
    [schema, touched, debounceMs]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched(prev => ({ ...prev, [name]: true }));
      const field = schema.find(f => f.name === name);
      if (field?.validation) {
        const error = validateField(values[name], field.validation, values);
        setErrors(prev => ({ ...prev, [name]: error || "" }));
      }
    },
    [schema, values]
  );

  const validate = useCallback(() => {
    const errs = validateForm(schema, values);
    setErrors(errs);
    // Mark all as touched
    const allTouched: Record<string, boolean> = {};
    schema.forEach(f => (allTouched[f.name] = true));
    setTouched(allTouched);
    return Object.keys(errs).length === 0;
  }, [schema, values]);

  const reset = useCallback(() => {
    setValues(getInitialValues(schema, defaultValues));
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [schema, defaultValues]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validate,
    reset,
  };
}