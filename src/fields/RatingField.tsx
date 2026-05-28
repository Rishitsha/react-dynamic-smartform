import React, { useState } from "react";
import { FieldProps } from "../types";

interface RatingFieldProps extends FieldProps {
  stars?: number;
}

const RatingField: React.FC<RatingFieldProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  stars = 5,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const current = hovered ?? value ?? 0;

  return (
    <div className="sf-field">
      <label className="sf-label">
        {label}
        {required && <span className="sf-required"> *</span>}
      </label>
      <div
        className="sf-rating"
        role="radiogroup"
        aria-label={label}
        onMouseLeave={() => setHovered(null)}
      >
        {Array.from({ length: stars }, (_, i) => {
          const starVal = i + 1;
          const filled = starVal <= current;
          return (
            <button
              key={starVal}
              type="button"
              role="radio"
              aria-checked={value === starVal}
              aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
              className={`sf-rating__star${filled ? " sf-rating__star--filled" : ""}`}
              onClick={() => { if (!disabled) { onChange(starVal); onBlur(); } }}
              onMouseEnter={() => !disabled && setHovered(starVal)}
              disabled={disabled}
            >
              <svg viewBox="0 0 24 24" width="28" height="28">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={filled ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          );
        })}
        {value > 0 && (
          <span className="sf-rating__value">{value} / {stars}</span>
        )}
      </div>
      {helpText && !error && <p className="sf-help">{helpText}</p>}
      {error && <p className="sf-error" role="alert">{error}</p>}
    </div>
  );
};

// ── Slider ─────────────────────────────────────────────────────────────────

interface SliderFieldProps extends FieldProps {
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}

export const SliderField: React.FC<SliderFieldProps> = ({
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
  showValue = true,
}) => {
  const pct = ((value ?? min) - min) / (max - min);

  return (
    <div className="sf-field">
      <label htmlFor={name} className="sf-label">
        {label}
        {required && <span className="sf-required"> *</span>}
        {showValue && (
          <span className="sf-slider__badge">{value ?? min}</span>
        )}
      </label>
      <div className="sf-slider__track-wrap">
        <input
          id={name}
          type="range"
          className="sf-slider"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onBlur}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? min}
          style={{ "--pct": `${pct * 100}%` } as React.CSSProperties}
        />
        <div className="sf-slider__labels">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      {helpText && !error && <p className="sf-help">{helpText}</p>}
      {error && <p className="sf-error" role="alert">{error}</p>}
    </div>
  );
};

export default RatingField;