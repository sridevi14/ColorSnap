"use client";

import { useState } from "react";
import { ColorInfo } from "@/app/page";

interface ColorPaletteProps {
  colors: ColorInfo[];
}

function getContrastColor(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showCopyAll, setShowCopyAll] = useState(false);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyAllColors = async () => {
    const allHexCodes = colors.map((color) => color.hex).join(", ");
    try {
      await navigator.clipboard.writeText(allHexCodes);
      setShowCopyAll(true);
      setTimeout(() => setShowCopyAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Extracted Palette
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {colors.length} colors extracted
          </p>
        </div>
        <button
          onClick={copyAllColors}
          className={`btn-secondary text-sm flex items-center gap-2 ${
            showCopyAll ? "!border-[var(--success)] !text-[var(--success)]" : ""
          }`}
        >
          {showCopyAll ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy All
            </>
          )}
        </button>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`
              group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
              hover:scale-105 hover:shadow-lg opacity-0 animate-fade-in stagger-${index + 1}
            `}
            style={{ animationFillMode: 'forwards' }}
            onClick={() => copyToClipboard(color.hex, index)}
          >
            {/* Color Swatch */}
            <div
              className="aspect-square w-full flex items-center justify-center transition-all duration-300"
              style={{ backgroundColor: color.hex }}
            >
              {/* Hover overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: `${color.hex}dd` }}
              >
                {copiedIndex === index ? (
                  <svg 
                    className="w-6 h-6" 
                    style={{ color: getContrastColor(color.hex) }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg 
                    className="w-6 h-6" 
                    style={{ color: getContrastColor(color.hex) }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Color Info */}
            <div className="p-3 bg-[var(--bg-tertiary)]">
              <p className="font-mono text-sm font-medium text-[var(--text-primary)] tracking-tight">
                {color.hex.toUpperCase()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                {color.rgb.map(v => Math.round(v)).join(", ")}
              </p>
            </div>

            {/* Copied indicator */}
            {copiedIndex === index && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-[var(--success)] text-white animate-scale-in">
                Copied!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-5">
        Click on any color to copy its HEX code
      </p>
    </div>
  );
}
