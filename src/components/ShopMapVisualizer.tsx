import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MapPin,
  Truck,
  Flame,
  Wrench,
  ShieldCheck,
  Star,
  Phone,
  Send,
  Zap,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
  Crosshair,
  Move,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layers,
  Compass,
  Navigation,
  Info,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Sparkles,
  HelpCircle,
  Filter,
  Radio,
  Award,
  Hammer,
  BadgeCheck,
  Building2,
  Loader2,
  Activity,
  Check,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  FileDown,
  X,
  FileText,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { Shop, BrandType } from "../types";

export interface ShopTypeVisibility {
  authorized: boolean;
  fabricator: boolean;
  mobile: boolean;
  storm: boolean;
  standard: boolean;
}

interface ShopMapVisualizerProps {
  shops: Shop[];
  selectedShopId: string | null;
  onSelectShop: (shop: Shop | null) => void;
  onSelectShopForQuote: (shop: Shop) => void;
  hoveredShopId?: string | null;
  onHoverShop?: (shopId: string | null) => void;
  isLoading?: boolean;
  savedShopIds?: string[];
  onToggleFavorite?: (shopId: string) => void;
  onQuickContact?: (shop: Shop) => void;
}

// Regional boundaries for quick zoom
interface RegionConfig {
  name: string;
  id: string;
  viewBox: { x: number; y: number; width: number; height: number };
  description: string;
}

const REGIONS: RegionConfig[] = [
  {
    name: "All US Snowbelt",
    id: "all",
    viewBox: { x: 0, y: 0, width: 960, height: 600 },
    description: "Full continental coverage across major commercial snow belts",
  },
  {
    name: "Great Lakes & Midwest",
    id: "midwest",
    viewBox: { x: 420, y: 100, width: 380, height: 320 },
    description: "MN, WI, MI, IL, IN, OH - Lake-effect storm corridors",
  },
  {
    name: "Northeast & New England",
    id: "northeast",
    viewBox: { x: 680, y: 80, width: 270, height: 260 },
    description: "NY, PA, MA, NH, VT, ME - Heavy coastal nor'easters",
  },
  {
    name: "Rocky Mountains & West",
    id: "rockies",
    viewBox: { x: 120, y: 130, width: 400, height: 340 },
    description: "CO, WY, MT, UT - High-altitude severe alpine upfitting",
  },
];

// Project Lat/Lng (WGS84) to SVG Map Coordinate System (960x600 Albers-like projection)
function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  // Bounding box for Continental US
  // Longitude ~ -125 (West) to -66 (East)
  // Latitude ~ 24.5 (South) to 49.5 (North)
  
  // Standard Albers conic approximation for continental US map canvas
  const rad = Math.PI / 180;
  const lat0 = 38 * rad; // center latitude
  const lng0 = -96 * rad; // center longitude
  const phi1 = 29.5 * rad;
  const phi2 = 45.5 * rad;

  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const rho0 = Math.sqrt(c - 2 * n * Math.sin(lat0)) / n;

  const phi = lat * rad;
  const lambda = lng * rad;

  const theta = n * (lambda - lng0);
  const rho = Math.sqrt(Math.max(0.001, c - 2 * n * Math.sin(phi))) / n;

  // Scale and translate to fit nicely in 960 x 600 SVG viewport
  const scale = 880;
  const x = 480 + scale * rho * Math.sin(theta);
  const y = 300 + scale * (rho0 - rho * Math.cos(theta)) * 0.85;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

