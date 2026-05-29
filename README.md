# ⚡ react-dynamic-smartform
 
<p align="center">
  <img src="https://img.shields.io/npm/v/react-dynamic-smartform?color=6366f1&style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/bundlephobia/minzip/react-dynamic-smartform?color=22c55e&style=flat-square" alt="bundle size" />
  <img src="https://img.shields.io/npm/dm/react-dynamic-smartform?color=06b6d4&style=flat-square" alt="downloads" />
  <img src="https://img.shields.io/npm/l/react-dynamic-smartform?style=flat-square" alt="license" />
  <img src="https://img.shields.io/github/stars/Rishitsha/react-dynamic-smartform?style=social" alt="stars" />
</p>
<p align="center">
  A lightweight, schema-driven dynamic form builder for React.<br/>
  Build complex, validated forms in seconds using just a JSON schema ✨
</p>
<p align="center">
  <a href="https://codesandbox.io/p/sandbox/npchpm?file=%2Fsrc%2FApp.tsx%3A38%2C11">
    <strong>👉 Open Live Interactive Demo on CodeSandbox</strong>
  </a>
</p>
---
 
## ✨ Features
 
| | Feature | Description |
|---|---|---|
| 📦 | **Zero Dependencies** | Under 10KB gzipped |
| 🧠 | **Schema Driven** | Entire form UI & logic from a single JSON array |
| ✅ | **Smart Validation** | Required, Email, Min/Max, Regex, Custom functions |
| 🔁 | **Conditional Logic** | `showIf` / `disabled` — show, hide, or disable fields dynamically |
| 🌐 | **API Integration** | Fetch dropdown options from remote APIs with built-in caching |
| 🧩 | **New Field Types** | Date range, File upload, Signature pad, Rating, Slider, OTP, Color picker, Repeatable groups |
| 🧙 | **Multi-step Wizard** | `SmartFormWizard` with progress bar and per-step validation |
| 🔧 | **Visual Form Builder** | Drag-and-drop `FormBuilder` with live preview and JSON export |
| 🪝 | **useFormState Hook** | Access `dirty`, `isValid`, `completionPct` outside the form |
| 🔍 | **Dev-time Validation** | `validateSchema()` catches errors before runtime |
| 📖 | **Storybook Generator** | Auto-generate `.stories.tsx` files from any schema |
| ⚡ | **Optimized Performance** | Debounced `onChange`, smart re-rendering |
| 🧩 | **Full TypeScript Support** | Complete type definitions for every prop and schema key |
 
---
 
## 📦 Installation
 
```bash
# npm
npm install react-dynamic-smartform
 
# yarn
yarn add react-dynamic-smartform
 
# pnpm
pnpm add react-dynamic-smartform
```
 
---
 
## 🚀 Quick Start
 
### 1️⃣ Define a Schema
 
```ts
import { FieldSchema } from "react-dynamic-smartform";
 
const schema: FieldSchema[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    col: 6,
    validation: { required: "Username is required", minLength: 3 },
    placeholder: "johndoe",
    helpText: "3–20 characters",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    col: 6,
    validation: { required: true, email: true },
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    col: 6,
    options: ["Developer", "Designer", "Manager"],
    validation: { required: true },
  },
  {
    name: "bio",
    label: "Bio",
    type: "textarea",
    col: 12,
    rows: 3,
  },
];
```
 
### 2️⃣ Render the Form
 
```tsx
import { SmartForm } from "react-dynamic-smartform";
import "react-dynamic-smartform/dist/smartform.css";
 
function App() {
  return (
    <SmartForm
      schema={schema}
      onSubmit={(data) => console.log(data)}
      submitLabel="Create Account"
    />
  );
}
```
 
---
 
## 🧩 Field Types
 
| Type | Description |
|---|---|
| `text` | Single-line text input |
| `email` | Email input with format validation |
| `password` | Password input |
| `number` | Numeric input with min/max |
| `textarea` | Multi-line text |
| `select` | Dropdown — static options or remote API |
| `radio` | Radio button group |
| `checkbox` | Single checkbox |
| `date` | Native date picker |
| `daterange` | Start + end date as one field |
| `file` | Drag-and-drop upload with preview, size/type validation |
| `signature` | Canvas-based drawn signature |
| `rating` | Star rating (configurable count) |
| `slider` | Range slider with min/max/step |
| `colorpicker` | Hex/RGBA color picker with presets |
| `otp` | Segmented PIN/OTP input boxes |
| `repeatable` | Add/remove rows of nested field groups |
 
