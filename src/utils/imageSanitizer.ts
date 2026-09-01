/**
 * Image and Profile Data Sanitization Utility for FrameInSteel / PlowInstallations
 *
 * Provides:
 * 1. Client-side MIME validation (strictly raster images: JPEG, PNG, WEBP, GIF; disallowing SVGs/HTML/executables).
 * 2. Canvas-based re-encoding and EXIF metadata stripping.
 * 3. Max dimension scaling & JPEG/WebP compression to prevent memory/storage overload.
 * 4. Text & URL sanitization against XSS vectors.
 */

import { ShopPhoto, ShopPhotoCategory, BrandType } from "../types";

export interface SanitizeImageResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  metadata?: {
    originalName: string;
    width: number;
    height: number;
    sizeBytes: number;
    mimeType: string;
  };
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB max upload limit
const MAX_DIMENSION_PX = 1440; // Max width or height
const COMPRESSION_QUALITY = 0.86;

/**
 * Strips HTML tags and unsafe characters from user text inputs (titles, captions, tags).
 */
export function sanitizeText(input: string, maxLength = 250): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/[\r\n\t]+/g, " ") // Normalize whitespace
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes external or data URLs to ensure safe protocols.
 */
export function sanitizeImageUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Allow safe base64 image data URLs
  if (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  // Allow standard safe HTTPS image URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Sanitizes an uploaded File by:
 * 1. Checking strict MIME type (rejecting SVGs/HTML/Executables)
 * 2. Enforcing file size ceilings
 * 3. Loading into an Image element and rendering to an offscreen HTML5 Canvas
 * 4. Re-exporting as clean JPEG/WebP (strips EXIF, scripts, and normalizes raster pixels)
 */
export async function sanitizeImageFile(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<SanitizeImageResult> {
  const maxWidth = options.maxWidth || MAX_DIMENSION_PX;
  const maxHeight = options.maxHeight || MAX_DIMENSION_PX;
  const quality = options.quality || COMPRESSION_QUALITY;

  // 1. Validate file exists
  if (!file) {
    return { success: false, error: "No file was provided." };
  }

  // 2. MIME type verification
  const lowerType = file.type.toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(lowerType)) {
    return {
      success: false,
      error: `Invalid file type "${file.type || "unknown"}". Only JPG, PNG, WEBP, and GIF photos are permitted. SVGs and documents are disallowed for security.`,
    };
  }

  // 3. File size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 12MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`,
    };
  }

  // 4. Canvas-based re-encoding to strip EXIF/malicious metadata and resize
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read image file data.",
      });
    };

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        resolve({ success: false, error: "Could not decode image data." });
        return;
      }

      const img = new Image();
      img.onerror = () => {
        resolve({
          success: false,
          error: "Corrupt image format or unreadable photo contents.",
        });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio scaling
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({
              success: false,
              error: "Browser canvas 2D rendering context is unavailable.",
            });
            return;
          }

          // Fill white background (useful if transparent PNG converted to JPEG)
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(0, 0, width, height);

          // Draw image (stripping all raw EXIF/metadata)
          ctx.drawImage(img, 0, 0, width, height);

          // Export as sanitized image/jpeg
          const sanitizedDataUrl = canvas.toDataURL("image/jpeg", quality);

          resolve({
            success: true,
            dataUrl: sanitizedDataUrl,
            metadata: {
              originalName: file.name,
              width,
              height,
              sizeBytes: Math.round((sanitizedDataUrl.length * 3) / 4),
              mimeType: "image/jpeg",
            },
          });
        } catch (err) {
          resolve({
            success: false,
            error: `Image sanitization failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          });
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Curated preset workshop photos that shop owners can optionally choose or preview.
 */
export const SAMPLE_WORKSHOP_PRESETS: Array<{
  category: ShopPhotoCategory;
  title: string;
  caption: string;
  equipmentBrand?: BrandType;
  url: string;
  tags: string[];
}> = [
  {
    category: "bay",
    title: "14ft High-Clearance Drive-Thru Upfitting Bay",
    caption: "Dual 15,000 lb 2-post commercial lifts outfitted for heavy F-550 and Silverado 5500HD chassis with overhead crane.",
    url: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80",
    tags: ["Commercial Bay", "14ft Door Clearance", "Heavy Lifts", "Overhead Hoist"],
  },
  {
    category: "fabrication",
    title: "Custom Subframe Mount & Push Beam Reinforcement",
    caption: "MIG welded 3/8\" structural plate undercarriage tie-in for Western MVP3 V-Plow on a Ford F-450 Super Duty.",
    equipmentBrand: "Western",
    url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    tags: ["AWS D1.1 Welding", "3/8-inch Plate", "Subframe Gussets", "Push Beam"],
  },
  {
    category: "fabrication",
    title: "Custom Rear Salter Hitch Receiver & Bumper Cage",
    caption: "Reinforced 2-inch class V receiver tube tied directly into chassis rail webbing for 1,500lb spreader hopper.",
    equipmentBrand: "SaltDogg",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    tags: ["Custom Hitch", "Class V", "Hopper Support", "Powder Coat"],
  },
  {
    category: "inventory",
    title: "Refurbished Western MVP3 & Pro Plus Blade Rack",
    caption: "Full inventory of 8.5ft and 9.5ft reconditioned V-Plow blades with fresh cutting edges, new hoses, and certified 1,950 PSI relief valves.",
    equipmentBrand: "Western",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Ready Inventory", "Rebuilt Hydraulics", "New Cutting Edges", "FleetFlex"],
  },
  {
    category: "inventory",
    title: "SaltDogg & Boss V-Box Spreader Inventory Yard",
    caption: "Poly electric and stainless gas-drive spreaders ready for seasonal delivery and truck bed drop-in upfits.",
    equipmentBrand: "Boss",
    url: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80",
    tags: ["V-Box Spreaders", "Poly Electric", "In-Stock", "Immediate Delivery"],
  },
  {
    category: "facility",
    title: "Mobile Emergency Storm Service Rig Fleet",
    caption: "Four fully-equipped 4x4 mobile service trucks with onboard hydraulic crimpers, emergency fluid warmers, and replacement modules.",
    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    tags: ["24/7 Response", "Mobile Hose Crimper", "Mid-Storm Dispatch", "Field Techs"],
  },
];
