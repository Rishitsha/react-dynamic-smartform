var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/SmartForm.tsx
import { useCallback as useCallback6 } from "react";

// src/useSmartForm.tsx
import { useState, useCallback, useRef, useEffect } from "react";

// src/ValidationField.tsx
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateField(value, rules, allValues) {
  if (!rules) return void 0;
  const isEmpty = value === void 0 || value === null || value === "" || Array.isArray(value) && value.length === 0;
  if (rules.required) {
    if (isEmpty) {
      return typeof rules.required === "string" ? rules.required : "This field is required";
    }
  }
  if (isEmpty) return void 0;
  if (rules.email && !EMAIL_REGEX.test(value)) {
    return typeof rules.email === "string" ? rules.email : "Invalid email address";
  }
  if (typeof value === "number") {
    if (rules.min !== void 0 && value < Number(rules.min)) {
      return typeof rules.min === "string" ? rules.min : `Minimum value is ${rules.min}`;
    }
    if (rules.max !== void 0 && value > Number(rules.max)) {
      return typeof rules.max === "string" ? rules.max : `Maximum value is ${rules.max}`;
    }
  }
  if (typeof value === "string") {
    if (rules.minLength !== void 0 && value.length < Number(rules.minLength)) {
      return typeof rules.minLength === "string" ? rules.minLength : `Minimum ${rules.minLength} characters required`;
    }
    if (rules.maxLength !== void 0 && value.length > Number(rules.maxLength)) {
      return typeof rules.maxLength === "string" ? rules.maxLength : `Maximum ${rules.maxLength} characters allowed`;
    }
    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }
  }
  if (rules.validate) {
    const result = rules.validate(value, allValues);
    if (result !== true) return result;
  }
  return void 0;
}
function validateForm(schema, values) {
  const errors = {};
  for (const field of schema) {
    if (field.showIf && !field.showIf(values)) continue;
    if (field.validation) {
      const error = validateField(values[field.name], field.validation, values);
      if (error) errors[field.name] = error;
    }
  }
  return errors;
}

// src/useSmartForm.tsx
function getInitialValues(schema, defaultValues) {
  var _a, _b;
  const values = {};
  for (const field of schema) {
    values[field.name] = (_b = (_a = defaultValues == null ? void 0 : defaultValues[field.name]) != null ? _a : field.defaultValue) != null ? _b : field.type === "checkbox" ? false : "";
  }
  return values;
}
function useSmartForm(schema, defaultValues, onChange, debounceMs = 0) {
  const [values, setValues] = useState(
    () => getInitialValues(schema, defaultValues)
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const handleChange = useCallback(
    (name, rawValue) => {
      const field = schema.find((f) => f.name === name);
      const value = (field == null ? void 0 : field.transform) ? field.transform(rawValue) : rawValue;
      setValues((prev) => {
        const next = __spreadProps(__spreadValues({}, prev), { [name]: value });
        if (onChangeRef.current) {
          if (debounceMs > 0) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => onChangeRef.current(next), debounceMs);
          } else {
            onChangeRef.current(next);
          }
        }
        return next;
      });
      if (touched[name] && (field == null ? void 0 : field.validation)) {
        setValues((prev) => {
          const next = __spreadProps(__spreadValues({}, prev), { [name]: value });
          const error = validateField(value, field.validation, next);
          setErrors((e) => __spreadProps(__spreadValues({}, e), { [name]: error || "" }));
          return next;
        });
      }
    },
    [schema, touched, debounceMs]
  );
  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => __spreadProps(__spreadValues({}, prev), { [name]: true }));
      const field = schema.find((f) => f.name === name);
      if (field == null ? void 0 : field.validation) {
        const error = validateField(values[name], field.validation, values);
        setErrors((prev) => __spreadProps(__spreadValues({}, prev), { [name]: error || "" }));
      }
    },
    [schema, values]
  );
  const validate = useCallback(() => {
    const errs = validateForm(schema, values);
    setErrors(errs);
    const allTouched = {};
    schema.forEach((f) => allTouched[f.name] = true);
    setTouched(allTouched);
    return Object.keys(errs).length === 0;
  }, [schema, values]);
  const reset = useCallback(() => {
    setValues(getInitialValues(schema, defaultValues));
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [schema, defaultValues]);
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
    reset
  };
}

