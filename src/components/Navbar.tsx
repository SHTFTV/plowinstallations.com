import React from "react";
import {
  Wrench,
  Truck,
  BrainCircuit,
  FileSpreadsheet,
  Cpu,
  PackageCheck,
  PlusCircle,
  ShieldCheck,
  Snowflake,
  ClipboardList,
  Bookmark,
  Star,
  Phone,
  Mail,
  MapPin,
  Flame,
  Layers,
  Scale,
  Calendar,
  Sparkles,
} from "lucide-react";

export type ActiveTab =
  | "directory"
  | "shop"
  | "fitment"
  | "calculator"
  | "diagnostics"
  | "bench-tools"
  | "parts-exchange"
  | "work-orders"
  | "eyespyr"
  | "marketplace";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenRegisterModal?: () => void;
  onOpenPostJobModal?: () => void;
  savedShopsCount?: number;
  onViewSavedShops?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostJobModal,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner: Real Business Status & Direct Contact */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex flex-wrap items-center justify-between shadow-inner">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-950 text-amber-400 text-[11px] font-black uppercase tracking-wider">
            3-BAY COMMERCIAL SHOP
          </span>
          <span className="hidden sm:inline text-slate-900 font-bold">
            Full Flow Hydraulics • 26020 62 Ave, Aldergrove, BC V4W 1V3
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="tel:6048173783"
            className="flex items-center space-x-1.5 text-slate-950 font-black hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>(604) 817-3783</span>
          </a>
          <span className="hidden md:inline text-slate-900/60">•</span>
          <a
            href="mailto:info@fullflowhydraulics.com"
            className="hidden md:flex items-center space-x-1 text-slate-950 font-bold hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>info@fullflowhydraulics.com</span>
          </a>
          <div className="hidden lg:flex items-center space-x-1 text-[11px] bg-slate-900/10 px-2 py-0.5 rounded border border-slate-900/20">
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
            <span className="font-semibold text-slate-950">24/7 Mobile Storm Response</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Shop Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab("shop")}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 border-2 border-amber-300 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-slate-950" />
              <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-amber-400">
                <Wrench className="w-3 h-3 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                  FULL FLOW <span className="text-amber-400">HYDRAULICS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  ALDERGROVE, BC
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>26020 62 Ave, Aldergrove, BC • Plow Installations • 3-Bay Welding & Hydraulics</span>
              </p>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <a
              href="tel:6048173783"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              id="header-call-btn"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>(604) 817-3783</span>
            </a>

            <button
              onClick={() => {
                if (onOpenPostJobModal) {
                  onOpenPostJobModal();
                } else {
                  setActiveTab("work-orders");
                }
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02]"
              id="header-book-service-btn"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Request Quote / Book Bay</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/80 text-xs font-semibold">
          {/* Shop & Services */}
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "shop" || activeTab === "directory"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-tab-shop"
          >
            <Truck className="w-4 h-4" />
            <span>3-Bay Shop & Services</span>
          </button>

          {/* Truck-to-Plow Fitment Database */}
          <button
            onClick={() => setActiveTab("fitment")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all border ${
              activeTab === "fitment"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-amber-300 shadow-lg shadow-amber-500/30"
                : "bg-slate-950/80 text-amber-300 hover:text-white hover:bg-slate-900 border-amber-500/40 hover:border-amber-400"
            }`}
            id="nav-tab-fitment"
          >
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-extrabold">Plow Fitment & Mount Database</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-mono font-bold">
              DIRECT FIT
            </span>
          </button>

          {/* Ballast & Physics Calculator */}
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "calculator"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-tab-calculator"
          >
            <Scale className="w-4 h-4" />
            <span>Axle Load & Ballast Math</span>
          </button>

          {/* Hydraulics, Welding & Shop Bench */}
          <button
            onClick={() => setActiveTab("bench-tools")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "bench-tools"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-tab-bench-tools"
          >
            <Flame className="w-4 h-4" />
            <span>Welding, Hydraulics & Bench Tools</span>
          </button>

          {/* Master Tech AI & Wiring Diagnosis */}
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "diagnostics"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-tab-diagnostics"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Master Tech AI Diagnostics</span>
          </button>

          {/* Equipment & Parts Stock */}
          <button
            onClick={() => setActiveTab("parts-exchange")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "parts-exchange"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-tab-parts-exchange"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Used Plows & Equipment Stock</span>
          </button>

          {/* Work Orders & Estimates */}
          <button
            onClick={() => setActiveTab("work-orders")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "work-orders"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-tab-work-orders"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Work Orders & Quotes</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
