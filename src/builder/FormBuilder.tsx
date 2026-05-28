import React, { useState, useCallback, useRef } from "react";
import { FieldSchema, FieldType } from "../types";
import SmartForm from "../SmartForm";

// ── Palette of available field types ────────────────────────────────────────
interface PaletteItem {
  type: FieldType;
  icon: string;
  label: string;
  defaults: Partial<FieldSchema>;
}

const PALETTE: PaletteItem[] = [
  { type: "text",        icon: "T",  label: "Text",        defaults: {} },
  { type: "email",       icon: "@",  label: "Email",       defaults: { validation: { email: true } } },
  { type: "password",    icon: "🔒", label: "Password",    defaults: {} },
  { type: "number",      icon: "#",  label: "Number",      defaults: {} },
  { type: "textarea",    icon: "¶",  label: "Textarea",    defaults: { rows: 3 } },
  { type: "select",      icon: "▾",  label: "Select",      defaults: { options: ["Option A", "Option B", "Option C"] } },
  { type: "radio",       icon: "◉",  label: "Radio",       defaults: { options: ["Yes", "No"] } },
  { type: "checkbox",    icon: "☑",  label: "Checkbox",    defaults: {} },
  { type: "date",        icon: "📅", label: "Date",        defaults: {} },
  { type: "daterange",   icon: "↔",  label: "Date Range",  defaults: {} },
  { type: "file",        icon: "📎", label: "File Upload", defaults: {} },
  { type: "signature",   icon: "✍",  label: "Signature",   defaults: {} },
  { type: "rating",      icon: "★",  label: "Rating",      defaults: { stars: 5 } },
  { type: "slider",      icon: "⇌",  label: "Slider",      defaults: { min: 0, max: 100, step: 1 } },
  { type: "colorpicker", icon: "🎨", label: "Colour",      defaults: {} },
  { type: "otp",         icon: "⊞",  label: "OTP",         defaults: { otpLength: 6 } },
];

// ── Unique name generator ────────────────────────────────────────────────────
function genName(type: FieldType, existing: FieldSchema[]) {
  let i = 1;
  const base = type.replace(/[^a-z]/gi, "");
  while (existing.some((f) => f.name === `${base}_${i}`)) i++;
  return `${base}_${i}`;
}

