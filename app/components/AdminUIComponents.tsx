/**
 * Enhanced Admin Dashboard - Premium UI Components
 * Provides modern, animated, and user-friendly admin controls
 */

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { X, Save, AlertCircle, CheckCircle, Copy } from "lucide-react";

// Container for admin form sections
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
      className="rounded-2xl border border-gradient-to-r from-violet-200 to-pink-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

// Form text input field
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-white text-gray-900 placeholder-gray-400 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-600">{helpText}</p>
      )}
    </div>
  );
}

// Form textarea field
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
      />
      {helpText && <p className="mt-1 text-xs text-gray-600">{helpText}</p>}
    </div>
  );
}

// Form select field
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && <p className="mt-1 text-xs text-gray-600">{helpText}</p>}
    </div>
  );
}

// List editing component
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
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2 mb-3">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
          >
            <span className="text-gray-700 text-sm">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              disabled={disabled}
              className="p-1 hover:bg-red-100 text-red-600 rounded transition disabled:opacity-50"
            >
              <X className="w-4 h-4" />
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
            onKeyPress={(e) => {
              if (e.key === "Enter" && newItem.trim()) {
                onAdd(newItem.trim());
                setNewItem("");
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (newItem.trim()) {
                onAdd(newItem.trim());
                setNewItem("");
              }
            }}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold transition"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// Status badge
export function StatusBadge({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const colorMap = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-3 flex items-center gap-2 ${colorMap[type]}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

// Save button
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
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Save className="w-4 h-4" />
      {loading ? "Saving..." : "Save Changes"}
    </motion.button>
  );
}

// Copy to clipboard helper
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition flex items-center gap-1 text-sm"
    >
      <Copy className="w-4 h-4" />
      {copied ? "Copied!" : label}
    </button>
  );
}
