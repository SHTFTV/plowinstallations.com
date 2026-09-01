import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Truck,
  Wrench,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Zap,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Flame,
  PlusCircle,
  X,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { TRUCK_FITMENT_DATABASE } from "../data/brandsAndFitmentData";
import { TruckPlowFitment, CompatiblePlowOption } from "../types";

interface FitmentDatabaseProps {
  onSelectFitmentForCalculator?: (truck: TruckPlowFitment, plow: CompatiblePlowOption) => void;
  onRequestQuote?: (vehicleName: string, plowName: string, notes?: string) => void;
}

export const FitmentDatabase: React.FC<FitmentDatabaseProps> = ({
  onSelectFitmentForCalculator,
  onRequestQuote,
}) => {
  // Filter state
  const [selectedMake, setSelectedMake] = useState<string>("All");
  const [selectedModel, setSelectedModel] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal for adding custom shop fitment spec
  const [isAddFitmentOpen, setIsAddFitmentOpen] = useState<boolean>(false);
  const [customFitments, setCustomFitments] = useState<TruckPlowFitment[]>([]);

  // Form for custom fitment
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYearRange, setNewYearRange] = useState("2020 - 2026");
  const [newPlowBrand, setNewPlowBrand] = useState("BOSS");
  const [newPlowModel, setNewPlowModel] = useState("");
  const [newPlowType, setNewPlowType] = useState<CompatiblePlowOption["plowType"]>("V-Plow");
  const [newMountPart, setNewMountPart] = useState("");
  const [newHarnessPart, setNewHarnessPart] = useState("");
  const [newBallastLbs, setNewBallastLbs] = useState<number>(450);
  const [newEstHours, setNewEstHours] = useState<number>(3.5);
  const [newNotes, setNewNotes] = useState("");

  const allFitments = useMemo(() => {
    return [...customFitments, ...TRUCK_FITMENT_DATABASE];
  }, [customFitments]);

  // Extract distinct makes
  const distinctMakes = useMemo(() => {
    const makes = Array.from(new Set(allFitments.map((f) => f.make))).sort();
    return ["All", ...makes];
  }, [allFitments]);

  // Extract distinct models based on selected make
  const distinctModels = useMemo(() => {
    let filtered = allFitments;
    if (selectedMake !== "All") {
      filtered = filtered.filter((f) => f.make === selectedMake);
    }
    const models = Array.from(new Set(filtered.map((f) => f.model))).sort();
    return ["All", ...models];
  }, [allFitments, selectedMake]);

  // Distinct plow brands
  const distinctBrands = useMemo(() => {
    const brands = new Set<string>();
    allFitments.forEach((f) => {
      f.compatiblePlows.forEach((p) => brands.add(p.brand));
    });
    return ["All", ...Array.from(brands).sort()];
  }, [allFitments]);

  // Filtered results
  const filteredFitments = useMemo(() => {
    return allFitments
      .map((fitment) => {
        // Match truck level filters
        if (selectedMake !== "All" && fitment.make !== selectedMake) return null;
        if (selectedModel !== "All" && fitment.model !== selectedModel) return null;

        // Filter compatible plows
        const matchingPlows = fitment.compatiblePlows.filter((plow) => {
          if (selectedBrand !== "All" && plow.brand !== selectedBrand) return false;
          if (selectedType !== "All" && plow.plowType !== selectedType) return false;
          if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            const truckMatch = `${fitment.make} ${fitment.model} ${fitment.yearRange}`.toLowerCase().includes(q);
            const plowMatch = `${plow.brand} ${plow.model} ${plow.mountKitPart} ${plow.notes}`.toLowerCase().includes(q);
            if (!truckMatch && !plowMatch) return false;
          }
          return true;
        });

        if (matchingPlows.length === 0) return null;

        return {
          ...fitment,
          compatiblePlows: matchingPlows,
        };
      })
      .filter((f): f is TruckPlowFitment => f !== null);
  }, [allFitments, selectedMake, selectedModel, selectedBrand, selectedType, searchQuery]);

  // Total count of matching configurations
  const totalMatchingPlows = useMemo(() => {
    return filteredFitments.reduce((acc, curr) => acc + curr.compatiblePlows.length, 0);
  }, [filteredFitments]);

  const handleResetFilters = () => {
    setSelectedMake("All");
    setSelectedModel("All");
    setSelectedYear("All");
    setSelectedBrand("All");
    setSelectedType("All");
    setSearchQuery("");
  };

  const handleAddCustomFitmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMake || !newModel || !newPlowModel || !newMountPart) return;

    const newFitmentRecord: TruckPlowFitment = {
      id: `custom-fitment-${Date.now()}`,
      make: newMake,
      model: newModel,
      yearRange: newYearRange,
      yearMin: 2020,
      yearMax: 2026,
      cabTypes: ["All Cabs"],
      bedLengths: ["Standard Bed"],
      engineOptions: ["Standard Gas / Diesel"],
      gvwrLbs: 9900,
      frontGawrLbs: 4800,
      plowPrepPackageCode: "Shop Custom Fabrication / Direct Fit",
      plowPrepDescription: "Verified by Full Flow Hydraulics 3-bay technical shop in Aldergrove, BC.",
      compatiblePlows: [
        {
          brand: newPlowBrand as any,
          model: newPlowModel,
          plowType: newPlowType,
          bladeWidthFt: 8.5,
          weightLbs: 850,
          mountKitPart: newMountPart,
          lightingHarnessPart: newHarnessPart || "Multiplex Adapter",
          controllerType: "Handheld In-Cab Joystick",
          minBallastRequiredLbs: newBallastLbs,
          estLaborHours: newEstHours,
          fitmentLevel: "Direct Bolt-On",
          notes: newNotes || "Custom shop verified installation at 26020 62 Ave, Aldergrove.",
        },
      ],
    };

    setCustomFitments([newFitmentRecord, ...customFitments]);
    setIsAddFitmentOpen(false);
    // Reset form
    setNewMake("");
    setNewModel("");
    setNewPlowModel("");
    setNewMountPart("");
    setNewHarnessPart("");
    setNewNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Flow Hydraulics Compatibility Engine • Aldergrove, BC</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Truck-to-Plow <span className="text-amber-400">Fitment & Mount Database</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
              Find guaranteed direct bolt-on mounts, lighting harnesses, controller looms, and ballast specifications for your truck. Verified by our 3-bay commercial shop at <strong>26020 62 Ave, Aldergrove, BC</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5 text-amber-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>BOSS, Western, Fisher, SnowEx, Sno-Way & Meyer</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OEM Undercarriage Part Numbers</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>In-Bay Aldergrove Installation Available</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <a
              href="tel:6048173783"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Call (604) 817-3783</span>
            </a>
            <button
              onClick={() => setIsAddFitmentOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Custom Fitment Spec</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Sidebar & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end">
          {/* Search bar */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Search Vehicle, Mount Part #, or Plow
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. F-250, LTA09000B, MVP3, 31268-1..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Make Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Truck Make</label>
            <select
              value={selectedMake}
              onChange={(e) => {
                setSelectedMake(e.target.value);
                setSelectedModel("All");
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {distinctMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Truck Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {distinctModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Plow Brand Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Plow Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {distinctBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Blade Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Blade Category</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Blade Types</option>
              <option value="Straight Blade">Straight Blade</option>
              <option value="V-Plow">V-Plow</option>
              <option value="Wide-Out / Expandable">Expandable Wing / Wide-Out</option>
              <option value="Heavy Municipal / Wing">Heavy Municipal / Highway</option>
            </select>
          </div>
        </div>

        {/* Results summary & Active pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="font-bold text-amber-400">{filteredFitments.length}</span>
            <span>Vehicle Chassis Groups</span>
            <span className="text-slate-500">•</span>
            <span className="font-bold text-emerald-400">{totalMatchingPlows}</span>
            <span>Compatible Plow Options Found</span>
          </div>

          {(selectedMake !== "All" ||
            selectedModel !== "All" ||
            selectedBrand !== "All" ||
            selectedType !== "All" ||
            searchQuery !== "") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Container */}
      {filteredFitments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
          <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Vehicle Fitments Matched</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            We couldn't find a direct database match for this specific filter set. Our Aldergrove shop specializes in custom welding and fabrication for any custom truck or lifted vehicle.
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Clear Filters
            </button>
            <a
              href="tel:6048173783"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Shop Tech: (604) 817-3783</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFitments.map((fitment) => (
            <div
              key={fitment.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Truck Header Bar */}
              <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg md:text-xl font-black text-white">
                        {fitment.make} {fitment.model}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono text-xs font-bold border border-slate-700">
                        {fitment.yearRange}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                      <span>GVWR: <strong className="text-slate-200">{fitment.gvwrLbs.toLocaleString()} lbs</strong></span>
                      <span>•</span>
                      <span>Front GAWR: <strong className="text-slate-200">{fitment.frontGawrLbs.toLocaleString()} lbs</strong></span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{fitment.plowPrepPackageCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                    <strong className="text-amber-400">{fitment.compatiblePlows.length}</strong> compatible models
                  </span>
                </div>
              </div>

              {/* Compatible Plows Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fitment.compatiblePlows.map((plow, idx) => (
                  <div
                    key={`${fitment.id}-plow-${idx}`}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4.5 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Top Brand & Type Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                          {plow.brand}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {plow.plowType}
                        </span>
                      </div>

                      {/* Model Title */}
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {plow.model}
                      </h3>

                      {/* Technical Mount & Harness Details */}
                      <div className="mt-3 space-y-2 text-xs border-t border-slate-800/80 pt-3">
                        <div className="flex items-start justify-between">
                          <span className="text-slate-400 font-medium">Mount Undercarriage:</span>
                          <span className="font-mono font-bold text-amber-300 text-right">
                            {plow.mountKitPart}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-slate-400 font-medium">Lighting Harness:</span>
                          <span className="font-mono text-slate-300 text-right">
                            {plow.lightingHarnessPart}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-slate-400 font-medium">In-Cab Controller:</span>
                          <span className="text-slate-300 text-right">{plow.controllerType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Min. Bed Ballast:</span>
                          <span className="font-bold text-emerald-400">{plow.minBallastRequiredLbs} lbs</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Aldergrove Bay Labor:</span>
                          <span className="font-mono text-slate-300">{plow.estLaborHours} hrs est.</span>
                        </div>
                      </div>

                      {/* Notes snippet */}
                      {plow.notes && (
                        <p className="mt-3 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                          <Info className="w-3 h-3 text-amber-400 inline mr-1" />
                          {plow.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          if (onSelectFitmentForCalculator) {
                            onSelectFitmentForCalculator(fitment, plow);
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
                        title="Calculate Front Axle Weight & Ballast in Physics Calculator"
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ballast Math</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onRequestQuote) {
                            onRequestQuote(
                              `${fitment.make} ${fitment.model} (${fitment.yearRange})`,
                              `${plow.brand} - ${plow.model} (Mount: ${plow.mountKitPart})`,
                              `Customer requested installation quote at Full Flow Hydraulics 3-bay Aldergrove shop. Estimated labor: ${plow.estLaborHours} hrs.`
                            );
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/10"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Aldergrove Bay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Fitment Modal */}
      <AnimatePresence>
        {isAddFitmentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Add Custom Vehicle Fitment Spec</h3>
                </div>
                <button
                  onClick={() => setIsAddFitmentOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomFitmentSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Make *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ford, Ram, GMC"
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Model *</label>
                    <input
                      type="text"
                      placeholder="e.g. F-450 Super Duty"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Year Range</label>
                    <input
                      type="text"
                      value={newYearRange}
                      onChange={(e) => setNewYearRange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Plow Brand *</label>
                    <select
                      value={newPlowBrand}
                      onChange={(e) => setNewPlowBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="BOSS">BOSS</option>
                      <option value="Western">Western</option>
                      <option value="Fisher">Fisher</option>
                      <option value="SnowEx">SnowEx</option>
                      <option value="Sno-Way">Sno-Way</option>
                      <option value="Meyer">Meyer</option>
                      <option value="Arctic">Arctic</option>
                      <option value="Metal Pless">Metal Pless</option>
                      <option value="Custom / Multi-Brand">Custom Fab</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Plow Blade Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. BOSS DXT 9'2'' Dual-Trip V-Plow"
                    value={newPlowModel}
                    onChange={(e) => setNewPlowModel(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mount Kit Part # *</label>
                    <input
                      type="text"
                      placeholder="e.g. BOSS LTA09000B"
                      value={newMountPart}
                      onChange={(e) => setNewMountPart(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Lighting Harness Part #</label>
                    <input
                      type="text"
                      placeholder="e.g. MSC09991 13-Pin"
                      value={newHarnessPart}
                      onChange={(e) => setNewHarnessPart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Min. Ballast (lbs)</label>
                    <input
                      type="number"
                      value={newBallastLbs}
                      onChange={(e) => setNewBallastLbs(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Labor Time (hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newEstHours}
                      onChange={(e) => setNewEstHours(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Shop Installation Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Requires custom drop-plate for 4-inch lift kit. In-house steel welding recommended."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFitmentOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                  >
                    Save Fitment Spec
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
