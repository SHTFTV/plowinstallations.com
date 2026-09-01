import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  ShieldCheck,
  Tag,
  Wrench,
  Building2,
  Package,
  Layers,
  Star,
  Eye,
  X,
  Plus,
  RefreshCw,
  Info,
  Check,
} from "lucide-react";
import { Shop, ShopPhoto, ShopPhotoCategory, BrandType } from "../types";
import {
  sanitizeImageFile,
  sanitizeText,
  SAMPLE_WORKSHOP_PRESETS,
} from "../utils/imageSanitizer";

interface ShopPhotoManagerModalProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePhotos: (shopId: string, photos: ShopPhoto[]) => void;
}

const CATEGORY_CONFIG: Record<
  ShopPhotoCategory,
  { label: string; icon: React.ReactNode; color: string; desc: string }
> = {
  bay: {
    label: "Service Bay & Clearance",
    icon: <Building2 className="w-3.5 h-3.5" />,
    color: "text-sky-400 bg-sky-950/70 border-sky-800",
    desc: "Lifts, door clearance, ceiling height, drive-through bays",
  },
  fabrication: {
    label: "Custom Subframe Fabrication",
    icon: <Wrench className="w-3.5 h-3.5" />,
    color: "text-amber-400 bg-amber-950/70 border-amber-800",
    desc: "Custom push beams, welded brackets, chassis rail tie-ins",
  },
  inventory: {
    label: "Equipment & Used Inventory",
    icon: <Package className="w-3.5 h-3.5" />,
    color: "text-emerald-400 bg-emerald-950/70 border-emerald-800",
    desc: "Reconditioned plows, spreaders, pumps, controllers",
  },
  facility: {
    label: "Shop Floor & Service Rigs",
    icon: <Layers className="w-3.5 h-3.5" />,
    color: "text-purple-400 bg-purple-950/70 border-purple-800",
    desc: "Mobile repair trucks, hydraulic crimping benches, store front",
  },
};

const POPULAR_BRANDS: BrandType[] = [
  "Western",
  "Boss",
  "Fisher",
  "SnowDogg",
  "Meyer",
  "SnowEx",
  "SaltDogg",
  "Custom / Multi-Brand",
];