---
 
## 🧠 SmartForm Props
 
| Prop | Type | Default | Description |
|---|---|---|---|
| `schema` | `FieldSchema[]` | — | Form field definitions |
| `onSubmit` | `(data: Record<string, any>) => void` | — | Called on valid submission |
| `onChange` | `(data: Record<string, any>) => void` | — | Called on any field change |
| `defaultValues` | `Record<string, any>` | — | Pre-fill field values |
| `submitLabel` | `string` | `"Submit"` | Submit button text |
| `className` | `string` | — | CSS class on the `<form>` element |
| `gridCols` | `number` | `12` | Grid columns (used with `col` on each field) |
 
---
 
## 📐 FieldSchema Reference
 
```ts
interface FieldSchema {
  // Required
  name: string;          // Unique field key
  label: string;         // Display label
  type: FieldType;       // Field type (see table above)
 
  // Layout
  col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
 
  // Content
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  rows?: number;         // textarea only
 
  // Validation
  validation?: {
    required?: boolean | string;
    email?: boolean | string;
    min?: number | string;
    max?: number | string;
    minLength?: number | string;
    maxLength?: number | string;
    pattern?: { value: RegExp; message: string };
    validate?: (value: any, allValues: Record<string, any>) => true | string;
  };
 
  // Conditional logic
  showIf?: (values: Record<string, any>) => boolean;
  disabled?: boolean | ((values: Record<string, any>) => boolean);
 
  // Data
  options?: string[] | { label: string; value: string }[];
  optionsUrl?: string;   // Fetch options from a remote API
 
  // Field-specific
  stars?: number;        // rating — number of stars (default 5)
  min?: number;          // slider
  max?: number;          // slider
  step?: number;         // slider
  showValue?: boolean;   // slider — show current value badge
  multiple?: boolean;    // file — allow multiple files
  accept?: string;       // file — HTML accept string e.g. "image/*,.pdf"
  maxSize?: number;      // file — max bytes
  otpLength?: number;    // otp — number of digit boxes (default 6)
  startLabel?: string;   // daterange
  endLabel?: string;     // daterange
  fields?: SubFieldSchema[];  // repeatable — sub-field definitions
  addLabel?: string;     // repeatable — "Add" button label
  removeLabel?: string;  // repeatable — "Remove" button label
 
  // Value transform (applied before storing)
  transform?: (value: any) => any;
}
```
 
---
 
## 🔁 Conditional Logic
 
Fields can appear, disappear, or become disabled based on the values of other fields.
 
```ts
const schema: FieldSchema[] = [
  { name: "hasCompany", label: "Signing up as a company?", type: "checkbox" },
 
  // Only visible when hasCompany is checked
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    showIf: (values) => !!values.hasCompany,
    validation: { required: "Company name is required" },
  },
 
  // Disabled until a country is selected
  {
    name: "state",
    label: "State",
    type: "text",
    disabled: (values) => !values.country,
  },
];
```
 
---
 
## 🌐 API-Driven Options
 
Fetch dropdown or radio options from a remote endpoint. Responses are cached automatically.
 
```ts
{
  name: "country",
  label: "Country",
  type: "select",
  optionsUrl: "https://restcountries.com/v3.1/all?fields=name",
}
```
 
The hook normalises common API shapes automatically:
- `{ label, value }` — used as-is
- `{ name, id }` — mapped to `{ label: name, value: id }`
- `"string"` — used as both label and value
---
 
## 🧙 Multi-step Wizard
 
