"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import ColorPalette from "@/components/ColorPalette";
import { extractColors } from "@/utils/colorExtractor";

export interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
  population: number;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleImageUpload = async (imageData: string) => {
    setImage(imageData);
    setIsExtracting(true);
    
    try {
      const extractedColors = await extractColors(imageData);
      setColors(extractedColors);
    } catch (error) {
      console.error("Error extracting colors:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setColors([]);
    setIsExtracting(false);
  };

  return (
    <main className="min-h-screen">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border-primary) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-[var(--text-primary)]">ColorSnap</span>
            </div>
            
            {image && (
              <button
                onClick={handleReset}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Image
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {!image ? (
            <div className="py-8">
              {/* Hero Section */}
              <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                  <span className="text-[var(--text-primary)]">Extract colors from </span>
                  <span className="gradient-text">any image</span>
                </h1>
                <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
                  Upload an image and instantly get a beautiful color palette. 
                  Fast, free, and works entirely in your browser.
                </p>
              </div>

              {/* Upload Component */}
              <ImageUpload onImageUpload={handleImageUpload} />

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
                {[
                  { icon: "⚡", title: "Instant", desc: "Colors extracted in milliseconds" },
                  { icon: "🔒", title: "Private", desc: "Everything happens in your browser" },
                  { icon: "📋", title: "Easy Copy", desc: "Click any color to copy HEX" },
                ].map((feature, i) => (
                  <div 
                    key={i} 
                    className={`card-elevated p-5 text-center opacity-0 animate-fade-in`}
                    style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{feature.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="card p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Source Image
                  </h2>
                </div>
                <div className="relative w-full flex items-center justify-center rounded-xl overflow-hidden bg-[var(--bg-tertiary)]">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="max-w-full max-h-[400px] w-auto h-auto object-contain"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>

              {/* Color Palette */}
              {isExtracting ? (
                <div className="card p-12 text-center animate-fade-in">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[var(--text-secondary)]">Extracting colors...</span>
                  </div>
                </div>
              ) : (
                <ColorPalette colors={colors} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-[var(--border-primary)] mt-16">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
            <p>Private by design — everything stays on your device</p>
            <p>
  Built by{" "}
  <a
    href="https://www.linkedin.com/in/sridevimanjuraja/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline"
  >
    Sridevi
  </a>
</p>

            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
