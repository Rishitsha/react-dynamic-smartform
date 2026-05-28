import React, { useRef, useState, useCallback } from "react";
import { FieldProps } from "../types";

interface FileUploadFieldProps extends FieldProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // bytes
}

interface FileWithPreview {
  file: File;
  previewUrl?: string;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
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
  maxSize,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>(
    Array.isArray(value) ? value : []
  );
  const [localError, setLocalError] = useState<string | undefined>();

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const processed: FileWithPreview[] = arr.map((file) => {
        // Size check
        if (maxSize && file.size > maxSize) {
          return {
            file,
            error: `File too large (max ${formatBytes(maxSize)})`,
          };
        }
        // Type check via accept
        if (accept) {
          const types = accept.split(",").map((s) => s.trim());
          const ok = types.some((t) => {
            if (t.startsWith(".")) return file.name.toLowerCase().endsWith(t.toLowerCase());
            if (t.endsWith("/*")) return file.type.startsWith(t.replace("/*", "/"));
            return file.type === t;
          });
          if (!ok) return { file, error: "File type not allowed" };
        }
        // Preview for images
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;
        return { file, previewUrl };
      });

      const next = multiple ? [...files, ...processed] : processed.slice(0, 1);
      setFiles(next);
      const validFiles = next.filter((f) => !f.error).map((f) => f.file);
      onChange(multiple ? validFiles : validFiles[0] ?? null);
    },
    [files, multiple, accept, maxSize, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const removeFile = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    const validFiles = next.filter((f) => !f.error).map((f) => f.file);
    onChange(multiple ? validFiles : validFiles[0] ?? null);
  };

  return (
    <div className="sf-field">
      <label className="sf-label">
        {label}
        {required && <span className="sf-required"> *</span>}
      </label>

      <div
        className={`sf-dropzone${dragging ? " sf-dropzone--active" : ""}${disabled ? " sf-dropzone--disabled" : ""}${error ? " sf-dropzone--error" : ""}`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onBlur={onBlur}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label={`Upload ${label}`}
      >
        <input
          ref={inputRef}
          type="file"
          id={name}
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          style={{ display: "none" }}
          aria-hidden="true"
        />
        <div className="sf-dropzone__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="sf-dropzone__text">
          <strong>Drag & drop</strong> or <span className="sf-dropzone__link">browse</span>
        </p>
        {accept && (
          <p className="sf-dropzone__hint">
            Allowed: {accept} {maxSize ? `· Max ${formatBytes(maxSize)}` : ""}
          </p>
        )}
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <ul className="sf-file-list">
          {files.map((fw, idx) => (
            <li key={idx} className={`sf-file-item${fw.error ? " sf-file-item--error" : ""}`}>
              {fw.previewUrl && (
                <img src={fw.previewUrl} alt={fw.file.name} className="sf-file-preview" />
              )}
              {!fw.previewUrl && (
                <div className="sf-file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              )}
              <div className="sf-file-info">
                <span className="sf-file-name">{fw.file.name}</span>
                {fw.error
                  ? <span className="sf-file-error">{fw.error}</span>
                  : <span className="sf-file-size">{formatBytes(fw.file.size)}</span>
                }
              </div>
              <button
                type="button"
                className="sf-file-remove"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                aria-label={`Remove ${fw.file.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {helpText && !error && <p className="sf-help">{helpText}</p>}
      {error && <p className="sf-error" role="alert">{error}</p>}
    </div>
  );
};

export default FileUploadField;