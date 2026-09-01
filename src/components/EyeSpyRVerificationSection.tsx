import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  Bot,
  Globe,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Flame,
  Wrench,
  Truck,
  Building2,
  DollarSign,
  Cpu,
  Layers,
  Radio,
  FileCode,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Lock,
  Share2,
  RefreshCw,
  QrCode,
  Sliders,
} from "lucide-react";
import { Shop } from "../types";

interface EyeSpyRVerificationSectionProps {
  shops?: Shop[];
  onOpenRegisterModal?: () => void;
  onSelectShop?: (shop: Shop) => void;
}

export const EyeSpyRVerificationSection: React.FC<EyeSpyRVerificationSectionProps> = ({
  shops = [],
  onOpenRegisterModal,
  onSelectShop,
}) => {
  const [selectedShopId, setSelectedShopId] = useState<string>(
    shops.length > 0 ? shops[0].id : "demo-shop"
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "process" | "aeo-geo" | "generator" | "ai-simulator">("overview");
  const [selectedAiEngine, setSelectedAiEngine] = useState<"chatgpt" | "perplexity" | "gemini">("perplexity");
  const [simulatedQuery, setSimulatedQuery] = useState<string>(
    "Who is the best independent shop for emergency Boss V-plow hydraulic repairs and Western FleetFlex wiring near me?"
  );

  // Fallback demo shop if empty
  const activeShop: Partial<Shop> =
    shops.find((s) => s.id === selectedShopId) ||
    shops[0] || {
      id: "shop-demo",
      name: "Apex Severe Duty Plow & Hydraulics",
      ownerName: "Marcus Vance, Master Tech",
      city: "Buffalo",
      state: "NY",
      zip: "14225",
      address: "2450 Walden Ave, Buffalo, NY 14225",
      phone: "(716) 829-4410",
      email: "service@apexplow.com",
      hourlyRate: 115,
      bayCount: 4,
      doorClearanceFt: 14,
      hasMobileRig: true,
      has247StormResponse: true,
      providesCustomFab: true,
      brands: ["Western", "Boss", "Fisher", "SaltDogg"],
      specialties: [
        "Hydraulics & Hoses",
        "FleetFlex Multiplex Diagnostics",
        "24/7 Storm Emergency Response",
        "Custom Subframe Fabrication",
      ],
      completedInstalls: 385,
    };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Generate dynamic JSON-LD Schema for the shop's website
  const generateJsonLdSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": ["AutoRepair", "LocalBusiness"],
      "@id": `https://eyespyr.com/entity/${activeShop.id || "shop"}`,
      "name": activeShop.name,
      "description": `EyeSpyR Anti-Fake Verified commercial snowplow, spreader upfitter, and emergency hydraulic repair facility in ${activeShop.city}, ${activeShop.state}. Specializing in ${activeShop.brands?.join(", ")}.`,
      "url": `https://plowinstallations.com/shop/${activeShop.id}`,
      "telephone": activeShop.phone,
      "email": activeShop.email,
      "priceRange": `$$ (${activeShop.hourlyRate ? `$${activeShop.hourlyRate}/hr` : "$115/hr"})`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": activeShop.address || "Industrial Pkwy",
        "addressLocality": activeShop.city || "Buffalo",
        "addressRegion": activeShop.state || "NY",
        "postalCode": activeShop.zip || "14201",
        "addressCountry": "US",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 42.8864,
        "longitude": -78.8784,
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "07:00",
          "closes": "18:00",
        },
        ...(activeShop.has247StormResponse
          ? [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                "opens": "00:00",
                "closes": "23:59",
                "description": "24/7 Emergency Storm Dispatch for Active Blizzard & Winter Storm Operations",
              },
            ]
          : []),
      ],
      "areaServed": [
        {
          "@type": "AdministrativeArea",
          "name": `${activeShop.city} Metro Area`,
        },
        {
          "@type": "AdministrativeArea",
          "name": `${activeShop.state} Snowbelt Region`,
        },
      ],
      "makesOffer": activeShop.brands?.map((brand) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${brand} Snowplow Upfitting & Diagnostics`,
          "provider": {
            "@type": "AutoRepair",
            "name": activeShop.name,
          },
        },
      })),
      "knowsAbout": [
        "Snowplow Upfitting",
        "Hydraulic Relief Valve Diagnostics",
        "V-Plow Calibration",
        "FleetFlex Multiplex Wiring",
        "Salt Spreader Auger Drives",
        "Custom Push-Beam Subframe Welding",
        ...(activeShop.specialties || []),
      ],
      "memberOf": {
        "@type": "Organization",
        "name": "EyeSpyR Verified Upfitter Network",
        "url": "https://eyespyr.com",
        "identifier": `EYESPYR-VERIFIED-${activeShop.id?.toUpperCase() || "2026"}`,
      },
      "verification": {
        "@type": "Certification",
        "name": "EyeSpyR Anti-Fake Commercial Shop Verification",
        "issuedBy": "EyeSpyR.com Trust & Safety Entity Engine",
        "status": "Active / Verified",
      },
    };

    return JSON.stringify(schema, null, 2);
  };

  const widgetEmbedCode = `<!-- EyeSpyR.com Verified Upfitter & AEO Trust Badge -->
<div id="eyespyr-trust-seal" data-shop-id="${activeShop.id || "shop-id"}" data-theme="industrial-amber"></div>
<script src="https://eyespyr.com/cdn/widget.v2.js" async></script>
<!-- /End EyeSpyR.com AEO Badge -->`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 p-6 sm:p-10 shadow-2xl shadow-slate-950/80">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-black tracking-wider uppercase">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>EYESPYR.COM INTEGRATED ENGINE</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bonus: EyeSpyR™ Verification Included</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>The Ultimate 2-for-1 SEO & AI Advantage</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Get Listed + Get Cited: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
                The Ultimate 2-for-1 SEO & AI Advantage
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Standard directory listings only target traditional Google search. When you list your plow installation shop, you can optionally unlock <strong className="text-white">EyeSpyR™ Verification</strong>—our advanced Schema + AI engine.
            </p>
          </div>

          {/* 3 Pillars: Traditional SEO, AEO, and GEO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Traditional SEO</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Boosts your local search visibility and domain authority for plow installations and repairs.
              </p>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>AEO (Answer Engine Optimization)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formats your shop data so AI search tools like ChatGPT, Claude, and Perplexity pick up your business as the direct answer.
              </p>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold font-mono uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>GEO (Generative Engine Optimization)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Embeds structured entity schemas to make sure generative engines cite your shop for local plow installs, repairs, and inventory.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification Cost</div>
              <div className="text-2xl font-black text-amber-400 font-mono">$10<span className="text-xs text-slate-400 font-normal">/year</span></div>
              <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero commission on quotes</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Engines Optimized</div>
              <div className="text-2xl font-black text-white font-mono">100%</div>
              <div className="text-[10px] text-sky-400">Perplexity, ChatGPT, Gemini, Apple</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Anti-Fake Filtering</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">100% Real</div>
              <div className="text-[10px] text-slate-400">Physical bays & mobile vans only</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Structured JSON-LD</div>
              <div className="text-2xl font-black text-amber-300 font-mono">Included</div>
              <div className="text-[10px] text-amber-400/90">Instant copy-paste code for your site</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onOpenRegisterModal && (
              <button
                onClick={onOpenRegisterModal}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-transform active:scale-95 shadow-lg shadow-amber-500/25"
                id="eyespyr-hero-register-btn"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Claim Your Shop & Get Verified ($10/yr)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setActiveTab("aeo-geo")}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Explore AEO & GEO Technology</span>
            </button>
            <button
              onClick={() => setActiveTab("generator")}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-sm border border-amber-500/30 transition-colors"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Generate Website Schema Markup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "overview", label: "Executive Overview", icon: Layers },
          { id: "process", label: "The 4-Step Verification Process", icon: ShieldCheck },
          { id: "aeo-geo", label: "What is AEO & GEO?", icon: Bot },
          { id: "generator", label: "Website Schema (JSON-LD) Generator", icon: Code2 },
          { id: "ai-simulator", label: "Live AI Search Simulator", icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
              id={`eyespyr-tab-${tab.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW & COMPARISON */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Option 2: Feature Callout Card */}
          <div className="bg-slate-950/95 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>⚡ EyeSpyR™ AEO/GEO Verification Layer [Schema + AI]</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[11px] font-sans font-bold">
                2-for-1 Value Proposition
              </span>
            </div>
            
            <div className="text-white font-bold text-sm font-sans pt-1">
              Double Your Visibility with One Listing:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs pt-1">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                  <Globe className="w-4 h-4" />
                  <span>• Level 1 (Directory SEO)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Directly drives local contractor traffic, organic map visibility, and authoritative backlinks to your plow installation business.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="text-sky-300 font-bold flex items-center space-x-1.5">
                  <Bot className="w-4 h-4" />
                  <span>• Level 2 (EyeSpyR™ AEO/GEO Engine)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Injects structured AI schema so AI search engines (ChatGPT, Claude, Perplexity) cite your shop when local customers ask for plow installations and equipment repairs.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Old School Directories */}
            <div className="bg-slate-900/60 border border-red-900/40 rounded-2xl p-5 sm:p-6 space-y-4 relative opacity-85">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-red-400 uppercase tracking-wider">
                  The Broken Legacy Model
                </span>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold">
                  Yelp / Angi / YellowPages
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Traditional Lead-Broker Directories</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span><strong>$40–$120 per lead</strong> shared with 4 other shops simultaneously.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span>Flooded with fake scraper listings, spam lead-farms, and call brokers.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span>Zero entity structured data for modern AI answer engines (Perplexity, ChatGPT).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span>Locks your direct phone number behind obfuscated tracking lines.</span>
                </li>
              </ul>
            </div>

            {/* Standard SEO Agency */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 relative opacity-85">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Expensive Agency Retainers
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                  $1,500 - $3,000 / mo
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Traditional SEO Retainer Agencies</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold mt-0.5">!</span>
                  <span>Massive recurring monthly retainers that eat your seasonal profits.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold mt-0.5">!</span>
                  <span>Focused only on legacy Google 10-blue-links, ignoring AI generative engines.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold mt-0.5">!</span>
                  <span>Slow 6–12 month ranking ramp-up with zero guarantee of winter storm placement.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold mt-0.5">!</span>
                  <span>Generic non-technical content writers who don't know FleetFlex from SmartHitch.</span>
                </li>
              </ul>
            </div>

            {/* The EyeSpyR Superpowered Model */}
            <div className="bg-gradient-to-b from-amber-950/50 to-slate-900 border-2 border-amber-500/80 rounded-2xl p-5 sm:p-6 space-y-4 relative shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                Included with Listing
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>The EyeSpyR™ Standard</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold">
                  $10 / Year Flat
                </span>
              </div>
              <h3 className="text-lg font-black text-white">EyeSpyR Superpowered AEO + GEO</h3>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Direct Contractor Traffic:</strong> Contractors call your direct shop & dispatch lines with zero commissions or middleman cut.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>AEO & Voice Search Grounding:</strong> Your shop is structured to be the direct authoritative answer for Siri, Perplexity & Google AI.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Website Schema (JSON-LD):</strong> Plug-and-play markup injected onto your own domain to elevate your local authority.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Anti-Fake Commercial Badge:</strong> Real bays and certified mobile vans only — building trust with municipal and fleet buyers.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Key Value Pillars */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Why AEO & GEO Are Critical in 2026/2027</h3>
                <p className="text-xs text-slate-400">
                  Search engines have evolved from keyword matching to AI-driven generative synthesis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Search className="w-4 h-4" />
                  <span>Old SEO (2015-2023)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Required stuffing keywords and paying agencies thousands every month just to fight for position 3 on a page of 10 blue links that users skipped over.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>AEO (Answer Engine Optimization)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a commercial contractor is stuck in a storm at 3 AM and asks their phone or Perplexity: <em>"Find 24/7 Boss V-Plow repair near me"</em>, AEO delivers your shop as the synthesized direct answer.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>GEO (Generative Engine Optimization)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Structures your business knowledge graph so ChatGPT, Gemini, and Apple Intelligence cite your shop as the regional expert for specific equipment brands and custom subframe fabrication.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE 4-STEP VERIFICATION PROCESS */}
      {activeTab === "process" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Built for Independent Upfitters
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                The EyeSpyR.com 4-Step Verification Workflow
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Every listing submitted to PlowInstallations.com undergoes the EyeSpyR verification protocol to eliminate fake lead brokers and ensure 100% authentic technician facilities.
              </p>
            </div>

            {/* 4 Steps Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-amber-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-mono">
                      01
                    </span>
                    <h4 className="text-sm font-black text-white">Commercial Entity & Bay Audit</h4>
                  </div>
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We verify your business registration, physical commercial bay specifications (minimum 12–16ft overhead door clearances) or mobile rig vehicle identification. No residential fake fronts or ghost addresses.
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-mono pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Physical Address & GPS Pin Grounding</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center font-mono">
                      02
                    </span>
                    <h4 className="text-sm font-black text-white">Anti-Fake & Zero-Spam Vetting</h4>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We purge lead-broker networks, middlemen lead sellers, call forwarding traps, and scrapers. Only real master mechanics with physical tools and documented winter upfit experience receive approval.
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Direct Owner Phone & Emergency Dispatch Validated</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-sky-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 font-black text-sm flex items-center justify-center font-mono">
                      03
                    </span>
                    <h4 className="text-sm font-black text-white">AEO & GEO Knowledge Graph Injection</h4>
                  </div>
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our system generates deep semantic Schema.org (JSON-LD) structures mapping your exact supported brands (Western, Fisher, Boss, SnowDogg), services, emergency 24/7 hours, and used equipment catalog.
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-sky-400 font-mono pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Search Engine & AI Model Entity Indexing</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative group hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-xl bg-purple-500 text-white font-black text-sm flex items-center justify-center font-mono">
                      04
                    </span>
                    <h4 className="text-sm font-black text-white">Cryptographic Trust Badge & Live Activation</h4>
                  </div>
                  <QrCode className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your shop receives the official <strong className="text-white">EyeSpyR™ Verified Independent Upfitter Trust Seal</strong> with an embeddable website widget, interactive radar map placement, and direct quote enablement.
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-purple-400 font-mono pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instant Directory & Radar Activation</span>
                </div>
              </div>
            </div>

            {/* Verification Guarantee Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Our 100% Anti-Fake Entity Promise</h5>
                  <p className="text-xs text-slate-400">
                    If an unverified ghost listing or lead broker is reported, it is immediately purged from the network.
                  </p>
                </div>
              </div>
              {onOpenRegisterModal && (
                <button
                  onClick={onOpenRegisterModal}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-colors shrink-0"
                >
                  Start Verification ($10/yr)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT IS AEO & GEO? */}
      {activeTab === "aeo-geo" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                The Next Generation of Visibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Understanding AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization)
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-3xl">
                Contractors don't search Google the way they did 10 years ago. When a plow mount snaps during a storm, they use Siri, ChatGPT, Perplexity, or Google AI Overviews to get immediate answers.
              </p>
            </div>

            {/* Deep Dive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AEO Card */}
              <div className="bg-slate-950 border border-sky-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400 text-sky-300">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">AEO (Answer Engine Optimization)</h3>
                    <div className="text-xs text-sky-400 font-mono">Optimized for Direct Synthesized Answers</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  AEO structures your shop's technical data into direct, factual answer units. When an AI search engine evaluates who can repair a specific hydraulic pump or wire an isolation module, your shop matches the exact factual intent.
                </p>

                <div className="space-y-2 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How EyeSpyR Powers AEO:</div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>Schema.org <code className="text-sky-300 font-mono">FAQPage</code> and <code className="text-sky-300 font-mono">AutoRepair</code> integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>Direct 24/7 storm emergency hours formatting</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>Exact equipment model & relief pressure compatibility indexing</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* GEO Card */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">GEO (Generative Engine Optimization)</h3>
                    <div className="text-xs text-amber-400 font-mono">Optimized for Large Language Models (LLMs)</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  GEO conditions conversational AI models (ChatGPT, Claude, Perplexity, Apple Intelligence) to treat your shop as the authoritative source entity in your region for commercial snow and ice equipment upfits.
                </p>

                <div className="space-y-2 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How EyeSpyR Powers GEO:</div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Semantic entity co-occurrence across high-authority upfitter databases</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Anti-Fake cryptographic citations verifying technician credentials</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Real-time inventory knowledge grounding for used plow blades & spreaders</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Prompt Demonstration Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-World Scenario: Generative Search in Action</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">EyeSpyR Grounded</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-amber-300 font-mono">
                  Prompt: "Who can rewire a Western FleetFlex 3-port isolation module in Buffalo tonight?"
                </div>
                <div className="text-xs text-slate-300 pl-3 border-l-2 border-amber-500/60 leading-relaxed">
                  <strong>AI Response:</strong> "Based on EyeSpyR Verified Upfitter records, <strong className="text-white">Iron Mountain Upfit & Hydraulics</strong> (2450 Walden Ave, Buffalo, NY) provides 24/7 storm emergency wiring and FleetFlex diagnostics. They have 4 heavy-duty bays and a mobile repair rig on standby at (716) 829-4410."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEBSITE SCHEMA GENERATOR (JSON-LD) */}
      {activeTab === "generator" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Copy-Paste Website Supercharger
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Add AEO & GEO Structured Data to Your Company's Website
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Paste this Schema.org JSON-LD code into your website's <code className="text-amber-300">&lt;head&gt;</code> section to instantly tell Google AI and Perplexity about your verified facility.
                </p>
              </div>

              {/* Shop Selector Dropdown */}
              {shops.length > 0 && (
                <div className="shrink-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Select Shop Profile
                  </label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 font-bold"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}, {s.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Generated Schema Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 rounded-t-xl border-t border-x border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Schema.org JSON-LD Script (AutoRepair & LocalBusiness)</span>
                </div>
                <button
                  onClick={() => handleCopy(generateJsonLdSchema(), "jsonld")}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm"
                  id="copy-schema-code-btn"
                >
                  {copiedCode === "jsonld" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Schema Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-amber-300/90 p-4 sm:p-5 rounded-b-xl border border-slate-800 text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  <code>{generateJsonLdSchema()}</code>
                </pre>
              </div>
            </div>

            {/* EyeSpyR Trust Badge Embed Widget */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>EyeSpyR™ Verified Trust Seal Widget</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Embed this live trust badge onto your website footer or contact page.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(widgetEmbedCode, "widget")}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  {copiedCode === "widget" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Widget Embed</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-300 p-3.5 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto select-all">
                <code>{widgetEmbedCode}</code>
              </pre>

              {/* Visual Badge Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                    <ShieldCheck className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">
                      EYESPYR™ VERIFIED INDEPENDENT UPFITTER
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ID: EYESPYR-{activeShop.id?.toUpperCase()} • Commercial Bay & Technician Certified
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Grounded Citation Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE AI SEARCH SIMULATOR */}
      {activeTab === "ai-simulator" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Interactive Engine Grounding Test
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Simulate How AI Engines Cite Your Verified Business
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                See how conversational search engines prioritize EyeSpyR verified entities over generic unverified directories.
              </p>
            </div>

            {/* Engine Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2">Simulate Engine:</span>
              {[
                { id: "perplexity", label: "Perplexity AI", color: "text-sky-400" },
                { id: "chatgpt", label: "ChatGPT Search (OpenAI)", color: "text-emerald-400" },
                { id: "gemini", label: "Google Gemini / AI Overview", color: "text-amber-400" },
              ].map((eng) => (
                <button
                  key={eng.id}
                  onClick={() => setSelectedAiEngine(eng.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedAiEngine === eng.id
                      ? "bg-slate-800 border-amber-400 text-white shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className={eng.color}>● </span>
                  {eng.label}
                </button>
              ))}
            </div>

            {/* Query Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Contractor Query / Voice Prompt:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={simulatedQuery}
                  onChange={(e) => setSimulatedQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none"
                  placeholder="Enter a snowplow upfitting or repair query..."
                />
                <button
                  onClick={() =>
                    setSimulatedQuery(
                      "Where can I buy a refurbished Western 8.5ft Pro Plus plow blade with FleetFlex wiring near Buffalo?"
                    )
                  }
                  className="absolute right-3 top-2.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-slate-800 px-2 py-1 rounded-lg transition-colors"
                >
                  Load Used Equipment Query
                </button>
              </div>
            </div>

            {/* Simulated AI Answer Output */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-sky-400" />
                  <span className="text-sm font-bold text-white capitalize">
                    {selectedAiEngine} Answer Engine
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span>Sources:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                    EyeSpyR.com Verified DB
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono font-bold">
                    PlowInstallations.com
                  </span>
                </div>
              </div>

              {/* Synthesized Response */}
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
                <p>
                  According to verified commercial entity records from the <strong className="text-amber-400">EyeSpyR.com Network</strong>, the top-rated verified independent facility in the area is:
                </p>

                <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-black text-white flex items-center space-x-2">
                        <span>{activeShop.name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </h4>
                      <div className="text-xs text-slate-400">
                        {activeShop.address} • Phone: <span className="text-amber-300 font-mono font-bold">{activeShop.phone}</span>
                      </div>
                    </div>
                    {activeShop.verified && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold">
                        Anti-Fake Verified
                      </span>
                    )}
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    {activeShop.brands && activeShop.brands.length > 0 && (
                      <li>• <strong>Supported Brands:</strong> {activeShop.brands.join(", ")}</li>
                    )}
                    {typeof activeShop.hourlyRate === "number" && (
                      <li>• <strong>Shop Rate:</strong> ${activeShop.hourlyRate}/hr (Zero markup)</li>
                    )}
                    {typeof activeShop.bayCount === "number" && (
                      <li>• <strong>Facility:</strong> {activeShop.bayCount} Commercial Bays
                        {typeof activeShop.doorClearanceFt === "number" ? ` (${activeShop.doorClearanceFt}ft clearance)` : ""}
                      </li>
                    )}
                    <li>• <strong>Emergency:</strong> {activeShop.has247StormResponse ? "24/7 Storm Response Active" : "Regular Business Hours"}</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-400">
                  <strong>Citation Logic:</strong> {activeShop.verified
                    ? "This shop is cited directly because its entity profile contains cryptographically verified structured JSON-LD data, physical bay verification, and active snowbelt emergency dispatch capability."
                    : "This shop is cited directly because its entity profile contains structured JSON-LD data published on the EyeSpyR network."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
