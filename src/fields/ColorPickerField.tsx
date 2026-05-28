import React, { useState, useRef, useEffect } from "react";
import { FieldProps } from "../types";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e",
  "#06b6d4", "#6366f1", "#a855f7", "#ec4899",
  "#1a1a2e", "#374151", "#6b7280", "#ffffff",
];

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: 1,
  };
}

function rgbaToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

const ColorPickerField: React.FC<FieldProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
}) => {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState<string>(value || "#6366f1");
  const [rgba, setRgba] = useState(() => hexToRgba(value || "#6366f1"));
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    if (value && value !== hex) {
      setHex(value);
      setRgba(hexToRgba(value));
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onBlur]);

  const applyHex = (h: string) => {
    setHex(h);
    try {
      const parsed = hexToRgba(h);
      setRgba(parsed);
    } catch {}
    onChange(h);
  };

  const applyRgba = (r: number, g: number, b: number, a: number) => {
    const newRgba = { r, g, b, a };
    setRgba(newRgba);
    const h = rgbaToHex(r, g, b);
    setHex(h);
    onChange(a < 1 ? `rgba(${r},${g},${b},${a})` : h);
  };

  return (
    <div className="sf-field">
      <label className="sf-label">
        {label}
        {required && <span className="sf-required"> *</span>}
      </label>
      <div className="sf-color" ref={panelRef}>
        <button
          type="button"
          className={`sf-color__trigger${error ? " sf-input--error" : ""}`}
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={`Pick color for ${label}`}
        >
          <span
            className="sf-color__swatch"
            style={{ background: value || hex }}
            aria-hidden="true"
          />
          <span className="sf-color__hex">{value || hex}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sf-color__chevron">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="sf-color__panel" role="dialog" aria-label="Color picker">
            {/* Native colour input for full picker */}
            <div className="sf-color__native-wrap">
              <input
                type="color"
                value={hex.startsWith("#") ? hex : "#6366f1"}
                onChange={(e) => applyHex(e.target.value)}
                className="sf-color__native"
                title="Open full colour picker"
              />
              <span className="sf-color__native-label">Open full picker</span>
            </div>

            {/* Preset swatches */}
            <div className="sf-color__presets">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`sf-color__preset${hex === c ? " sf-color__preset--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => applyHex(c)}
                  title={c}
                  aria-label={c}
                  aria-pressed={hex === c}
                />
              ))}
            </div>

            {/* Manual hex input */}
            <div className="sf-color__inputs">
              <div className="sf-color__input-group">
                <label className="sf-color__input-label">Hex</label>
                <input
                  type="text"
                  className="sf-input sf-color__hex-input"
                  value={hex}
                  maxLength={7}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHex(v);
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) applyHex(v);
                  }}
                  spellCheck={false}
                />
              </div>
              {(["r", "g", "b"] as const).map((ch) => (
                <div key={ch} className="sf-color__input-group">
                  <label className="sf-color__input-label">{ch.toUpperCase()}</label>
                  <input
                    type="number"
                    className="sf-input sf-color__rgb-input"
                    min={0}
                    max={255}
                    value={rgba[ch]}
                    onChange={(e) =>
                      applyRgba(
                        ch === "r" ? +e.target.value : rgba.r,
                        ch === "g" ? +e.target.value : rgba.g,
                        ch === "b" ? +e.target.value : rgba.b,
                        rgba.a
                      )
                    }
                  />
                </div>
              ))}
              <div className="sf-color__input-group">
                <label className="sf-color__input-label">A</label>
                <input
                  type="number"
                  className="sf-input sf-color__rgb-input"
                  min={0}
                  max={1}
                  step={0.1}
                  value={rgba.a}
                  onChange={(e) => applyRgba(rgba.r, rgba.g, rgba.b, +e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {helpText && !error && <p className="sf-help">{helpText}</p>}
      {error && <p className="sf-error" role="alert">{error}</p>}
    </div>
  );
};

export default ColorPickerField;