// src/utils/Schemavalidator.ts
var VALID_TYPES = [
  "text",
  "number",
  "select",
  "email",
  "password",
  "textarea",
  "checkbox",
  "radio",
  "date",
  "file",
  "daterange",
  "signature",
  "rating",
  "slider",
  "colorpicker",
  "otp",
  "repeatable"
];
var KNOWN_FIELD_KEYS = /* @__PURE__ */ new Set([
  "name",
  "label",
  "type",
  "placeholder",
  "defaultValue",
  "col",
  "validation",
  "options",
  "optionsUrl",
  "showIf",
  "disabled",
  "transform",
  "helpText",
  "rows",
  "startLabel",
  "endLabel",
  "multiple",
  "accept",
  "maxSize",
  "stars",
  "min",
  "max",
  "step",
  "showValue",
  "otpLength",
  "fields",
  "addLabel",
  "removeLabel"
]);
function warnField(field, idx) {
  var _a;
  const warnings = [];
  const ref = `fields[${idx}] (${(_a = field.name) != null ? _a : "unknown"})`;
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
      severity: "error"
    });
  }
  if ((field.type === "select" || field.type === "radio") && !field.options && !field.optionsUrl) {
    warnings.push({
      field: ref,
      message: `type "${field.type}" should have \`options\` or \`optionsUrl\``,
      severity: "warning"
    });
  }
  if (field.type === "repeatable" && (!field.fields || field.fields.length === 0)) {
    warnings.push({
      field: ref,
      message: `type "repeatable" requires a \`fields\` array`,
      severity: "error"
    });
  }
  if (field.type === "otp" && field.otpLength !== void 0 && (field.otpLength < 4 || field.otpLength > 12)) {
    warnings.push({
      field: ref,
      message: `\`otpLength\` should be between 4 and 12`,
      severity: "warning"
    });
  }
  if (field.col !== void 0 && (field.col < 1 || field.col > 12)) {
    warnings.push({
      field: ref,
      message: `\`col\` must be between 1 and 12`,
      severity: "error"
    });
  }
  for (const key of Object.keys(field)) {
    if (!KNOWN_FIELD_KEYS.has(key)) {
      warnings.push({
        field: ref,
        message: `Unknown key "${key}" \u2014 did you mean a valid prop? (may be ignored)`,
        severity: "warning"
      });
    }
  }
  if (field.validation) {
    const v = field.validation;
    if (v.min !== void 0 && v.max !== void 0 && Number(v.min) > Number(v.max)) {
      warnings.push({ field: ref, message: "`min` is greater than `max`", severity: "error" });
    }
    if (v.minLength !== void 0 && v.maxLength !== void 0 && Number(v.minLength) > Number(v.maxLength)) {
      warnings.push({ field: ref, message: "`minLength` is greater than `maxLength`", severity: "error" });
    }
  }
  return warnings;
}
function validateSchema(schema) {
  const warnings = [];
  const isSteps = schema.length > 0 && "fields" in schema[0] && "title" in schema[0];
  const flatFields = isSteps ? schema.reduce((acc, stepItem) => {
    acc.push(...stepItem.fields);
    return acc;
  }, []) : schema;
  flatFields.forEach((f, idx) => {
    warnings.push(...warnField(f, idx));
  });
  const names = flatFields.map((f) => f.name).filter(Boolean);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length > 0) {
    const unique = [...new Set(dupes)];
    unique.forEach((n) => {
      warnings.push({
        field: n,
        message: `Duplicate field name "${n}" detected. Names must be unique.`,
        severity: "error"
      });
    });
  }
  return warnings;
}
function useSchemaValidation(schema) {
  var _a, _b;
  const nodeEnv = (_b = (_a = globalThis.process) == null ? void 0 : _a.env) == null ? void 0 : _b.NODE_ENV;
  if (nodeEnv !== "development") return;
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

// src/fields/TextField.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var TextField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled,
  helpText,
  required,
  type = "text"
}) => /* @__PURE__ */ jsxs("div", { className: "sf-field", children: [
  /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "sf-label", children: [
    label,
    required && /* @__PURE__ */ jsx("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
  ] }),
  /* @__PURE__ */ jsx(
    "input",
    {
      id: name,
      name,
      type,
      className: `sf-input${error ? " sf-input--error" : ""}`,
      value: value != null ? value : "",
      onChange: (e) => onChange(e.target.value),
      onBlur,
      placeholder,
      disabled,
      "aria-invalid": !!error,
      "aria-describedby": error ? `${name}-error` : helpText ? `${name}-help` : void 0
    }
  ),
  helpText && !error && /* @__PURE__ */ jsx("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ jsx("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var TextField_default = TextField;

// src/useOptions.ts
import { useState as useState2, useEffect as useEffect2 } from "react";
var cache = {};
function useOptions(staticOptions, url) {
  const [options, setOptions] = useState2(() => {
    if (staticOptions) return normalizeOptions(staticOptions);
    if (url && cache[url]) return cache[url];
    return [];
  });
  const [loading, setLoading] = useState2(!!url && !cache[url]);
  useEffect2(() => {
    if (!url) return;
    if (cache[url]) {
      setOptions(cache[url]);
      return;
    }
    setLoading(true);
    fetch(url).then((r) => r.json()).then((data) => {
      const normalized = Array.isArray(data) ? normalizeOptions(data) : [];
      cache[url] = normalized;
      setOptions(normalized);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [url]);
  return { options, loading };
}
function normalizeOptions(opts) {
  return opts.map((o) => {
    if (typeof o === "string") return { label: o, value: o };
    if (o.label && o.value) return o;
    if (o.name && o.id) return { label: o.name, value: String(o.id) };
    if (o.title && o.id) return { label: o.title, value: String(o.id) };
    return { label: String(o), value: String(o) };
  });
}

// src/fields/SelectField.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var SelectField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled,
  helpText,
  required,
  options: staticOptions,
  optionsUrl
}) => {
  const { options, loading } = useOptions(staticOptions, optionsUrl);
  return /* @__PURE__ */ jsxs2("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs2("label", { htmlFor: name, className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx2("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs2(
      "select",
      {
        id: name,
        name,
        className: `sf-input sf-select${error ? " sf-input--error" : ""}`,
        value: value != null ? value : "",
        onChange: (e) => onChange(e.target.value),
        onBlur,
        disabled: disabled || loading,
        "aria-invalid": !!error,
        "aria-describedby": error ? `${name}-error` : helpText ? `${name}-help` : void 0,
        children: [
          /* @__PURE__ */ jsx2("option", { value: "", children: loading ? "Loading\u2026" : placeholder || "Select an option" }),
          options.map((o) => /* @__PURE__ */ jsx2("option", { value: o.value, children: o.label }, o.value))
        ]
      }
    ),
    helpText && !error && /* @__PURE__ */ jsx2("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx2("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
  ] });
};
var SelectField_default = SelectField;

// src/fields/NumberField.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var NumberField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled,
  helpText,
  required
}) => /* @__PURE__ */ jsxs3("div", { className: "sf-field", children: [
  /* @__PURE__ */ jsxs3("label", { htmlFor: name, className: "sf-label", children: [
    label,
    required && /* @__PURE__ */ jsx3("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
  ] }),
  /* @__PURE__ */ jsx3(
    "input",
    {
      id: name,
      name,
      type: "number",
      className: `sf-input${error ? " sf-input--error" : ""}`,
      value: value != null ? value : "",
      onChange: (e) => onChange(e.target.value === "" ? "" : Number(e.target.value)),
      onBlur,
      placeholder,
      disabled,
      "aria-invalid": !!error,
      "aria-describedby": error ? `${name}-error` : helpText ? `${name}-help` : void 0
    }
  ),
  helpText && !error && /* @__PURE__ */ jsx3("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ jsx3("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var NumberField_default = NumberField;

// src/fields/TextAreaField.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var TextareaField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled,
  helpText,
  required,
  rows = 4
}) => /* @__PURE__ */ jsxs4("div", { className: "sf-field", children: [
  /* @__PURE__ */ jsxs4("label", { htmlFor: name, className: "sf-label", children: [
    label,
    required && /* @__PURE__ */ jsx4("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
  ] }),
  /* @__PURE__ */ jsx4(
    "textarea",
    {
      id: name,
      name,
      className: `sf-input sf-textarea${error ? " sf-input--error" : ""}`,
      value: value != null ? value : "",
      onChange: (e) => onChange(e.target.value),
      onBlur,
      placeholder,
      disabled,
      rows,
      "aria-invalid": !!error,
      "aria-describedby": error ? `${name}-error` : helpText ? `${name}-help` : void 0
    }
  ),
  helpText && !error && /* @__PURE__ */ jsx4("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ jsx4("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var TextAreaField_default = TextareaField;

// src/fields/RadioField.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var RadioField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  options: rawOptions = []
}) => {
  const options = normalizeOptions(rawOptions);
  return /* @__PURE__ */ jsxs5("div", { className: "sf-field", role: "group", "aria-labelledby": `${name}-legend`, children: [
    /* @__PURE__ */ jsxs5("span", { id: `${name}-legend`, className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx5("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "sf-radio-group", children: options.map((opt) => /* @__PURE__ */ jsxs5("label", { className: "sf-label--radio", children: [
      /* @__PURE__ */ jsx5(
        "input",
        {
          type: "radio",
          name,
          value: opt.value,
          checked: value === opt.value,
          onChange: () => onChange(opt.value),
          onBlur,
          disabled,
          className: "sf-radio"
        }
      ),
      /* @__PURE__ */ jsx5("span", { children: opt.label })
    ] }, opt.value)) }),
    helpText && !error && /* @__PURE__ */ jsx5("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx5("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var RadioField_default = RadioField;

// src/fields/CheckboxField.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var CheckboxField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText
}) => /* @__PURE__ */ jsxs6("div", { className: "sf-field sf-field--checkbox", children: [
  /* @__PURE__ */ jsxs6("label", { htmlFor: name, className: "sf-label sf-label--checkbox", children: [
    /* @__PURE__ */ jsx6(
      "input",
      {
        id: name,
        name,
        type: "checkbox",
        className: "sf-checkbox",
        checked: !!value,
        onChange: (e) => onChange(e.target.checked),
        onBlur,
        disabled,
        "aria-invalid": !!error
      }
    ),
    /* @__PURE__ */ jsx6("span", { children: label })
  ] }),
  helpText && !error && /* @__PURE__ */ jsx6("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ jsx6("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var CheckboxField_default = CheckboxField;

// src/fields/DateRangeField.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var DateRangeField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  startLabel = "Start Date",
  endLabel = "End Date"
}) => {
  var _a, _b;
  const start = (_a = value == null ? void 0 : value.start) != null ? _a : "";
  const end = (_b = value == null ? void 0 : value.end) != null ? _b : "";
  const handleStart = (e) => {
    onChange({ start: e.target.value, end });
  };
  const handleEnd = (e) => {
    onChange({ start, end: e.target.value });
  };
  return /* @__PURE__ */ jsxs7("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs7("label", { className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx7("span", { className: "sf-required", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "sf-daterange", children: [
      /* @__PURE__ */ jsxs7("div", { className: "sf-daterange__group", children: [
        /* @__PURE__ */ jsx7("label", { className: "sf-daterange__sublabel", children: startLabel }),
        /* @__PURE__ */ jsx7(
          "input",
          {
            id: `${name}-start`,
            type: "date",
            className: `sf-input${error ? " sf-input--error" : ""}`,
            value: start,
            max: end || void 0,
            onChange: handleStart,
            onBlur,
            disabled,
            "aria-invalid": !!error
          }
        )
      ] }),
      /* @__PURE__ */ jsx7("div", { className: "sf-daterange__separator", children: "\u2192" }),
      /* @__PURE__ */ jsxs7("div", { className: "sf-daterange__group", children: [
        /* @__PURE__ */ jsx7("label", { className: "sf-daterange__sublabel", children: endLabel }),
        /* @__PURE__ */ jsx7(
          "input",
          {
            id: `${name}-end`,
            type: "date",
            className: `sf-input${error ? " sf-input--error" : ""}`,
            value: end,
            min: start || void 0,
            onChange: handleEnd,
            onBlur,
            disabled,
            "aria-invalid": !!error
          }
        )
      ] })
    ] }),
    helpText && !error && /* @__PURE__ */ jsx7("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx7("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var DateRangeField_default = DateRangeField;

// src/fields/FileUploadField.tsx
import { useRef as useRef2, useState as useState3, useCallback as useCallback2 } from "react";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
var FileUploadField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  multiple = false,
  accept,
  maxSize
}) => {
  const inputRef = useRef2(null);
  const [dragging, setDragging] = useState3(false);
  const [files, setFiles] = useState3(
    Array.isArray(value) ? value : []
  );
  const [localError, setLocalError] = useState3();
  const processFiles = useCallback2(
    (incoming) => {
      var _a;
      const arr = Array.from(incoming);
      const processed = arr.map((file) => {
        if (maxSize && file.size > maxSize) {
          return {
            file,
            error: `File too large (max ${formatBytes(maxSize)})`
          };
        }
        if (accept) {
          const types = accept.split(",").map((s) => s.trim());
          const ok = types.some((t) => {
            if (t.startsWith(".")) return file.name.toLowerCase().endsWith(t.toLowerCase());
            if (t.endsWith("/*")) return file.type.startsWith(t.replace("/*", "/"));
            return file.type === t;
          });
          if (!ok) return { file, error: "File type not allowed" };
        }
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : void 0;
        return { file, previewUrl };
      });
      const next = multiple ? [...files, ...processed] : processed.slice(0, 1);
      setFiles(next);
      const validFiles = next.filter((f) => !f.error).map((f) => f.file);
      onChange(multiple ? validFiles : (_a = validFiles[0]) != null ? _a : null);
    },
    [files, multiple, accept, maxSize, onChange]
  );
  const handleDrop = useCallback2(
    (e) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );
  const handleInputChange = (e) => {
    if (e.target.files) processFiles(e.target.files);
  };
  const removeFile = (idx) => {
    var _a;
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    const validFiles = next.filter((f) => !f.error).map((f) => f.file);
    onChange(multiple ? validFiles : (_a = validFiles[0]) != null ? _a : null);
  };
  return /* @__PURE__ */ jsxs8("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs8("label", { className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx8("span", { className: "sf-required", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs8(
      "div",
      {
        className: `sf-dropzone${dragging ? " sf-dropzone--active" : ""}${disabled ? " sf-dropzone--disabled" : ""}${error ? " sf-dropzone--error" : ""}`,
        onDragOver: (e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        },
        onDragLeave: () => setDragging(false),
        onDrop: handleDrop,
        onClick: () => {
          var _a;
          return !disabled && ((_a = inputRef.current) == null ? void 0 : _a.click());
        },
        onBlur,
        role: "button",
        tabIndex: disabled ? -1 : 0,
        onKeyDown: (e) => {
          var _a;
          return e.key === "Enter" && ((_a = inputRef.current) == null ? void 0 : _a.click());
        },
        "aria-label": `Upload ${label}`,
        children: [
          /* @__PURE__ */ jsx8(
            "input",
            {
              ref: inputRef,
              type: "file",
              id: name,
              name,
              accept,
              multiple,
              disabled,
              onChange: handleInputChange,
              style: { display: "none" },
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsx8("div", { className: "sf-dropzone__icon", children: /* @__PURE__ */ jsxs8("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
            /* @__PURE__ */ jsx8("path", { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" }),
            /* @__PURE__ */ jsx8("polyline", { points: "17 8 12 3 7 8" }),
            /* @__PURE__ */ jsx8("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
          ] }) }),
          /* @__PURE__ */ jsxs8("p", { className: "sf-dropzone__text", children: [
            /* @__PURE__ */ jsx8("strong", { children: "Drag & drop" }),
            " or ",
            /* @__PURE__ */ jsx8("span", { className: "sf-dropzone__link", children: "browse" })
          ] }),
          accept && /* @__PURE__ */ jsxs8("p", { className: "sf-dropzone__hint", children: [
            "Allowed: ",
            accept,
            " ",
            maxSize ? `\xB7 Max ${formatBytes(maxSize)}` : ""
          ] })
        ]
      }
    ),
    files.length > 0 && /* @__PURE__ */ jsx8("ul", { className: "sf-file-list", children: files.map((fw, idx) => /* @__PURE__ */ jsxs8("li", { className: `sf-file-item${fw.error ? " sf-file-item--error" : ""}`, children: [
      fw.previewUrl && /* @__PURE__ */ jsx8("img", { src: fw.previewUrl, alt: fw.file.name, className: "sf-file-preview" }),
      !fw.previewUrl && /* @__PURE__ */ jsx8("div", { className: "sf-file-icon", children: /* @__PURE__ */ jsxs8("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
        /* @__PURE__ */ jsx8("path", { d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" }),
        /* @__PURE__ */ jsx8("polyline", { points: "14 2 14 8 20 8" })
      ] }) }),
      /* @__PURE__ */ jsxs8("div", { className: "sf-file-info", children: [
        /* @__PURE__ */ jsx8("span", { className: "sf-file-name", children: fw.file.name }),
        fw.error ? /* @__PURE__ */ jsx8("span", { className: "sf-file-error", children: fw.error }) : /* @__PURE__ */ jsx8("span", { className: "sf-file-size", children: formatBytes(fw.file.size) })
      ] }),
      /* @__PURE__ */ jsx8(
        "button",
        {
          type: "button",
          className: "sf-file-remove",
          onClick: (e) => {
            e.stopPropagation();
            removeFile(idx);
          },
          "aria-label": `Remove ${fw.file.name}`,
          children: "\xD7"
        }
      )
    ] }, idx)) }),
    helpText && !error && /* @__PURE__ */ jsx8("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx8("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var FileUploadField_default = FileUploadField;

// src/fields/SignaturePad.tsx
import { useRef as useRef3, useEffect as useEffect3, useState as useState4, useCallback as useCallback3 } from "react";
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var SignaturePad = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required
}) => {
  const canvasRef = useRef3(null);
  const [drawing, setDrawing] = useState4(false);
  const [isEmpty, setIsEmpty] = useState4(!value);
  const lastPos = useRef3(null);
  useEffect3(() => {
    if (!value || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      var _a;
      const ctx = (_a = canvasRef.current) == null ? void 0 : _a.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = value;
  }, []);
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const startDrawing = useCallback3((e) => {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    setIsEmpty(false);
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  }, [disabled]);
  const draw = useCallback3((e) => {
    if (!drawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }, [drawing, disabled]);
  const stopDrawing = useCallback3(() => {
    if (!drawing) return;
    setDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onChange(dataUrl);
    }
    onBlur();
  }, [drawing, onChange, onBlur]);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  };
  return /* @__PURE__ */ jsxs9("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs9("label", { className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx9("span", { className: "sf-required", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: `sf-signature${error ? " sf-signature--error" : ""}${disabled ? " sf-signature--disabled" : ""}`, children: [
      /* @__PURE__ */ jsx9(
        "canvas",
        {
          ref: canvasRef,
          width: 480,
          height: 160,
          className: "sf-signature__canvas",
          onMouseDown: startDrawing,
          onMouseMove: draw,
          onMouseUp: stopDrawing,
          onMouseLeave: stopDrawing,
          onTouchStart: startDrawing,
          onTouchMove: draw,
          onTouchEnd: stopDrawing,
          style: { touchAction: "none", cursor: disabled ? "not-allowed" : "crosshair" },
          "aria-label": `Signature for ${label}`,
          role: "img"
        }
      ),
      isEmpty && /* @__PURE__ */ jsx9("div", { className: "sf-signature__placeholder", "aria-hidden": "true", children: "Sign here" }),
      /* @__PURE__ */ jsxs9(
        "button",
        {
          type: "button",
          className: "sf-signature__clear",
          onClick: clearSignature,
          disabled: disabled || isEmpty,
          title: "Clear signature",
          children: [
            /* @__PURE__ */ jsxs9("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx9("polyline", { points: "3 6 5 6 21 6" }),
              /* @__PURE__ */ jsx9("path", { d: "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" }),
              /* @__PURE__ */ jsx9("path", { d: "M10 11v6M14 11v6" })
            ] }),
            "Clear"
          ]
        }
      )
    ] }),
    helpText && !error && /* @__PURE__ */ jsx9("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx9("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var SignaturePad_default = SignaturePad;

// src/fields/RatingField.tsx
import { useState as useState5 } from "react";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var RatingField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  stars = 5
}) => {
  var _a;
  const [hovered, setHovered] = useState5(null);
  const current = (_a = hovered != null ? hovered : value) != null ? _a : 0;
  return /* @__PURE__ */ jsxs10("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs10("label", { className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx10("span", { className: "sf-required", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs10(
      "div",
      {
        className: "sf-rating",
        role: "radiogroup",
        "aria-label": label,
        onMouseLeave: () => setHovered(null),
        children: [
          Array.from({ length: stars }, (_, i) => {
            const starVal = i + 1;
            const filled = starVal <= current;
            return /* @__PURE__ */ jsx10(
              "button",
              {
                type: "button",
                role: "radio",
                "aria-checked": value === starVal,
                "aria-label": `${starVal} star${starVal > 1 ? "s" : ""}`,
                className: `sf-rating__star${filled ? " sf-rating__star--filled" : ""}`,
                onClick: () => {
                  if (!disabled) {
                    onChange(starVal);
                    onBlur();
                  }
                },
                onMouseEnter: () => !disabled && setHovered(starVal),
                disabled,
                children: /* @__PURE__ */ jsx10("svg", { viewBox: "0 0 24 24", width: "28", height: "28", children: /* @__PURE__ */ jsx10(
                  "polygon",
                  {
                    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
                    fill: filled ? "currentColor" : "none",
                    stroke: "currentColor",
                    strokeWidth: "1.5"
                  }
                ) })
              },
              starVal
            );
          }),
          value > 0 && /* @__PURE__ */ jsxs10("span", { className: "sf-rating__value", children: [
            value,
            " / ",
            stars
          ] })
        ]
      }
    ),
    helpText && !error && /* @__PURE__ */ jsx10("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx10("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var SliderField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  min = 0,
  max = 100,
  step = 1,
  showValue = true
}) => {
  const pct = ((value != null ? value : min) - min) / (max - min);
  return /* @__PURE__ */ jsxs10("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs10("label", { htmlFor: name, className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx10("span", { className: "sf-required", children: " *" }),
      showValue && /* @__PURE__ */ jsx10("span", { className: "sf-slider__badge", children: value != null ? value : min })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "sf-slider__track-wrap", children: [
      /* @__PURE__ */ jsx10(
        "input",
        {
          id: name,
          type: "range",
          className: "sf-slider",
          min,
          max,
          step,
          value: value != null ? value : min,
          onChange: (e) => onChange(Number(e.target.value)),
          onBlur,
          disabled,
          "aria-valuemin": min,
          "aria-valuemax": max,
          "aria-valuenow": value != null ? value : min,
          style: { "--pct": `${pct * 100}%` }
        }
      ),
      /* @__PURE__ */ jsxs10("div", { className: "sf-slider__labels", children: [
        /* @__PURE__ */ jsx10("span", { children: min }),
        /* @__PURE__ */ jsx10("span", { children: max })
      ] })
    ] }),
    helpText && !error && /* @__PURE__ */ jsx10("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx10("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var RatingField_default = RatingField;

// src/fields/ColorPickerField.tsx
import { useState as useState6, useRef as useRef4, useEffect as useEffect4 } from "react";
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
var PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#1a1a2e",
  "#374151",
  "#6b7280",
  "#ffffff"
];
function hexToRgba(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: num >> 16 & 255,
    g: num >> 8 & 255,
    b: num & 255,
    a: 1
  };
}
function rgbaToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}
var ColorPickerField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required
}) => {
  const [open, setOpen] = useState6(false);
  const [hex, setHex] = useState6(value || "#6366f1");
  const [rgba, setRgba] = useState6(() => hexToRgba(value || "#6366f1"));
  const panelRef = useRef4(null);
  useEffect4(() => {
    if (value && value !== hex) {
      setHex(value);
      setRgba(hexToRgba(value));
    }
  }, [value]);
  useEffect4(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        onBlur();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onBlur]);
  const applyHex = (h) => {
    setHex(h);
    try {
      const parsed = hexToRgba(h);
      setRgba(parsed);
    } catch (e) {
    }
    onChange(h);
  };
  const applyRgba = (r, g, b, a) => {
    const newRgba = { r, g, b, a };
    setRgba(newRgba);
    const h = rgbaToHex(r, g, b);
    setHex(h);
    onChange(a < 1 ? `rgba(${r},${g},${b},${a})` : h);
  };
  return /* @__PURE__ */ jsxs11("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs11("label", { className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx11("span", { className: "sf-required", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "sf-color", ref: panelRef, children: [
      /* @__PURE__ */ jsxs11(
        "button",
        {
          type: "button",
          className: `sf-color__trigger${error ? " sf-input--error" : ""}`,
          onClick: () => !disabled && setOpen((o) => !o),
          disabled,
          "aria-haspopup": "true",
          "aria-expanded": open,
          "aria-label": `Pick color for ${label}`,
          children: [
            /* @__PURE__ */ jsx11(
              "span",
              {
                className: "sf-color__swatch",
                style: { background: value || hex },
                "aria-hidden": "true"
              }
            ),
            /* @__PURE__ */ jsx11("span", { className: "sf-color__hex", children: value || hex }),
            /* @__PURE__ */ jsx11("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "sf-color__chevron", children: /* @__PURE__ */ jsx11("polyline", { points: "6 9 12 15 18 9" }) })
          ]
        }
      ),
      open && /* @__PURE__ */ jsxs11("div", { className: "sf-color__panel", role: "dialog", "aria-label": "Color picker", children: [
        /* @__PURE__ */ jsxs11("div", { className: "sf-color__native-wrap", children: [
          /* @__PURE__ */ jsx11(
            "input",
            {
              type: "color",
              value: hex.startsWith("#") ? hex : "#6366f1",
              onChange: (e) => applyHex(e.target.value),
              className: "sf-color__native",
              title: "Open full colour picker"
            }
          ),
          /* @__PURE__ */ jsx11("span", { className: "sf-color__native-label", children: "Open full picker" })
        ] }),
        /* @__PURE__ */ jsx11("div", { className: "sf-color__presets", children: PRESET_COLORS.map((c) => /* @__PURE__ */ jsx11(
          "button",
          {
            type: "button",
            className: `sf-color__preset${hex === c ? " sf-color__preset--active" : ""}`,
            style: { background: c },
            onClick: () => applyHex(c),
            title: c,
            "aria-label": c,
            "aria-pressed": hex === c
          },
          c
        )) }),
        /* @__PURE__ */ jsxs11("div", { className: "sf-color__inputs", children: [
          /* @__PURE__ */ jsxs11("div", { className: "sf-color__input-group", children: [
            /* @__PURE__ */ jsx11("label", { className: "sf-color__input-label", children: "Hex" }),
            /* @__PURE__ */ jsx11(
              "input",
              {
                type: "text",
                className: "sf-input sf-color__hex-input",
                value: hex,
                maxLength: 7,
                onChange: (e) => {
                  const v = e.target.value;
                  setHex(v);
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) applyHex(v);
                },
                spellCheck: false
              }
            )
          ] }),
          ["r", "g", "b"].map((ch) => /* @__PURE__ */ jsxs11("div", { className: "sf-color__input-group", children: [
            /* @__PURE__ */ jsx11("label", { className: "sf-color__input-label", children: ch.toUpperCase() }),
            /* @__PURE__ */ jsx11(
              "input",
              {
                type: "number",
                className: "sf-input sf-color__rgb-input",
                min: 0,
                max: 255,
                value: rgba[ch],
                onChange: (e) => applyRgba(
                  ch === "r" ? +e.target.value : rgba.r,
                  ch === "g" ? +e.target.value : rgba.g,
                  ch === "b" ? +e.target.value : rgba.b,
                  rgba.a
                )
              }
            )
          ] }, ch)),
          /* @__PURE__ */ jsxs11("div", { className: "sf-color__input-group", children: [
            /* @__PURE__ */ jsx11("label", { className: "sf-color__input-label", children: "A" }),
            /* @__PURE__ */ jsx11(
              "input",
              {
                type: "number",
                className: "sf-input sf-color__rgb-input",
                min: 0,
                max: 1,
                step: 0.1,
                value: rgba.a,
                onChange: (e) => applyRgba(rgba.r, rgba.g, rgba.b, +e.target.value)
              }
            )
          ] })
        ] })
      ] })
    ] }),
    helpText && !error && /* @__PURE__ */ jsx11("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx11("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var ColorPickerField_default = ColorPickerField;

// src/fields/OTPField.tsx
import { useRef as useRef5, useCallback as useCallback4 } from "react";
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
var OTPField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  otpLength = 6
}) => {
  const inputsRef = useRef5([]);
  const digits = (value || "").split("").concat(Array(otpLength).fill("")).slice(0, otpLength);
  const focusNext = (idx) => {
    var _a;
    return (_a = inputsRef.current[idx + 1]) == null ? void 0 : _a.focus();
  };
  const focusPrev = (idx) => {
    var _a;
    return (_a = inputsRef.current[idx - 1]) == null ? void 0 : _a.focus();
  };
  const handleChange = useCallback4(
    (idx, raw) => {
      const char = raw.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[idx] = char;
      const joined = next.join("");
      onChange(joined);
      if (char) focusNext(idx);
    },
    [digits, onChange]
  );
  const handlePaste = useCallback4(
    (e, startIdx) => {
      var _a;
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpLength - startIdx);
      const next = [...digits];
      pasted.split("").forEach((ch, i) => {
        next[startIdx + i] = ch;
      });
      onChange(next.join(""));
      const focus = Math.min(startIdx + pasted.length, otpLength - 1);
      (_a = inputsRef.current[focus]) == null ? void 0 : _a.focus();
    },
    [digits, onChange, otpLength]
  );
  const handleKeyDown = useCallback4(
    (e, idx) => {
      if (e.key === "Backspace") {
        if (digits[idx]) {
          const next = [...digits];
          next[idx] = "";
          onChange(next.join(""));
        } else {
          focusPrev(idx);
        }
      } else if (e.key === "ArrowLeft") focusPrev(idx);
      else if (e.key === "ArrowRight") focusNext(idx);
    },
    [digits, onChange]
  );
  return /* @__PURE__ */ jsxs12("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs12("label", { className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ jsx12("span", { className: "sf-required", children: " *" })
    ] }),
    /* @__PURE__ */ jsx12("div", { className: "sf-otp", role: "group", "aria-label": label, children: digits.map((d, idx) => /* @__PURE__ */ jsx12(
      "input",
      {
        ref: (el) => {
          inputsRef.current[idx] = el;
        },
        id: `${name}-${idx}`,
        type: "text",
        inputMode: "numeric",
        pattern: "\\d*",
        maxLength: 1,
        className: `sf-otp__digit${error ? " sf-otp__digit--error" : ""}${d ? " sf-otp__digit--filled" : ""}`,
        value: d,
        onChange: (e) => handleChange(idx, e.target.value),
        onKeyDown: (e) => handleKeyDown(e, idx),
        onPaste: (e) => handlePaste(e, idx),
        onFocus: (e) => e.target.select(),
        onBlur: idx === otpLength - 1 ? onBlur : void 0,
        disabled,
        autoComplete: idx === 0 ? "one-time-code" : "off",
        "aria-label": `Digit ${idx + 1} of ${otpLength}`
      },
      idx
    )) }),
    helpText && !error && /* @__PURE__ */ jsx12("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ jsx12("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var OTPField_default = OTPField;

// src/fields/RepeatableField.tsx
import { useCallback as useCallback5 } from "react";
import { jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
function emptyRow(fields) {
  var _a;
  const row = {};
  for (const f of fields) {
    row[f.name] = (_a = f.defaultValue) != null ? _a : f.type === "checkbox" ? false : "";
  }
  return row;
}
var InlineField = ({ field, value, onChange, error, disabled, rowIdx }) => {
  var _a, _b, _c;
  const id = `${field.name}-${rowIdx}`;
  const isDisabled = typeof field.disabled === "function" ? field.disabled({}) : !!field.disabled || !!disabled;
  const baseProps = {
    id,
    name: id,
    className: `sf-input${error ? " sf-input--error" : ""}`,
    disabled: isDisabled,
    placeholder: field.placeholder
  };
  let input;
  if (field.type === "select") {
    const opts = (field.options || []).map(
      (o) => typeof o === "string" ? { label: o, value: o } : o
    );
    input = /* @__PURE__ */ jsxs13("select", __spreadProps(__spreadValues({}, baseProps), { value, onChange: (e) => onChange(e.target.value), children: [
      /* @__PURE__ */ jsx13("option", { value: "", children: "-- Select --" }),
      opts.map((o) => /* @__PURE__ */ jsx13("option", { value: o.value, children: o.label }, o.value))
    ] }));
  } else if (field.type === "checkbox") {
    input = /* @__PURE__ */ jsx13(
      "input",
      __spreadProps(__spreadValues({}, baseProps), {
        type: "checkbox",
        className: "sf-checkbox",
        checked: !!value,
        onChange: (e) => onChange(e.target.checked)
      })
    );
  } else if (field.type === "textarea") {
    input = /* @__PURE__ */ jsx13(
      "textarea",
      __spreadProps(__spreadValues({}, baseProps), {
        className: `sf-input sf-textarea${error ? " sf-input--error" : ""}`,
        rows: (_a = field.rows) != null ? _a : 2,
        value,
        onChange: (e) => onChange(e.target.value)
      })
    );
  } else {
    input = /* @__PURE__ */ jsx13(
      "input",
      __spreadProps(__spreadValues({}, baseProps), {
        type: field.type,
        value,
        onChange: (e) => onChange(e.target.value)
      })
    );
  }
  return /* @__PURE__ */ jsxs13("div", { className: "sf-repeatable__cell", style: { gridColumn: `span ${(_b = field.col) != null ? _b : 12}` }, children: [
    /* @__PURE__ */ jsxs13("label", { htmlFor: id, className: "sf-repeatable__cell-label", children: [
      field.label,
      ((_c = field.validation) == null ? void 0 : _c.required) && /* @__PURE__ */ jsx13("span", { className: "sf-required", children: " *" })
    ] }),
    input,
    error && /* @__PURE__ */ jsx13("p", { className: "sf-error", children: error })
  ] });
};
var RepeatableField = ({
  name,
  label,
  value = [],
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  fields,
  addLabel = "+ Add Row",
  removeLabel = "Remove",
  minRows = 0,
  maxRows = Infinity
}) => {
  const addRow = useCallback5(() => {
    if (value.length >= maxRows) return;
    onChange([...value, emptyRow(fields)]);
  }, [value, fields, maxRows, onChange]);
  const removeRow = useCallback5(
    (idx) => {
      if (value.length <= minRows) return;
      const next = value.filter((_, i) => i !== idx);
      onChange(next);
    },
    [value, minRows, onChange]
  );
  const updateCell = useCallback5(
    (rowIdx, fieldName, v) => {
      const next = value.map(
        (row, i) => i === rowIdx ? __spreadProps(__spreadValues({}, row), { [fieldName]: v }) : row
      );
      onChange(next);
    },
    [value, onChange]
  );
  const rowErrors = {};
  return /* @__PURE__ */ jsxs13("div", { className: "sf-field", children: [
    /* @__PURE__ */ jsxs13("div", { className: "sf-repeatable__header", children: [
      /* @__PURE__ */ jsxs13("label", { className: "sf-label", children: [
        label,
        required && /* @__PURE__ */ jsx13("span", { className: "sf-required", children: " *" })
      ] }),
      value.length < maxRows && /* @__PURE__ */ jsx13(
        "button",
        {
          type: "button",
          className: "sf-btn sf-btn--ghost sf-repeatable__add",
          onClick: addRow,
          disabled,
          children: addLabel
        }
      )
    ] }),
    value.length === 0 && /* @__PURE__ */ jsxs13("div", { className: "sf-repeatable__empty", children: [
      'No rows yet. Click "',
      addLabel,
      '" to start.'
    ] }),
    /* @__PURE__ */ jsx13("div", { className: "sf-repeatable__rows", children: value.map((row, rowIdx) => /* @__PURE__ */ jsxs13("div", { className: "sf-repeatable__row", children: [
      /* @__PURE__ */ jsx13("div", { className: "sf-repeatable__row-index", children: rowIdx + 1 }),
      /* @__PURE__ */ jsx13("div", { className: "sf-repeatable__row-fields", children: fields.map((f) => {
        var _a;
        return /* @__PURE__ */ jsx13(
          InlineField,
          {
            field: f,
            value: row[f.name],
            onChange: (v) => updateCell(rowIdx, f.name, v),
            error: (_a = rowErrors[rowIdx]) == null ? void 0 : _a[f.name],
            disabled,
            rowIdx
          },
          f.name
        );
      }) }),
      value.length > minRows && /* @__PURE__ */ jsx13(
        "button",
        {
          type: "button",
          className: "sf-repeatable__remove",
          onClick: () => removeRow(rowIdx),
          disabled,
          title: removeLabel,
          children: /* @__PURE__ */ jsxs13("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
            /* @__PURE__ */ jsx13("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
            /* @__PURE__ */ jsx13("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
          ] })
        }
      )
    ] }, rowIdx)) }),
    typeof error === "string" && /* @__PURE__ */ jsx13("p", { className: "sf-error", role: "alert", children: error }),
    helpText && !error && /* @__PURE__ */ jsx13("p", { className: "sf-help", children: helpText })
  ] });
};
var RepeatableField_default = RepeatableField;

// src/SmartForm.tsx
import { jsx as jsx14, jsxs as jsxs14 } from "react/jsx-runtime";
var SmartForm = ({
  schema = [],
  onSubmit,
  onChange,
  defaultValues,
  submitLabel = "Submit",
  className = "",
  gridCols = 12
}) => {
  useSchemaValidation(schema);
  const {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validate,
    reset
  } = useSmartForm(schema, defaultValues, onChange);
  const handleSubmit = useCallback6(
    (e) => __async(null, null, function* () {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      try {
        yield onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }),
    [validate, onSubmit, values, setIsSubmitting]
  );
  const renderField = useCallback6(
    (field) => {
      var _a, _b, _c, _d;
      if (field.showIf && !field.showIf(values)) return null;
      const isDisabled = typeof field.disabled === "function" ? field.disabled(values) : !!field.disabled;
      const colStyle = field.col ? { gridColumn: `span ${field.col}` } : void 0;
      const commonProps = {
        name: field.name,
        label: field.label,
        value: values[field.name],
        onChange: (v) => handleChange(field.name, v),
        onBlur: () => handleBlur(field.name),
        error: touched[field.name] ? errors[field.name] : void 0,
        placeholder: field.placeholder,
        disabled: isDisabled,
        helpText: field.helpText,
        required: !!((_a = field.validation) == null ? void 0 : _a.required)
      };
      let fieldEl;
      switch (field.type) {
        case "text":
          fieldEl = /* @__PURE__ */ jsx14(TextField_default, __spreadValues({}, commonProps));
          break;
        case "email":
          fieldEl = /* @__PURE__ */ jsx14(TextField_default, __spreadProps(__spreadValues({}, commonProps), { type: "email" }));
          break;
        case "password":
          fieldEl = /* @__PURE__ */ jsx14(TextField_default, __spreadProps(__spreadValues({}, commonProps), { type: "password" }));
          break;
        case "date":
          fieldEl = /* @__PURE__ */ jsx14(TextField_default, __spreadProps(__spreadValues({}, commonProps), { type: "date" }));
          break;
        case "number":
          fieldEl = /* @__PURE__ */ jsx14(NumberField_default, __spreadValues({}, commonProps));
          break;
        case "textarea":
          fieldEl = /* @__PURE__ */ jsx14(TextAreaField_default, __spreadProps(__spreadValues({}, commonProps), { rows: field.rows }));
          break;
        case "select":
          fieldEl = /* @__PURE__ */ jsx14(
            SelectField_default,
            __spreadProps(__spreadValues({}, commonProps), {
              options: field.options,
              optionsUrl: field.optionsUrl
            })
          );
          break;
        case "radio":
          fieldEl = /* @__PURE__ */ jsx14(RadioField_default, __spreadProps(__spreadValues({}, commonProps), { options: field.options }));
          break;
        case "checkbox":
          fieldEl = /* @__PURE__ */ jsx14(CheckboxField_default, __spreadValues({}, commonProps));
          break;
        // ── NEW FIELD TYPES ──────────────────────────────────────────────────
        case "daterange":
          fieldEl = /* @__PURE__ */ jsx14(
            DateRangeField_default,
            __spreadProps(__spreadValues({}, commonProps), {
              startLabel: field.startLabel,
              endLabel: field.endLabel
            })
          );
          break;
        case "file":
          fieldEl = /* @__PURE__ */ jsx14(
            FileUploadField_default,
            __spreadProps(__spreadValues({}, commonProps), {
              multiple: field.multiple,
              accept: field.accept,
              maxSize: field.maxSize
            })
          );
          break;
        case "signature":
          fieldEl = /* @__PURE__ */ jsx14(SignaturePad_default, __spreadValues({}, commonProps));
          break;
        case "rating":
          fieldEl = /* @__PURE__ */ jsx14(RatingField_default, __spreadProps(__spreadValues({}, commonProps), { stars: field.stars }));
          break;
        case "slider":
          fieldEl = /* @__PURE__ */ jsx14(
            SliderField,
            __spreadProps(__spreadValues({}, commonProps), {
              min: field.min,
              max: field.max,
              step: field.step,
              showValue: field.showValue
            })
          );
          break;
        case "colorpicker":
          fieldEl = /* @__PURE__ */ jsx14(ColorPickerField_default, __spreadValues({}, commonProps));
          break;
        case "otp":
          fieldEl = /* @__PURE__ */ jsx14(OTPField_default, __spreadProps(__spreadValues({}, commonProps), { otpLength: field.otpLength }));
          break;
        case "repeatable":
          fieldEl = /* @__PURE__ */ jsx14(
            RepeatableField_default,
            __spreadProps(__spreadValues({}, commonProps), {
              fields: (_b = field.fields) != null ? _b : [],
              addLabel: field.addLabel,
              removeLabel: field.removeLabel,
              minRows: (_c = field.validation) == null ? void 0 : _c.minRows,
              maxRows: (_d = field.validation) == null ? void 0 : _d.maxRows
            })
          );
          break;
        default:
          fieldEl = /* @__PURE__ */ jsx14(TextField_default, __spreadValues({}, commonProps));
      }
      return /* @__PURE__ */ jsx14("div", { className: "sf-field-wrapper", style: colStyle, children: fieldEl }, field.name);
    },
    [values, errors, touched, handleChange, handleBlur]
  );
  return /* @__PURE__ */ jsxs14(
    "form",
    {
      className: `sf-form ${className}`.trim(),
      onSubmit: handleSubmit,
      noValidate: true,
      style: { "--sf-grid-cols": gridCols },
      children: [
        /* @__PURE__ */ jsx14("div", { className: "sf-grid", children: schema.map(renderField) }),
        /* @__PURE__ */ jsxs14("div", { className: "sf-actions", children: [
          /* @__PURE__ */ jsx14(
            "button",
            {
              type: "submit",
              className: "sf-btn sf-btn--primary",
              disabled: isSubmitting,
              children: isSubmitting ? "Submitting\u2026" : submitLabel
            }
          ),
          /* @__PURE__ */ jsx14(
            "button",
            {
              type: "button",
              className: "sf-btn sf-btn--ghost",
              onClick: reset,
              disabled: isSubmitting,
              children: "Reset"
            }
          )
        ] })
      ]
    }
  );
};
var SmartForm_default = SmartForm;

// src/SmartFormWizard.tsx
import React8, { useState as useState7, useCallback as useCallback7 } from "react";
import { jsx as jsx15, jsxs as jsxs15 } from "react/jsx-runtime";
var SmartFormWizard = ({
  steps,
  onSubmit,
  onChange,
  defaultValues,
  submitLabel = "Submit",
  className = "",
  onStepChange
}) => {
  const [currentStep, setCurrentStep] = useState7(0);
  const allFields = steps.reduce((acc, stepItem) => {
    acc.push(...stepItem.fields);
    return acc;
  }, []);
  const {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur
  } = useSmartForm(allFields, defaultValues, onChange);
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const validateStep = useCallback7(() => {
    const stepErrors = validateForm(step.fields, values);
    return Object.keys(stepErrors).length === 0;
  }, [step.fields, values]);
  const goNext = useCallback7(() => {
    if (!validateStep()) {
      step.fields.forEach((f) => handleBlur(f.name));
      return;
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    onStepChange == null ? void 0 : onStepChange(next);
  }, [validateStep, currentStep, step.fields, handleBlur, onStepChange]);
  const goPrev = useCallback7(() => {
    const prev = currentStep - 1;
    setCurrentStep(prev);
    onStepChange == null ? void 0 : onStepChange(prev);
  }, [currentStep, onStepChange]);
  const handleSubmit = useCallback7(
    (e) => __async(null, null, function* () {
      e.preventDefault();
      if (!validateStep()) {
        step.fields.forEach((f) => handleBlur(f.name));
        return;
      }
      setIsSubmitting(true);
      try {
        yield onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }),
    [validateStep, step.fields, handleBlur, onSubmit, values, setIsSubmitting]
  );
  const progress = steps.length <= 1 ? 100 : currentStep / (steps.length - 1) * 100;
  return /* @__PURE__ */ jsxs15("div", { className: `sf-wizard ${className}`.trim(), children: [
    /* @__PURE__ */ jsx15("div", { className: "sf-wizard__steps", role: "tablist", "aria-label": "Form steps", children: steps.map((s, idx) => {
      const state = idx < currentStep ? "done" : idx === currentStep ? "active" : "pending";
      return /* @__PURE__ */ jsxs15(React8.Fragment, { children: [
        /* @__PURE__ */ jsxs15(
          "div",
          {
            className: `sf-wizard__step sf-wizard__step--${state}`,
            role: "tab",
            "aria-selected": idx === currentStep,
            "aria-label": `Step ${idx + 1}: ${s.title}`,
            children: [
              /* @__PURE__ */ jsx15("div", { className: "sf-wizard__step-circle", children: state === "done" ? /* @__PURE__ */ jsx15("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: /* @__PURE__ */ jsx15("polyline", { points: "20 6 9 17 4 12" }) }) : /* @__PURE__ */ jsx15("span", { children: idx + 1 }) }),
              /* @__PURE__ */ jsx15("span", { className: "sf-wizard__step-label", children: s.title })
            ]
          }
        ),
        idx < steps.length - 1 && /* @__PURE__ */ jsx15("div", { className: `sf-wizard__connector${idx < currentStep ? " sf-wizard__connector--done" : ""}` })
      ] }, idx);
    }) }),
    /* @__PURE__ */ jsx15("div", { className: "sf-wizard__progress-bar", role: "progressbar", "aria-valuenow": currentStep + 1, "aria-valuemin": 1, "aria-valuemax": steps.length, children: /* @__PURE__ */ jsx15("div", { className: "sf-wizard__progress-fill", style: { width: `${progress}%` } }) }),
    /* @__PURE__ */ jsxs15("div", { className: "sf-wizard__content", children: [
      step.description && /* @__PURE__ */ jsx15("p", { className: "sf-wizard__description", children: step.description }),
      /* @__PURE__ */ jsxs15(
        "form",
        {
          onSubmit: isLast ? handleSubmit : (e) => {
            e.preventDefault();
            goNext();
          },
          noValidate: true,
          children: [
            /* @__PURE__ */ jsx15("div", { className: "sf-grid", style: { "--sf-grid-cols": 12 }, children: step.fields.map((field) => {
              if (field.showIf && !field.showIf(values)) return null;
              const isDisabled = typeof field.disabled === "function" ? field.disabled(values) : !!field.disabled;
              const colStyle = field.col ? { gridColumn: `span ${field.col}` } : void 0;
              return /* @__PURE__ */ jsx15("div", { className: "sf-field-wrapper", style: colStyle, children: /* @__PURE__ */ jsx15(
                FieldRenderer,
                {
                  field,
                  value: values[field.name],
                  error: touched[field.name] ? errors[field.name] : void 0,
                  onChange: (v) => handleChange(field.name, v),
                  onBlur: () => handleBlur(field.name),
                  isDisabled,
                  values
                }
              ) }, field.name);
            }) }),
            /* @__PURE__ */ jsxs15("div", { className: "sf-wizard__actions", children: [
              !isFirst && /* @__PURE__ */ jsx15("button", { type: "button", className: "sf-btn sf-btn--ghost", onClick: goPrev, children: "\u2190 Back" }),
              /* @__PURE__ */ jsx15("div", { style: { flex: 1 } }),
              !isLast && /* @__PURE__ */ jsx15("button", { type: "submit", className: "sf-btn sf-btn--primary", children: "Next \u2192" }),
              isLast && /* @__PURE__ */ jsx15("button", { type: "submit", className: "sf-btn sf-btn--primary", disabled: isSubmitting, children: isSubmitting ? "Submitting\u2026" : submitLabel })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs15("p", { className: "sf-wizard__counter", children: [
      "Step ",
      currentStep + 1,
      " of ",
      steps.length
    ] })
  ] });
};
var FieldRenderer = ({ field, value, error, onChange, onBlur, isDisabled, values }) => {
  var _a, _b, _c, _d;
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
    required: !!((_a = field.validation) == null ? void 0 : _a.required)
  };
  switch (field.type) {
    case "text":
      return /* @__PURE__ */ jsx15(TextField_default, __spreadValues({}, common));
    case "email":
      return /* @__PURE__ */ jsx15(TextField_default, __spreadProps(__spreadValues({}, common), { type: "email" }));
    case "password":
      return /* @__PURE__ */ jsx15(TextField_default, __spreadProps(__spreadValues({}, common), { type: "password" }));
    case "date":
      return /* @__PURE__ */ jsx15(TextField_default, __spreadProps(__spreadValues({}, common), { type: "date" }));
    case "number":
      return /* @__PURE__ */ jsx15(NumberField_default, __spreadValues({}, common));
    case "textarea":
      return /* @__PURE__ */ jsx15(TextAreaField_default, __spreadProps(__spreadValues({}, common), { rows: field.rows }));
    case "select":
      return /* @__PURE__ */ jsx15(SelectField_default, __spreadProps(__spreadValues({}, common), { options: field.options, optionsUrl: field.optionsUrl }));
    case "radio":
      return /* @__PURE__ */ jsx15(RadioField_default, __spreadProps(__spreadValues({}, common), { options: field.options }));
    case "checkbox":
      return /* @__PURE__ */ jsx15(CheckboxField_default, __spreadValues({}, common));
    case "daterange":
      return /* @__PURE__ */ jsx15(DateRangeField_default, __spreadProps(__spreadValues({}, common), { startLabel: field.startLabel, endLabel: field.endLabel }));
    case "file":
      return /* @__PURE__ */ jsx15(FileUploadField_default, __spreadProps(__spreadValues({}, common), { multiple: field.multiple, accept: field.accept, maxSize: field.maxSize }));
    case "signature":
      return /* @__PURE__ */ jsx15(SignaturePad_default, __spreadValues({}, common));
    case "rating":
      return /* @__PURE__ */ jsx15(RatingField_default, __spreadProps(__spreadValues({}, common), { stars: field.stars }));
    case "slider":
      return /* @__PURE__ */ jsx15(SliderField, __spreadProps(__spreadValues({}, common), { min: field.min, max: field.max, step: field.step, showValue: field.showValue }));
    case "colorpicker":
      return /* @__PURE__ */ jsx15(ColorPickerField_default, __spreadValues({}, common));
    case "otp":
      return /* @__PURE__ */ jsx15(OTPField_default, __spreadProps(__spreadValues({}, common), { otpLength: field.otpLength }));
    case "repeatable":
      return /* @__PURE__ */ jsx15(
        RepeatableField_default,
        __spreadProps(__spreadValues({}, common), {
          fields: (_b = field.fields) != null ? _b : [],
          addLabel: field.addLabel,
          removeLabel: field.removeLabel,
          minRows: (_c = field.validation) == null ? void 0 : _c.minRows,
          maxRows: (_d = field.validation) == null ? void 0 : _d.maxRows
        })
      );
    default:
      return /* @__PURE__ */ jsx15(TextField_default, __spreadValues({}, common));
  }
};
var SmartFormWizard_default = SmartFormWizard;

// src/builder/FormBuilder.tsx
import { useState as useState8, useCallback as useCallback8, useRef as useRef6 } from "react";
import { Fragment, jsx as jsx16, jsxs as jsxs16 } from "react/jsx-runtime";
var PALETTE = [
  { type: "text", icon: "T", label: "Text", defaults: {} },
  { type: "email", icon: "@", label: "Email", defaults: { validation: { email: true } } },
  { type: "password", icon: "\u{1F512}", label: "Password", defaults: {} },
  { type: "number", icon: "#", label: "Number", defaults: {} },
  { type: "textarea", icon: "\xB6", label: "Textarea", defaults: { rows: 3 } },
  { type: "select", icon: "\u25BE", label: "Select", defaults: { options: ["Option A", "Option B", "Option C"] } },
  { type: "radio", icon: "\u25C9", label: "Radio", defaults: { options: ["Yes", "No"] } },
  { type: "checkbox", icon: "\u2611", label: "Checkbox", defaults: {} },
  { type: "date", icon: "\u{1F4C5}", label: "Date", defaults: {} },
  { type: "daterange", icon: "\u2194", label: "Date Range", defaults: {} },
  { type: "file", icon: "\u{1F4CE}", label: "File Upload", defaults: {} },
  { type: "signature", icon: "\u270D", label: "Signature", defaults: {} },
  { type: "rating", icon: "\u2605", label: "Rating", defaults: { stars: 5 } },
  { type: "slider", icon: "\u21CC", label: "Slider", defaults: { min: 0, max: 100, step: 1 } },
  { type: "colorpicker", icon: "\u{1F3A8}", label: "Colour", defaults: {} },
  { type: "otp", icon: "\u229E", label: "OTP", defaults: { otpLength: 6 } }
];
function genName(type, existing) {
  let i = 1;
  const base = type.replace(/[^a-z]/gi, "");
  while (existing.some((f) => f.name === `${base}_${i}`)) i++;
  return `${base}_${i}`;
}
var FieldEditor = ({ field, onChange, onDelete }) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
  const update = (partial) => onChange(__spreadValues(__spreadValues({}, field), partial));
  const setValidation = (key, val) => onChange(__spreadProps(__spreadValues({}, field), { validation: __spreadProps(__spreadValues({}, field.validation), { [key]: val || void 0 }) }));
  return /* @__PURE__ */ jsxs16("div", { className: "sfb-editor", children: [
    /* @__PURE__ */ jsxs16("div", { className: "sfb-editor__header", children: [
      /* @__PURE__ */ jsx16("span", { className: "sfb-editor__type-badge", children: field.type }),
      /* @__PURE__ */ jsxs16("button", { type: "button", className: "sfb-editor__delete", onClick: onDelete, title: "Delete field", children: [
        /* @__PURE__ */ jsxs16("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
          /* @__PURE__ */ jsx16("polyline", { points: "3 6 5 6 21 6" }),
          /* @__PURE__ */ jsx16("path", { d: "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" })
        ] }),
        "Delete"
      ] })
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "sfb-prop", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Name (key)" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          className: "sf-input sfb-prop__input",
          value: field.name,
          onChange: (e) => update({ name: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "sfb-prop", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Label" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          className: "sf-input sfb-prop__input",
          value: field.label,
          onChange: (e) => update({ label: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "sfb-prop", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Placeholder" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          className: "sf-input sfb-prop__input",
          value: (_a = field.placeholder) != null ? _a : "",
          onChange: (e) => update({ placeholder: e.target.value || void 0 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "sfb-prop", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Help text" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          className: "sf-input sfb-prop__input",
          value: (_b = field.helpText) != null ? _b : "",
          onChange: (e) => update({ helpText: e.target.value || void 0 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Col span" }),
      /* @__PURE__ */ jsx16(
        "select",
        {
          className: "sf-input sfb-prop__select",
          value: (_c = field.col) != null ? _c : 12,
          onChange: (e) => update({ col: Number(e.target.value) }),
          children: [2, 3, 4, 6, 8, 9, 12].map((c) => /* @__PURE__ */ jsxs16("option", { value: c, children: [
            c,
            " / 12"
          ] }, c))
        }
      )
    ] }),
    (field.type === "select" || field.type === "radio") && /* @__PURE__ */ jsxs16("div", { className: "sfb-prop", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Options (comma-separated)" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          className: "sf-input sfb-prop__input",
          value: (_e = (_d = field.options) == null ? void 0 : _d.join(", ")) != null ? _e : "",
          onChange: (e) => update({ options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
        }
      )
    ] }),
    field.type === "slider" && /* @__PURE__ */ jsxs16(Fragment, { children: [
      /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
        /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Min" }),
        /* @__PURE__ */ jsx16(
          "input",
          {
            type: "number",
            className: "sf-input sfb-prop__select",
            value: (_f = field.min) != null ? _f : 0,
            onChange: (e) => update({ min: +e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
        /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Max" }),
        /* @__PURE__ */ jsx16(
          "input",
          {
            type: "number",
            className: "sf-input sfb-prop__select",
            value: (_g = field.max) != null ? _g : 100,
            onChange: (e) => update({ max: +e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
        /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Step" }),
        /* @__PURE__ */ jsx16(
          "input",
          {
            type: "number",
            className: "sf-input sfb-prop__select",
            value: (_h = field.step) != null ? _h : 1,
            onChange: (e) => update({ step: +e.target.value })
          }
        )
      ] })
    ] }),
    field.type === "rating" && /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Stars" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          type: "number",
          min: 3,
          max: 10,
          className: "sf-input sfb-prop__select",
          value: (_i = field.stars) != null ? _i : 5,
          onChange: (e) => update({ stars: +e.target.value })
        }
      )
    ] }),
    field.type === "otp" && /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
      /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "OTP Length" }),
      /* @__PURE__ */ jsx16(
        "input",
        {
          type: "number",
          min: 4,
          max: 12,
          className: "sf-input sfb-prop__select",
          value: (_j = field.otpLength) != null ? _j : 6,
          onChange: (e) => update({ otpLength: +e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsx16("div", { className: "sfb-section", children: "Validation" }),
    /* @__PURE__ */ jsx16("div", { className: "sfb-prop sfb-prop--check", children: /* @__PURE__ */ jsxs16("label", { children: [
      /* @__PURE__ */ jsx16(
        "input",
        {
          type: "checkbox",
          checked: !!((_k = field.validation) == null ? void 0 : _k.required),
          onChange: (e) => setValidation("required", e.target.checked || void 0)
        }
      ),
      "Required"
    ] }) }),
    (field.type === "text" || field.type === "textarea" || field.type === "email" || field.type === "password") && /* @__PURE__ */ jsxs16(Fragment, { children: [
      /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
        /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Min length" }),
        /* @__PURE__ */ jsx16(
          "input",
          {
            type: "number",
            className: "sf-input sfb-prop__select",
            value: (_m = (_l = field.validation) == null ? void 0 : _l.minLength) != null ? _m : "",
            onChange: (e) => setValidation("minLength", e.target.value ? +e.target.value : void 0)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs16("div", { className: "sfb-prop sfb-prop--row", children: [
        /* @__PURE__ */ jsx16("label", { className: "sfb-prop__label", children: "Max length" }),
        /* @__PURE__ */ jsx16(
          "input",
          {
            type: "number",
            className: "sf-input sfb-prop__select",
            value: (_o = (_n = field.validation) == null ? void 0 : _n.maxLength) != null ? _o : "",
            onChange: (e) => setValidation("maxLength", e.target.value ? +e.target.value : void 0)
          }
        )
      ] })
    ] })
  ] });
};
var FormBuilder = ({ initialSchema = [], onChange }) => {
  const [schema, setSchema] = useState8(initialSchema);
  const [selected, setSelected] = useState8(null);
  const [draggingPalette, setDraggingPalette] = useState8(null);
  const [draggingIdx, setDraggingIdx] = useState8(null);
  const [dragOverIdx, setDragOverIdx] = useState8(null);
  const [tab, setTab] = useState8("builder");
  const dragTarget = useRef6(null);
  const updateSchema = (next) => {
    setSchema(next);
    onChange == null ? void 0 : onChange(next);
  };
  const addField = useCallback8(
    (item, insertAt) => {
      const newField = __spreadValues({
        name: genName(item.type, schema),
        label: item.label,
        type: item.type,
        col: 12
      }, item.defaults);
      const next = [...schema];
      if (insertAt !== void 0) {
        next.splice(insertAt, 0, newField);
      } else {
        next.push(newField);
      }
      updateSchema(next);
      setSelected(insertAt != null ? insertAt : next.length - 1);
    },
    [schema]
  );
  const updateField = (idx, updated) => {
    const next = schema.map((f, i) => i === idx ? updated : f);
    updateSchema(next);
  };
  const deleteField = (idx) => {
    const next = schema.filter((_, i) => i !== idx);
    updateSchema(next);
    setSelected(null);
  };
  const handleDropOnRow = (dropIdx) => {
    if (draggingIdx === null || draggingIdx === dropIdx) {
      setDraggingIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...schema];
    const [moved] = next.splice(draggingIdx, 1);
    next.splice(dropIdx, 0, moved);
    updateSchema(next);
    setSelected(dropIdx);
    setDraggingIdx(null);
    setDragOverIdx(null);
  };
  return /* @__PURE__ */ jsxs16("div", { className: "sfb", children: [
    /* @__PURE__ */ jsxs16("div", { className: "sfb-tabs", children: [
      /* @__PURE__ */ jsx16("h2", { className: "sfb-title", children: "Form Builder" }),
      /* @__PURE__ */ jsx16("div", { className: "sfb-tab-group", children: ["builder", "preview", "json"].map((t) => /* @__PURE__ */ jsx16(
        "button",
        {
          type: "button",
          className: `sfb-tab${tab === t ? " sfb-tab--active" : ""}`,
          onClick: () => setTab(t),
          children: t === "builder" ? "\u{1F527} Builder" : t === "preview" ? "\u{1F441} Preview" : "{ } JSON"
        },
        t
      )) })
    ] }),
    tab === "builder" && /* @__PURE__ */ jsxs16("div", { className: "sfb-layout", children: [
      /* @__PURE__ */ jsxs16("aside", { className: "sfb-palette", children: [
        /* @__PURE__ */ jsx16("div", { className: "sfb-palette__title", children: "Fields" }),
        PALETTE.map((item) => /* @__PURE__ */ jsxs16(
          "div",
          {
            className: "sfb-palette__item",
            draggable: true,
            onDragStart: () => setDraggingPalette(item),
            onDragEnd: () => setDraggingPalette(null),
            onClick: () => addField(item),
            title: `Add ${item.label}`,
            children: [
              /* @__PURE__ */ jsx16("span", { className: "sfb-palette__icon", children: item.icon }),
              /* @__PURE__ */ jsx16("span", { children: item.label })
            ]
          },
          item.type
        ))
      ] }),
      /* @__PURE__ */ jsxs16(
        "main",
        {
          className: "sfb-canvas",
          onDragOver: (e) => e.preventDefault(),
          onDrop: (e) => {
            e.preventDefault();
            if (draggingPalette) {
              addField(draggingPalette);
              setDraggingPalette(null);
            }
          },
          children: [
            schema.length === 0 && /* @__PURE__ */ jsxs16("div", { className: "sfb-canvas__empty", children: [
              /* @__PURE__ */ jsx16("div", { className: "sfb-canvas__empty-icon", children: "+" }),
              /* @__PURE__ */ jsx16("p", { children: "Drag fields from the left panel or click them to add" })
            ] }),
            schema.map((field, idx) => {
              var _a, _b;
              return /* @__PURE__ */ jsxs16(
                "div",
                {
                  className: `sfb-row${selected === idx ? " sfb-row--selected" : ""}${dragOverIdx === idx ? " sfb-row--dragover" : ""}`,
                  style: { gridColumn: `span ${(_a = field.col) != null ? _a : 12}` },
                  onClick: () => setSelected(idx),
                  draggable: true,
                  onDragStart: () => {
                    setDraggingIdx(idx);
                  },
                  onDragOver: (e) => {
                    e.preventDefault();
                    setDragOverIdx(idx);
                  },
                  onDragLeave: () => setDragOverIdx(null),
                  onDrop: (e) => {
                    e.stopPropagation();
                    handleDropOnRow(idx);
                  },
                  children: [
                    /* @__PURE__ */ jsx16("div", { className: "sfb-row__handle", title: "Drag to reorder", children: /* @__PURE__ */ jsxs16("svg", { width: "12", height: "16", viewBox: "0 0 12 16", fill: "currentColor", children: [
                      /* @__PURE__ */ jsx16("circle", { cx: "4", cy: "3", r: "1.5" }),
                      /* @__PURE__ */ jsx16("circle", { cx: "8", cy: "3", r: "1.5" }),
                      /* @__PURE__ */ jsx16("circle", { cx: "4", cy: "8", r: "1.5" }),
                      /* @__PURE__ */ jsx16("circle", { cx: "8", cy: "8", r: "1.5" }),
                      /* @__PURE__ */ jsx16("circle", { cx: "4", cy: "13", r: "1.5" }),
                      /* @__PURE__ */ jsx16("circle", { cx: "8", cy: "13", r: "1.5" })
                    ] }) }),
                    /* @__PURE__ */ jsxs16("div", { className: "sfb-row__content", children: [
                      /* @__PURE__ */ jsx16("span", { className: "sfb-row__type", children: field.type }),
                      /* @__PURE__ */ jsx16("span", { className: "sfb-row__name", children: field.label }),
                      /* @__PURE__ */ jsxs16("span", { className: "sfb-row__key", children: [
                        "key: ",
                        field.name
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs16("div", { className: "sfb-row__col", children: [
                      "col ",
                      (_b = field.col) != null ? _b : 12
                    ] })
                  ]
                },
                `${field.name}-${idx}`
              );
            })
          ]
        }
      ),
      /* @__PURE__ */ jsx16("aside", { className: "sfb-props", children: selected !== null && schema[selected] ? /* @__PURE__ */ jsx16(
        FieldEditor,
        {
          field: schema[selected],
          onChange: (updated) => updateField(selected, updated),
          onDelete: () => deleteField(selected)
        }
      ) : /* @__PURE__ */ jsx16("div", { className: "sfb-props__empty", children: /* @__PURE__ */ jsx16("p", { children: "Select a field to edit its properties" }) }) })
    ] }),
    tab === "preview" && /* @__PURE__ */ jsx16("div", { className: "sfb-preview", children: schema.length === 0 ? /* @__PURE__ */ jsx16("p", { className: "sfb-preview__empty", children: "Add fields in the Builder tab to see a preview." }) : /* @__PURE__ */ jsx16(
      SmartForm_default,
      {
        schema,
        onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
        submitLabel: "Submit (preview)"
      }
    ) }),
    tab === "json" && /* @__PURE__ */ jsxs16("div", { className: "sfb-json", children: [
      /* @__PURE__ */ jsx16("div", { className: "sfb-json__toolbar", children: /* @__PURE__ */ jsx16(
        "button",
        {
          type: "button",
          className: "sf-btn sf-btn--ghost sfb-json__copy",
          onClick: () => {
            var _a;
            return (_a = navigator.clipboard) == null ? void 0 : _a.writeText(JSON.stringify(schema, null, 2));
          },
          children: "Copy JSON"
        }
      ) }),
      /* @__PURE__ */ jsx16("pre", { className: "sfb-json__code", children: JSON.stringify(schema, null, 2) })
    ] })
  ] });
};
var FormBuilder_default = FormBuilder;

// src/hooks/useFormState.ts
import { useMemo } from "react";
function useFormState(schema, defaultValues, onChange) {
  const form = useSmartForm(schema, defaultValues, onChange);
  const { values, errors, touched, isSubmitting } = form;
  const dirty = useMemo(() => {
    var _a, _b;
    const d = {};
    for (const field of schema) {
      const def = (_b = (_a = defaultValues == null ? void 0 : defaultValues[field.name]) != null ? _a : field.defaultValue) != null ? _b : field.type === "checkbox" ? false : "";
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
    const required = schema.filter((f) => {
      var _a;
      return (_a = f.validation) == null ? void 0 : _a.required;
    });
    if (!required.length) return 100;
    const filled = required.filter((f) => {
      const v = values[f.name];
      return v !== "" && v !== null && v !== void 0 && !(Array.isArray(v) && v.length === 0);
    });
    return Math.round(filled.length / required.length * 100);
  }, [schema, values]);
  return __spreadProps(__spreadValues({}, form), {
    dirty,
    isDirty,
    isValid,
    completionPct
  });
}

// src/utils/storybookGenerator.ts
function generateStories(schema, componentName = "MyForm", importPath = "react-dynamic-smartform") {
  var _a;
  const isSteps = schema.length > 0 && "title" in schema[0];
  const lines = [];
  lines.push(`import type { Meta, StoryObj } from "@storybook/react";`);
  lines.push(`import { ${isSteps ? "SmartFormWizard" : "SmartForm"} } from "${importPath}";`);
  lines.push(`import { action } from "@storybook/addon-actions";`);
  lines.push("");
  if (isSteps) {
    lines.push(`const steps = ${JSON.stringify(schema, null, 2)};`);
  } else {
    lines.push(`const schema = ${JSON.stringify(schema, null, 2)};`);
  }
  lines.push("");
  const comp = isSteps ? "SmartFormWizard" : "SmartForm";
  lines.push(`const meta: Meta<typeof ${comp}> = {`);
  lines.push(`  title: "SmartForm/${componentName}",`);
  lines.push(`  component: ${comp},`);
  lines.push(`  parameters: { layout: "centered" },`);
  lines.push(`  tags: ["autodocs"],`);
  lines.push(`};`);
  lines.push(`export default meta;`);
  lines.push("");
  lines.push(`type Story = StoryObj<typeof ${comp}>;`);
  lines.push("");
  lines.push(`export const Default: Story = {`);
  lines.push(`  args: {`);
  if (isSteps) {
    lines.push(`    steps,`);
  } else {
    lines.push(`    schema,`);
  }
  lines.push(`    onSubmit: action("onSubmit"),`);
  lines.push(`    submitLabel: "Submit",`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push("");
  if (!isSteps) {
    const flatSchema = schema;
    const defaultValues = {};
    for (const field of flatSchema) {
      if (field.type === "text" || field.type === "email" || field.type === "password") {
        defaultValues[field.name] = `Sample ${field.label}`;
      } else if (field.type === "number") {
        defaultValues[field.name] = 42;
      } else if (field.type === "checkbox") {
        defaultValues[field.name] = true;
      } else if (field.type === "select" || field.type === "radio") {
        const firstOpt = (_a = field.options) == null ? void 0 : _a[0];
        if (firstOpt) {
          defaultValues[field.name] = typeof firstOpt === "string" ? firstOpt : firstOpt.value;
        }
      } else if (field.type === "rating") {
        defaultValues[field.name] = 3;
      }
    }
    lines.push(`export const Prefilled: Story = {`);
    lines.push(`  args: {`);
    lines.push(`    schema,`);
    lines.push(`    onSubmit: action("onSubmit"),`);
    lines.push(`    defaultValues: ${JSON.stringify(defaultValues, null, 4)},`);
    lines.push(`  },`);
    lines.push(`};`);
    lines.push("");
  }
  lines.push(`export const Disabled: Story = {`);
  lines.push(`  args: {`);
  if (isSteps) {
    lines.push(`    steps: steps.map(s => ({ ...s, fields: s.fields.map(f => ({ ...f, disabled: true })) })),`);
  } else {
    lines.push(`    schema: (schema as any).map((f: any) => ({ ...f, disabled: true })),`);
  }
  lines.push(`    onSubmit: action("onSubmit"),`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push("");
  return lines.join("\n");
}
function generateStoriesFile(schema, componentName, importPath = "react-dynamic-smartform") {
  return {
    filename: `${componentName}.stories.tsx`,
    content: generateStories(schema, componentName, importPath)
  };
}
export {
  CheckboxField_default as CheckboxField,
  ColorPickerField_default as ColorPickerField,
  DateRangeField_default as DateRangeField,
  FieldRenderer,
  FileUploadField_default as FileUploadField,
  FormBuilder_default as FormBuilder,
  NumberField_default as NumberField,
  OTPField_default as OTPField,
  RadioField_default as RadioField,
  RatingField_default as RatingField,
  RepeatableField_default as RepeatableField,
  SelectField_default as SelectField,
  SignaturePad_default as SignaturePad,
  SliderField,
  SmartForm_default as SmartForm,
  SmartFormWizard_default as SmartFormWizard,
  TextField_default as TextField,
  generateStories,
  generateStoriesFile,
  useFormState,
  useSchemaValidation,
  useSmartForm,
  validateField,
  validateForm,
  validateSchema
};