// ── FieldEditor: right-panel property editor ─────────────────────────────────
const FieldEditor: React.FC<{
  field: FieldSchema;
  onChange: (updated: FieldSchema) => void;
  onDelete: () => void;
}> = ({ field, onChange, onDelete }) => {
  const update = (partial: Partial<FieldSchema>) => onChange({ ...field, ...partial });
  const setValidation = (key: string, val: any) =>
    onChange({ ...field, validation: { ...field.validation, [key]: val || undefined } });

  return (
    <div className="sfb-editor">
      <div className="sfb-editor__header">
        <span className="sfb-editor__type-badge">{field.type}</span>
        <button type="button" className="sfb-editor__delete" onClick={onDelete} title="Delete field">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
          Delete
        </button>
      </div>

      <div className="sfb-prop">
        <label className="sfb-prop__label">Name (key)</label>
        <input className="sf-input sfb-prop__input" value={field.name}
          onChange={(e) => update({ name: e.target.value })} />
      </div>
      <div className="sfb-prop">
        <label className="sfb-prop__label">Label</label>
        <input className="sf-input sfb-prop__input" value={field.label}
          onChange={(e) => update({ label: e.target.value })} />
      </div>
      <div className="sfb-prop">
        <label className="sfb-prop__label">Placeholder</label>
        <input className="sf-input sfb-prop__input" value={field.placeholder ?? ""}
          onChange={(e) => update({ placeholder: e.target.value || undefined })} />
      </div>
      <div className="sfb-prop">
        <label className="sfb-prop__label">Help text</label>
        <input className="sf-input sfb-prop__input" value={field.helpText ?? ""}
          onChange={(e) => update({ helpText: e.target.value || undefined })} />
      </div>
      <div className="sfb-prop sfb-prop--row">
        <label className="sfb-prop__label">Col span</label>
        <select className="sf-input sfb-prop__select" value={field.col ?? 12}
          onChange={(e) => update({ col: Number(e.target.value) as any })}>
          {[2,3,4,6,8,9,12].map(c => <option key={c} value={c}>{c} / 12</option>)}
        </select>
      </div>

      {/* Options for select/radio */}
      {(field.type === "select" || field.type === "radio") && (
        <div className="sfb-prop">
          <label className="sfb-prop__label">Options (comma-separated)</label>
          <input
            className="sf-input sfb-prop__input"
            value={
              (field.options as string[] | undefined)?.join(", ") ?? ""
            }
            onChange={(e) => update({ options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
        </div>
      )}

      {/* Slider config */}
      {field.type === "slider" && (
        <>
          <div className="sfb-prop sfb-prop--row">
            <label className="sfb-prop__label">Min</label>
            <input type="number" className="sf-input sfb-prop__select" value={field.min ?? 0}
              onChange={(e) => update({ min: +e.target.value })} />
          </div>
          <div className="sfb-prop sfb-prop--row">
            <label className="sfb-prop__label">Max</label>
            <input type="number" className="sf-input sfb-prop__select" value={field.max ?? 100}
              onChange={(e) => update({ max: +e.target.value })} />
          </div>
          <div className="sfb-prop sfb-prop--row">
            <label className="sfb-prop__label">Step</label>
            <input type="number" className="sf-input sfb-prop__select" value={field.step ?? 1}
              onChange={(e) => update({ step: +e.target.value })} />
          </div>
        </>
      )}

      {/* Rating stars */}
      {field.type === "rating" && (
        <div className="sfb-prop sfb-prop--row">
          <label className="sfb-prop__label">Stars</label>
          <input type="number" min={3} max={10} className="sf-input sfb-prop__select" value={field.stars ?? 5}
            onChange={(e) => update({ stars: +e.target.value })} />
        </div>
      )}

      {/* OTP length */}
      {field.type === "otp" && (
        <div className="sfb-prop sfb-prop--row">
          <label className="sfb-prop__label">OTP Length</label>
          <input type="number" min={4} max={12} className="sf-input sfb-prop__select" value={field.otpLength ?? 6}
            onChange={(e) => update({ otpLength: +e.target.value })} />
        </div>
      )}

      {/* Validation */}
      <div className="sfb-section">Validation</div>
      <div className="sfb-prop sfb-prop--check">
        <label>
          <input type="checkbox" checked={!!field.validation?.required}
            onChange={(e) => setValidation("required", e.target.checked || undefined)} />
          Required
        </label>
      </div>
      {(field.type === "text" || field.type === "textarea" || field.type === "email" || field.type === "password") && (
        <>
          <div className="sfb-prop sfb-prop--row">
            <label className="sfb-prop__label">Min length</label>
            <input type="number" className="sf-input sfb-prop__select"
              value={field.validation?.minLength as number ?? ""}
              onChange={(e) => setValidation("minLength", e.target.value ? +e.target.value : undefined)} />
          </div>
          <div className="sfb-prop sfb-prop--row">
            <label className="sfb-prop__label">Max length</label>
            <input type="number" className="sf-input sfb-prop__select"
              value={field.validation?.maxLength as number ?? ""}
              onChange={(e) => setValidation("maxLength", e.target.value ? +e.target.value : undefined)} />
          </div>
        </>
      )}
    </div>
  );
};

// ── Main FormBuilder ─────────────────────────────────────────────────────────
const FormBuilder: React.FC<{
  initialSchema?: FieldSchema[];
  onChange?: (schema: FieldSchema[]) => void;
}> = ({ initialSchema = [], onChange }) => {
  const [schema, setSchema] = useState<FieldSchema[]>(initialSchema);
  const [selected, setSelected] = useState<number | null>(null);
  const [draggingPalette, setDraggingPalette] = useState<PaletteItem | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<"builder" | "preview" | "json">("builder");
  const dragTarget = useRef<number | null>(null);

  const updateSchema = (next: FieldSchema[]) => {
    setSchema(next);
    onChange?.(next);
  };

  // Add field from palette
  const addField = useCallback(
    (item: PaletteItem, insertAt?: number) => {
      const newField: FieldSchema = {
        name: genName(item.type, schema),
        label: item.label,
        type: item.type,
        col: 12,
        ...item.defaults,
      } as FieldSchema;
      const next = [...schema];
      if (insertAt !== undefined) {
        next.splice(insertAt, 0, newField);
      } else {
        next.push(newField);
      }
      updateSchema(next);
      setSelected(insertAt ?? next.length - 1);
    },
    [schema]
  );

  const updateField = (idx: number, updated: FieldSchema) => {
    const next = schema.map((f, i) => (i === idx ? updated : f));
    updateSchema(next);
  };

  const deleteField = (idx: number) => {
    const next = schema.filter((_, i) => i !== idx);
    updateSchema(next);
    setSelected(null);
  };

  // Reorder via drag
  const handleDropOnRow = (dropIdx: number) => {
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

  return (
    <div className="sfb">
      {/* Top tabs */}
      <div className="sfb-tabs">
        <h2 className="sfb-title">Form Builder</h2>
        <div className="sfb-tab-group">
          {(["builder", "preview", "json"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`sfb-tab${tab === t ? " sfb-tab--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "builder" ? "🔧 Builder" : t === "preview" ? "👁 Preview" : "{ } JSON"}
            </button>
          ))}
        </div>
      </div>

      {tab === "builder" && (
        <div className="sfb-layout">
          {/* LEFT: field palette */}
          <aside className="sfb-palette">
            <div className="sfb-palette__title">Fields</div>
            {PALETTE.map((item) => (
              <div
                key={item.type}
                className="sfb-palette__item"
                draggable
                onDragStart={() => setDraggingPalette(item)}
                onDragEnd={() => setDraggingPalette(null)}
                onClick={() => addField(item)}
                title={`Add ${item.label}`}
              >
                <span className="sfb-palette__icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </aside>

          {/* CENTRE: canvas */}
          <main
            className="sfb-canvas"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingPalette) {
                addField(draggingPalette);
                setDraggingPalette(null);
              }
            }}
          >
            {schema.length === 0 && (
              <div className="sfb-canvas__empty">
                <div className="sfb-canvas__empty-icon">+</div>
                <p>Drag fields from the left panel or click them to add</p>
              </div>
            )}
            {schema.map((field, idx) => (
              <div
                key={`${field.name}-${idx}`}
                className={`sfb-row${selected === idx ? " sfb-row--selected" : ""}${dragOverIdx === idx ? " sfb-row--dragover" : ""}`}
                style={{ gridColumn: `span ${field.col ?? 12}` }}
                onClick={() => setSelected(idx)}
                draggable
                onDragStart={() => { setDraggingIdx(idx); }}
                onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={(e) => { e.stopPropagation(); handleDropOnRow(idx); }}
              >
                <div className="sfb-row__handle" title="Drag to reorder">
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
                    <circle cx="4" cy="3" r="1.5" />
                    <circle cx="8" cy="3" r="1.5" />
                    <circle cx="4" cy="8" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="4" cy="13" r="1.5" />
                    <circle cx="8" cy="13" r="1.5" />
                  </svg>
                </div>
                <div className="sfb-row__content">
                  <span className="sfb-row__type">{field.type}</span>
                  <span className="sfb-row__name">{field.label}</span>
                  <span className="sfb-row__key">key: {field.name}</span>
                </div>
                <div className="sfb-row__col">col {field.col ?? 12}</div>
              </div>
            ))}
          </main>

          {/* RIGHT: property editor */}
          <aside className="sfb-props">
            {selected !== null && schema[selected] ? (
              <FieldEditor
                field={schema[selected]}
                onChange={(updated) => updateField(selected, updated)}
                onDelete={() => deleteField(selected)}
              />
            ) : (
              <div className="sfb-props__empty">
                <p>Select a field to edit its properties</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {tab === "preview" && (
        <div className="sfb-preview">
          {schema.length === 0 ? (
            <p className="sfb-preview__empty">Add fields in the Builder tab to see a preview.</p>
          ) : (
            <SmartForm
              schema={schema}
              onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
              submitLabel="Submit (preview)"
            />
          )}
        </div>
      )}

      {tab === "json" && (
        <div className="sfb-json">
          <div className="sfb-json__toolbar">
            <button
              type="button"
              className="sf-btn sf-btn--ghost sfb-json__copy"
              onClick={() => navigator.clipboard?.writeText(JSON.stringify(schema, null, 2))}
            >
              Copy JSON
            </button>
          </div>
          <pre className="sfb-json__code">{JSON.stringify(schema, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;