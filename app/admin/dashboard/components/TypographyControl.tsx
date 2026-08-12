"use client";

import React from "react";
import type { TypographyStyle } from "@/app/lib/types";
import { RotateCcw, Bold, Italic, Underline } from "lucide-react";

interface TypographyControlProps {
  label: string;
  styleValue?: TypographyStyle;
  onChange: (newStyle: TypographyStyle | undefined) => void;
}

const COLOR_PRESETS = [
  { name: "Default (Theme)", value: "" },
  { name: "Accent Red", value: "#d94e33" },
  { name: "Deep Charcoal", value: "#2a241f" },
  { name: "Warm Gold", value: "#c4a884" },
  { name: "Terracotta", value: "#8d6b4e" },
  { name: "Forest Green", value: "#2e7d32" },
  { name: "Royal Blue", value: "#1565c0" },
  { name: "Purple Accent", value: "#7b1fa2" },
];

export default function TypographyControl({
  label,
  styleValue = {},
  onChange,
}: TypographyControlProps) {
  const handleToggleBold = () => {
    onChange({
      ...styleValue,
      bold: !styleValue.bold,
    });
  };

  const handleToggleItalic = () => {
    onChange({
      ...styleValue,
      italic: !styleValue.italic,
    });
  };

  const handleToggleUnderline = () => {
    onChange({
      ...styleValue,
      underline: !styleValue.underline,
    });
  };

  const handleColorChange = (color: string) => {
    if (!color) {
      const { color: _, ...rest } = styleValue;
      onChange(Object.keys(rest).length > 0 ? rest : undefined);
    } else {
      onChange({
        ...styleValue,
        color,
      });
    }
  };

  const handleReset = () => {
    onChange(undefined);
  };

  const isCustomized = Boolean(
    styleValue.color || styleValue.bold || styleValue.italic || styleValue.underline
  );

  return (
    <div className="rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">{label}</span>
        {isCustomized && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            title="Reset to global theme"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Global Theme
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Style Toggles */}
        <div className="inline-flex rounded-lg border border-[var(--foreground)]/20 bg-[var(--surface)] p-0.5">
          <button
            type="button"
            onClick={handleToggleBold}
            className={`p-1.5 rounded text-xs font-bold transition ${
              styleValue.bold
                ? "bg-[var(--foreground)] text-[var(--surface)]"
                : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggleItalic}
            className={`p-1.5 rounded text-xs font-bold transition ${
              styleValue.italic
                ? "bg-[var(--foreground)] text-[var(--surface)]"
                : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggleUnderline}
            className={`p-1.5 rounded text-xs font-bold transition ${
              styleValue.underline
                ? "bg-[var(--foreground)] text-[var(--surface)]"
                : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
            }`}
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          <select
            value={styleValue.color || ""}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-[var(--foreground)]/20 bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)] outline-none"
          >
            {COLOR_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.value}>
                {preset.name}
              </option>
            ))}
          </select>
          {styleValue.color && (
            <div
              className="w-5 h-5 rounded-full border border-[var(--foreground)]/30 flex-shrink-0"
              style={{ backgroundColor: styleValue.color }}
              title={styleValue.color}
            />
          )}
        </div>
      </div>
    </div>
  );
}
