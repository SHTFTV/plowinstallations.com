import React, { useState, useEffect } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { PlowInstallationPage } from "./components/PlowInstallationPage";
import { FitmentDatabase } from "./components/FitmentDatabase";
import { FitmentBallastCalculator } from "./components/FitmentBallastCalculator";
import { MasterTechAiAssistant } from "./components/MasterTechAiAssistant";
import { ShopBenchTools } from "./components/ShopBenchTools";
import { PartsExchangeView } from "./components/PartsExchangeView";
import { WorkOrderManager } from "./components/WorkOrderManager";
import { JobMarketplaceView } from "./components/JobMarketplaceView";
import { INITIAL_SHOPS, INITIAL_JOBS } from "./data/mockData";
import { Shop, JobListing, JobBid, UsedEquipmentItem, TruckPlowFitment, CompatiblePlowOption } from "./types";
import {
  Wrench,
  Truck,
  ShieldCheck,
  Snowflake,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  PackageCheck,
  Send,
  Mail,
  Bell,
  Check,
  Bookmark,
  MapPin,
  Calendar,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("shop");
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [jobs, setJobs] = useState<JobListing[]>(INITIAL_JOBS);

  // Modals & Quote Request Target
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteVehicle, setQuoteVehicle] = useState("");
  const [quotePlow, setQuotePlow] = useState("");
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");

  // Newsletter Subscription
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterSubscribed(true);
    showToast(`Subscribed ${newsletterEmail} to Full Flow Hydraulics bulletins and snowstorm updates!`);
    setNewsletterEmail("");
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Bridge from Fitment Database to Physics Ballast Calculator
  const handleSelectFitmentForCalculator = (truck: TruckPlowFitment, plow: CompatiblePlowOption) => {
    setActiveTab("calculator");
    showToast(`Loaded ${truck.make} ${truck.model} & ${plow.brand} ${plow.model} into Ballast Calculator.`);
  };

  // Request Quote from Fitment Database
  const handleRequestQuoteFromFitment = (vehicleName: string, plowName: string, notes?: string) => {
    setQuoteVehicle(vehicleName);
    setQuotePlow(plowName);
    if (notes) setQuoteNotes(notes);
    setIsQuoteModalOpen(true);
  };

  const handleSendDirectQuoteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Quote request dispatched to Full Flow Hydraulics! Our Aldergrove shop will contact you at ${quotePhone}.`);
    setIsQuoteModalOpen(false);
    setQuoteVehicle("");
    setQuotePlow("");
    setQuoteName("");
    setQuotePhone("");
    setQuoteEmail("");
    setQuoteNotes("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center space-x-2 border border-emerald-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPostJobModal={() => setIsQuoteModalOpen(true)}
      />

      {/* Primary Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(activeTab === "shop" || activeTab === "directory") && (
          <PlowInstallationPage
            onNavigateToFitment={() => setActiveTab("fitment")}
            onNavigateToCalculator={() => setActiveTab("calculator")}
            onNavigateToDiagnostics={() => setActiveTab("diagnostics")}
            onRequestQuoteWithDetails={(service) => {
              setQuoteNotes(`Customer requested service: ${service}`);
              setIsQuoteModalOpen(true);
            }}
          />
        )}

        {activeTab === "fitment" && (
          <FitmentDatabase
            onSelectFitmentForCalculator={handleSelectFitmentForCalculator}
            onRequestQuote={handleRequestQuoteFromFitment}
          />
        )}

        {activeTab === "calculator" && <FitmentBallastCalculator />}

        {activeTab === "bench-tools" && <ShopBenchTools />}

        {activeTab === "diagnostics" && <MasterTechAiAssistant />}

        {activeTab === "parts-exchange" && <PartsExchangeView />}

        {activeTab === "work-orders" && <WorkOrderManager />}

        {activeTab === "marketplace" && (
          <JobMarketplaceView
            jobs={jobs}
            onOpenPostJobModal={() => setIsQuoteModalOpen(true)}
            onSubmitBid={() => {}}
          />
        )}
      </main>

      {/* Direct Quote Request Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Request Quote • Full Flow Hydraulics</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  26020 62 Ave, Aldergrove, BC • Rate: $125/hr
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendDirectQuoteRequest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="e.g. Mike Johnson"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="(604) 555-0199"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                  placeholder="mike@contractor.ca"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Your Truck Details *</label>
                <input
                  type="text"
                  required
                  value={quoteVehicle}
                  onChange={(e) => setQuoteVehicle(e.target.value)}
                  placeholder="e.g. 2024 Ford F-350 Super Duty 7.3L Gas"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Plow / Hydraulic Service Desired *</label>
                <input
                  type="text"
                  required
                  value={quotePlow}
                  onChange={(e) => setQuotePlow(e.target.value)}
                  placeholder="e.g. BOSS DXT 9'2'' V-Plow Mount Install & Wiring"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Installation Notes / Timeline</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Need install completed before winter. Truck has a 2-inch leveling kit."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  Submit Quote to Full Flow Hydraulics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono font-black text-white text-sm">
                  FULL FLOW HYDRAULICS & PLOW INSTALLATIONS
                </span>
                <p className="text-[11px] text-slate-400">
                  26020 62 Ave, Aldergrove, BC V4W 1V3 • (604) 817-3783 • info@fullflowhydraulics.com
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <button
                onClick={() => setActiveTab("shop")}
                className="hover:text-amber-400 transition-colors"
              >
                3-Bay Shop
              </button>
              <button
                onClick={() => setActiveTab("fitment")}
                className="hover:text-amber-400 transition-colors"
              >
                Fitment Database
              </button>
              <button
                onClick={() => setActiveTab("calculator")}
                className="hover:text-amber-400 transition-colors"
              >
                Ballast Math
              </button>
              <button
                onClick={() => setActiveTab("bench-tools")}
                className="hover:text-amber-400 transition-colors"
              >
                Hydraulics & Welding Bench
              </button>
              <button
                onClick={() => setActiveTab("diagnostics")}
                className="hover:text-amber-400 transition-colors"
              >
                Master Tech AI
              </button>
              <button
                onClick={() => setActiveTab("parts-exchange")}
                className="hover:text-amber-400 transition-colors"
              >
                Used Equipment Stock
              </button>
              <button
                onClick={() => setActiveTab("work-orders")}
                className="hover:text-amber-400 transition-colors"
              >
                Work Orders
              </button>
            </div>
          </div>

          {/* Newsletter Signup Form */}
          <div className="py-6 border-b border-slate-900">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Full Flow Hydraulics Technical Bulletins & Storm Alerts
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
                    Fraser Valley / BC
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Subscribe for technical fitment bulletins, hydraulic fluid maintenance reminders, and winter blizzard emergency response notices in Aldergrove and Langley.
                </p>
              </div>

              {newsletterSubscribed ? (
                <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subscribed! You&apos;ll receive technical bulletins and storm updates.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto"
                >
                  <div className="relative flex-1 sm:w-72">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>
              © {new Date().getFullYear()} Full Flow Hydraulics. All Rights Reserved. 26020 62 Ave, Aldergrove, BC V4W 1V3.
            </p>
            <p className="flex items-center space-x-1">
              <span>Official Website:</span>
              <a
                href="https://plowinstallations.com/aldergrove/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline"
              >
                https://plowinstallations.com/aldergrove/
              </a>
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>
              A Division of <span className="text-slate-300">Builders Haus</span> • Powered by <span className="text-slate-300">Industry Army Marketing</span>
            </p>
            <a href="mailto:build@buildershaus.com" className="hover:text-amber-400 transition-colors">
              Guest post with us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