```tsx
import { SmartFormWizard, StepSchema } from "react-dynamic-smartform";
 
const steps: StepSchema[] = [
  {
    title: "Personal Info",
    description: "Tell us about yourself",
    fields: [
      { name: "firstName", label: "First Name", type: "text", col: 6, validation: { required: true } },
      { name: "lastName",  label: "Last Name",  type: "text", col: 6, validation: { required: true } },
    ],
  },
  {
    title: "Contact",
    fields: [
      { name: "email", label: "Email", type: "email", validation: { required: true, email: true } },
      { name: "phone", label: "Phone", type: "text" },
    ],
  },
  {
    title: "Confirm",
    fields: [
      { name: "terms", label: "I agree to the Terms of Service", type: "checkbox", validation: { required: true } },
    ],
  },
];
 
<SmartFormWizard
  steps={steps}
  onSubmit={(data) => console.log(data)}
  submitLabel="Complete Registration"
/>
```
 
Each step validates independently before advancing. A progress bar and step indicator are included automatically.
 
---
 
## 🔧 Visual Form Builder
 
Drop `FormBuilder` anywhere to give your users a drag-and-drop schema editor with live preview and JSON export.
 
```tsx
import { FormBuilder } from "react-dynamic-smartform";
 
<FormBuilder
  initialSchema={[]}
  onChange={(schema) => console.log("Updated schema:", schema)}
/>
```
 
The builder includes a field palette, property editor panel, live form preview, and a raw JSON tab.
 
---
 
## 🪝 useFormState Hook
 
Access form state outside the `<SmartForm>` component — useful for save indicators, progress bars, and enabling/disabling external buttons.
 
```tsx
import { useFormState } from "react-dynamic-smartform";
 
function MyPage() {
  const { values, isDirty, isValid, completionPct, errors } = useFormState(schema);
 
  return (
    <>
      <p>Completion: {completionPct}%</p>
      <p>Has unsaved changes: {isDirty ? "Yes" : "No"}</p>
      <p>All valid: {isValid ? "Yes" : "No"}</p>
    </>
  );
}
```
 
| Property | Type | Description |
|---|---|---|
| `values` | `Record<string, any>` | Current field values |
| `errors` | `Record<string, string>` | Current validation errors |
| `touched` | `Record<string, boolean>` | Which fields have been interacted with |
| `dirty` | `Record<string, boolean>` | Which fields differ from their default value |
| `isDirty` | `boolean` | `true` if any field has changed |
| `isValid` | `boolean` | `true` if all visible fields pass validation |
| `isSubmitting` | `boolean` | `true` while the `onSubmit` promise is pending |
| `completionPct` | `number` | Percentage of required fields that are filled (0–100) |
 
---
 
## 🔍 Dev-time Schema Validation
 
Catch schema mistakes early in development with `validateSchema()`.
 
```ts
import { validateSchema } from "react-dynamic-smartform";
 
const warnings = validateSchema(schema);
// [
//   { field: "fields[1] (email)", message: "Duplicate field name "email"", severity: "error" },
//   { field: "fields[2] (picker)", message: "type "select" should have options or optionsUrl", severity: "warning" },
// ]
```
 
Or use the hook version — it logs automatically to the browser console in development:
 
```ts
import { useSchemaValidation } from "react-dynamic-smartform";
 
// Call inside your component. Logs grouped warnings in dev, no-op in production.
useSchemaValidation(schema);
```
 
Checks include: missing `name`/`label`/`type`, unknown field types, duplicate names, invalid `col` values, missing `options` on select/radio fields, and unknown keys.
 
---
 
## 📖 Storybook Story Generator
 
Auto-generate Storybook CSF stories from any schema.
 
```ts
import { generateStoriesFile } from "react-dynamic-smartform";
 
const { filename, content } = generateStoriesFile(schema, "ContactForm");
// filename → "ContactForm.stories.tsx"
// content  → full CSF story with Default, Prefilled, and Disabled variants
```
 
Use this in a build script or CLI tool to keep stories in sync with your schemas automatically.
 
---
 
## 🎨 Styling & Theming
 
Import the default stylesheet:
 
```ts
import "react-dynamic-smartform/dist/smartform.css";
```
 
All classes use a `sf-` prefix and are easy to override with plain CSS. Key classes:
 
