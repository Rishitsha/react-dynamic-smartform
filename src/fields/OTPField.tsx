import React, { useRef, useCallback } from "react";
import { FieldProps } from "../types";

interface OTPFieldProps extends FieldProps {
  otpLength?: number;
}

const OTPField: React.FC<OTPFieldProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  helpText,
  required,
  otpLength = 6,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits: string[] = (value || "").split("").concat(Array(otpLength).fill("")).slice(0, otpLength);

  const focusNext = (idx: number) => inputsRef.current[idx + 1]?.focus();
  const focusPrev = (idx: number) => inputsRef.current[idx - 1]?.focus();

  const handleChange = useCallback(
    (idx: number, raw: string) => {
      // Accept only digits
      const char = raw.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[idx] = char;
      const joined = next.join("");
      onChange(joined);
      if (char) focusNext(idx);
    },
    [digits, onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent, startIdx: number) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpLength - startIdx);
      const next = [...digits];
      pasted.split("").forEach((ch, i) => { next[startIdx + i] = ch; });
      onChange(next.join(""));
      const focus = Math.min(startIdx + pasted.length, otpLength - 1);
      inputsRef.current[focus]?.focus();
    },
    [digits, onChange, otpLength]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
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

  return (
    <div className="sf-field">
      <label className="sf-label">
        {label}
        {required && <span className="sf-required"> *</span>}
      </label>
      <div className="sf-otp" role="group" aria-label={label}>
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            id={`${name}-${idx}`}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            className={`sf-otp__digit${error ? " sf-otp__digit--error" : ""}${d ? " sf-otp__digit--filled" : ""}`}
            value={d}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={(e) => handlePaste(e, idx)}
            onFocus={(e) => e.target.select()}
            onBlur={idx === otpLength - 1 ? onBlur : undefined}
            disabled={disabled}
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${idx + 1} of ${otpLength}`}
          />
        ))}
      </div>
      {helpText && !error && <p className="sf-help">{helpText}</p>}
      {error && <p className="sf-error" role="alert">{error}</p>}
    </div>
  );
};

export default OTPField;