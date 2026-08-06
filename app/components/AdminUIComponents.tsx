/**
 * Shared admin UI primitives styled to match the paper aesthetic.
 */

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { X, Save, AlertCircle, CheckCircle, Copy } from "lucide-react";

export const adminFieldClassName =
  "w-full rounded-2xl border-2 border-[var(--foreground)]/15 bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/45 shadow-[4px_4px_0_0_rgba(47,36,27,0.08)] transition-all duration-300 focus:border-[var(--accent)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)] disabled:text-[var(--foreground)]/50";

export const adminSubtleButtonClassName =
  "inline-flex items-center justify-center rounded-full border-2 border-[var(--foreground)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(47,36,27,0.08)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[var(--surface-soft)] active:translate-y-0";

export const adminPrimaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border-2 border-[var(--foreground)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.14)] transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

export function AdminCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="paper-card p-6 shadow-none transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-[var(--foreground)]">{title}</h3>
          {description && <p className="mt-1 text-sm text-[var(--foreground)]/70">{description}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

export function AdminTextInput({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  helpText,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`${adminFieldClassName} ${error ? "border-red-300 focus:border-red-500" : ""}`}
      />
      {error && (
        <p className="mt-1 flex items-center gap-1 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
      {helpText && !error && <p className="mt-1 text-xs text-[var(--foreground)]/60">{helpText}</p>}
    </div>
  );
}

export function AdminTextarea({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  rows = 4,
  helpText,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  helpText?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={`${adminFieldClassName} resize-none`}
      />
      {helpText && <p className="mt-1 text-xs text-[var(--foreground)]/60">{helpText}</p>}
    </div>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
  helpText,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  helpText?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={adminFieldClassName}>
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && <p className="mt-1 text-xs text-[var(--foreground)]/60">{helpText}</p>}
    </div>
  );
}

export function AdminList({
  label,
  items,
  onAdd,
  onRemove,
  disabled = false,
  placeholder = "Add new item...",
}: {
  label: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [newItem, setNewItem] = React.useState("");

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">{label}</label>
      <div className="mb-3 space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center justify-between rounded-xl border-2 border-[var(--foreground)]/12 bg-[var(--surface)] px-4 py-2 shadow-[3px_3px_0_0_rgba(47,36,27,0.08)]"
          >
            <span className="text-sm text-[var(--foreground)]">{item}</span>
            <button type="button" onClick={() => onRemove(index)} disabled={disabled} className="rounded-full p-1 text-red-700 transition hover:bg-red-50 disabled:opacity-50">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newItem.trim()) {
                onAdd(newItem.trim());
                setNewItem("");
              }
            }}
            placeholder={placeholder}
            className={adminFieldClassName}
          />
          <button
            type="button"
            onClick={() => {
              if (newItem.trim()) {
                onAdd(newItem.trim());
                setNewItem("");
              }
            }}
            className={adminPrimaryButtonClassName}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const colorMap = {
    success: "border-emerald-300 bg-emerald-100 text-emerald-800",
    error: "border-red-300 bg-red-100 text-red-800",
    info: "border-blue-300 bg-blue-100 text-blue-800",
  };

  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`paper-card flex items-center gap-2 p-3 shadow-none ${colorMap[type]}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

export function SaveButton({
  onClick,
  loading = false,
  disabled = false,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={loading || disabled}
      className={adminPrimaryButtonClassName}
    >
      <Save className="h-4 w-4" />
      {loading ? "Saving..." : "Save Changes"}
    </motion.button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={adminSubtleButtonClassName}
    >
      <Copy className="h-4 w-4" />
      {copied ? "Copied!" : label}
    </button>
  );
}