| Class | Element |
|---|---|
| `.sf-form` | `<form>` wrapper |
| `.sf-grid` | Field grid |
| `.sf-label` | Field label |
| `.sf-input` | All input/select/textarea elements |
| `.sf-input--error` | Input in error state |
| `.sf-error` | Error message text |
| `.sf-help` | Help text |
| `.sf-btn--primary` | Submit button |
| `.sf-btn--ghost` | Reset button |
 
Custom theme example:
 
```css
.sf-input:focus {
  border-color: #your-brand-color;
  box-shadow: 0 0 0 3px rgba(your-r, your-g, your-b, 0.15);
}
 
.sf-btn--primary {
  background: #your-brand-color;
  border-color: #your-brand-color;
}
```
 
---
 
## 🗂️ Full API Reference
 
```ts
// Components
import { SmartForm, SmartFormWizard, FormBuilder } from "react-dynamic-smartform";
 
// Hooks
import { useSmartForm, useFormState } from "react-dynamic-smartform";
 
// Utilities
import { validateField, validateForm, validateSchema, useSchemaValidation } from "react-dynamic-smartform";
import { generateStories, generateStoriesFile } from "react-dynamic-smartform";
 
// Individual field components (for custom renderers)
import {
  TextField, NumberField, SelectField, TextareaField,
  RadioField, CheckboxField, DateRangeField, FileUploadField,
  SignaturePad, RatingField, SliderField, ColorPickerField,
  OTPField, RepeatableField,
} from "react-dynamic-smartform";
 
// Types
import type {
  FieldSchema, SubFieldSchema, StepSchema, FieldType,
  FieldProps, SelectOption, ValidationRule, SmartFormProps,
  ColSpan, FormStateSnapshot, SchemaWarning,
} from "react-dynamic-smartform";
```
 
---
 
## 📋 Examples
 
<details>
<summary><strong>File Upload with drag-and-drop</strong></summary>
```ts
{
  name: "documents",
  label: "Upload Documents",
  type: "file",
  multiple: true,
  accept: "image/*,.pdf",
  maxSize: 2 * 1024 * 1024, // 2MB
  helpText: "Images or PDFs, max 2MB each",
}
```
</details>
<details>
<summary><strong>OTP / PIN Input</strong></summary>
```ts
{
  name: "verificationCode",
  label: "Verification Code",
  type: "otp",
  otpLength: 6,
  validation: { required: true },
  helpText: "Enter the 6-digit code sent to your phone",
}
```
</details>
<details>
<summary><strong>Repeatable field groups</strong></summary>
```ts
{
  name: "teamMembers",
  label: "Team Members",
  type: "repeatable",
  addLabel: "+ Add Member",
  validation: { minRows: 1, maxRows: 5 },
  fields: [
    { name: "fullName", label: "Full Name", type: "text",   col: 4, validation: { required: true } },
    { name: "email",    label: "Email",     type: "email",  col: 4 },
    { name: "role",     label: "Role",      type: "select", col: 4, options: ["Frontend", "Backend", "Design"] },
  ],
}
```
</details>
<details>
<summary><strong>Custom async validation</strong></summary>
```ts
{
  name: "username",
  label: "Username",
  type: "text",
  validation: {
    required: true,
    validate: async (value) => {
      const res = await fetch(`/api/check-username?name=${value}`);
      const { available } = await res.json();
      return available || "Username is already taken";
    },
  },
}
```
</details>
<details>
<summary><strong>Remote API options with dependent dropdowns</strong></summary>
```ts
const schema: FieldSchema[] = [
  {
    name: "country",
    label: "Country",
    type: "select",
    optionsUrl: "https://api.example.com/countries",
  },
  {
    name: "city",
    label: "City",
    type: "select",
    showIf: (v) => !!v.country,
    // Rebuild URL when country changes
    optionsUrl: undefined, // use options + onChange to reload dynamically
  },
];
```
</details>
---
 
## 🤝 Contributing
 
Contributions, issues, and feature requests are welcome.
 
```bash
git clone https://github.com/Rishitsha/react-dynamic-smartform
cd react-dynamic-smartform
npm install
npm run dev
```
 
---
 
## 📄 License
 
MIT © [Rishitsha](https://github.com/Rishitsha)