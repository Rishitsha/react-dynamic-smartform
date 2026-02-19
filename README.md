# 🚀 react-dynamic-smartform

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

---


