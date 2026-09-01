import React, { useState } from "react";
import {
  FileSpreadsheet,
  PlusCircle,
  Clock,
  MapPin,
  Truck,
  Send,
  DollarSign,
  CheckCircle2,
  Calendar,
  Building2,
  Calculator,
  Printer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { JobListing, JobBid } from "../types";

interface JobMarketplaceViewProps {
  jobs: JobListing[];
  onOpenPostJobModal: () => void;
  onSubmitBid: (jobId: string, bid: Omit<JobBid, "id" | "submittedAt">) => void;
}

export const JobMarketplaceView: React.FC<JobMarketplaceViewProps> = ({
  jobs,
  onOpenPostJobModal,
  onSubmitBid,
}) => {
  const [selectedUrgency, setSelectedUrgency] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(jobs[0]?.id || null);

  // Quote Builder Drawer / Modal State
  const [activeQuoteJob, setActiveQuoteJob] = useState<JobListing | null>(null);
  const [quoteShopName, setQuoteShopName] = useState("My Independent Upfit Shop");
  const [quoteLaborHours, setQuoteLaborHours] = useState(8);
  const [quoteHourlyRate, setQuoteHourlyRate] = useState(115);
  const [quoteMountHardware, setQuoteMountHardware] = useState(650);
  const [quoteWiringHarness, setQuoteWiringHarness] = useState(380);
  const [quoteSuppliesMisc, setQuoteSuppliesMisc] = useState(75);
  const [quoteWarrantyMonths, setQuoteWarrantyMonths] = useState(12);
  const [quoteNotes, setQuoteNotes] = useState(
    "Includes Grade 8 mount bolt torque certs, dielectric sealed terminals, and full NHTSA headlight aim adjustment."
  );

  const filteredJobs = jobs.filter((j) => {
    const matchesUrgency = selectedUrgency === "All" || j.urgency === selectedUrgency;
    const matchesStatus = selectedStatus === "All" || j.status === selectedStatus;
    return matchesUrgency && matchesStatus;
  });

  const quoteLaborTotal = quoteLaborHours * quoteHourlyRate;
  const quotePartsTotal = quoteMountHardware + quoteWiringHarness + quoteSuppliesMisc;
  const quoteGrandTotal = quoteLaborTotal + quotePartsTotal;

  const handleSubmitQuote = () => {
    if (!activeQuoteJob) return;

    onSubmitBid(activeQuoteJob.id, {
      shopId: "shop-custom",
      shopName: quoteShopName,
      shopLocation: "Local Certified Upfitter",
      shopRating: 5.0,
      estimatedLaborHours: quoteLaborHours,
      laborTotal: quoteLaborTotal,
      partsTotal: quotePartsTotal,
      totalQuote: quoteGrandTotal,
      estimatedDaysToComplete: Math.ceil(quoteLaborHours / 8),
      notes: quoteNotes,
      includesWarrantyMonths: quoteWarrantyMonths,
    });

    setActiveQuoteJob(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Decentralized Upfit RFPs & Job Board</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Plow & Salter Installation Marketplace
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Commercial fleets, property management contractors, and vehicle owners post upfits
              and emergency swaps. Independent shops submit transparent, direct-to-customer quotes.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenPostJobModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
              id="job-post-rfp-btn"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Post Upfit Job / RFP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold mr-1">Urgency:</span>
          {["All", "Standard Pre-Season", "Urgent Before Storm", "Emergency 24hr"].map((urg) => (
            <button
              key={urg}
              onClick={() => setSelectedUrgency(urg)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedUrgency === urg
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {urg}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open for Bids</option>
            <option value="Quoted">Quoted</option>
            <option value="Awarded">Awarded</option>
          </select>
        </div>
      </div>

      {/* Job Listings Grid */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const isExpanded = expandedJobId === job.id;

          return (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-lg"
              id={`job-card-${job.id}`}
            >
              {/* Top Meta Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-mono text-amber-400 font-bold">#{job.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-medium">{job.clientName}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                    {job.clientType}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      job.urgency === "Emergency 24hr"
                        ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                        : job.urgency === "Urgent Before Storm"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {job.urgency}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                    {job.status} ({job.bids.length} quotes)
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="mt-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white hover:text-amber-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-300 font-medium">{job.vehicle}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target: {job.targetDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-[11px] text-slate-400">Budget Estimate</div>
                    <div className="text-sm font-mono font-bold text-amber-400">
                      {job.budgetRange}
                    </div>
                  </div>
                </div>

                {/* Equipment & Description */}
                <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold">Equipment to Upfit: </span>
                    <span className="text-amber-300 font-mono">{job.equipment}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{job.scopeDescription}</p>
                </div>

                {/* Existing Bids / Quotes Accordion */}
                {job.bids.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                    >
                      <span>
                        View Submitted Shop Quotes ({job.bids.length})
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2 border-t border-slate-800 pt-2.5">
                        {job.bids.map((bid) => (
                          <div
                            key={bid.id}
                            className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white">{bid.shopName}</span>
                                <span className="text-slate-400 font-mono">({bid.shopLocation})</span>
                                <span className="text-emerald-400 font-semibold text-[11px]">
                                  {bid.includesWarrantyMonths}mo warranty
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] mt-1">{bid.notes}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-sm font-mono font-black text-amber-400">
                                ${bid.totalQuote.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {bid.estimatedLaborHours} hrs labor (${bid.laborTotal}) + ${bid.partsTotal} parts
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    Posted on {job.postedDate}
                  </div>
                  <button
                    onClick={() => setActiveQuoteJob(job)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                    id={`submit-quote-btn-${job.id}`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-slate-950" />
                    <span>Build & Submit Shop Quote</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Shop Quote Builder Modal */}
      {activeQuoteJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <span>Itemized Upfit Quote Builder</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Job: {activeQuoteJob.title} (#{activeQuoteJob.id})
                </p>
              </div>
              <button
                onClick={() => setActiveQuoteJob(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Your Independent Shop / Technician Name:
                </label>
                <input
                  type="text"
                  value={quoteShopName}
                  onChange={(e) => setQuoteShopName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Labor Hours:</label>
                  <input
                    type="number"
                    value={quoteLaborHours}
                    onChange={(e) => setQuoteLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Shop Rate ($/hr):</label>
                  <input
                    type="number"
                    value={quoteHourlyRate}
                    onChange={(e) => setQuoteHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mount Kit ($):</label>
                  <input
                    type="number"
                    value={quoteMountHardware}
                    onChange={(e) => setQuoteMountHardware(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Wiring / Relays ($):</label>
                  <input
                    type="number"
                    value={quoteWiringHarness}
                    onChange={(e) => setQuoteWiringHarness(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Shop Supplies & Dielectric ($):
                  </label>
                  <input
                    type="number"
                    value={quoteSuppliesMisc}
                    onChange={(e) => setQuoteSuppliesMisc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Installation Warranty (Months):
                  </label>
                  <input
                    type="number"
                    value={quoteWarrantyMonths}
                    onChange={(e) => setQuoteWarrantyMonths(parseInt(e.target.value) || 12)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Scope & Compliance Notes:
                </label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quote Breakdown Summary Card */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Labor Subtotal ({quoteLaborHours} hrs @ ${quoteHourlyRate}/hr):</span>
                  <span className="font-mono text-slate-200 font-bold">${quoteLaborTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hardware & Harness Subtotal:</span>
                  <span className="font-mono text-slate-200 font-bold">${quotePartsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-amber-400 border-t border-slate-800 pt-2">
                  <span>Total Upfit Quote:</span>
                  <span className="font-mono">${quoteGrandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveQuoteJob(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
                id="quote-submit-final-btn"
              >
                Submit Direct Quote to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
