import React, { useState, useMemo } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Zap,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  Info,
  Truck,
  RotateCcw,
} from "lucide-react";
import { VehicleSpec, PlowBladeSpec, SpreaderSpec } from "../types";
import { VEHICLE_DATABASE, PLOW_CATALOG, SPREADER_CATALOG } from "../data/mockData";

interface FitmentBallastCalculatorProps {
  onTransferToWorkOrder?: (data: any) => void;
}

export const FitmentBallastCalculator: React.FC<FitmentBallastCalculatorProps> = ({
  onTransferToWorkOrder,
}) => {
  // Vehicle Selection State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(VEHICLE_DATABASE[0].id);
  const [selectedPlowId, setSelectedPlowId] = useState<string>(PLOW_CATALOG[0].id);
  const [selectedSpreaderId, setSelectedSpreaderId] = useState<string>("none");

  // Custom adjustments for lifted/leveled trucks
  const [suspensionLiftInches, setSuspensionLiftInches] = useState<number>(0);
  const [driverPassengerWeightLbs, setDriverPassengerWeightLbs] = useState<number>(200);

  // AI Fitment Advisor State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Selected specs lookup
  const vehicle = useMemo(
    () => VEHICLE_DATABASE.find((v) => v.id === selectedVehicleId) || VEHICLE_DATABASE[0],
    [selectedVehicleId]
  );

  const plow = useMemo(
    () => PLOW_CATALOG.find((p) => p.id === selectedPlowId) || PLOW_CATALOG[0],
    [selectedPlowId]
  );

  const spreader = useMemo(
    () => SPREADER_CATALOG.find((s) => s.id === selectedSpreaderId) || null,
    [selectedSpreaderId]
  );

  // Physical calculations
  const calculation = useMemo(() => {
    const totalPlowWetWeight = plow.weightLbs + 120; // blade + mount undercarriage + hydraulics
    const overhang = vehicle.frontOverhangInches;
    const wheelbase = vehicle.wheelbaseInches;

    // Load transferred to front axle from cantilevered plow
    const frontAxlePlowLoad = totalPlowWetWeight * (1 + overhang / wheelbase);
    const rearAxlePlowUnload = totalPlowWetWeight * (overhang / wheelbase);

    // Baseline front axle load (approx 56% curb weight + diesel bonus + driver share)
    const baseFrontAxleWeight =
      vehicle.curbWeightLbs * 0.56 + vehicle.engineWeightBonusLbs + driverPassengerWeightLbs * 0.6;
    const totalFrontAxleLoad = baseFrontAxleWeight + frontAxlePlowLoad;
    const frontAxleCapacityRemaining = vehicle.fgawrLbs - totalFrontAxleLoad;
    const isFrontOverloaded = frontAxleCapacityRemaining < 0;

    // Ballast requirement math (distance behind rear axle ~ bedLengthFt * 12 * 0.75)
    const distRearAxleToBallast = vehicle.bedLengthFt * 12 * 0.75;
    const requiredBallastLbs = Math.max(
      0,
      Math.round(
        (totalPlowWetWeight * (overhang + wheelbase)) / (distRearAxleToBallast + wheelbase) * 0.85
      )
    );

    // Spreader weight effect if installed
    const spreaderDryWeight = spreader ? spreader.dryWeightLbs : 0;
    const ballastAccounted = spreaderDryWeight >= requiredBallastLbs;
    const netAdditionalBallastNeeded = Math.max(0, requiredBallastLbs - spreaderDryWeight);

    // Push beam height calculation
    const baseRideHeight = 14.75;
    const actualPushBeamHeight = baseRideHeight + suspensionLiftInches;
    const pushBeamIdealMin = 14.5;
    const pushBeamIdealMax = 15.5;
    const needsDropBracket = actualPushBeamHeight > pushBeamIdealMax;
    const dropPlateCorrectionInches = needsDropBracket
      ? Math.round((actualPushBeamHeight - 15.0) * 2) / 2
      : 0;

    // Electrical safety evaluation
    const alternatorOk = vehicle.alternatorAmps >= 200;
    const dualBatteryOk = vehicle.hasDualBatteries;

    return {
      totalPlowWetWeight,
      frontAxlePlowLoad: Math.round(frontAxlePlowLoad),
      rearAxlePlowUnload: Math.round(rearAxlePlowUnload),
      totalFrontAxleLoad: Math.round(totalFrontAxleLoad),
      frontAxleCapacityRemaining: Math.round(frontAxleCapacityRemaining),
      isFrontOverloaded,
      requiredBallastLbs,
      spreaderDryWeight,
      ballastAccounted,
      netAdditionalBallastNeeded,
      actualPushBeamHeight,
      pushBeamIdealMin,
      pushBeamIdealMax,
      needsDropBracket,
      dropPlateCorrectionInches,
      alternatorOk,
      dualBatteryOk,
    };
  }, [vehicle, plow, spreader, suspensionLiftInches, driverPassengerWeightLbs]);

  // Handler: Ask AI Fitment Advisor
  const handleGetAiAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);

    try {
      const response = await fetch("/api/ai/fitment-advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleYear: vehicle.year,
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          trim: `${vehicle.trim} (${vehicle.engine})`,
          plowModel: `${plow.brand} ${plow.model} (${plow.weightLbs} lbs)`,
          spreaderModel: spreader ? `${spreader.brand} ${spreader.model}` : "Standard Bed Ballast",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate fitment advisory.");
      }
      setAiAnalysis(data.result);
    } catch (err: any) {
      setAiError(err.message || "Could not reach fitment advisory engine.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title / Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Commercial Axle Load & Geometry Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Vehicle & Plow Fitment Matchmaker + Ballast Calculator
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Calculate exact Front Axle Gross Weight (FGAWR) safety limits, cantilevered blade
              overhang loads, required counter-ballast behind the rear axle, and push-beam drop plate
              corrections for leveled or lifted trucks.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              id="calc-print-btn"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Spec Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Step 1: Select Vehicle Platform */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <span>Vehicle Chassis Platform</span>
            </h2>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Select Truck / Chassis:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
              id="calc-vehicle-select"
            >
              {VEHICLE_DATABASE.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model} - {v.engine}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle specs preview card */}
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Front GAWR (FGAWR):</span>
              <span className="font-mono font-bold text-amber-400">{vehicle.fgawrLbs.toLocaleString()} lbs</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Rear GAWR (RGAWR):</span>
              <span className="font-mono font-bold text-slate-200">{vehicle.rgawrLbs.toLocaleString()} lbs</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Wheelbase / Overhang:</span>
              <span className="font-mono text-slate-200">{vehicle.wheelbaseInches}&quot; / {vehicle.frontOverhangInches}&quot;</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Alternator / Dual Batts:</span>
              <span className="font-mono text-slate-200">
                {vehicle.alternatorAmps}A / {vehicle.hasDualBatteries ? "Dual Batts" : "Single Batt"}
              </span>
            </div>
          </div>

          {/* Suspension Lift Adjustment */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold">Aftermarket Lift / Leveling Kit:</span>
              <span className="font-mono font-bold text-amber-400">+{suspensionLiftInches}&quot; Lift</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={suspensionLiftInches}
              onChange={(e) => setSuspensionLiftInches(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
              id="calc-lift-slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Stock (0&quot;)</span>
              <span>2.5&quot; Leveling</span>
              <span>4&quot; Suspension</span>
              <span>6&quot; Extreme</span>
            </div>
          </div>
        </div>

        {/* Step 2: Select Plow Equipment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                2
              </span>
              <span>Plow Blade Model</span>
            </h2>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Select Blade System:
            </label>
            <select
              value={selectedPlowId}
              onChange={(e) => setSelectedPlowId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
              id="calc-plow-select"
            >
              {PLOW_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.model} ({p.weightLbs} lbs) - {p.type}
                </option>
              ))}
            </select>
          </div>

          {/* Plow specs card */}
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Blade Wet Weight:</span>
              <span className="font-mono font-bold text-amber-400">{plow.weightLbs} lbs</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Blade Type & Width:</span>
              <span className="font-mono text-slate-200">{plow.type} ({plow.widthFt} ft)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Hydraulic Relief Pressure:</span>
              <span className="font-mono text-slate-200">{plow.hydraulicReliefPsi} PSI</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Electrical Architecture:</span>
              <span className="font-mono text-amber-300 truncate max-w-[180px]">{plow.electricalSystem}</span>
            </div>
          </div>
        </div>

        {/* Step 3: Rear Spreader / Salter */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <span>Rear Salter / Spreader</span>
            </h2>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Select Rear Salter (Optional):
            </label>
            <select
              value={selectedSpreaderId}
              onChange={(e) => setSelectedSpreaderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
              id="calc-spreader-select"
            >
              <option value="none">No Spreader (Loose Ballast Bags Only)</option>
              {SPREADER_CATALOG.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.brand} {s.model} ({s.dryWeightLbs} lbs dry)
                </option>
              ))}
            </select>
          </div>

          {spreader ? (
            <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Spreader Dry Weight:</span>
                <span className="font-mono font-bold text-amber-400">{spreader.dryWeightLbs} lbs</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Capacity & Material:</span>
                <span className="font-mono text-slate-200">{spreader.capacityCuYd} cu yd ({spreader.material})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Full Salt Load (est):</span>
                <span className="font-mono text-emerald-400">
                  +{Math.round(spreader.capacityCuYd * 2100)} lbs (Salt @ 78 lb/cu ft)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/40 rounded-lg p-4 border border-dashed border-slate-800 text-xs text-slate-400 text-center">
              No spreader selected. Solid ballast sand bags or solid concrete blocks placed against tailgate will be calculated.
            </div>
          )}
        </div>
      </div>

      {/* Real-time Calculation Diagnostic Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>Engineering Weight Distribution & Compliance Results</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculated for {vehicle.year} {vehicle.make} {vehicle.model} + {plow.brand} {plow.model}
            </p>
          </div>

          <button
            onClick={handleGetAiAnalysis}
            disabled={aiLoading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            id="calc-ai-advise-btn"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{aiLoading ? "Consulting AI Engine..." : "Get AI Master Tech Fitment Report"}</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Front Axle GAWR Safety */}
          <div
            className={`p-4 rounded-xl border ${
              calculation.isFrontOverloaded
                ? "bg-red-950/40 border-red-800 text-red-200"
                : "bg-slate-950 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Front Axle Load (FGAWR):</span>
              {calculation.isFrontOverloaded ? (
                <span className="px-2 py-0.5 rounded bg-red-900 text-red-200 text-[10px] font-bold">
                  OVERLOAD WARNING
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                  COMPLIANT PASS
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">
                {calculation.totalFrontAxleLoad.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ {vehicle.fgawrLbs.toLocaleString()} lbs Max</span>
            </div>
            <div className="mt-2 text-xs">
              {calculation.isFrontOverloaded ? (
                <p className="text-red-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Exceeds FGAWR by {Math.abs(calculation.frontAxleCapacityRemaining)} lbs! Counter-ballast required.</span>
                </p>
              ) : (
                <p className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{calculation.frontAxleCapacityRemaining} lbs safety margin available.</span>
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Required Tailgate Ballast */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Required Rear Ballast:</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-bold">
                MANDATORY
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-amber-400">
                {calculation.requiredBallastLbs.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">lbs behind rear axle</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {spreader ? (
                calculation.ballastAccounted ? (
                  <span className="text-emerald-400">
                    ✓ Spreader dry weight ({calculation.spreaderDryWeight} lbs) satisfies minimum counter-ballast.
                  </span>
                ) : (
                  <span>
                    Spreader provides {calculation.spreaderDryWeight} lbs. Add {calculation.netAdditionalBallastNeeded} lbs supplemental sandbags.
                  </span>
                )
              ) : (
                <span>Position securely against tailgate to maintain 50% steer traction.</span>
              )}
            </p>
          </div>

          {/* Card 3: Push Beam Height & Drop Plate */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Push Beam Height:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  calculation.needsDropBracket
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "bg-emerald-950 text-emerald-400"
                }`}
              >
                {calculation.needsDropBracket ? "DROP PLATE NEEDED" : "IDEAL TARGET"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">
                {calculation.actualPushBeamHeight.toFixed(1)}&quot;
              </span>
              <span className="text-xs text-slate-400">Target: 14.5&quot; - 15.5&quot;</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {calculation.needsDropBracket ? (
                <span className="text-amber-300 font-semibold">
                  Requires {calculation.dropPlateCorrectionInches}&quot; drop plate shim so blade trips safely.
                </span>
              ) : (
                <span className="text-emerald-400">
                  Standard factory mount height delivers ideal 75°-80° blade attack angle.
                </span>
              )}
            </p>
          </div>

          {/* Card 4: Electrical & Alternator Reserve */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Electrical Reserve:</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">
                {vehicle.alternatorAmps}A
              </span>
              <span className="text-xs text-slate-400">Alternator / {vehicle.hasDualBatteries ? "Dual" : "Single"} Batt</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {calculation.alternatorOk ? (
                <span className="text-emerald-400">
                  Sufficient reserve for peak 180A hydraulic angling draw.
                </span>
              ) : (
                <span className="text-amber-400">
                  Single small battery may suffer voltage drop. Dual battery isolator kit suggested.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* AI Advisory Box */}
        {aiAnalysis && (
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl p-5 sm:p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Master Tech Fitment & Upfit Specification Report</span>
              </div>
              <button
                onClick={() => setAiAnalysis(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap font-sans bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              {aiAnalysis}
            </div>
          </div>
        )}

        {aiError && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{aiError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
