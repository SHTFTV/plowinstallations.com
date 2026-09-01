import React, { useState, useRef } from "react";
import {
  Building2,
  Wrench,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Plus,
  Trash2,
  DollarSign,
  AlertTriangle,
  BadgePercent,
  Check,
  Tag,
  Zap,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Shop, BrandType, UsedEquipmentItem, ShopPhoto, ShopPhotoCategory } from "../types";
import { sanitizeImageFile, sanitizeText, SAMPLE_WORKSHOP_PRESETS } from "../utils/imageSanitizer";

interface RegisterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (shop: Shop) => void;
}

const ALL_BRANDS: BrandType[] = [
  "Western",
  "Boss",
  "Fisher",
  "SnowDogg",
  "Meyer",
  "SnowEx",
  "Hiniker",
  "Sno-Way",
  "SaltDogg",
  "Torwel",
  "Custom / Multi-Brand",
];

const ALL_SERVICES = [
  "Commercial Plow Installs",
  "Spreader & Salter Upfitting",
  "Emergency 24/7 Storm Repairs",
  "Custom Subframe Fabrication",
  "Multiplex & Module Diagnostics",
  "Hydraulic Rebuilds & Valve Repair",
  "Mobile Service Rig",
  "Ballast & Axle Weight Certifications",
];

const EQUIPMENT_CATEGORIES: UsedEquipmentItem["category"][] = [
  "Used Plow Blade & Assembly",
  "Used V-Box / Tailgate Spreader",
  "Used Snow Pusher / Box",
  "Refurbished Power Unit & Pump",
  "Used Undercarriage Mount & Beam",
  "Used In-Cab Controller & Harness",
  "UTV / Loader Attachment",
];

const EQUIPMENT_CONDITIONS: UsedEquipmentItem["condition"][] = [
  "Shop Refurbished & Tested",
  "Field Ready / Good Condition",
  "Like New / Low Hours",
  "Contractor Surplus",
];

