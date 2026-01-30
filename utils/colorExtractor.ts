import Vibrant from "node-vibrant";
import { ColorInfo } from "@/app/page";

export async function extractColors(imageData: string): Promise<ColorInfo[]> {
  try {
    // Use Vibrant.js to extract colors
    const vibrant = new Vibrant(imageData);
    const palette = await vibrant.getPalette();

    const colors: ColorInfo[] = [];

    // Extract all available swatches
    const swatchKeys = [
      "Vibrant",
      "DarkVibrant",
      "LightVibrant",
      "Muted",
      "DarkMuted",
      "LightMuted",
    ] as const;

    for (const key of swatchKeys) {
      const swatch = palette[key];
      if (swatch) {
        colors.push({
          hex: swatch.hex,
          rgb: swatch.rgb as [number, number, number],
          population: swatch.population,
        });
      }
    }

    // If we have fewer than 5 colors, add more using canvas sampling
    if (colors.length < 5) {
      const additionalColors = await extractColorsFromCanvas(imageData, 8);
      
      // Filter out colors that are too similar to existing ones
      const filteredColors = additionalColors.filter((newColor) => {
        return !colors.some((existingColor) => 
          areColorsSimilar(newColor.rgb, existingColor.rgb)
        );
      });

      colors.push(...filteredColors.slice(0, 8 - colors.length));
    }

    // Return up to 8 colors
    return colors.slice(0, 8);
  } catch (error) {
    console.error("Error extracting colors:", error);
    
    // Fallback to canvas-based extraction
    return extractColorsFromCanvas(imageData, 8);
  }
}

// Fallback method using Canvas API
async function extractColorsFromCanvas(
  imageData: string,
  numColors: number
): Promise<ColorInfo[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Resize for performance
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Sample pixels and count colors
        const colorMap = new Map<string, { rgb: [number, number, number]; count: number }>();
        const step = 4; // Sample every 4th pixel for performance

        for (let i = 0; i < pixels.length; i += step * 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Quantize colors to reduce variations
          const qr = Math.round(r / 20) * 20;
          const qg = Math.round(g / 20) * 20;
          const qb = Math.round(b / 20) * 20;

          const key = `${qr},${qg},${qb}`;
          const existing = colorMap.get(key);
          
          if (existing) {
            existing.count++;
          } else {
            colorMap.set(key, { rgb: [qr, qg, qb], count: 1 });
          }
        }

        // Sort by popularity and convert to ColorInfo
        const colors = Array.from(colorMap.entries())
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, numColors)
          .map(([_, data]) => ({
            hex: rgbToHex(data.rgb),
            rgb: data.rgb,
            population: data.count,
          }));

        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageData;
  });
}

// Helper function to convert RGB to HEX
function rgbToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((value) => {
        const hex = Math.round(value).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Helper function to check if two colors are similar
function areColorsSimilar(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
  threshold: number = 50
): boolean {
  const diff = Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
  return diff < threshold;
}