export const ShopPhotoManagerModal: React.FC<ShopPhotoManagerModalProps> = ({
  shop,
  isOpen,
  onClose,
  onUpdatePhotos,
}) => {
  const [photos, setPhotos] = useState<ShopPhoto[]>(shop.photos || []);
  const [activeTab, setActiveTab] = useState<"gallery" | "upload" | "presets">("gallery");
  const [filterCategory, setFilterCategory] = useState<ShopPhotoCategory | "all">("all");

  // New photo form state
  const [selectedCategory, setSelectedCategory] = useState<ShopPhotoCategory>("fabrication");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoBrand, setPhotoBrand] = useState<BrandType | "">("");
  const [tagInput, setTagInput] = useState("");
  const [tagsList, setTagsList] = useState<string[]>(["AWS Welded", "Custom Fit"]);

  // File upload state
  const [isProcessing, setIsProcessing] = useState(false);
  const [sanitizedPreview, setSanitizedPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{
    width: number;
    height: number;
    sizeKb: number;
    mime: string;
  } | null>(null);

  // Lightbox preview
  const [lightboxPhoto, setLightboxPhoto] = useState<ShopPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError(null);
    setUploadSuccessMsg(null);

    const result = await sanitizeImageFile(file, {
      maxWidth: 1440,
      maxHeight: 1440,
      quality: 0.88,
    });

    setIsProcessing(false);

    if (!result.success || !result.dataUrl) {
      setUploadError(result.error || "Failed to sanitize image.");
      setSanitizedPreview(null);
      setFileMetadata(null);
      return;
    }

    setSanitizedPreview(result.dataUrl);
    if (result.metadata) {
      setFileMetadata({
        width: result.metadata.width,
        height: result.metadata.height,
        sizeKb: Math.round(result.metadata.sizeBytes / 1024),
        mime: result.metadata.mimeType,
      });
    }

    // Auto set title if empty
    if (!photoTitle) {
      const cleanBaseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setPhotoTitle(cleanBaseName.slice(0, 50));
    }
  };

  const handleAddTag = () => {
    const clean = sanitizeText(tagInput, 30);
    if (clean && !tagsList.includes(clean) && tagsList.length < 6) {
      setTagsList([...tagsList, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter((t) => t !== tagToRemove));
  };

  const handleSaveUploadedPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanitizedPreview) {
      setUploadError("Please select a photo file or choose a preset.");
      return;
    }

    const cleanTitle = sanitizeText(photoTitle, 80) || `${shop.name} Workshop Photo`;
    const cleanCaption = sanitizeText(photoCaption, 300);

    const newPhoto: ShopPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: selectedCategory,
      title: cleanTitle,
      url: sanitizedPreview,
      caption: cleanCaption,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      equipmentBrand: photoBrand ? (photoBrand as BrandType) : undefined,
      tags: tagsList,
      isPrimary: photos.length === 0, // First photo is primary by default
    };

    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);
    onUpdatePhotos(shop.id, updatedPhotos);

    // Reset form
    setSanitizedPreview(null);
    setPhotoTitle("");
    setPhotoCaption("");
    setFileMetadata(null);
    setUploadSuccessMsg(`"${cleanTitle}" was sanitized and saved to shop profile!`);
    setActiveTab("gallery");
  };

  const handleAddPreset = (preset: (typeof SAMPLE_WORKSHOP_PRESETS)[0]) => {
    const newPhoto: ShopPhoto = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: preset.category,
      title: preset.title,
      url: preset.url,
      caption: preset.caption,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      equipmentBrand: preset.equipmentBrand,
      tags: preset.tags,
      isPrimary: photos.length === 0,
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    onUpdatePhotos(shop.id, updated);
    setUploadSuccessMsg(`Added "${preset.title}" to gallery!`);
    setActiveTab("gallery");
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    setPhotos(updated);
    onUpdatePhotos(shop.id, updated);
  };

  const handleSetPrimary = (photoId: string) => {
    const updated = photos.map((p) => ({
      ...p,
      isPrimary: p.id === photoId,
    }));
    setPhotos(updated);
    onUpdatePhotos(shop.id, updated);
  };

  const filteredPhotos =
    filterCategory === "all"
      ? photos
      : photos.filter((p) => p.category === filterCategory);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-manager-title"
        id="shop-photo-manager-modal"
      >
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Camera className="w-4 h-4" />
              </span>
              <h2
                id="photo-manager-title"
                className="text-base sm:text-lg font-black text-white"
              >
                Shop Bay & Fabrication Photo Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage verified visual evidence for <strong className="text-slate-200">{shop.name}</strong> ({shop.city}, {shop.state}).
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close photo manager"
            id="close-photo-manager-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Sanitization Guarantee Banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 sm:px-5 py-2 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              <strong>Anti-Malware & EXIF Sanitization:</strong> Uploaded images are strictly re-encoded on canvas, stripped of EXIF coordinates, and compressed for instant loading.
            </span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/60 border border-emerald-700 text-emerald-200">
            MIME Verified
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 px-4 sm:px-5 py-2.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "gallery"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="tab-photo-gallery"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Gallery ({photos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "upload"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="tab-upload-photo"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Photo</span>
            </button>

            <button
              onClick={() => setActiveTab("presets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "presets"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="tab-preset-photos"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Workshop Presets</span>
            </button>
          </div>

          {activeTab === "gallery" && photos.length > 0 && (
            <div className="flex items-center space-x-1 overflow-x-auto text-xs">
              <span className="text-[11px] text-slate-500 font-bold uppercase mr-1">Filter:</span>
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  filterCategory === "all"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({photos.length})
              </button>
              {(["bay", "fabrication", "inventory", "facility"] as ShopPhotoCategory[]).map(
                (cat) => {
                  const count = photos.filter((p) => p.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2 py-1 rounded text-[11px] font-bold flex items-center space-x-1 ${
                        filterCategory === cat
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{CATEGORY_CONFIG[cat].label.split(" ")[0]}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Success Banner */}
          {uploadSuccessMsg && (
            <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
              <button
                onClick={() => setUploadSuccessMsg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: GALLERY VIEW */}
          {activeTab === "gallery" && (
            <div>
              {photos.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-950/40">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Workshop Photos Added Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Show prospective contractors your 14ft door clearance, custom subframe weld jigs, hydraulic hose bench, or ready plow inventory!
                  </p>
                  <div className="pt-2 flex justify-center space-x-2">
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-amber-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Your Photos</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("presets")}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Browse Workshop Presets</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => {
                    const catCfg = CATEGORY_CONFIG[photo.category] || CATEGORY_CONFIG.facility;
                    return (
                      <div
                        key={photo.id}
                        className={`bg-slate-950 border rounded-2xl overflow-hidden flex flex-col group transition-all relative ${
                          photo.isPrimary
                            ? "border-amber-500/80 shadow-md shadow-amber-500/10"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Primary Badge */}
                        {photo.isPrimary && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-md">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>Featured Cover</span>
                          </div>
                        )}

                        {/* Image Thumbnail with Overlay */}
                        <div
                          className="relative h-44 bg-slate-900 overflow-hidden cursor-pointer"
                          onClick={() => setLightboxPhoto(photo)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white font-bold text-xs flex items-center space-x-1 backdrop-blur-sm border border-slate-700">
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>View Full Size</span>
                            </span>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute bottom-2 right-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1 backdrop-blur-md ${catCfg.color}`}
                            >
                              {catCfg.icon}
                              <span>{catCfg.label.split(" ")[0]}</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Meta & Actions */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {photo.title}
                              </h4>
                              {photo.equipmentBrand && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-amber-300 shrink-0">
                                  {photo.equipmentBrand}
                                </span>
                              )}
                            </div>
                            {photo.caption && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                {photo.caption}
                              </p>
                            )}

                            {/* Tags */}
                            {photo.tags && photo.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {photo.tags.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-900 text-slate-400 border border-slate-800/80"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {photo.uploadedAt || "Verified"}
                            </span>

                            <div className="flex items-center space-x-1.5">
                              {!photo.isPrimary && (
                                <button
                                  onClick={() => handleSetPrimary(photo.id)}
                                  className="px-2 py-1 rounded text-[10px] font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition-colors"
                                  title="Set as featured cover photo for this shop"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                title="Remove photo from profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD NEW PHOTO */}
          {activeTab === "upload" && (
            <form onSubmit={handleSaveUploadedPhoto} className="space-y-4">
              {uploadError && (
                <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3 text-xs text-red-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  sanitizedPreview
                    ? "border-emerald-500/60 bg-emerald-950/10"
                    : "border-slate-700 hover:border-amber-500 bg-slate-950/60 hover:bg-slate-950"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="py-6 space-y-2">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-amber-300">
                      Sanitizing image, stripping EXIF, and re-encoding on Canvas...
                    </p>
                  </div>
                ) : sanitizedPreview ? (
                  <div className="space-y-3">
                    <div className="relative max-h-56 max-w-md mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-md">
                      <img
                        src={sanitizedPreview}
                        alt="Sanitized preview"
                        className="w-full h-auto max-h-56 object-contain bg-slate-950"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Sanitized & Ready</span>
                      </div>
                    </div>

                    {fileMetadata && (
                      <p className="text-[11px] font-mono text-emerald-400">
                        Resolution: {fileMetadata.width}x{fileMetadata.height}px | Safe Payload:{" "}
                        {fileMetadata.sizeKb} KB
                      </p>
                    )}

                    <p className="text-xs text-slate-400">
                      Click here to choose a different photo file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Drop shop photo here, or click to browse
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Supports JPG, PNG, WEBP, and GIF up to 12MB. Automatically sanitized against malicious payloads.
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Classification & Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Photo Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CATEGORY_CONFIG) as ShopPhotoCategory[]).map((cat) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                            selectedCategory === cat
                              ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 font-bold">
                            {cfg.icon}
                            <span className="truncate">{cfg.label.split(" ")[0]}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                            {cfg.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title & Brand */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="e.g. 14ft Bay Drive-Thru / F-550 Custom Subframe"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Associated Brand / Equipment (Optional)
                    </label>
                    <select
                      value={photoBrand}
                      onChange={(e) => setPhotoBrand(e.target.value as BrandType)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="">General Facility / No Specific Brand</option>
                      {POPULAR_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Description / Technical Notes
                </label>
                <textarea
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  rows={2}
                  placeholder="e.g. Dual 15,000lb 2-post lifts, MIG welded 3/8-inch plate gussets, fleet diagnostic bench..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Feature Tags
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag (e.g. 14ft Doors, AWS Welds, V-Plow) and press Enter"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tagsList.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700 flex items-center space-x-1"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-red-400 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("gallery")}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!sanitizedPreview || isProcessing}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Sanitize & Save to Shop Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: WORKSHOP PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Select any high-resolution workshop sample to test gallery functionality or showcase standard bay and custom fabrication capabilities.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SAMPLE_WORKSHOP_PRESETS.map((preset, idx) => {
                  const catCfg = CATEGORY_CONFIG[preset.category];
                  const alreadyAdded = photos.some((p) => p.title === preset.title);
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative h-36 bg-slate-900">
                        <img
                          src={preset.url}
                          alt={preset.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-md ${catCfg.color}`}
                          >
                            {catCfg.label.split(" ")[0]}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {preset.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {preset.caption}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddPreset(preset)}
                          disabled={alreadyAdded}
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                            alreadyAdded
                              ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                              : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {alreadyAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to Profile</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Shop Profile</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3 sm:px-5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            {photos.length} profile {photos.length === 1 ? "photo" : "photos"} stored
          </span>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Overlay */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-3 p-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    CATEGORY_CONFIG[lightboxPhoto.category]?.color || "text-slate-300"
                  }`}
                >
                  {CATEGORY_CONFIG[lightboxPhoto.category]?.label}
                </span>
                <h3 className="text-sm font-bold text-white">{lightboxPhoto.title}</h3>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            {lightboxPhoto.caption && (
              <p className="text-xs text-slate-300 leading-relaxed">
                {lightboxPhoto.caption}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span>{lightboxPhoto.uploadedAt || "Verified Shop Photo"}</span>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