export const RegisterShopModal: React.FC<RegisterShopModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "equipment" | "photos" | "verification"
  >("profile");

  // Shop Profile info
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("NY");
  const [zip, setZip] = useState("14201");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number>(115);
  const [hasMobileRig, setHasMobileRig] = useState(true);
  const [has247StormResponse, setHas247StormResponse] = useState(true);
  const [providesCustomFab, setProvidesCustomFab] = useState(true);
  const [brandsSupported, setBrandsSupported] = useState<BrandType[]>([
    "Western",
    "Boss",
    "Fisher",
    "SnowDogg",
  ]);
  const [specialties, setSpecialties] = useState<string[]>([
    "Commercial Plow Installs",
    "Emergency 24/7 Storm Repairs",
    "Multiplex & Module Diagnostics",
  ]);
  const [yearsInBusiness, setYearsInBusiness] = useState(12);
  const [bayCount, setBayCount] = useState(3);
  const [doorClearanceFt, setDoorClearanceFt] = useState(14);
  const [bio, setBio] = useState("");

  // Anti-Fake Shop Verification fields
  const [businessLicenseNo, setBusinessLicenseNo] = useState("");
  const [hasPhysicalBays, setHasPhysicalBays] = useState(true);
  const [antiFakeAgreement, setAntiFakeAgreement] = useState(true);

  // Used Winter Equipment state
  const [usedEquipmentList, setUsedEquipmentList] = useState<UsedEquipmentItem[]>([
    {
      id: `init-eq-${Date.now()}`,
      title: "Western 8.5ft Pro Plus Straight Blade (FleetFlex)",
      category: "Used Plow Blade & Assembly",
      brand: "Western",
      condition: "Shop Refurbished & Tested",
      price: 3450,
      year: 2022,
      seasonsUsed: "2 Seasons",
      includesWiringOrMount: "Complete isolation module & FleetFlex handheld controller",
      description: "Tested at 1,950 PSI relief, fresh poly cutting edge, no rust on quadrant.",
      inStock: true,
    },
  ]);

  // Shop Photos state (Bay, Custom Fab, Inventory)
  const [photosList, setPhotosList] = useState<ShopPhoto[]>([
    {
      id: `reg-photo-1`,
      category: "bay",
      title: "14ft Commercial Installation Bay",
      url: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80",
      caption: "High-clearance drive-through bay with 15k commercial lifts and overhead crane.",
      uploadedAt: "Today",
      tags: ["14ft Clearance", "Heavy Lift"],
      isPrimary: true,
    },
  ]);

  // Photo form & upload state
  const [photoFileProcessing, setPhotoFileProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [regPhotoCategory, setRegPhotoCategory] = useState<ShopPhotoCategory>("fabrication");
  const [regPhotoTitle, setRegPhotoTitle] = useState("");
  const [regPhotoCaption, setRegPhotoCaption] = useState("");
  const [regPhotoBrand, setRegPhotoBrand] = useState<BrandType | "">("");
  const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
  const regFileInputRef = useRef<HTMLInputElement>(null);

  // Sub-form for adding new used equipment item
  const [showAddEquipmentForm, setShowAddEquipmentForm] = useState(false);
  const [newEqTitle, setNewEqTitle] = useState("");
  const [newEqCategory, setNewEqCategory] = useState<UsedEquipmentItem["category"]>("Used Plow Blade & Assembly");
  const [newEqBrand, setNewEqBrand] = useState<BrandType>("Western");
  const [newEqCondition, setNewEqCondition] = useState<UsedEquipmentItem["condition"]>("Shop Refurbished & Tested");
  const [newEqPrice, setNewEqPrice] = useState<number>(2500);
  const [newEqYear, setNewEqYear] = useState<number>(2022);
  const [newEqSeasons, setNewEqSeasons] = useState("2 Seasons");
  const [newEqWiring, setNewEqWiring] = useState("Wiring harness & controller included");
  const [newEqDesc, setNewEqDesc] = useState("");

  if (!isOpen) return null;

  const toggleBrand = (brand: BrandType) => {
    setBrandsSupported((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleSpecialty = (svc: string) => {
    setSpecialties((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handlePhotoUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileProcessing(true);
    setPhotoError(null);

    const result = await sanitizeImageFile(file, {
      maxWidth: 1400,
      maxHeight: 1400,
      quality: 0.88,
    });

    setPhotoFileProcessing(false);

    if (!result.success || !result.dataUrl) {
      setPhotoError(result.error || "Failed to process image.");
      setRegPhotoPreview(null);
      return;
    }

    setRegPhotoPreview(result.dataUrl);
    if (!regPhotoTitle) {
      const cleanBaseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setRegPhotoTitle(cleanBaseName.slice(0, 50));
    }
  };

  const handleAddPhotoToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhotoPreview) {
      setPhotoError("Please select a photo file or choose a workshop preset.");
      return;
    }

    const cleanTitle = sanitizeText(regPhotoTitle, 80) || "Workshop Photo";
    const cleanCaption = sanitizeText(regPhotoCaption, 250);

    const newPhoto: ShopPhoto = {
      id: `photo-${Date.now()}`,
      category: regPhotoCategory,
      title: cleanTitle,
      url: regPhotoPreview,
      caption: cleanCaption,
      uploadedAt: "Today",
      equipmentBrand: regPhotoBrand ? (regPhotoBrand as BrandType) : undefined,
      tags: [regPhotoCategory === "fabrication" ? "Custom Weld" : "Shop Verified"],
      isPrimary: photosList.length === 0,
    };

    setPhotosList([...photosList, newPhoto]);
    setRegPhotoPreview(null);
    setRegPhotoTitle("");
    setRegPhotoCaption("");
    setPhotoError(null);
  };

  const handleAddPresetPhoto = (preset: (typeof SAMPLE_WORKSHOP_PRESETS)[0]) => {
    const newPhoto: ShopPhoto = {
      id: `preset-${Date.now()}`,
      category: preset.category,
      title: preset.title,
      url: preset.url,
      caption: preset.caption,
      uploadedAt: "Today",
      equipmentBrand: preset.equipmentBrand,
      tags: preset.tags,
      isPrimary: photosList.length === 0,
    };
    setPhotosList([...photosList, newPhoto]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotosList(photosList.filter((p) => p.id !== id));
  };

  const handleAddUsedEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqTitle || !newEqPrice) return;

    const newItem: UsedEquipmentItem = {
      id: `used-${Date.now()}`,
      title: newEqTitle,
      category: newEqCategory,
      brand: newEqBrand,
      condition: newEqCondition,
      price: newEqPrice,
      year: newEqYear,
      seasonsUsed: newEqSeasons,
      includesWiringOrMount: newEqWiring,
      description: newEqDesc || "Fully inspected and ready for snow removal contractor work.",
      inStock: true,
    };

    setUsedEquipmentList((prev) => [...prev, newItem]);
    setNewEqTitle("");
    setNewEqDesc("");
    setShowAddEquipmentForm(false);
  };

  const handleRemoveUsedEquipment = (id: string) => {
    setUsedEquipmentList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !phone) return;

    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name,
      ownerName: ownerName || "Independent Master Tech",
      phone,
      email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
      city,
      state,
      zip: zip || "14201",
      address: address || `${city}, ${state}`,
      lat: 42.8864 + (Math.random() - 0.5) * 3,
      lng: -78.8784 + (Math.random() - 0.5) * 5,
      hourlyRate,
      rating: 5.0,
      reviewCount: 1,
      verified: true,
      einVerified: Boolean(businessLicenseNo || antiFakeAgreement),
      businessLicenseNo: businessLicenseNo || "VERIFIED-IND-2026",
      verificationBadge: "Anti-Fake Verified",
      subscriptionPlan: "$10/Year Verified Independent Listing",
      listingPriceAnnual: 10,
      yearsInBusiness,
      bayCount,
      doorClearanceFt,
      hasMobileRig,
      has247StormResponse,
      providesCustomFab,
      brands: brandsSupported,
      specialties,
      certifications: ["ASE Certified Upfitter", "Anti-Scam Verified Independent"],
      bio: bio || "Independent commercial snow & ice management upfitter and used equipment provider.",
      completedInstalls: 150,
      usedEquipment: usedEquipmentList,
      photos: photosList,
    };

    onRegister(newShop);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Modal Top Header with $10/year and Anti-Fake Badge */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-bold text-xs flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>$10 / YEAR FLAT LISTING</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-[11px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Fake Shops Guarantee</span>
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>List Your Independent Shop & Used Equipment</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect directly with snow contractors and municipal fleets. Keep 100% of quote revenue with zero dealer commissions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Pricing & Anti-Fake Guarantee Value Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-emerald-950/40 border border-amber-500/30 rounded-xl p-3.5 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start space-x-2">
            <BadgePercent className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">$10 / Year Flat Listing</span>
              <span className="text-slate-400 text-[11px]">No lead fees, no middleman percentage.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Strict Anti-Fake Vetting</span>
              <span className="text-slate-400 text-[11px]">Physical bay or commercial mobile rig required.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Package className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">List Used Equipment</span>
              <span className="text-slate-400 text-[11px]">Display used plows & salters directly on profile.</span>
            </div>
          </div>
        </div>

        {/* Form Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === "profile"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Shop Profile & Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("equipment")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === "equipment"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>2. Equipment ({usedEquipmentList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === "photos"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>3. Bay & Fab Photos ({photosList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === "verification"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Anti-Fake Vetting ($10/yr)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* TAB 1: SHOP PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Shop / Mobile Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Iron Ridge Truck & Snow Upfitters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Master Technician / Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Chet Kozlowski"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Physical Street Address or Service Base *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 2450 Walden Ave"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Buffalo"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State & Zip *</label>
                  <div className="flex space-x-1.5">
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="NY"
                      maxLength={2}
                      className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-white uppercase text-center focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="14227"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Direct Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(716) 555-0199"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email for Quotes
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="service@ironridgeplow.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hourly Shop Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 115)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Service Capabilities */}
              <div className="flex flex-wrap gap-4 py-2 border-y border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMobileRig}
                    onChange={(e) => setHasMobileRig(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-slate-300 font-semibold">Mobile Service Truck (Roadside/Lot)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={has247StormResponse}
                    onChange={(e) => setHas247StormResponse(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-red-400 font-semibold">24/7 Emergency Storm Dispatch</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={providesCustomFab}
                    onChange={(e) => setProvidesCustomFab(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-amber-300 font-semibold">Custom Subframe Fabrication</span>
                </label>
              </div>

              {/* Brands Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Brands Installed, Serviced & Repaired:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_BRANDS.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        brandsSupported.includes(b)
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Specialties:</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SERVICES.map((svc) => (
                    <button
                      type="button"
                      key={svc}
                      onClick={() => toggleSpecialty(svc)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        specialties.includes(svc)
                          ? "bg-amber-500/10 border-amber-500/60 text-slate-200"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="truncate">{svc}</span>
                      {specialties.includes(svc) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Shop Bio & Overview:
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell contractors about your bay capacity, turnaround speed, and winter equipment expertise..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("equipment")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Next: Add Used Equipment ({usedEquipmentList.length}) →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USED EQUIPMENT INVENTORY */}
          {activeTab === "equipment" && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>Used Winter Management Equipment on Your Profile</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      List your pre-owned plow blades, refurbished V-box spreaders, pushers, power packs, and mount kits for local contractors to buy directly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddEquipmentForm(!showAddEquipmentForm)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Used Equipment</span>
                  </button>
                </div>

                {/* Add Equipment Sub-Form */}
                {showAddEquipmentForm && (
                  <div className="mt-3 p-4 bg-slate-900 border border-amber-500/40 rounded-xl space-y-3">
                    <div className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>New Used Equipment Listing</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Equipment Title / Model *</label>
                        <input
                          type="text"
                          value={newEqTitle}
                          onChange={(e) => setNewEqTitle(e.target.value)}
                          placeholder="e.g. Boss 8'2'' D-VXT Poly V-Plow"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Equipment Category</label>
                        <select
                          value={newEqCategory}
                          onChange={(e) => setNewEqCategory(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        >
                          {EQUIPMENT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Brand</label>
                        <select
                          value={newEqBrand}
                          onChange={(e) => setNewEqBrand(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        >
                          {ALL_BRANDS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Condition</label>
                        <select
                          value={newEqCondition}
                          onChange={(e) => setNewEqCondition(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        >
                          {EQUIPMENT_CONDITIONS.map((cond) => (
                            <option key={cond} value={cond}>
                              {cond}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Price ($ USD) *</label>
                        <input
                          type="number"
                          value={newEqPrice}
                          onChange={(e) => setNewEqPrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Includes Wiring / Mount</label>
                        <input
                          type="text"
                          value={newEqWiring}
                          onChange={(e) => setNewEqWiring(e.target.value)}
                          placeholder="e.g. Includes SmartHitch 2, controller & harness"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Description / Notes</label>
                        <input
                          type="text"
                          value={newEqDesc}
                          onChange={(e) => setNewEqDesc(e.target.value)}
                          placeholder="e.g. New cutting edges, fresh fluid, pressure tested"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddEquipmentForm(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddUsedEquipment}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Add to Shop Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* List of currently added items */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Current Profile Equipment ({usedEquipmentList.length})
                </div>

                {usedEquipmentList.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                    No used equipment added yet. Click &quot;Add Used Equipment&quot; above to list items on your shop profile.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {usedEquipmentList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white truncate text-xs">
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 font-mono">
                              {item.brand}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {item.condition}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.includesWiringOrMount || item.description}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            ${item.price.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUsedEquipment(item.id)}
                            className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                            title="Remove listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                >
                  ← Back to Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1"
                >
                  <span>Next: Bay & Fab Photos →</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SHOP PHOTOS (BAYS, CUSTOM FAB, INVENTORY) */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Upload Shop Bay, Custom Subframe & Inventory Photos</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Visual proof of your facility, weld quality, and available inventory builds instant trust with snow removal contractors.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                  Canvas Sanitized
                </span>
              </div>

              {photoError && (
                <div className="bg-red-950/70 border border-red-800 rounded-xl p-3 text-xs text-red-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Upload Input & Drop Area */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div
                  onClick={() => regFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    regPhotoPreview
                      ? "border-emerald-500/60 bg-emerald-950/10"
                      : "border-slate-700 hover:border-amber-500 bg-slate-900/60"
                  }`}
                >
                  <input
                    type="file"
                    ref={regFileInputRef}
                    onChange={handlePhotoUploadChange}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />

                  {photoFileProcessing ? (
                    <div className="py-3 flex items-center justify-center space-x-2 text-amber-300 font-bold text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sanitizing image & stripping EXIF metadata...</span>
                    </div>
                  ) : regPhotoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={regPhotoPreview}
                        alt="Preview"
                        className="max-h-36 mx-auto rounded-lg border border-slate-700 object-contain"
                      />
                      <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Sanitized Image Ready</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Click to change selected photo
                      </span>
                    </div>
                  ) : (
                    <div className="py-2 space-y-1">
                      <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-200">
                        Click or drag a photo here (JPG, PNG, WEBP)
                      </div>
                      <div className="text-[10px] text-slate-500">
                        EXIF data is automatically stripped and image is optimized.
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-form inputs for adding the photo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      Category *
                    </label>
                    <select
                      value={regPhotoCategory}
                      onChange={(e) => setRegPhotoCategory(e.target.value as ShopPhotoCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="bay">Service Bay & Clearance</option>
                      <option value="fabrication">Custom Subframe Fabrication</option>
                      <option value="inventory">Inventory & Used Equipment</option>
                      <option value="facility">Shop Floor & Mobile Rig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      value={regPhotoTitle}
                      onChange={(e) => setRegPhotoTitle(e.target.value)}
                      placeholder="e.g. 14ft High Bay / Custom Push Beam"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      Brand Tag (Optional)
                    </label>
                    <select
                      value={regPhotoBrand}
                      onChange={(e) => setRegPhotoBrand(e.target.value as BrandType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="">No Specific Brand</option>
                      {ALL_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Caption / Equipment Details
                  </label>
                  <input
                    type="text"
                    value={regPhotoCaption}
                    onChange={(e) => setRegPhotoCaption(e.target.value)}
                    placeholder="e.g. Dual 15k lifts, MIG welded 3/8-in steel brackets, certified 1,950 PSI relief..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleAddPresetPhoto(SAMPLE_WORKSHOP_PRESETS[0])}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      + Bay Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetPhoto(SAMPLE_WORKSHOP_PRESETS[1])}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      + Fab Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetPhoto(SAMPLE_WORKSHOP_PRESETS[3])}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      + Inventory Preset
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPhotoToList}
                    disabled={!regPhotoPreview}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo to Shop</span>
                  </button>
                </div>
              </div>

              {/* Current Photos Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Current Profile Photos ({photosList.length})
                </div>

                {photosList.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    No photos added yet. Upload your bay or custom weld photos above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                    {photosList.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-28 bg-slate-900">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-amber-300 border border-slate-700">
                            {photo.category}
                          </span>
                        </div>

                        <div className="p-2.5 space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-white text-[11px] truncate">
                              {photo.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(photo.id)}
                              className="text-slate-500 hover:text-red-400 p-0.5"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {photo.caption && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("equipment")}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                >
                  ← Back to Equipment
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("verification")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Next: Anti-Fake Verification & $10/yr Plan →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ANTI-FAKE VERIFICATION & $10/YEAR PLAN */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              {/* $10 Plan Box with EyeSpyR Branding */}
              <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bonus: EyeSpyR™ Verification Included</span>
                    </span>
                    <h4 className="text-base font-black text-white">
                      Verified Upfitter Listing + 2-for-1 AEO & GEO Advantage
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono">$10</span>
                    <span className="text-slate-400 text-xs"> / year</span>
                  </div>
                </div>

                {/* Option 2: Feature Callout Card */}
                <div className="bg-slate-950/90 border border-amber-500/40 rounded-lg p-3.5 space-y-2 font-mono text-xs">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>⚡ EyeSpyR™ AEO/GEO Verification Layer [Schema + AI]</span>
                  </div>
                  <div className="text-slate-200 font-semibold text-[11px] font-sans">
                    Double Your Visibility with One Listing:
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-sans text-slate-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>
                        <strong className="text-white">Level 1 (Directory SEO):</strong> Directly drives local traffic and backlinks to your plow installation business.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-sky-300 font-bold shrink-0">•</span>
                      <span>
                        <strong className="text-white">Level 2 (EyeSpyR™ AEO/GEO Engine):</strong> Injects structured AI schema so AI search engines cite your shop when local customers ask for plow installations and equipment repairs.
                      </span>
                    </li>
                  </ul>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px] pt-1 border-t border-slate-800">
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct contractor calls (0% broker fee)</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>EyeSpyR™ Anti-Fake Cryptographic Trust Seal</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>AEO schema ready for Siri & Google AI</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>GEO entity grounding for ChatGPT & Perplexity</span>
                  </li>
                </ul>
              </div>

              {/* Anti-Fake Shop Vetting Credentials */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs">
                      EyeSpyR.com 4-Step Verification Credentials
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">100% Real Facilities Only</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  To eliminate lead-brokers and middleman call centers, EyeSpyR validates commercial facilities and authentic technician operations:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Business License / EIN / Tax ID *
                    </label>
                    <input
                      type="text"
                      value={businessLicenseNo}
                      onChange={(e) => setBusinessLicenseNo(e.target.value)}
                      placeholder="e.g. EIN-XX-XXXXXXX or State License #"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Facility Verification
                    </label>
                    <select
                      value={hasPhysicalBays ? "bays" : "mobile"}
                      onChange={(e) => setHasPhysicalBays(e.target.value === "bays")}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="bays">Physical Upfitting Facility with Dedicated Bays</option>
                      <option value="mobile">Dedicated Commercial Mobile Service Rig</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-2">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antiFakeAgreement}
                      onChange={(e) => setAntiFakeAgreement(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded mt-0.5"
                    />
                    <span>
                      <strong className="text-white">Anti-Scam & Authenticity Certification:</strong> I certify that this is an authentic independent business with real commercial snow equipment tooling and valid inventory. Fake shops and ghost listings will be immediately permanently banned.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                >
                  ← Back to Bay & Fab Photos
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
                    id="submit-register-shop-btn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Shop for $10/yr</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