export const ShopMapVisualizer: React.FC<ShopMapVisualizerProps> = ({
  shops,
  selectedShopId,
  onSelectShop,
  onSelectShopForQuote,
  hoveredShopId,
  onHoverShop,
  isLoading = false,
  savedShopIds = [],
  onToggleFavorite,
  onQuickContact,
}) => {
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [isSwitchingRegion, setIsSwitchingRegion] = useState<boolean>(false);
  const [showSnowBeltZone, setShowSnowBeltZone] = useState<boolean>(true);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(false);

  // Multi-select shop type visibility toggles (Clickable Legend Checkboxes)
  const [typeVisibility, setTypeVisibility] = useState<ShopTypeVisibility>({
    authorized: true,
    fabricator: true,
    mobile: true,
    storm: true,
    standard: true,
  });

  const toggleTypeVisibility = (typeKey: keyof ShopTypeVisibility) => {
    setTypeVisibility((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  };

  const showAllTypes = () => {
    setTypeVisibility({
      authorized: true,
      fabricator: true,
      mobile: true,
      storm: true,
      standard: true,
    });
  };

  const hideAllTypes = () => {
    setTypeVisibility({
      authorized: false,
      fabricator: false,
      mobile: false,
      storm: false,
      standard: false,
    });
  };

  // Region switch micro-loader effect for silky smooth perceived responsiveness
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectRegion = (regionId: string) => {
    if (regionId === activeRegion) return;
    setIsSwitchingRegion(true);
    if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
    setActiveRegion(regionId);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    switchTimeoutRef.current = setTimeout(() => {
      setIsSwitchingRegion(false);
    }, 280);
  };

  const showLoadingOverlay = isLoading || isSwitchingRegion;

  const isShopVisible = (shop: Shop): boolean => {
    const isStorm = shop.has247StormResponse;
    const isMobile = shop.hasMobileRig;
    const isFabricator = shop.providesCustomFab || shop.specialties.some((s) => /fabricat|weld|subframe/i.test(s));
    const isAuthorized = shop.brands.some((b) => b !== "Custom / Multi-Brand") && (shop.bayCount >= 3 || shop.verified);
    const isStandard = !isStorm && !isMobile && !isFabricator && !isAuthorized;

    // If a shop belongs to a specific category that is disabled, hide it
    if (isStorm && !typeVisibility.storm) return false;
    if (isMobile && !typeVisibility.mobile) return false;
    if (isFabricator && !typeVisibility.fabricator && !isStorm && !isMobile && !isAuthorized) return false;
    if (isAuthorized && !typeVisibility.authorized && !isStorm && !isMobile && !isFabricator) return false;
    if (isStandard && !typeVisibility.standard) return false;

    // Ensure at least one active qualifying criteria is checked
    return (
      (isStorm && typeVisibility.storm) ||
      (isMobile && typeVisibility.mobile) ||
      (isFabricator && typeVisibility.fabricator) ||
      (isAuthorized && typeVisibility.authorized) ||
      (isStandard && typeVisibility.standard)
    );
  };

  const legendStats = useMemo(() => {
    return {
      total: shops.length,
      storm: shops.filter((s) => s.has247StormResponse).length,
      mobile: shops.filter((s) => s.hasMobileRig).length,
      authorized: shops.filter(
        (s) => s.brands.some((b) => b !== "Custom / Multi-Brand") && (s.bayCount >= 3 || s.verified)
      ).length,
      fabricator: shops.filter(
        (s) => s.providesCustomFab || s.specialties.some((sp) => /fabricat|weld|subframe/i.test(sp))
      ).length,
      standard: shops.filter(
        (s) =>
          !s.has247StormResponse &&
          !s.hasMobileRig &&
          !s.providesCustomFab &&
          !(s.brands.some((b) => b !== "Custom / Multi-Brand") && (s.bayCount >= 3 || s.verified))
      ).length,
      verified: shops.filter((s) => s.verified).length,
      usedEquipment: shops.filter((s) => s.usedEquipment && s.usedEquipment.length > 0).length,
    };
  }, [shops]);

  const selectedShop = useMemo(
    () => shops.find((s) => s.id === selectedShopId) || null,
    [shops, selectedShopId]
  );

  // Compute SVG coordinates for all provided shops
  const mappedShops = useMemo(() => {
    return shops.map((shop) => {
      const coords = projectCoordinates(shop.lat, shop.lng);
      return {
        ...shop,
        mapX: coords.x,
        mapY: coords.y,
      };
    });
  }, [shops]);

  const currentRegion = REGIONS.find((r) => r.id === activeRegion) || REGIONS[0];

  // Base viewBox adjusted for zoom and pan
  const currentViewBox = useMemo(() => {
    const base = currentRegion.viewBox;
    const w = base.width / zoomLevel;
    const h = base.height / zoomLevel;
    const x = base.x + (base.width - w) / 2 + panOffset.x;
    const y = base.y + (base.height - h) / 2 + panOffset.y;
    return `${x} ${y} ${w} ${h}`;
  }, [currentRegion, zoomLevel, panOffset]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExportMenuOpen]);

  // Export Map View as High-Resolution PNG (2400x1500 + HUD Watermark Footer)
  const handleExportPNG = async () => {
    if (!svgRef.current) return;
    setIsExportingPng(true);
    setExportFeedback("Rendering High-Resolution Map PNG...");

    try {
      const svgElement = svgRef.current;
      
      // Clone SVG to ensure inline namespaces and isolated attributes
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      // High-resolution canvas dimensions
      const targetWidth = 2400;
      const targetHeight = 1500;

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);

      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const footerHeight = 160;
            canvas.width = targetWidth;
            canvas.height = targetHeight + footerHeight;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Unable to create canvas rendering context"));
              return;
            }

            // Dark background matching radar UI
            ctx.fillStyle = "#030712";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw SVG map
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Draw Bottom HUD Watermark Bar
            ctx.fillStyle = "#090d16";
            ctx.fillRect(0, targetHeight, canvas.width, footerHeight);

            // Divider line
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, targetHeight);
            ctx.lineTo(canvas.width, targetHeight);
            ctx.stroke();

            // Accent indicator
            ctx.fillStyle = "#f59e0b";
            ctx.fillRect(0, targetHeight, 12, footerHeight);

            // Brand Title & Stats
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 32px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText("SNOWBELT UPFITTER & PLOW RADAR NETWORK", 40, targetHeight + 52);

            const visibleCount = mappedShops.filter(isShopVisible).length;
            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 20px monospace";
            ctx.fillText(
              `ACTIVE REGION: ${currentRegion.name.toUpperCase()}  |  VISIBLE LOCATIONS: ${visibleCount} SHOPS  |  ZOOM: ${Math.round(zoomLevel * 100)}%`,
              40,
              targetHeight + 92
            );

            ctx.fillStyle = "#94a3b8";
            ctx.font = "16px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            const dateStr = new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            ctx.fillText(`Exported on ${dateStr} • EyeSpyR™ AEO/GEO Verified Network Data`, 40, targetHeight + 128);

            // Right-side legend indicators
            ctx.textAlign = "right";
            ctx.font = "bold 17px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

            ctx.fillStyle = "#10b981";
            ctx.fillText("● Authorized OEM Dealer", canvas.width - 40, targetHeight + 48);

            ctx.fillStyle = "#f59e0b";
            ctx.fillText("● Custom Fabricator", canvas.width - 40, targetHeight + 76);

            ctx.fillStyle = "#38bdf8";
            ctx.fillText("● Mobile Service Rig", canvas.width - 40, targetHeight + 104);

            ctx.fillStyle = "#ef4444";
            ctx.fillText("● 24/7 Emergency Storm Hub", canvas.width - 40, targetHeight + 132);

            // Convert canvas to PNG blob and download
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const downloadUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  const safeRegion = activeRegion.toLowerCase().replace(/[^a-z0-9]/g, "-");
                  a.download = `snowbelt-plow-map-${safeRegion}-${new Date().toISOString().slice(0, 10)}.png`;
                  a.href = downloadUrl;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(downloadUrl);
                }
                resolve();
              },
              "image/png",
              1.0
            );
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => {
          reject(new Error("Image failed to load serialized SVG"));
        };

        img.src = blobURL;
      });

      URL.revokeObjectURL(blobURL);
      setExportFeedback("PNG Map Snapshot downloaded successfully!");
      setTimeout(() => setExportFeedback(null), 3500);
      setIsExportMenuOpen(false);
    } catch (error) {
      console.error("Failed to export high-res PNG map:", error);
      setExportFeedback("Failed to export PNG. Please try again.");
      setTimeout(() => setExportFeedback(null), 4000);
    } finally {
      setIsExportingPng(false);
    }
  };

  // Export Filtered Shop Locations as CSV Data File
  const handleExportCSV = () => {
    const visibleShops = mappedShops.filter(isShopVisible);

    const headers = [
      "Shop Name",
      "City",
      "State",
      "Zip Code",
      "Full Address",
      "Phone Number",
      "Website",
      "Standard Hourly Rate ($/hr)",
      "Emergency Storm Rate ($/hr)",
      "Turnaround Time",
      "Service Bays",
      "Authorized Brands",
      "Provides Custom Fabrication",
      "Has Mobile Service Rig",
      "24/7 Storm Response",
      "Anti-Fake Verified",
      "EyeSpyR Verified",
      "Specialties",
      "Used Equipment Count",
      "Latitude",
      "Longitude",
      "Active Region",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = visibleShops.map((s) => [
      escapeCsv(s.name),
      escapeCsv(s.city),
      escapeCsv(s.state),
      escapeCsv(s.zipCode || ""),
      escapeCsv(s.address || ""),
      escapeCsv(s.phone || ""),
      escapeCsv(s.website || ""),
      escapeCsv(s.hourlyRate || ""),
      escapeCsv(s.emergencyHourlyRate || ""),
      escapeCsv(s.turnaroundTime || ""),
      escapeCsv(s.bayCount || ""),
      escapeCsv(s.brands ? s.brands.join("; ") : ""),
      escapeCsv(s.providesCustomFab ? "Yes" : "No"),
      escapeCsv(s.hasMobileRig ? "Yes" : "No"),
      escapeCsv(s.has247StormResponse ? "Yes" : "No"),
      escapeCsv(s.verified ? "Yes" : "No"),
      escapeCsv(s.verified ? "Yes" : "No"),
      escapeCsv(s.specialties ? s.specialties.join("; ") : ""),
      escapeCsv(s.usedEquipment ? s.usedEquipment.length : 0),
      escapeCsv(s.lat),
      escapeCsv(s.lng),
      escapeCsv(currentRegion.name),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeRegion = activeRegion.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.setAttribute("href", url);
    link.setAttribute("download", `snowbelt-plow-shops-${safeRegion}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(`CSV file with ${visibleShops.length} shops downloaded!`);
    setTimeout(() => setExportFeedback(null), 3500);
    setIsExportMenuOpen(false);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 4.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(Number((prev - 0.35).toFixed(2)), 0.7));
  const handleSetZoom = (level: number) => setZoomLevel(Math.max(0.7, Math.min(4.5, level)));
  
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveRegion("all");
  };

  const handleFocusHighDensity = () => {
    // Focus into the high-density Great Lakes / Upstate NY Snowbelt cluster
    setActiveRegion("greatLakes");
    setZoomLevel(2.8);
    setPanOffset({ x: 30, y: -20 });
  };

  const handlePanNudge = (dx: number, dy: number) => {
    setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Smooth wheel zoom without page jump
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoomLevel((prev) => Math.max(0.7, Math.min(4.5, Number((prev + delta).toFixed(2)))));
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Double click to zoom into dense clusters
    if ((e.target as HTMLElement).tagName !== "BUTTON") {
      handleZoomIn();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (0.8 / zoomLevel);
    const dy = (e.clientY - dragStart.y) * (0.8 / zoomLevel);
    setPanOffset((prev) => ({ x: prev.x - dx, y: prev.y - dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div id="map-container" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Map Control Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white tracking-tight">
                Geographic Shop & Rig Network
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                {shops.length} Registered Locations
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive snowbelt upfitter radar, emergency response radius, and mobile service rigs.
            </p>
          </div>
        </div>

        {/* Regional Quick Selectors & Export Map View Station */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Regional Quick Selectors */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold text-[11px] px-1 hidden lg:inline">
              Region:
            </span>
            {REGIONS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => selectRegion(reg.id)}
                className={`map-toggle px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeRegion === reg.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30"
                    : "bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>

          {/* Export Map View Dropdown Station */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              id="export-map-view-btn"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border shadow-sm ${
                isExportMenuOpen
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20"
                  : "bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:border-amber-400"
              }`}
              title="Export current filtered map view as High-Resolution PNG or CSV spreadsheet"
              aria-expanded={isExportMenuOpen}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Map View</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExportMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Export Popover Dropdown Menu */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Export Map View & Data</div>
                      <div className="text-[10px] text-slate-400">
                        {currentRegion.name} • {mappedShops.filter(isShopVisible).length} visible shops
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExportMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Option 1: High-Resolution PNG */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 mt-0.5 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                            <span>High-Resolution PNG Map</span>
                            <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono text-[9px] font-bold">
                              2400×1500 px
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            Full graphic snapshot of current zoom, state borders, storm radar zones, and visible shop pins with HUD watermark.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleExportPNG}
                      disabled={isExportingPng}
                      id="export-png-btn"
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      {isExportingPng ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating PNG...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Download Map Image (.PNG)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option 2: CSV Data File */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                            <span>Filtered Shop Directory Data</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                              .CSV
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            Structured spreadsheet with shop names, addresses, phone numbers, hourly rates, emergency response, and coordinates.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      id="export-csv-btn"
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Download Shop Dataset (.CSV)</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Respects active shop type legend filters</span>
                  <span className="font-mono text-amber-400/90 font-bold">
                    {mappedShops.filter(isShopVisible).length} of {shops.length} records
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Canvas and Interactive Overlays */}
      <div className="relative bg-slate-950 w-full h-[420px] sm:h-[480px] select-none overflow-hidden">
        {/* Floating Export Toast Confirmation */}
        {exportFeedback && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-full shadow-2xl font-bold text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200 border border-amber-300">
            <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{exportFeedback}</span>
          </div>
        )}

        {/* SVG Base Map */}
        <svg
          ref={svgRef}
          viewBox={currentViewBox}
          className={`w-full h-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.7"
                strokeDasharray="2 2"
              />
            </pattern>

            {/* Snow Belt Severe Cold Gradient */}
            <linearGradient id="snowbelt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.03" />
            </linearGradient>

            {/* Radial glow for emergency response */}
            <radialGradient id="emergency-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            {/* Selected Shop Pin Glow */}
            <radialGradient id="selected-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Background with Grid */}
          <rect x="-200" y="-100" width="1400" height="800" fill="#030712" />
          <rect x="-200" y="-100" width="1400" height="800" fill="url(#radar-grid)" />

          {/* North American Snow Belt Shaded Zone */}
          {showSnowBeltZone && (
            <path
              d="M 120 220 C 240 240, 360 210, 480 180 C 600 150, 720 140, 880 120 L 920 280 C 800 320, 680 340, 520 380 C 380 410, 240 380, 120 320 Z"
              fill="url(#snowbelt-gradient)"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.3"
            />
          )}

          {/* Stylized US Outlines & State Boundaries */}
          <g className="state-boundaries" stroke="#334155" strokeWidth="1" fill="#0f172a" fillOpacity="0.7">
            {/* Pacific & West: WA, OR, CA, NV, ID, UT, AZ */}
            <path d="M 80 80 L 170 90 L 160 170 L 150 250 L 100 380 L 70 280 L 60 150 Z" />
            {/* Rockies & Mountain: MT, WY, CO, NM */}
            <path d="M 170 90 L 340 110 L 330 290 L 325 390 L 225 380 L 230 280 L 160 170 Z" />
            {/* Northern Plains: ND, SD, NE, KS */}
            <path d="M 340 110 L 480 125 L 475 320 L 470 410 L 325 390 L 330 290 L 340 110 Z" />
            {/* Great Lakes & Upper Midwest: MN, WI, MI, IL, IN, OH */}
            <path d="M 480 125 L 580 90 L 640 140 L 720 180 L 700 290 L 590 320 L 475 320 Z" />
            {/* Northeast & New England: NY, PA, NJ, CT, RI, MA, VT, NH, ME */}
            <path d="M 720 180 L 800 130 L 880 70 L 910 140 L 860 220 L 780 250 L 720 270 Z" />
            {/* Mid-Atlantic & South */}
            <path d="M 700 290 L 840 280 L 800 460 L 680 440 L 590 320 Z" />
            {/* Gulf & Southern Plains */}
            <path d="M 325 390 L 470 410 L 590 420 L 560 520 L 380 510 L 325 390 Z" />
          </g>

          {/* Major Snowstorm Transport Arteries (I-90, I-80, I-87, I-94) */}
          {showCorridors && (
            <g className="corridors" stroke="#475569" strokeWidth="1.2" strokeDasharray="3 3" fill="none" opacity="0.6">
              {/* I-90 / I-80 Corridor: Seattle -> Chicago -> Cleveland -> Buffalo -> Boston */}
              <path d="M 90 90 Q 300 150 540 210 T 730 210 T 890 170" />
              {/* I-94 Corridor: Minneapolis -> Milwaukee -> Detroit */}
              <path d="M 470 170 Q 560 210 660 220" />
              {/* I-87 North-South Adirondack Corridor */}
              <path d="M 800 110 L 810 240" />
              {/* Rocky Mountain I-70 Corridor */}
              <path d="M 160 260 L 320 280 L 470 300" />
            </g>
          )}

          {/* Regional Labels */}
          <g className="region-labels" fill="#64748b" fontSize="10" fontFamily="sans-serif" fontWeight="700" opacity="0.7">
            <text x="830" y="95">NEW ENGLAND</text>
            <text x="730" y="160">LAKE ERIE / NY</text>
            <text x="540" y="140">GREAT LAKES</text>
            <text x="440" y="150">UPPER MIDWEST</text>
            <text x="240" y="270">ROCKIES</text>
          </g>

          {/* Emergency Service Coverage Rings & Pulses */}
          {mappedShops
            .filter((s) => s.has247StormResponse && isShopVisible(s))
            .map((shop) => {
              return (
                <g
                  key={`pulse-${shop.id}`}
                  transform={`translate(${shop.mapX}, ${shop.mapY})`}
                  className="transition-opacity duration-300 pointer-events-none"
                >
                  <circle r="42" fill="url(#emergency-pulse)" className="animate-pulse" />
                  <circle
                    r="30"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                    opacity="0.4"
                  />
                </g>
              );
            })}

          {/* Interactive Shop Pins (Filtered by Clickable Legend Checkboxes) */}
          {mappedShops
            .filter(isShopVisible)
            .map((shop) => {
              const isSelected = shop.id === selectedShopId;
              const isHovered = shop.id === hoveredShopId;
              const isFabricator = shop.providesCustomFab || shop.specialties.some((s) => /fabricat|weld|subframe/i.test(s));
              const isAuthorized = shop.brands.some((b) => b !== "Custom / Multi-Brand") && (shop.bayCount >= 3 || shop.verified);

              const pinColor = isSelected
                ? "#f59e0b"
                : shop.has247StormResponse
                ? "#ef4444"
                : shop.hasMobileRig
                ? "#3b82f6"
                : isFabricator
                ? "#f59e0b"
                : isAuthorized
                ? "#10b981"
                : "#64748b";

              return (
                <g
                  key={shop.id}
                  id={`map-marker-${shop.id}`}
                  transform={`translate(${shop.mapX}, ${shop.mapY})`}
                  className="cursor-pointer transition-all duration-200 focus:outline-none"
                  opacity={1}
                  role="button"
                  tabIndex={0}
                  aria-label={`View shop details for ${shop.name} in ${shop.city}, ${shop.state}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectShop(isSelected ? null : shop);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectShop(isSelected ? null : shop);
                    }
                  }}
                  onMouseEnter={() => onHoverShop?.(shop.id)}
                  onMouseLeave={() => onHoverShop?.(null)}
                  style={{
                    transform: isSelected || isHovered
                      ? `translate(${shop.mapX}px, ${shop.mapY}px) scale(1.35)`
                      : `translate(${shop.mapX}px, ${shop.mapY}px) scale(1)`,
                    transformOrigin: "center bottom",
                  }}
                >
                  {/* Pin Highlight Glow */}
                  {(isSelected || isHovered) && (
                    <circle r="22" fill="url(#selected-glow)" className="animate-ping" style={{ animationDuration: "2.5s" }} />
                  )}

                  {/* Pin Drop Shadow */}
                  <ellipse cx="0" cy="2" rx="6" ry="2.5" fill="#000000" opacity="0.6" />

                  {/* Marker Body */}
                  <path
                    d="M 0 -22 C -8 -22 -12 -16 -12 -9 C -12 0 0 4 0 4 C 0 4 12 0 12 -9 C 12 -16 8 -22 0 -22 Z"
                    fill={pinColor}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />

                  {/* Inner Icon Indicator */}
                  <circle cx="0" cy="-10" r="4.5" fill="#0f172a" />
                  {shop.has247StormResponse ? (
                    <circle cx="0" cy="-10" r="2.5" fill="#fef08a" />
                  ) : shop.hasMobileRig ? (
                    <circle cx="0" cy="-10" r="2.5" fill="#93c5fd" />
                  ) : isFabricator ? (
                    <circle cx="0" cy="-10" r="2.5" fill="#fde047" />
                  ) : (
                    <circle cx="0" cy="-10" r="2.5" fill="#a7f3d0" />
                  )}

                {/* Floating City Label on Pin Hover / Selection */}
                {(isSelected || isHovered) && (
                  <g transform="translate(0, -28)">
                    <rect
                      x="-65"
                      y="-16"
                      width="130"
                      height="18"
                      rx="4"
                      fill="#020617"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {shop.city}, {shop.state}
                      {typeof shop.hourlyRate === "number" ? ` ($${shop.hourlyRate}/hr)` : ""}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Skeleton Loader & Radar Sweep Spinner Overlay */}
        {showLoadingOverlay && (
          <div
            id="map-radar-loader-overlay"
            className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300 pointer-events-none animate-in fade-in"
          >
            {/* Pulsing Radar Ring & Glowing Scanner Core */}
            <div className="relative flex items-center justify-center">
              {/* Outer expanding ripple */}
              <div className="w-24 h-24 rounded-full border border-amber-500/30 animate-ping absolute" style={{ animationDuration: "2s" }} />
              {/* Secondary radar boundary */}
              <div className="w-20 h-20 rounded-full border border-sky-400/20 animate-pulse absolute" />
              {/* Central Glowing Target */}
              <div className="w-14 h-14 rounded-full bg-slate-900/90 border border-amber-500/60 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              </div>
            </div>

            {/* Status Skeleton Text & Perceived Performance Badge */}
            <div className="mt-4 flex flex-col items-center space-y-1.5 px-4 text-center">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold text-amber-300 shadow-md">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Calibrating Snowbelt Radar Grid...</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Updating coordinates, active storm hubs & 24/7 service rigs
              </p>
            </div>
          </div>
        )}

        {/* Custom Map Navigation & Zoom Controls */}
        <div
          id="map-zoom-controls"
          className="absolute top-3 right-3 z-20 flex flex-col gap-2 max-w-[200px]"
        >
          {/* Main Zoom In / Zoom Out Station */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl shadow-slate-950/80 space-y-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1.5">
              <span className="flex items-center space-x-1">
                <ZoomIn className="w-3 h-3 text-amber-400" />
                <span>Zoom Level</span>
              </span>
              <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Primary Zoom Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleZoomIn}
                className="map-toggle flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-800 hover:border-amber-400 rounded-xl transition-all font-bold text-xs shadow-inner"
                title="Zoom In (+0.35x)"
                aria-label="Zoom in on map"
                id="map-zoom-in-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>In</span>
              </button>

              <button
                onClick={handleZoomOut}
                className="map-toggle flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-800 hover:border-amber-400 rounded-xl transition-all font-bold text-xs shadow-inner"
                title="Zoom Out (-0.35x)"
                aria-label="Zoom out on map"
                id="map-zoom-out-btn"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Out</span>
              </button>
            </div>

            {/* Quick Zoom Density Presets */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold">
              {[
                { label: "1x", val: 1.0, desc: "Overview" },
                { label: "2x", val: 2.0, desc: "Regional" },
                { label: "3x", val: 3.0, desc: "Metro" },
                { label: "4.5x", val: 4.5, desc: "Bays" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSetZoom(p.val)}
                  className={`py-1 rounded-lg border transition-all text-center ${
                    Math.abs(zoomLevel - p.val) < 0.2
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm"
                      : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                  }`}
                  title={`${p.desc} (${p.label})`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* High-Density Cluster Focus & Reset */}
            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              <button
                onClick={handleFocusHighDensity}
                className="map-toggle w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/30 rounded-xl transition-all text-[10px] font-bold"
                title="Auto-zoom into the highest density Snowbelt and Great Lakes shop cluster"
                id="map-focus-density-btn"
              >
                <Crosshair className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Focus Dense Hubs</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-1 py-1 px-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors text-[10px]"
                title="Reset zoom and center coordinates"
                id="map-zoom-reset-btn"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset View</span>
              </button>
            </div>

            {/* Precision Directional Pan D-Pad */}
            <div className="pt-1.5 border-t border-slate-800/80">
              <div className="text-[9px] text-slate-500 font-medium text-center mb-1 flex items-center justify-center space-x-1">
                <Move className="w-2.5 h-2.5" />
                <span>Pan Nudge</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <button
                  onClick={() => handlePanNudge(0, 30)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                  title="Pan Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePanNudge(30, 0)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                    title="Pan Left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <button
                    onClick={() => handlePanNudge(-30, 0)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                    title="Pan Right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => handlePanNudge(0, -30)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                  title="Pan Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Layers & Geographic Overlays (Top-Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-xl flex flex-col space-y-1.5 text-[11px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Overlays</span>
            <button
              onClick={() => setShowSnowBeltZone(!showSnowBeltZone)}
              className={`map-toggle flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-colors text-left ${
                showSnowBeltZone ? "bg-sky-950/80 text-sky-300 border border-sky-800/60 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3 text-sky-400" />
              <span>Snowbelt Zone</span>
            </button>
            <button
              onClick={() => setShowCorridors(!showCorridors)}
              className={`map-toggle flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-colors text-left ${
                showCorridors ? "bg-slate-800 text-slate-200 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Navigation className="w-3 h-3 text-slate-400" />
              <span>Interstate Arteries</span>
            </button>
          </div>
        </div>

        {/* Interactive Shop Specialization Map Legend with Clickable Checkboxes */}
        <div
          id="map-visualization-legend"
          className={`absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl z-20 transition-all duration-300 max-w-[96%] sm:max-w-2xl ${
            isLegendExpanded ? "p-3.5 sm:p-4" : "px-3.5 py-2.5"
          }`}
        >
          {/* Legend Header Bar with Visible Count and Select All / Deselect All Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-white tracking-wide text-[11px] sm:text-xs">
                Layer Visibility & Shop Types
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-300 text-[10px] font-mono">
                <span className="text-amber-400 font-bold">
                  {mappedShops.filter(isShopVisible).length}
                </span>
                <span>/</span>
                <span>{shops.length} visible</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={showAllTypes}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[10px] font-bold border border-slate-700 transition-colors"
                title="Check all shop type layers"
                id="legend-select-all-btn"
              >
                Select All
              </button>
              <button
                onClick={hideAllTypes}
                className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-medium border border-slate-800 transition-colors"
                title="Uncheck all shop type layers"
                id="legend-deselect-all-btn"
              >
                Clear
              </button>
              <button
                onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1 text-[10px] font-medium"
                title={isLegendExpanded ? "Collapse Legend Details" : "Expand Legend Details"}
                aria-label="Toggle Legend Details"
              >
                <span className="hidden sm:inline">{isLegendExpanded ? "Compact" : "Details"}</span>
                {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Clickable Legend Checkbox Toggles */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            {/* Authorized Dealer Checkbox */}
            <label
              htmlFor="legend-checkbox-authorized"
              className={`map-toggle inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                typeVisibility.authorized
                  ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-sm shadow-emerald-950/50"
                  : "bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700 opacity-60"
              }`}
              title="Click checkbox to toggle Authorized Dealer markers on the map"
              id="legend-pill-authorized-dealer"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="legend-checkbox-authorized"
                  checked={typeVisibility.authorized}
                  onChange={() => toggleTypeVisibility("authorized")}
                  className="sr-only"
                  aria-label="Toggle Authorized Dealer markers visibility"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    typeVisibility.authorized
                      ? "bg-emerald-500 border-emerald-400 text-slate-950"
                      : "bg-slate-900 border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <Award className={`w-3.5 h-3.5 shrink-0 ${typeVisibility.authorized ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="font-semibold text-xs">Authorized Dealer</span>
              </div>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                  typeVisibility.authorized ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-900 text-slate-500"
                }`}
              >
                {legendStats.authorized}
              </span>
            </label>

            {/* Independent Fabricator Checkbox */}
            <label
              htmlFor="legend-checkbox-fabricator"
              className={`map-toggle inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                typeVisibility.fabricator
                  ? "bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-sm shadow-amber-950/50"
                  : "bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700 opacity-60"
              }`}
              title="Click checkbox to toggle Independent Fabricator markers on the map"
              id="legend-pill-independent-fabricator"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="legend-checkbox-fabricator"
                  checked={typeVisibility.fabricator}
                  onChange={() => toggleTypeVisibility("fabricator")}
                  className="sr-only"
                  aria-label="Toggle Independent Fabricator markers visibility"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    typeVisibility.fabricator
                      ? "bg-amber-500 border-amber-400 text-slate-950"
                      : "bg-slate-900 border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <Hammer className={`w-3.5 h-3.5 shrink-0 ${typeVisibility.fabricator ? "text-amber-400" : "text-slate-500"}`} />
                <span className="font-semibold text-xs">Fabricator</span>
              </div>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                  typeVisibility.fabricator ? "bg-amber-500/20 text-amber-300" : "bg-slate-900 text-slate-500"
                }`}
              >
                {legendStats.fabricator}
              </span>
            </label>

            {/* Mobile Service Checkbox (Explicitly supports hiding 'Mobile Service' markers) */}
            <label
              htmlFor="legend-checkbox-mobile"
              className={`map-toggle inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                typeVisibility.mobile
                  ? "bg-blue-950/80 border-blue-500/80 text-blue-200 shadow-sm shadow-blue-950/50"
                  : "bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700 opacity-60"
              }`}
              title="Click checkbox to toggle Mobile Service markers on the map"
              id="legend-pill-mobile-service"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="legend-checkbox-mobile"
                  checked={typeVisibility.mobile}
                  onChange={() => toggleTypeVisibility("mobile")}
                  className="sr-only"
                  aria-label="Toggle Mobile Service markers visibility"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    typeVisibility.mobile
                      ? "bg-blue-500 border-blue-400 text-white"
                      : "bg-slate-900 border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <Truck className={`w-3.5 h-3.5 shrink-0 ${typeVisibility.mobile ? "text-sky-400" : "text-slate-500"}`} />
                <span className="font-semibold text-xs">Mobile Service</span>
              </div>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                  typeVisibility.mobile ? "bg-blue-500/20 text-blue-300" : "bg-slate-900 text-slate-500"
                }`}
              >
                {legendStats.mobile}
              </span>
            </label>

            {/* 24/7 Storm Response Checkbox */}
            <label
              htmlFor="legend-checkbox-storm"
              className={`map-toggle inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                typeVisibility.storm
                  ? "bg-red-950/80 border-red-500/80 text-red-200 shadow-sm shadow-red-950/50"
                  : "bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700 opacity-60"
              }`}
              title="Click checkbox to toggle 24/7 Storm Response emergency markers on the map"
              id="legend-pill-storm-response"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="legend-checkbox-storm"
                  checked={typeVisibility.storm}
                  onChange={() => toggleTypeVisibility("storm")}
                  className="sr-only"
                  aria-label="Toggle 24/7 Storm Response markers visibility"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    typeVisibility.storm
                      ? "bg-red-500 border-red-400 text-white"
                      : "bg-slate-900 border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <Flame className={`w-3.5 h-3.5 shrink-0 ${typeVisibility.storm ? "text-amber-400" : "text-slate-500"}`} />
                <span className="font-semibold text-xs">24/7 Storm</span>
              </div>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                  typeVisibility.storm ? "bg-red-500/20 text-red-300" : "bg-slate-900 text-slate-500"
                }`}
              >
                {legendStats.storm}
              </span>
            </label>

            {/* Standard Commercial Bays Checkbox */}
            {legendStats.standard > 0 && (
              <label
                htmlFor="legend-checkbox-standard"
                className={`map-toggle inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                  typeVisibility.standard
                    ? "bg-slate-800/80 border-slate-600 text-slate-200 shadow-sm"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700 opacity-60"
                }`}
                title="Click checkbox to toggle Standard Commercial Bay markers on the map"
                id="legend-pill-standard-bay"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="legend-checkbox-standard"
                    checked={typeVisibility.standard}
                    onChange={() => toggleTypeVisibility("standard")}
                    className="sr-only"
                    aria-label="Toggle Standard Commercial Bay markers visibility"
                  />
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      typeVisibility.standard
                        ? "bg-slate-600 border-slate-500 text-white"
                        : "bg-slate-900 border-slate-700 text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${typeVisibility.standard ? "text-slate-400" : "text-slate-500"}`} />
                  <span className="font-semibold text-xs">Standard Bay</span>
                </div>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                    typeVisibility.standard ? "bg-slate-700 text-slate-300" : "bg-slate-900 text-slate-500"
                  }`}
                >
                  {legendStats.standard}
                </span>
              </label>
            )}
          </div>

          {/* Expanded Detail Panel: Rich Explanations & Checkbox Capabilities */}
          {isLegendExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs animate-in fade-in duration-200">
              {/* Specialization Breakdown Cards with Click-to-Toggle Integration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Authorized Dealer Card */}
                <div
                  onClick={() => toggleTypeVisibility("authorized")}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    typeVisibility.authorized
                      ? "bg-emerald-950/50 border-emerald-500/80 shadow-md"
                      : "bg-slate-950/40 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Authorized Dealer</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">
                      {typeVisibility.authorized ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Certified dealership bays for OEM plow & spreader sales, warranty upfitting, factory FleetFlex harnesses, and parts supply.
                  </p>
                </div>

                {/* Independent Fabricator Card */}
                <div
                  onClick={() => toggleTypeVisibility("fabricator")}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    typeVisibility.fabricator
                      ? "bg-amber-950/50 border-amber-500/80 shadow-md"
                      : "bg-slate-950/40 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                      <Hammer className="w-4 h-4 text-amber-400" />
                      <span>Independent Fabricator</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {typeVisibility.fabricator ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Custom welding and fabrication experts specializing in push-frame gusseting, subframe modifications, and hydraulic custom builds.
                  </p>
                </div>

                {/* Mobile Service Card */}
                <div
                  onClick={() => toggleTypeVisibility("mobile")}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    typeVisibility.mobile
                      ? "bg-blue-950/50 border-blue-500/80 shadow-md"
                      : "bg-slate-950/40 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px]">
                      <Truck className="w-4 h-4 text-sky-400" />
                      <span>Mobile Service</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-300 font-bold">
                      {typeVisibility.mobile ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Dispatched field service vans equipped with hydraulic hose crimpers, generator power, and roadside diagnostics delivered to your lot.
                  </p>
                </div>
              </div>

              {/* Geographic Overlays Explanation */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 bg-slate-950/60 rounded-lg px-2.5 py-1.5 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-2 rounded bg-sky-900/60 border border-sky-500/50" />
                  <span><strong className="text-slate-300">Snowbelt Shading:</strong> Lake-effect and alpine severe storm accumulation zone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 border-b-2 border-dashed border-slate-400 inline-block" />
                  <span><strong className="text-slate-300">Interstate Corridors:</strong> Priority commercial freight storm arteries (I-90, I-80, I-87, I-94)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Shop Popover Preview Drawer */}
        {selectedShop && showDetailsDrawer && (
          <div className="absolute top-3 right-3 max-w-sm w-full bg-slate-900/95 backdrop-blur-lg border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl z-30 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">{selectedShop.name}</h3>
                  {selectedShop.verified && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 text-[9px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Anti-Fake Verified</span>
                    </span>
                  )}
                  <span className="px-1 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-300 font-mono">
                    $10/yr
                  </span>
                  {savedShopIds.includes(selectedShop.id) && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center space-x-0.5">
                      <Bookmark className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>Saved</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {selectedShop.city}, {selectedShop.state} ({selectedShop.zip})
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(selectedShop.id)}
                    id={`map-favorite-btn-${selectedShop.id}`}
                    className={`p-1.5 rounded-lg border transition-all ${
                      savedShopIds.includes(selectedShop.id)
                        ? "bg-amber-500/20 border-amber-400 text-amber-400 shadow-sm"
                        : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700"
                    }`}
                    title={savedShopIds.includes(selectedShop.id) ? "Remove from My Saved Shops" : "Save to My Saved Shops"}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        savedShopIds.includes(selectedShop.id) ? "fill-amber-400 text-amber-400" : "text-slate-400"
                      }`}
                    />
                  </button>
                )}
                <button
                  onClick={() => onSelectShop(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
              {typeof selectedShop.hourlyRate === "number" && (
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Shop Rate
                  </span>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    ${selectedShop.hourlyRate}/hr
                  </span>
                </div>
              )}
              {(typeof selectedShop.rating === "number" || typeof selectedShop.completedInstalls === "number") && (
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Rating & Installs
                  </span>
                  <div className="flex items-center space-x-1 text-white font-bold text-xs">
                    {typeof selectedShop.rating === "number" && (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{selectedShop.rating}</span>
                      </>
                    )}
                    {typeof selectedShop.completedInstalls === "number" && (
                      <span className="text-slate-400 font-normal">
                        ({selectedShop.completedInstalls}+ builds)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Used Winter Equipment Preview in Map Popover */}
            {selectedShop.usedEquipment && selectedShop.usedEquipment.length > 0 && (
              <div className="my-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1">
                  <span>📦 Used Equipment ({selectedShop.usedEquipment.length})</span>
                  <span className="text-emerald-400 font-mono">
                    From ${Math.min(...selectedShop.usedEquipment.map((e) => e.price)).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {selectedShop.usedEquipment[0].title}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selectedShop.usedEquipment[0].condition} • {selectedShop.usedEquipment[0].brand}
                </div>
              </div>
            )}

            {/* Key Capabilities */}
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex flex-wrap gap-1">
                {selectedShop.has247StormResponse && (
                  <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 font-medium flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>24/7 Storm Response</span>
                  </span>
                )}
                {selectedShop.hasMobileRig && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 font-medium flex items-center space-x-1">
                    <Truck className="w-3 h-3" />
                    <span>Mobile Rig</span>
                  </span>
                )}
                {selectedShop.providesCustomFab && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-medium flex items-center space-x-1">
                    <Wrench className="w-3 h-3" />
                    <span>Custom Fab</span>
                  </span>
                )}
              </div>

              {/* Brands */}
              <div className="pt-1 flex items-center space-x-1 overflow-x-auto text-[10px]">
                <span className="text-slate-400 font-semibold shrink-0">Brands:</span>
                {selectedShop.brands.slice(0, 4).map((b) => (
                  <span
                    key={b}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono"
                  >
                    {b}
                  </span>
                ))}
                {selectedShop.brands.length > 4 && (
                  <span className="text-slate-400 font-mono">
                    +{selectedShop.brands.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                {onQuickContact && (
                  <button
                    onClick={() => onQuickContact(selectedShop)}
                    id={`map-quick-contact-btn-${selectedShop.id}`}
                    className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all"
                    title="Quick SMS text or phone call"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quick Contact</span>
                  </button>
                )}

                <a
                  href={`tel:${selectedShop.phone.replace(/[^0-9]/g, "")}`}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  title="Direct phone dialer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
              </div>

              <button
                onClick={() => onSelectShopForQuote(selectedShop)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all shadow-md shadow-amber-500/20"
                id={`map-quote-btn-${selectedShop.id}`}
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Request Direct Quote</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
