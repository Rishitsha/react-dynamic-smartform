# 🚀 react-dynamic-smartform

![npm version](https://img.shields.io/npm/v/react-dynamic-smartform?color=brightgreen)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-dynamic-smartform)
![npm downloads](https://img.shields.io/npm/dm/react-dynamic-smartform?color=blue)
![license](https://img.shields.io/npm/l/react-dynamic-smartform)
![github stars](https://img.shields.io/github/stars/Rishitsha/react-dynamic-smartform?style=social)

A lightweight, schema-driven dynamic form builder for React.  
Build complex, validated forms in seconds using just a JSON schema ✨

---

## ✨ Key Features

- 📦 **Zero Dependencies** – Ultra-lightweight (under 10KB gzipped)
- 🧠 **Schema Driven** – Define your entire form UI & logic using a single schema
- ✅ **Smart Validation**
  - Required
  - Email
  - Min / Max
  - Regex
  - Custom validation functions
- 🔁 **Conditional Logic**
  - Show / Hide fields
  - Disable fields dynamically (`showIf`, `disabled`)
- 🌐 **API Integration**
  - Fetch dropdown options from remote APIs
  - Built-in caching
- ⚡ **Optimized Performance**
  - Debounced `onChange`
  - Smart re-rendering
- 🧩 **Full TypeScript Support**

---

## 📦 Installation

### npm
```bash
npm install react-dynamic-smartform
```

### yarn
```bash
yarn add react-dynamic-smartform
```

---

## 🚀 Quick Start

### 1️⃣ Define Schema

```ts
import { FieldSchema } from "react-dynamic-smartform";

const schema: FieldSchema[] = [
  {
    name: "username",
    label: "User Name",
    type: "text",
    col: 6,
    validation: {
      required: "Username is mandatory",
    },
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    col: 6,
    validation: {
      required: true,
      email: true,
    },
  },
];
```

---

### 2️⃣ Render Form

```tsx
import { SmartForm } from "react-dynamic-smartform";

function App() {
  const handleSubmit = (data: any) => {
    console.log("Form Submitted:", data);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <SmartForm schema={schema} onSubmit={handleSubmit} />
    </div>
  );
}

export default App;
```

---

## 🧠 Props

| Prop | Type | Description |
|------|------|-------------|
| `schema` | `FieldSchema[]` | Form configuration |
| `onSubmit` | `(data) => void` | Submit callback |
| `defaultValues` | `object` | Initial form values |
| `submitLabel` | `string` | Submit button text |

## 🚀 Live Demo

See **react-dynamic-smartform** in action! Check out the interactive playground below to see how schemas are rendered into real forms:

[**👉 Click here to open Live Interactive Demo on CodeSandbox**](https://codesandbox.io/p/sandbox/npchpm?file=%2Fsrc%2FApp.tsx%3A38%2C11)

---


