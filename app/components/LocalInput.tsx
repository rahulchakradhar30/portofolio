"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { adminFieldClassName } from "./AdminUIComponents";

interface LocalInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  isTextarea?: boolean;
  className?: string;
}

export const LocalInput = React.memo(function LocalInput({
  label,
  value: parentValue,
  onChange,
  debounceMs = 250,
  type = "text",
  disabled = false,
  placeholder,
  helpText,
  required = false,
  error,
  rows = 4,
  isTextarea = false,
  className = "",
}: LocalInputProps) {
  const [localValue, setLocalValue] = useState(parentValue || "");
  const [prevParentValue, setPrevParentValue] = useState(parentValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state when parentValue changes from external source (e.g. form load or reset)
  if (parentValue !== prevParentValue) {
    setPrevParentValue(parentValue);
    setLocalValue(parentValue || "");
  }

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      onChange(val);
    }, debounceMs);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localValue !== parentValue) {
      onChange(localValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {isTextarea ? (
        <textarea
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={`${adminFieldClassName} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`${adminFieldClassName} ${error ? "border-red-300 focus:border-red-500" : ""}`}
        />
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      {helpText && !error && <p className="mt-1 text-xs text-[var(--foreground)]/60">{helpText}</p>}
    </div>
  );
});
