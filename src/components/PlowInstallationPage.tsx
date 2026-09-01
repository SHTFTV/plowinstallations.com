import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Wrench,
  Truck,
  Phone,
  Mail,
  MapPin,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Scale,
  DollarSign,
  Droplet,
  Cpu,
  Star,
  Settings,
} from "lucide-react";
import { INITIAL_SHOPS } from "../data/mockData";
import { Shop } from "../types";

interface PlowInstallationPageProps {
  onNavigateToFitment?: () => void;
  onNavigateToCalculator?: () => void;
  onNavigateToDiagnostics?: () => void;
  onRequestQuoteWithDetails?: (serviceName: string) => void;
}

export const PlowInstallationPage: React.FC<PlowInstallationPageProps> = ({
  onNavigateToFitment,
  onNavigateToCalculator,
  onNavigateToDiagnostics,
  onRequestQuoteWithDetails,
}) => {
  const shop: Shop = INITIAL_SHOPS[0];

  // Active Bay tab in facility inspector
  const [activeBayTab, setActiveBayTab] = useState<"bay1" | "bay2" | "bay3">("bay3");

  // Booking / Quote Form state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [truckDetails, setTruckDetails] = useState("");
  const [serviceNeeded, setServiceNeeded] = useState("Plow Installation & Mount Upfit");
  const [notes, setNotes] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;
    setFormSubmitted(true);
  };

  return (
    <div className="space-y-8">
      {/* Hero: Aldergrove Commercial 3-Bay Facility */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/50 border border-slate-800 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Flow Hydraulics • Aldergrove, BC</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>3-Bay Commercial Shop with 16ft Clearances</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-600 text-blue-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>24/7 Fraser Valley Mobile Storm Response</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Commercial Snow Plow Installations, <span className="text-amber-400">Welding & Hydraulics</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Full Flow Hydraulics is your dedicated 3-bay heavy duty commercial facility in Aldergrove, BC. We engineer turnkey truck-to-plow upfits, custom steel and aluminum fabrication, hydraulic cylinder rebuilds, and auto mechanical services.
          </p>

          {/* Quick Business Contact Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <a
              href="tel:6048173783"
              className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Direct Shop Phone</span>
                <span className="text-sm font-black text-white group-hover:text-amber-400 font-mono">(604) 817-3783</span>
              </div>
            </a>

            <a
              href="mailto:info@fullflowhydraulics.com"
              className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Email Shop</span>
                <span className="text-xs font-bold text-white group-hover:text-amber-400 truncate block">info@fullflowhydraulics.com</span>
              </div>
            </a>

            <a
              href="https://plowinstallations.com/aldergrove/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Facility Address</span>
                <span className="text-xs font-bold text-white group-hover:text-amber-400 block">26020 62 Ave, Aldergrove, BC</span>
              </div>
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#quote-booking-section"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Aldergrove Bay / Request Quote</span>
            </a>

            {onNavigateToFitment && (
              <button
                onClick={onNavigateToFitment}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Search Truck-to-Plow Fitment Database</span>
              </button>
            )}

            {onNavigateToCalculator && (
              <button
                onClick={onNavigateToCalculator}
                className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Axle Ballast Math</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core Pillars of Full Flow Hydraulics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pillar 1: 3-Bay Commercial Upfits */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Commercial 3-Bay Shop
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with 16-foot overhead door clearances and 18,000 lb heavy-duty truck hoists to handle full-size Ford Super Duty, Chevy Silverado HD, Ram HD, and Class 4–6 municipal chassis.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>3 Dedicated Drive-Through Service Bays</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Same-Day Pre-Season Turnarounds</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>OEM Undercarriage Push-Beam Installs</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-bold">
            Aldergrove Facility Rate: $125/hr
          </div>
        </div>

        {/* Pillar 2: Hydraulics Masters */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Hydraulics Specialists
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive hydraulic power unit diagnostics, pump motor rebuilding, directional valve manifolds, and on-site custom high-pressure hose crimping up to 5,000 PSI.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cylinder Re-Sealing & Rod Polishing</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Relief Valve Pressure Bench Testing</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Sub-Zero Fluid Flush & Decontamination</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-blue-400 font-bold">
            High-Pressure Hose Crimp While You Wait
          </div>
        </div>

        {/* Pillar 3: Welding (Aluminum & Steel) */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Welding: Aluminum & Steel
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Certified CWB/AWS welders for heavy steel subframe reinforcement, custom frame drop plates for lifted trucks, and precision TIG/MIG aluminum welding for hoppers and beds.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Structural Steel Frame Push-Beams</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Aluminum Salt Spreader Chute Repair</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hardfacing on Commercial Cutting Edges</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-orange-400 font-bold">
            Custom Fabrication & Lift Kit Brackets
          </div>
        </div>

        {/* Pillar 4: Auto Mechanics & Heavy Duty */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Auto Mechanics & Electrical
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Red Seal certified mechanics handling front suspension upgrades, Timbren SES bump stops, heavy-duty 250A alternators, dual-battery isolators, and multiplex lighting relays.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Fleet Flex & SmartTouch Multiplex Wiring</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Front Axle GAWR Suspension Leveling</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Brake, Steering & Charging Diagnostics</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-bold">
            Red Seal Heavy Duty & Auto Techs
          </div>
        </div>
      </div>

      {/* Interactive Facility Bay Tour */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Aldergrove Technical Facility Breakdown</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Inside Our 3 Commercial Service Bays
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered specifically for heavy contractor upfits, severe-duty welding, and rapid storm maintenance.
            </p>
          </div>

          {/* Bay Selector Buttons */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveBayTab("bay1")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeBayTab === "bay1"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay 1: Hydraulics & Hoses
            </button>
            <button
              onClick={() => setActiveBayTab("bay2")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeBayTab === "bay2"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay 2: Steel & Aluminum Welding
            </button>
            <button
              onClick={() => setActiveBayTab("bay3")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeBayTab === "bay3"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay 3: 18k Truck Lift & Upfits
            </button>
          </div>
        </div>

        {/* Bay Tab Content */}
        {activeBayTab === "bay1" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                BAY #1 — HYDRAULIC BENCH & DIAGNOSTICS
              </span>
              <h3 className="text-lg font-bold text-white">
                Hydraulic Pressure Testing, Valve Blocks & Custom Hose Assembly
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bay 1 features our dedicated hydraulic test bench with real-time pressure transducers (up to 6,000 PSI) and Parker high-pressure crimping station. We stock OEM fittings for BOSS, Western, Fisher, Meyer, and SnowEx power units.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Hose Crimper:</span>
                  <span className="font-bold text-white">Parker 2-wire & 4-wire (1/4" to 1")</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Pressure Bench:</span>
                  <span className="font-bold text-amber-400">0 - 5,000 PSI Calibrated</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bay 1 In-Stock Capabilities</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Solenoid coil testing (10-14 Ohms verification)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Crossover relief valve seating & pop-off adjustment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sub-zero blue hydraulic fluid flushing and filtering</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeBayTab === "bay2" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <span className="px-2.5 py-1 rounded bg-orange-500/20 text-orange-300 font-mono text-xs font-bold">
                BAY #2 — WELDING & CUSTOM FABRICATION
              </span>
              <h3 className="text-lg font-bold text-white">
                Aluminum TIG & Heavy Structural Steel Arc Welding
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our heavy welding bay is equipped with Miller Dynasty TIG stations for aluminum hopper and tank fabrication, alongside heavy GMAW/FCAW wire feeders for framing structural push-beams and subframe brackets.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Welding Processes:</span>
                  <span className="font-bold text-white">TIG Aluminum, MIG, Stick (SMAW)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Fabrication:</span>
                  <span className="font-bold text-amber-400">Custom Lifted Truck Drop Plates</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bay 2 Metalworking Projects</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cracked A-frame and quadrant gusset welding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Spreader chute and poly hopper frame repairs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Carbide and Hardox wear bar replacement</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeBayTab === "bay3" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                BAY #3 — 18,000 LB HEAVY DUTY TRUCK LIFT & UPFITS
              </span>
              <h3 className="text-lg font-bold text-white">
                Turnkey Snow Plow Undercarriages, Salters & Lighting Harnesses
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bay 3 accommodates everything from half-ton pickups to Class 6 dump trucks with full drive-through access and high-clearance hoists. We complete full mechanical bolt-on, electrical loom integration, and suspension load balancing.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Lift Capacity:</span>
                  <span className="font-bold text-white">18,000 lbs (Heavy Duty 4-Post)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Door Clearance:</span>
                  <span className="font-bold text-amber-400">16-Foot Overhead</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bay 3 Upfit Services</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>BOSS SmartHitch 2 & Western UltraMount 2 installations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>In-cab controller dash mounting & firewall grommets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Heated LED plow light aiming & isolation harness</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quote & Bay Booking Section */}
      <div id="quote-booking-section" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider inline-block">
              Direct Shop Communication
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Book a Service Bay or Request an Upfit Estimate
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Connect directly with our master technicians at 26020 62 Ave, Aldergrove, BC. We will review your truck specs and provide a firm labor & parts quote.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-950/80 border border-emerald-600 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 mx-auto font-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Quote Request Received!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{clientName}</strong>. Our shop technician will call you at <strong>{clientPhone}</strong> within 2 business hours to confirm your truck fitment and schedule your Aldergrove bay time.
              </p>
              <div className="pt-2">
                <a
                  href="tel:6048173783"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us Directly: (604) 817-3783</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4 bg-slate-950/90 border border-slate-800/90 p-6 rounded-2xl shadow-inner text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brad Mitchell"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (604) 555-0199"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. brad@contractor.ca"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary Service Needed *</label>
                  <select
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Plow Installation & Mount Upfit">Plow Installation & Mount Upfit</option>
                    <option value="Hydraulic Cylinder & Hose Service">Hydraulic Cylinder & Hose Service</option>
                    <option value="Welding: Steel Subframe & Push Beam">Welding: Steel Subframe & Push Beam</option>
                    <option value="Welding: Aluminum TIG & Salt Spreader">Welding: Aluminum TIG & Salt Spreader</option>
                    <option value="Auto Mechanics & Suspension Upgrade">Auto Mechanics & Suspension Upgrade</option>
                    <option value="Pre-Season Fleet Inspection">Pre-Season Fleet Inspection</option>
                    <option value="Emergency Storm Breakdown Repair">Emergency Storm Breakdown Repair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Vehicle Specs (Make, Model, Year, Engine) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024 Ford F-350 Super Duty 7.3L Godzilla Gas (Crew Cab, 8ft Bed)"
                  value={truckDetails}
                  onChange={(e) => setTruckDetails(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Scope of Work / Equipment Details</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Need BOSS DXT 9'2'' V-Plow installed. Truck has 2-inch leveling kit, might need custom drop brackets."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-slate-400 text-[11px]">
                  Shop Location: <strong>26020 62 Ave, Aldergrove, BC</strong>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit to Full Flow Hydraulics</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
