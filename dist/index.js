"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SmartForm: () => SmartForm_default,
  useSmartForm: () => useSmartForm,
  validateField: () => validateField,
  validateForm: () => validateForm
});
module.exports = __toCommonJS(index_exports);

// src/SmartForm.tsx
var import_react3 = require("react");

// src/useSmartForm.tsx
var import_react = require("react");

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
  const [values, setValues] = (0, import_react.useState)(
    () => getInitialValues(schema, defaultValues)
  );
  const [errors, setErrors] = (0, import_react.useState)({});
  const [touched, setTouched] = (0, import_react.useState)({});
  const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
  const debounceRef = (0, import_react.useRef)(null);
  const onChangeRef = (0, import_react.useRef)(onChange);
  onChangeRef.current = onChange;
  const handleChange = (0, import_react.useCallback)(
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
  const handleBlur = (0, import_react.useCallback)(
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
  const validate = (0, import_react.useCallback)(() => {
    const errs = validateForm(schema, values);
    setErrors(errs);
    const allTouched = {};
    schema.forEach((f) => allTouched[f.name] = true);
    setTouched(allTouched);
    return Object.keys(errs).length === 0;
  }, [schema, values]);
  const reset = (0, import_react.useCallback)(() => {
    setValues(getInitialValues(schema, defaultValues));
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [schema, defaultValues]);
  (0, import_react.useEffect)(() => {
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

// src/fields/TextField.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sf-field", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { htmlFor: name, className: "sf-label", children: [
    label,
    required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
  helpText && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var TextField_default = TextField;

// src/useOptions.ts
var import_react2 = require("react");
var cache = {};
function useOptions(staticOptions, url) {
  const [options, setOptions] = (0, import_react2.useState)(() => {
    if (staticOptions) return normalizeOptions(staticOptions);
    if (url && cache[url]) return cache[url];
    return [];
  });
  const [loading, setLoading] = (0, import_react2.useState)(!!url && !cache[url]);
  (0, import_react2.useEffect)(() => {
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
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "sf-field", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { htmlFor: name, className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: loading ? "Loading\u2026" : placeholder || "Select an option" }),
          options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: o.value, children: o.label }, o.value))
        ]
      }
    ),
    helpText && !error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
  ] });
};
var SelectField_default = SelectField;

// src/fields/NumberField.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
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
}) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "sf-field", children: [
  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { htmlFor: name, className: "sf-label", children: [
    label,
    required && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  helpText && !error && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var NumberField_default = NumberField;

// src/fields/TextAreaField.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
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
}) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "sf-field", children: [
  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { htmlFor: name, className: "sf-label", children: [
    label,
    required && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
  helpText && !error && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var TextAreaField_default = TextareaField;

// src/fields/RadioField.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "sf-field", role: "group", "aria-labelledby": `${name}-legend`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { id: `${name}-legend`, className: "sf-label", children: [
      label,
      required && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "sf-required", "aria-hidden": "true", children: " *" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "sf-radio-group", children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "sf-label--radio", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: opt.label })
    ] }, opt.value)) }),
    helpText && !error && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "sf-help", children: helpText }),
    error && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "sf-error", role: "alert", children: error })
  ] });
};
var RadioField_default = RadioField;

// src/fields/CheckboxField.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var CheckboxField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText
}) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "sf-field sf-field--checkbox", children: [
  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { htmlFor: name, className: "sf-label sf-label--checkbox", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: label })
  ] }),
  helpText && !error && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { id: `${name}-help`, className: "sf-help", children: helpText }),
  error && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { id: `${name}-error`, className: "sf-error", role: "alert", children: error })
] });
var CheckboxField_default = CheckboxField;

// src/SmartForm.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var SmartForm = ({
  schema,
  onSubmit,
  onChange,
  defaultValues,
  submitLabel = "Submit",
  className = "",
  gridCols = 12
}) => {
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
  const handleSubmit = (0, import_react3.useCallback)(
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
  const renderField = (0, import_react3.useCallback)(
    (field) => {
      var _a;
      if (field.showIf && !field.showIf(values)) return null;
      const isDisabled = typeof field.disabled === "function" ? field.disabled(values) : !!field.disabled;
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
      const colStyle = field.col ? { gridColumn: `span ${field.col}` } : void 0;
      let fieldEl;
      switch (field.type) {
        case "text":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TextField_default, __spreadValues({}, commonProps));
          break;
        case "email":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TextField_default, __spreadProps(__spreadValues({}, commonProps), { type: "email" }));
          break;
        case "password":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TextField_default, __spreadProps(__spreadValues({}, commonProps), { type: "password" }));
          break;
        case "date":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TextField_default, __spreadProps(__spreadValues({}, commonProps), { type: "date" }));
          break;
        case "number":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(NumberField_default, __spreadValues({}, commonProps));
          break;
        case "textarea":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TextAreaField_default, __spreadProps(__spreadValues({}, commonProps), { rows: field.rows }));
          break;
        case "select":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            SelectField_default,
            __spreadProps(__spreadValues({}, commonProps), {
              options: field.options,
              optionsUrl: field.optionsUrl
            })
          );
          break;
        case "radio":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(RadioField_default, __spreadProps(__spreadValues({}, commonProps), { options: field.options }));
          break;
        case "checkbox":
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CheckboxField_default, __spreadValues({}, commonProps));
          break;
        default:
          fieldEl = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(TextField_default, __spreadValues({}, commonProps));
      }
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "sf-field-wrapper", style: colStyle, children: fieldEl }, field.name);
    },
    [values, errors, touched, handleChange, handleBlur]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "form",
    {
      className: `sf-form ${className}`.trim(),
      onSubmit: handleSubmit,
      noValidate: true,
      style: { "--sf-grid-cols": gridCols },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "sf-grid", children: schema.map(renderField) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "sf-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "submit",
              className: "sf-btn sf-btn--primary",
              disabled: isSubmitting,
              children: isSubmitting ? "Submitting\u2026" : submitLabel
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SmartForm,
  useSmartForm,
  validateField,
  validateForm
});
