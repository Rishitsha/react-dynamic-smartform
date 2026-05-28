import { FieldSchema, StepSchema, FieldType } from "../types";

const VALID_TYPES: FieldType[] = [
  "text", "number", "select", "email", "password", "textarea",
  "checkbox", "radio", "date", "file",
  "daterange", "signature", "rating", "slider", "colorpicker", "otp", "repeatable",
];

const KNOWN_FIELD_KEYS = new Set([
  "name", "label", "type", "placeholder", "defaultValue", "col",
  "validation", "options", "optionsUrl", "showIf", "disabled", "transform",
  "helpText", "rows", "startLabel", "endLabel", "multiple", "accept",
  "maxSize", "stars", "min", "max", "step", "showValue", "otpLength",
  "fields", "addLabel", "removeLabel",
]);

export interface SchemaWarning {
  field: string;
  message: string;
  severity: "error" | "warning";
}

function warnField(field: FieldSchema, idx: number): SchemaWarning[] {
  const warnings: SchemaWarning[] = [];
  const ref = `fields[${idx}] (${field.name ?? "unknown"})`;

  // Required keys
  if (!field.name) {
    warnings.push({ field: ref, message: "`name` is required", severity: "error" });
  }
  if (!field.label) {
    warnings.push({ field: ref, message: "`label` is required", severity: "error" });
  }
  if (!field.type) {
    warnings.push({ field: ref, message: "`type` is required", severity: "error" });
  } else if (!VALID_TYPES.includes(field.type)) {
    warnings.push({
      field: ref,
      message: `Unknown type "${field.type}". Valid types: ${VALID_TYPES.join(", ")}`,
      severity: "error",
    });
  }

  // Type-specific checks
  if ((field.type === "select" || field.type === "radio") && !field.options && !field.optionsUrl) {
    warnings.push({
      field: ref,
      message: `type "${field.type}" should have \`options\` or \`optionsUrl\``,
      severity: "warning",
    });
  }
  if (field.type === "repeatable" && (!field.fields || field.fields.length === 0)) {
    warnings.push({
      field: ref,
      message: `type "repeatable" requires a \`fields\` array`,
      severity: "error",
    });
  }
  if (field.type === "otp" && field.otpLength !== undefined && (field.otpLength < 4 || field.otpLength > 12)) {
    warnings.push({
      field: ref,
      message: `\`otpLength\` should be between 4 and 12`,
      severity: "warning",
    });
  }
  if (field.col !== undefined && (field.col < 1 || field.col > 12)) {
    warnings.push({
      field: ref,
      message: `\`col\` must be between 1 and 12`,
      severity: "error",
    });
  }

  // Unknown keys
  for (const key of Object.keys(field)) {
    if (!KNOWN_FIELD_KEYS.has(key)) {
      warnings.push({
        field: ref,
        message: `Unknown key "${key}" — did you mean a valid prop? (may be ignored)`,
        severity: "warning",
      });
    }
  }

  // Validation sanity
  if (field.validation) {
    const v = field.validation;
    if (v.min !== undefined && v.max !== undefined && Number(v.min) > Number(v.max)) {
      warnings.push({ field: ref, message: "`min` is greater than `max`", severity: "error" });
    }
    if (v.minLength !== undefined && v.maxLength !== undefined && Number(v.minLength) > Number(v.maxLength)) {
      warnings.push({ field: ref, message: "`minLength` is greater than `maxLength`", severity: "error" });
    }
  }

  // Duplicate name detection handled at schema level
  return warnings;
}

/**
 * validateSchema
 *
 * Call at dev time (e.g. inside useEffect with process.env.NODE_ENV === "development")
 * to surface schema mistakes early.
 *
 * @returns Array of SchemaWarning objects
 */
export function validateSchema(
  schema: FieldSchema[] | StepSchema[]
): SchemaWarning[] {
  const warnings: SchemaWarning[] = [];

  // Detect if it's a step schema
  const isSteps = schema.length > 0 && "fields" in schema[0] && "title" in schema[0];
  const flatFields: FieldSchema[] = isSteps
    ? (schema as StepSchema[]).reduce((acc, stepItem) => {
        acc.push(...stepItem.fields);
        return acc;
      }, [] as FieldSchema[])
    : (schema as FieldSchema[]);

  // Per-field checks
  flatFields.forEach((f, idx) => {
    warnings.push(...warnField(f, idx));
  });

  // Duplicate name check
  const names = flatFields.map((f) => f.name).filter(Boolean);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length > 0) {
    const unique = [...new Set(dupes)];
    unique.forEach((n) => {
      warnings.push({
        field: n,
        message: `Duplicate field name "${n}" detected. Names must be unique.`,
        severity: "error",
      });
    });
  }

  return warnings;
}

/**
 * useSchemaValidation
 *
 * Hook that runs validateSchema in development and logs warnings to the console.
 */
export function useSchemaValidation(schema: FieldSchema[] | StepSchema[]) {
  const nodeEnv =
    (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV;
  if (nodeEnv !== "development") return;
  // Run synchronously on each render in dev (cheap, schema is rarely large)
  const warnings = validateSchema(schema);
  if (warnings.length === 0) return;

  console.groupCollapsed(
    `%c[react-dynamic-smartform] Schema warnings (${warnings.length})`,
    "color: #f59e0b; font-weight: bold;"
  );
  for (const w of warnings) {
    const style = w.severity === "error" ? "color:#ef4444" : "color:#f59e0b";
    console.warn(`%c[${w.severity.toUpperCase()}] ${w.field}: ${w.message}`, style);
  }
  console.groupEnd();
}
