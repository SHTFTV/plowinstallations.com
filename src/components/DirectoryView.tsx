import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Wrench,
  Truck,
  Flame,
  CheckCircle2,
  Filter,
  Send,
  Building2,
  Zap,
  Map as MapIcon,
  LayoutGrid,
  List,
  Maximize2,
  Crosshair,
  Package,
  DollarSign,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
  Info,
  Layers,
  X,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Globe,
  Bot,
  Bookmark,
  FileDown,
  Download,
  Printer,
  Copy,
  ExternalLink,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { Shop, BrandType, UsedEquipmentItem } from "../types";
import { ShopMapVisualizer } from "./ShopMapVisualizer";
import { QuickContactModal } from "./QuickContactModal";

interface DirectoryViewProps {
  shops: Shop[];
  onSelectShopForQuote: (shop: Shop, initialPlowNote?: string) => void;
  onOpenRegisterModal: () => void;
  onAddEquipmentToShop?: (shopId: string, item: UsedEquipmentItem) => void;
  onOpenEyeSpyR?: () => void;
  savedShopIds?: string[];
  onToggleFavorite?: (shopId: string) => void;
  initialOnlySaved?: boolean;
}

export type ViewMode = "list" | "map" | "split";

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  shops,
  onSelectShopForQuote,
  onOpenRegisterModal,
  onAddEquipmentToShop,
  onOpenEyeSpyR,
  savedShopIds = [],
  onToggleFavorite,
  initialOnlySaved = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All Specialties");
  const [onlyMobileRig, setOnlyMobileRig] = useState(false);
  const [onlyStormResponse, setOnlyStormResponse] = useState(false);
  const [onlyCustomFab, setOnlyCustomFab] = useState(false);
  const [onlyHasUsedEquipment, setOnlyHasUsedEquipment] = useState(false);
  const [onlyAntiFakeVerified, setOnlyAntiFakeVerified] = useState(false);
  const [onlySavedShops, setOnlySavedShops] = useState<boolean>(initialOnlySaved);
  const [isSavedRosterModalOpen, setIsSavedRosterModalOpen] = useState(false);
  const [quickContactShop, setQuickContactShop] = useState<Shop | null>(null);
  const [selectedState, setSelectedState] = useState<string>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isMapSwitching, setIsMapSwitching] = useState<boolean>(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [hoveredShopId, setHoveredShopId] = useState<string | null>(null);

  // Sync if initialOnlySaved prop changes
  useEffect(() => {
    if (initialOnlySaved) {
      setOnlySavedShops(true);
    }
  }, [initialOnlySaved]);

  const handleSwitchViewMode = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    if (newMode === "map" || newMode === "split") {
      setIsMapSwitching(true);
      setTimeout(() => {
        setIsMapSwitching(false);
      }, 350);
    }
    setViewMode(newMode);
  };
  
  // Track which shop cards have their used equipment accordion expanded
  const [expandedEquipmentShopIds, setExpandedEquipmentShopIds] = useState<Record<string, boolean>>({});

  // Quick Add Used Equipment Modal State
  const [activeAddEquipmentShop, setActiveAddEquipmentShop] = useState<Shop | null>(null);
  const [eqTitle, setEqTitle] = useState("");
  const [eqCategory, setEqCategory] = useState<UsedEquipmentItem["category"]>("Used Plow Blade & Assembly");
  const [eqBrand, setEqBrand] = useState<BrandType>("Western");
  const [eqCondition, setEqCondition] = useState<UsedEquipmentItem["condition"]>("Shop Refurbished & Tested");
  const [eqPrice, setEqPrice] = useState<number>(2900);
  const [eqWiring, setEqWiring] = useState("Includes wiring harness & in-cab controller");
  const [eqDesc, setEqDesc] = useState("Pressure tested, fluid flushed, ready for storm operations.");

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const brandOptions: string[] = [
    "All",
    "Western",
    "Boss",
    "Fisher",
    "SnowDogg",
    "Meyer",
    "SnowEx",
    "SaltDogg",
    "Hiniker",
    "Sno-Way",
  ];

  const stateOptions = [
    "All",
    "NY",
    "MN",
    "PA",
    "NH",
    "WI",
    "CO",
    "MI",
    "MA",
    "OH",
    "IL",
    "ME",
    "VT",
    "AK",
  ];

  const popularSpecialties = [
    "All Specialties",
    "Hydraulics & Hoses",
    "Wiring & Electronics",
    "24/7 Storm Response",
    "Mobile Field Rig",
    "Custom Fabrication",
    "V-Plow Calibrations",
    "Spreader Installs",
    "Subframe Reinforcement",
  ];

  const toggleEquipmentExpand = (shopId: string) => {
    setExpandedEquipmentShopIds((prev) => ({
      ...prev,
      [shopId]: !prev[shopId],
    }));
  };

  const handleQuickAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddEquipmentShop || !eqTitle) return;

    const newItem: UsedEquipmentItem = {
      id: `eq-${Date.now()}`,
      title: eqTitle,
      category: eqCategory,
      brand: eqBrand,
      condition: eqCondition,
      price: eqPrice,
      year: 2022,
      seasonsUsed: "2 Seasons",
      includesWiringOrMount: eqWiring,
      description: eqDesc,
      inStock: true,
    };

    if (onAddEquipmentToShop) {
      onAddEquipmentToShop(activeAddEquipmentShop.id, newItem);
    } else {
      // Local fallback
      if (!activeAddEquipmentShop.usedEquipment) {
        activeAddEquipmentShop.usedEquipment = [];
      }
      activeAddEquipmentShop.usedEquipment.unshift(newItem);
    }

    setExpandedEquipmentShopIds((prev) => ({ ...prev, [activeAddEquipmentShop.id]: true }));
    setActiveAddEquipmentShop(null);
    setEqTitle("");
  };

  const filteredShops = shops.filter((shop) => {
    const q = searchQuery.trim().toLowerCase();
    
    const matchesSearch =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      shop.city.toLowerCase().includes(q) ||
      shop.state.toLowerCase().includes(q) ||
      shop.zip.toLowerCase().includes(q) ||
      (shop.address && shop.address.toLowerCase().includes(q)) ||
      (shop.ownerName && shop.ownerName.toLowerCase().includes(q)) ||
      (shop.bio && shop.bio.toLowerCase().includes(q)) ||
      shop.specialties.some((s) => s.toLowerCase().includes(q)) ||
      (shop.certifications && shop.certifications.some((c) => c.toLowerCase().includes(q))) ||
      shop.brands.some((b) => b.toLowerCase().includes(q)) ||
      (shop.usedEquipment &&
        shop.usedEquipment.some(
          (eq) =>
            eq.title.toLowerCase().includes(q) ||
            eq.category.toLowerCase().includes(q) ||
            eq.brand.toLowerCase().includes(q) ||
            eq.description.toLowerCase().includes(q)
        ));

    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      (selectedSpecialty === "Hydraulics & Hoses" &&
        shop.specialties.some((s) => /hydraulic|hose|pressure|cylinder/i.test(s))) ||
      (selectedSpecialty === "Wiring & Electronics" &&
        shop.specialties.some((s) => /wiring|harness|fleetflex|multiplex|electrical|controller/i.test(s))) ||
      (selectedSpecialty === "24/7 Storm Response" && shop.has247StormResponse) ||
      (selectedSpecialty === "Mobile Field Rig" && shop.hasMobileRig) ||
      (selectedSpecialty === "Custom Fabrication" &&
        (shop.providesCustomFab || shop.specialties.some((s) => /fabricat|weld|subframe/i.test(s)))) ||
      (selectedSpecialty === "V-Plow Calibrations" &&
        shop.specialties.some((s) => /v-plow|wing|cross-over|relief/i.test(s))) ||
      (selectedSpecialty === "Spreader Installs" &&
        shop.specialties.some((s) => /spreader|salter|auger|spinner/i.test(s))) ||
      (selectedSpecialty === "Subframe Reinforcement" &&
        shop.specialties.some((s) => /subframe|reinforcement|push beam|mount/i.test(s)));

    const matchesBrand =
      selectedBrand === "All" ||
      shop.brands.includes(selectedBrand as BrandType) ||
      (shop.usedEquipment && shop.usedEquipment.some((eq) => eq.brand === selectedBrand));

    const matchesState =
      selectedState === "All" || shop.state.toUpperCase() === selectedState.toUpperCase();

    const matchesMobile = !onlyMobileRig || shop.hasMobileRig;
    const matchesStorm = !onlyStormResponse || shop.has247StormResponse;
    const matchesFab = !onlyCustomFab || shop.providesCustomFab;
    const matchesUsed = !onlyHasUsedEquipment || (shop.usedEquipment && shop.usedEquipment.length > 0);
    const matchesAntiFake = !onlyAntiFakeVerified || (shop.verified && shop.einVerified);
    const matchesSaved = !onlySavedShops || savedShopIds.includes(shop.id);

    return (
      matchesSearch &&
      matchesSpecialty &&
      matchesBrand &&
      matchesState &&
      matchesMobile &&
      matchesStorm &&
      matchesFab &&
      matchesUsed &&
      matchesAntiFake &&
      matchesSaved
    );
  });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedBrand !== "All" ||
    selectedState !== "All" ||
    selectedSpecialty !== "All Specialties" ||
    onlyMobileRig ||
    onlyStormResponse ||
    onlyCustomFab ||
    onlyHasUsedEquipment ||
    onlyAntiFakeVerified ||
    onlySavedShops;

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    setSelectedState("All");
    setSelectedSpecialty("All Specialties");
    setOnlyMobileRig(false);
    setOnlyStormResponse(false);
    setOnlyCustomFab(false);
    setOnlyHasUsedEquipment(false);
    setOnlyAntiFakeVerified(false);
    setOnlySavedShops(false);
    setSelectedShopId(null);
  };

  const totalUsedEquipmentCount = shops.reduce(
    (acc, s) => acc + (s.usedEquipment ? s.usedEquipment.length : 0),
    0
  );

  const handleLocateOnMap = (shop: Shop) => {
    setSelectedShopId(shop.id);
    if (viewMode === "list") {
      setViewMode("map");
    }
    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Hero / Directory Intro Banner with $10/year and Zero Fake Shops Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>List Your Shop for $10 / Year</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Fake Shops Guarantee (EIN & Bay Audited)</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700 text-blue-300 text-xs font-bold">
              <Package className="w-3.5 h-3.5 text-cyan-300" />
              <span>Used Winter Equipment Market Included</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Decentralized Network of Independent Snow Plow Upfitters & Used Equipment
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            Direct contractor access to verified local truck fabricators, commercial hydraulic mechanics, and used snow & ice equipment. No fake broker listings, no middleman percentage markup—connect directly with shops for installations, repairs, and pre-owned gear.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenRegisterModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
              id="dir-list-shop-btn"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>List Your Shop for $10/Yr & Post Used Equipment</span>
            </button>
            {onOpenEyeSpyR && (
              <button
                onClick={onOpenEyeSpyR}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 font-bold text-xs transition-all shadow-md"
                id="dir-eyespyr-aeo-geo-btn"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>EyeSpyR™ AEO/GEO Superpowered SEO Engine</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  Schema + AI
                </span>
              </button>
            )}
            <div className="text-xs text-slate-400 flex items-center space-x-3 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="font-semibold text-white">{shops.length} verified shops</span>
              <span>•</span>
              <span className="text-amber-400 font-mono font-bold">{totalUsedEquipmentCount} used units listed</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">100% Direct Rates</span>
            </div>
          </div>

          {/* Option 3: Short Explainer Text Directly Below Buttons */}
          <div className="pt-2 border-t border-slate-800/80 mt-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400 font-semibold">Why add EyeSpyR™ Verification?</strong>{" "}
              It turns a basic directory entry into an AEO/GEO powerhouse. While standard directory listings feed traditional Google search results, EyeSpyR™ injects deep structured schema and entity validation into your profile—ensuring both human searchers and AI response engines recommend your shop first.
            </p>
          </div>
        </div>
      </div>

      {/* Option 1: Clean High-Converting Section Block: 2-for-1 SEO & AI Advantage */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-400 text-[11px] font-mono font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Bonus: EyeSpyR™ Verification Included</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                2-for-1 Value Proposition
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Get Listed + Get Cited: The Ultimate 2-for-1 SEO & AI Advantage
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Standard directory listings only target traditional Google search. When you list your plow installation shop, you can optionally unlock <strong className="text-amber-300 font-semibold">EyeSpyR™ Verification</strong>—our advanced Schema + AI engine.
            </p>
          </div>

          {onOpenEyeSpyR && (
            <button
              onClick={onOpenEyeSpyR}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-transform active:scale-95 shrink-0 shadow-md shadow-amber-500/20"
            >
              <span>Explore AEO/GEO & Schema Generator</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3 Pillars: Traditional SEO, AEO, and GEO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Traditional SEO</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Boosts your local search visibility, organic map pack placement, and domain authority for plow installation keywords.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AEO (Answer Engine Optimization)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Formats your shop data so AI search tools like ChatGPT, Claude, and Perplexity pick up your business as the direct answer.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>GEO (Generative Engine Optimization)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Embeds structured entity schemas to make sure generative engines cite your shop for local plow installs, repairs, and inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Sticky Search & Filter Navigation Bar */}
      <div
        id="persistent-directory-search-bar"
        className="sticky top-2 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-slate-950/60 space-y-3 transition-all duration-200"
      >
        {/* Main Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Primary Search Input with Clear Button */}
          <div className="md:col-span-4 relative flex items-center">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop name, city, state, zip, specialty (e.g. Buffalo, Hydraulics)..."
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-amber-400 text-white text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none placeholder-slate-500 transition-colors shadow-inner"
              id="dir-search-input"
              aria-label="Search directory by name, city, zip, or service specialty"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                title="Clear search input"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Service Specialty Selector */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 appearance-none font-medium pr-8"
                id="dir-specialty-select"
                aria-label="Filter by service specialty"
              >
                {popularSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec === "All Specialties" ? "⚙️ All Service Specialties" : `⚙️ ${spec}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 appearance-none pr-8"
                id="dir-brand-select"
                aria-label="Filter by brand"
              >
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === "All" ? "🏷️ All Brands" : `🏷️ ${brand}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="md:col-span-3 flex items-center bg-slate-950 border border-slate-700/80 rounded-xl p-1 relative">
            <button
              onClick={() => handleSwitchViewMode("list")}
              className={`map-toggle relative z-10 flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors duration-150 ${
                viewMode === "list"
                  ? "text-slate-950 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="List-based display of shops & used equipment"
              id="view-toggle-list"
            >
              {viewMode === "list" && (
                <motion.div
                  layoutId="activeViewTabIndicator"
                  className="absolute inset-0 bg-amber-500 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center space-x-1.5">
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </span>
            </button>

            <button
              onClick={() => handleSwitchViewMode("map")}
              className={`map-toggle relative z-10 flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors duration-150 ${
                viewMode === "map"
                  ? "text-slate-950 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dedicated geographic map visualization view for shops"
              id="view-toggle-map"
            >
              {viewMode === "map" && (
                <motion.div
                  layoutId="activeViewTabIndicator"
                  className="absolute inset-0 bg-amber-500 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center space-x-1.5">
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </span>
            </button>

            <button
              onClick={() => handleSwitchViewMode("split")}
              className={`map-toggle relative z-10 flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors duration-150 ${
                viewMode === "split"
                  ? "text-slate-950 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Combined Map & List view"
              id="view-toggle-split"
            >
              {viewMode === "split" && (
                <motion.div
                  layoutId="activeViewTabIndicator"
                  className="absolute inset-0 bg-amber-500 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Split</span>
              </span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips & Live Result Counts */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 font-semibold flex items-center space-x-1 mr-0.5 text-[11px]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Filters:</span>
            </span>

            {/* My Saved Shops Filter Chip */}
            <button
              onClick={() => setOnlySavedShops(!onlySavedShops)}
              className={`map-toggle px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center space-x-1.5 ${
                onlySavedShops
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20"
                  : savedShopIds.length > 0
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
              id="filter-saved-shops"
              title="Filter directory to view only your saved/favorited upfitters and mobile mechanics"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  onlySavedShops
                    ? "fill-slate-950 text-slate-950"
                    : savedShopIds.length > 0
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-400"
                }`}
              />
              <span>My Saved Shops</span>
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold ${
                  onlySavedShops ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-amber-300"
                }`}
              >
                {savedShopIds.length}
              </span>
            </button>

            {/* State Quick Dropdown */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
              id="dir-state-select"
            >
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All States" : `State: ${st}`}
                </option>
              ))}
            </select>

            {/* Anti-Fake Verified Filter */}
            <button
              onClick={() => setOnlyAntiFakeVerified(!onlyAntiFakeVerified)}
              className={`map-toggle px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
                onlyAntiFakeVerified
                  ? "bg-emerald-950 border-emerald-500 text-emerald-200 font-bold shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
              id="filter-anti-fake"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Anti-Fake Verified</span>
            </button>

            {/* Used Equipment Filter */}
            <button
              onClick={() => setOnlyHasUsedEquipment(!onlyHasUsedEquipment)}
              className={`map-toggle px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
                onlyHasUsedEquipment
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
              id="filter-used-equipment"
            >
              <Package className="w-3 h-3" />
              <span>Used Equipment ({totalUsedEquipmentCount})</span>
            </button>

            {/* 24/7 Storm Response */}
            <button
              onClick={() => setOnlyStormResponse(!onlyStormResponse)}
              className={`map-toggle px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
                onlyStormResponse
                  ? "bg-red-950 border-red-500 text-red-200 font-bold shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
              id="filter-storm-response"
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>24/7 Storm</span>
            </button>

            {/* Mobile Service Rig */}
            <button
              onClick={() => setOnlyMobileRig(!onlyMobileRig)}
              className={`map-toggle px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
                onlyMobileRig
                  ? "bg-blue-950 border-blue-500 text-blue-200 font-bold shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
              id="filter-mobile-rig"
            >
              <Truck className="w-3 h-3 text-sky-400" />
              <span>Mobile Rig</span>
            </button>

            {/* Custom Fabrication */}
            <button
              onClick={() => setOnlyCustomFab(!onlyCustomFab)}
              className={`map-toggle px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
                onlyCustomFab
                  ? "bg-amber-950 border-amber-500 text-amber-200 font-bold shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
              id="filter-custom-fab"
            >
              <Wrench className="w-3 h-3 text-amber-400" />
              <span>Custom Fab</span>
            </button>
          </div>

          {/* Match Count & Reset Button */}
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-[11px] text-slate-400 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">{filteredShops.length}</span>
              <span className="text-slate-400">of {shops.length} shops</span>
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                title="Reset all search queries and active filter badges"
                id="reset-directory-filters-btn"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Visualization Component Section */}
      <AnimatePresence mode="wait">
        {(viewMode === "split" || viewMode === "map") && (
          <motion.div
            key="directory-map-section"
            ref={mapSectionRef}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2"
          >
            {viewMode === "map" && (
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapIcon className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white">Dedicated Geographic Map Visualization</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{filteredShops.length} independent shops plotted</span>
                </div>
                <button
                  onClick={() => handleSwitchViewMode("list")}
                  className="map-toggle inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 text-xs transition-colors"
                  id="map-view-switch-to-list-btn"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Switch to List View ({filteredShops.length})</span>
                </button>
              </div>
            )}
            <ShopMapVisualizer
              shops={filteredShops}
              selectedShopId={selectedShopId}
              onSelectShop={(shop) => setSelectedShopId(shop ? shop.id : null)}
              onSelectShopForQuote={onSelectShopForQuote}
              hoveredShopId={hoveredShopId}
              onHoverShop={setHoveredShopId}
              isLoading={isMapSwitching}
              savedShopIds={savedShopIds}
              onToggleFavorite={onToggleFavorite}
              onQuickContact={setQuickContactShop}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Header */}
      {viewMode !== "map" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span>Verified Independent Shops ({filteredShops.length})</span>
              {selectedShopId && (
                <span className="text-amber-400 font-normal text-xs lowercase">
                  (1 shop selected on radar)
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 hidden md:inline">
              $10/yr verified listings • Direct shop inquiries
            </span>
            <button
              onClick={() => handleSwitchViewMode("map")}
              className="map-toggle inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-amber-300 font-medium text-xs transition-colors shrink-0"
              id="list-view-switch-to-map-btn"
              title="Open full map visualization view"
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Map Visualization View</span>
            </button>
          </div>
        </div>
      )}

      {/* Shops Grid */}
      {viewMode !== "map" &&
        (filteredShops.length === 0 ? (
          onlySavedShops ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-2">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No Saved Shops Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You haven't saved any shops to your persistent roster yet. Click the{" "}
                <strong className="text-amber-400">Save (Bookmark)</strong> button on any shop card to build your fleet's emergency contact list.
              </p>
              <div className="pt-3 flex justify-center">
                <button
                  onClick={() => setOnlySavedShops(false)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  Browse All {shops.length} Shops
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No independent shops match this filter</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Try adjusting your search location, brand, or capabilities, or register your shop for $10/year to join our verified upfitter network.
              </p>
              <button
                onClick={onOpenRegisterModal}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg inline-flex items-center space-x-2"
              >
                <span>List Your Shop ($10/yr)</span>
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {/* Active Saved Shops Banner */}
            {onlySavedShops && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <Bookmark className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Viewing My Saved Shops Roster ({filteredShops.length})</span>
                    <p className="text-[11px] text-amber-200/80">
                      Saved locally in your browser session. Rapid access for storm emergency response and fleet upfit quotes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsSavedRosterModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                    id="open-saved-roster-export-btn"
                  >
                    <FileDown className="w-3.5 h-3.5 text-slate-950" />
                    <span>Export Roster (CSV)</span>
                  </button>
                  <button
                    onClick={() => setOnlySavedShops(false)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs transition-colors"
                  >
                    View All Shops ({shops.length})
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredShops.map((shop) => {
              const isSelected = shop.id === selectedShopId;
              const isHovered = shop.id === hoveredShopId;
              const isEqExpanded = Boolean(expandedEquipmentShopIds[shop.id]);
              const usedItems = shop.usedEquipment || [];
              const isShopSaved = savedShopIds.includes(shop.id);

              return (
                <div
                  key={shop.id}
                  onMouseEnter={() => setHoveredShopId(shop.id)}
                  onMouseLeave={() => setHoveredShopId(null)}
                  className={`bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all shadow-lg flex flex-col justify-between group ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/30 bg-slate-900/95"
                      : isHovered
                      ? "border-slate-600"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                  id={`shop-card-${shop.id}`}
                >
                  <div>
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                            {shop.name}
                          </h3>
                          {shop.verified && (
                            <span
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 text-[10px] font-bold"
                              title={`Anti-Fake Verified Shop: ${shop.businessLicenseNo || "License & Bays Audited"}`}
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Anti-Fake Verified</span>
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                            $10/yr Member
                          </span>
                          {isShopSaved && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center space-x-1 font-semibold">
                              <Bookmark className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>Saved</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            {shop.address || `${shop.city}, ${shop.state} ${shop.zip}`}
                          </span>
                        </p>
                      </div>

                      {/* Rating, Rate & Favorite Button */}
                      <div className="flex items-start space-x-2 shrink-0">
                        <div className="text-right">
                          {typeof shop.rating === "number" && (
                            <div className="flex items-center justify-end space-x-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-sm font-bold text-white">{shop.rating}</span>
                              {typeof shop.reviewCount === "number" && (
                                <span className="text-xs text-slate-400">({shop.reviewCount})</span>
                              )}
                            </div>
                          )}
                          {typeof shop.hourlyRate === "number" && (
                            <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                              ${shop.hourlyRate}/hr <span className="text-slate-400 font-normal">shop rate</span>
                            </div>
                          )}
                        </div>

                        {onToggleFavorite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(shop.id);
                            }}
                            id={`favorite-shop-${shop.id}`}
                            className={`p-2 rounded-xl border transition-all duration-150 flex items-center justify-center ${
                              isShopSaved
                                ? "bg-amber-500/20 border-amber-400/80 text-amber-400 shadow-md shadow-amber-500/10 hover:bg-amber-500/30"
                                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700 hover:bg-slate-900"
                            }`}
                            title={isShopSaved ? "Remove from My Saved Shops" : "Save shop to My Saved Shops"}
                            aria-label={isShopSaved ? "Remove from My Saved Shops" : "Save shop to My Saved Shops"}
                          >
                            <Bookmark
                              className={`w-4 h-4 transition-transform duration-150 active:scale-125 ${
                                isShopSaved ? "fill-amber-400 text-amber-400" : "text-slate-400"
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Badges / Capabilities */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
                      {shop.hasMobileRig && (
                        <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 font-medium flex items-center space-x-1">
                          <Truck className="w-3 h-3" />
                          <span>Mobile Van Rig</span>
                        </span>
                      )}
                      {shop.has247StormResponse && (
                        <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 font-medium flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>24/7 Storm Response</span>
                        </span>
                      )}
                      {shop.providesCustomFab && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-medium flex items-center space-x-1">
                          <Wrench className="w-3 h-3" />
                          <span>Custom Subframe Fab</span>
                        </span>
                      )}
                      {typeof shop.bayCount === "number" && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {shop.bayCount} Bays
                          {typeof shop.doorClearanceFt === "number" ? ` (${shop.doorClearanceFt}ft Door)` : ""}
                        </span>
                      )}
                      {typeof shop.completedInstalls === "number" && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {shop.completedInstalls}+ Upfits
                        </span>
                      )}
                    </div>

                    {/* Brands Handled */}
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Equipment Handled:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {shop.brands.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 bg-slate-800/90 text-amber-300 border border-slate-700 rounded text-[10px] font-mono font-medium"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* USED WINTER EQUIPMENT INVENTORY SECTION */}
                    <div className="mt-4 pt-3 border-t border-slate-800/90">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">
                            Used Equipment in Stock
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                            {usedItems.length} {usedItems.length === 1 ? "Unit" : "Units"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveAddEquipmentShop(shop)}
                            className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
                            title="List used equipment on this shop profile"
                          >
                            <Plus className="w-3 h-3 text-amber-400" />
                            <span>List Used Item</span>
                          </button>

                          {usedItems.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleEquipmentExpand(shop.id)}
                              className="px-2 py-1 rounded text-[10px] bg-slate-950 border border-slate-800 hover:border-slate-700 text-amber-400 font-bold flex items-center space-x-1 transition-colors"
                            >
                              <span>{isEqExpanded ? "Hide" : "View Inventory"}</span>
                              {isEqExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Used Equipment Details */}
                      {isEqExpanded && usedItems.length > 0 && (
                        <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
                          {usedItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 text-xs space-y-2 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-bold text-white text-xs">{item.title}</div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 font-mono">
                                      {item.brand}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                                      {item.condition}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {item.category}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-sm font-mono font-black text-amber-400">
                                    ${item.price.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    Direct Price
                                  </span>
                                </div>
                              </div>

                              {item.includesWiringOrMount && (
                                <p className="text-[11px] text-slate-300 bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
                                  <strong className="text-amber-400">Includes:</strong> {item.includesWiringOrMount}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                  {item.description}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectShopForQuote(
                                      shop,
                                      `Inquiry on Used Equipment: ${item.title} ($${item.price.toLocaleString()})`
                                    )
                                  }
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded flex items-center space-x-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Inquire on Unit</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Brief preview line when collapsed */}
                      {!isEqExpanded && usedItems.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="truncate">
                            Latest: {usedItems[0].title} (${usedItems[0].price.toLocaleString()})
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleEquipmentExpand(shop.id)}
                            className="text-amber-400 hover:underline shrink-0 ml-2 text-[10px]"
                          >
                            Explore all {usedItems.length} items →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Quick Contact Button */}
                      <button
                        onClick={() => setQuickContactShop(shop)}
                        id={`quick-contact-btn-${shop.id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 font-bold text-xs transition-all shadow-sm"
                        title="Initiate direct SMS text or phone call to this shop"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Quick Contact</span>
                      </button>

                      <button
                        onClick={() => setQuickContactShop(shop)}
                        className="inline-flex items-center space-x-1.5 text-slate-300 hover:text-white font-medium bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                        title="Open Quick Call & SMS dialer"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{shop.phone}</span>
                      </button>

                      {shop.emergencyPhone && (
                        <button
                          onClick={() => setQuickContactShop(shop)}
                          className="inline-flex items-center space-x-1.5 text-red-400 hover:text-red-300 font-medium bg-red-950/30 px-2.5 py-1.5 rounded-lg border border-red-900/50 transition-colors"
                          title="24/7 Emergency Storm Dispatch"
                        >
                          <Zap className="w-3.5 h-3.5 animate-pulse" />
                          <span className="hidden sm:inline">24/7 Dispatch</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(shop.id)}
                          id={`favorite-btn-${shop.id}`}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border font-medium text-xs transition-all ${
                            isShopSaved
                              ? "bg-amber-500/15 border-amber-500/60 text-amber-300 hover:bg-amber-500/25"
                              : "bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700"
                          }`}
                          title={isShopSaved ? "Saved in My Saved Shops" : "Add to My Saved Shops"}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isShopSaved ? "fill-amber-400 text-amber-400" : "text-amber-400"
                            }`}
                          />
                          <span>{isShopSaved ? "Saved" : "Save"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleLocateOnMap(shop)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium text-xs transition-colors"
                        title="Locate on Geographic Radar Map"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                        <span>Locate</span>
                      </button>

                      <button
                        onClick={() => onSelectShopForQuote(shop)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02]"
                        id={`request-quote-${shop.id}`}
                      >
                        <Send className="w-3.5 h-3.5 text-slate-950" />
                        <span>Request Direct Quote</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* SAVED SHOPS ROSTER MODAL */}
      {isSavedRosterModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Bookmark className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>My Saved Shops & Emergency Dispatch Roster</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                      {savedShopIds.length} Saved
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Persistently stored in your browser for fast winter storm response and quote routing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSavedRosterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {savedShopIds.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-300 font-bold">No saved shops found.</p>
                  <p className="text-xs text-slate-500">
                    Click the bookmark icon on any shop in the directory or map drawer to add them to your roster.
                  </p>
                </div>
              ) : (
                shops
                  .filter((s) => savedShopIds.includes(s.id))
                  .map((shop) => (
                    <div
                      key={shop.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{shop.name}</span>
                          {shop.verified && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                              Verified
                            </span>
                          )}
                          {typeof shop.hourlyRate === "number" && (
                            <span className="font-mono text-amber-400 text-xs font-bold">
                              ${shop.hourlyRate}/hr
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{shop.address || `${shop.city}, ${shop.state} ${shop.zip}`}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-300 pt-0.5">
                          <span className="text-emerald-400 font-mono">📞 {shop.phone}</span>
                          {shop.emergencyPhone && (
                            <span className="text-red-400 font-mono font-bold">
                              ⚡ 24/7: {shop.emergencyPhone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            setIsSavedRosterModalOpen(false);
                            setQuickContactShop(shop);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                          title="Quick SMS text or phone call"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>Contact</span>
                        </button>
                        {onToggleFavorite && (
                          <button
                            onClick={() => onToggleFavorite(shop.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-[10px] transition-colors"
                            title="Remove from Saved"
                          >
                            Remove
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsSavedRosterModalOpen(false);
                            onSelectShopForQuote(shop);
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition-all"
                        >
                          <Send className="w-3 h-3 text-slate-950" />
                          <span>Quote</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                {savedShopIds.length} shop{savedShopIds.length === 1 ? "" : "s"} ready for dispatch
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const savedList = shops.filter((s) => savedShopIds.includes(s.id));
                    if (savedList.length === 0) return;
                    const headers = [
                      "Shop ID",
                      "Shop Name",
                      "Address",
                      "City",
                      "State",
                      "Zip",
                      "Phone",
                      "Emergency Phone",
                      "Email",
                      "Hourly Rate",
                      "Rating",
                      "Mobile Rig",
                      "24/7 Storm Response",
                      "Custom Fab",
                      "Brands",
                    ];
                    const rows = savedList.map((s) => [
                      `"${s.id}"`,
                      `"${s.name.replace(/"/g, '""')}"`,
                      `"${(s.address || "").replace(/"/g, '""')}"`,
                      `"${s.city}"`,
                      `"${s.state}"`,
                      `"${s.zip}"`,
                      `"${s.phone}"`,
                      `"${s.emergencyPhone || ""}"`,
                      `"${s.email || ""}"`,
                      s.hourlyRate ?? "",
                      s.rating ?? "",
                      s.hasMobileRig ? "Yes" : "No",
                      s.has247StormResponse ? "Yes" : "No",
                      s.providesCustomFab ? "Yes" : "No",
                      `"${s.brands.join("; ")}"`,
                    ]);
                    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute(
                      "download",
                      `frameinsteel_saved_shops_${new Date().toISOString().split("T")[0]}.csv`
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  disabled={savedShopIds.length === 0}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download CSV Roster</span>
                </button>
                <button
                  onClick={() => setIsSavedRosterModalOpen(false)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CONTACT MODAL */}
      {quickContactShop && (
        <QuickContactModal
          shop={quickContactShop}
          onClose={() => setQuickContactShop(null)}
          onSelectShopForQuote={(shopToQuote) => {
            setQuickContactShop(null);
            onSelectShopForQuote(shopToQuote);
          }}
        />
      )}

      {/* QUICK ADD USED EQUIPMENT MODAL */}
      {activeAddEquipmentShop && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Shop Profile Inventory
                </span>
                <h3 className="text-base font-bold text-white">
                  Add Used Winter Equipment to {activeAddEquipmentShop.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveAddEquipmentShop(null)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddEquipment} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Equipment Title / Model *
                </label>
                <input
                  type="text"
                  required
                  value={eqTitle}
                  onChange={(e) => setEqTitle(e.target.value)}
                  placeholder="e.g. Fisher 8.5ft HDX Stainless Steel Straight Blade"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Used Plow Blade & Assembly">Used Plow Blade & Assembly</option>
                    <option value="Used V-Box / Tailgate Spreader">Used V-Box / Tailgate Spreader</option>
                    <option value="Used Snow Pusher / Box">Used Snow Pusher / Box</option>
                    <option value="Refurbished Power Unit & Pump">Refurbished Power Unit & Pump</option>
                    <option value="Used Undercarriage Mount & Beam">Used Undercarriage Mount & Beam</option>
                    <option value="Used In-Cab Controller & Harness">Used In-Cab Controller & Harness</option>
                    <option value="UTV / Loader Attachment">UTV / Loader Attachment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <select
                    value={eqBrand}
                    onChange={(e) => setEqBrand(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {brandOptions.filter((b) => b !== "All").map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Condition</label>
                  <select
                    value={eqCondition}
                    onChange={(e) => setEqCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Shop Refurbished & Tested">Shop Refurbished & Tested</option>
                    <option value="Field Ready / Good Condition">Field Ready / Good Condition</option>
                    <option value="Like New / Low Hours">Like New / Low Hours</option>
                    <option value="Contractor Surplus">Contractor Surplus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Direct Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={eqPrice}
                    onChange={(e) => setEqPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Included Wiring / Mounts</label>
                <input
                  type="text"
                  value={eqWiring}
                  onChange={(e) => setEqWiring(e.target.value)}
                  placeholder="e.g. MinuteMount 2 pushbeam and 4-pin isolation module"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Condition Details / Notes</label>
                <input
                  type="text"
                  value={eqDesc}
                  onChange={(e) => setEqDesc(e.target.value)}
                  placeholder="e.g. Cylinders rebuilt with fresh seals, new cutting edge installed"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveAddEquipmentShop(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Publish Used Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
