"use client";

import { useCallback, useEffect, useState } from "react";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
}

type TabType = "upload" | "url";

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");


  
  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleUrlSubmit = useCallback(async () => {
    if (!imageUrl.trim()) {
      setUrlError("Please enter an image URL");
      return;
    }

    setIsLoadingUrl(true);
    setUrlError("");

    try {
      // Create a temporary image to load and validate the URL
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const loadPromise = new Promise<string>((resolve, reject) => {
        img.onload = () => {
          // Convert to canvas to get data URL (handles CORS)
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            try {
              const dataUrl = canvas.toDataURL("image/png");
              resolve(dataUrl);
            } catch {
              // If canvas is tainted due to CORS, use the URL directly
              resolve(imageUrl);
            }
          } else {
            reject(new Error("Could not create canvas context"));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      // Set timeout for loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000);
      });

      img.src = imageUrl;
      
      const dataUrl = await Promise.race([loadPromise, timeoutPromise]);
      onImageUpload(dataUrl);
    } catch (error) {
      setUrlError(
        error instanceof Error 
          ? error.message 
          : "Failed to load image from URL"
      );
    } finally {
      setIsLoadingUrl(false);
    }
  }, [imageUrl, onImageUpload]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      // Convert DataTransferItemList to array to avoid iteration issue (ES2015+ or TS config)
      Array.from(items).forEach((item) => {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            setActiveTab("upload"); // ensure correct tab
            handleFile(file);       // reuse existing logic
          }
        }
      }
  )};
  
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);
  

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in">
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="tab-container">
          <button
            className={`tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </span>
          </button>
          <button
            className={`tab ${activeTab === "url" ? "active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              URL
            </span>
          </button>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative card cursor-pointer transition-all duration-300 overflow-hidden
            ${isDragging 
              ? "border-[var(--accent-primary)] bg-[var(--bg-tertiary)] animate-pulse-glow" 
              : "hover:border-[var(--border-secondary)] hover:bg-[var(--bg-tertiary)]"
            }
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="file-upload"
          />
          
          <div className="p-10 text-center">
            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isDragging 
                  ? "bg-[var(--accent-primary)] text-white scale-110" 
                  : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                }
              `}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {isDragging ? "Drop your image here" : "Drop your image here"}
            </h3>
            
            <p className="text-sm text-[var(--text-muted)] mb-5">
            or click to browse, or paste from clipboard
            </p>

            <button className="btn-primary text-sm">
              Choose Image
            </button>

            <p className="text-xs text-[var(--text-muted)] mt-5">
              PNG, JPG, WEBP, GIF up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* URL Tab */}
      {activeTab === "url" && (
        <div className="card p-8 animate-scale-in">
          <div className="mb-5 flex justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">
            Import from URL
          </h3>
          
          <p className="text-sm text-[var(--text-muted)] text-center mb-5">
            Paste an image URL from the web
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setUrlError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              {urlError && (
                <p className="text-xs text-[var(--error)] mt-2">{urlError}</p>
              )}
            </div>

            <button
              onClick={handleUrlSubmit}
              disabled={isLoadingUrl}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            >
              {isLoadingUrl ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </>
              ) : (
                "Load Image"
              )}
            </button>
          </div>

          <p className="text-xs text-[var(--text-muted)] text-center mt-5">
            Some URLs may not work due to CORS restrictions
          </p>
        </div>
      )}
    </div>
  );
}
