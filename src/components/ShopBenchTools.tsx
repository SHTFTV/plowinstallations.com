import React, { useState } from "react";
import {
  Cpu,
  Wrench,
  Zap,
  Sliders,
  CheckSquare,
  Printer,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { HARNESS_SYSTEMS } from "../data/mockData";
import { HarnessPin } from "../types";

export const ShopBenchTools: React.FC = () => {
  const [activeToolTab, setActiveToolTab] = useState<
    "harness" | "geometry" | "hydraulics" | "checklist"
  >("harness");

  // Harness Decoder State
  const [selectedHarnessId, setSelectedHarnessId] = useState(HARNESS_SYSTEMS[0].id);
  const [selectedPin, setSelectedPin] = useState<HarnessPin | null>(
    HARNESS_SYSTEMS[0].pins[0]
  );

  const activeHarness =
    HARNESS_SYSTEMS.find((h) => h.id === selectedHarnessId) || HARNESS_SYSTEMS[0];

  // Push Beam Geometry Simulator State
  const [measuredPushBeamHeight, setMeasuredPushBeamHeight] = useState<number>(15.0);
  const [tireDiameter, setTireDiameter] = useState<number>(33); // 31" to 37"

  // Hydraulic Truth Matrix State
  const [activeHydraulicMode, setActiveHydraulicMode] = useState<
    "raise" | "lower-float" | "angle-left" | "angle-right" | "scoop" | "vee"
  >("raise");

  // 18-Point Checklist State
  const [checklistItems, setChecklistItems] = useState<{ [key: string]: boolean }>({
    chk1: true,
    chk2: true,
    chk3: true,
    chk4: true,
    chk5: false,
    chk6: false,
    chk7: false,
    chk8: false,
  });

  const toggleChecklist = (key: string) => {
    setChecklistItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculations for Geometry Simulator
  const attackAngle = Math.round(75 + (measuredPushBeamHeight - 15.0) * 3.5);
  const isHeightIdeal = measuredPushBeamHeight >= 14.5 && measuredPushBeamHeight <= 15.5;
  const isHeightHigh = measuredPushBeamHeight > 15.5;
  const isHeightLow = measuredPushBeamHeight < 14.5;
  const dropBracketNeededInches = isHeightHigh
    ? (measuredPushBeamHeight - 15.0).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Independent Shop Bench & Tech Utilities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Shop Technical Bench & Pinout Decoders
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Pin-by-pin multimeter test procedures, push-beam attack angle simulators, hydraulic
              solenoid activation truth matrices, and printable quality certifications.
            </p>
          </div>

          {/* Sub-tool switcher tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveToolTab("harness")}
              className={`px-3 py-2 rounded-lg font-bold transition-all ${
                activeToolTab === "harness"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Harness Pinouts
            </button>
            <button
              onClick={() => setActiveToolTab("geometry")}
              className={`px-3 py-2 rounded-lg font-bold transition-all ${
                activeToolTab === "geometry"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Push Beam Simulator
            </button>
            <button
              onClick={() => setActiveToolTab("hydraulics")}
              className={`px-3 py-2 rounded-lg font-bold transition-all ${
                activeToolTab === "hydraulics"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Hydraulic Truth Matrix
            </button>
            <button
              onClick={() => setActiveToolTab("checklist")}
              className={`px-3 py-2 rounded-lg font-bold transition-all ${
                activeToolTab === "checklist"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              18-Pt Upfit Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Tool 1: Interactive Harness Pinout Decoder */}
      {activeToolTab === "harness" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Harness Selector & Pin List */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Plow Wiring System:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {HARNESS_SYSTEMS.map((sys) => (
                    <button
                      key={sys.id}
                      onClick={() => {
                        setSelectedHarnessId(sys.id);
                        setSelectedPin(sys.pins[0]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedHarnessId === sys.id
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {sys.brand} ({sys.name.split("(")[0]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Harness Info */}
            <div className="text-xs space-y-1.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="font-bold text-amber-400">{activeHarness.name}</div>
              <div className="text-slate-400 text-[11px]">Plug Type: {activeHarness.plugType}</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeHarness.description}
              </p>
            </div>

            {/* Pin Selection Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Click a Pin to Test:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeHarness.pins.map((pin, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPin(pin)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      selectedPin?.pinNumber === pin.pinNumber
                        ? "bg-amber-500/10 border-amber-500 text-white font-bold shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-mono text-amber-400 text-[11px]">
                        Pin {pin.pinNumber}
                      </div>
                      <div className="truncate text-slate-200 text-xs font-medium">
                        {pin.function}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {pin.wireColor.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Pin Detailed Bench Multimeter Guide */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
            {selectedPin ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                      Pin Detail & Multimeter Specification
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Pin {selectedPin.pinNumber} - {selectedPin.function}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 font-bold">
                    {selectedPin.gauge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Wire Color Code:</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedPin.wireColor}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Expected Test Voltage:</span>
                    <span className="font-mono font-bold text-amber-400 mt-0.5 block">
                      {selectedPin.typicalVoltage}
                    </span>
                  </div>
                </div>

                {/* Multimeter Procedure */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Multimeter Step-by-Step Test Procedure</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedPin.testProcedure}
                  </p>
                </div>

                {/* Known Pitfalls */}
                <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Common Failure Mode for this Circuit</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {activeHarness.commonIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Select a pin on the left to view exact test procedures.
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Weather-Pack seal inspection: Always apply dielectric grease prior to reconnecting.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: Push Beam Height & Attack Angle Simulator */}
      {activeToolTab === "geometry" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Push Beam Height & Attack Angle Simulator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure proper blade trip geometry, cutting edge wear, and snow roll velocity.
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono ${
                isHeightIdeal
                  ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                  : "bg-amber-950 border-amber-700 text-amber-300"
              }`}
            >
              {isHeightIdeal ? "IDEAL 14.5\"-15.5\" GEOMETRY" : `CORRECTION: ${dropBracketNeededInches}" DROP`}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">
                  Measured Ground to Center of Pin Hole:
                </span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {measuredPushBeamHeight.toFixed(1)} Inches
                </span>
              </div>
              <input
                type="range"
                min="12.0"
                max="20.0"
                step="0.25"
                value={measuredPushBeamHeight}
                onChange={(e) => setMeasuredPushBeamHeight(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>12.0&quot; (Too Low)</span>
                <span className="text-emerald-400 font-bold">14.5&quot; - 15.5&quot; (Target)</span>
                <span>20.0&quot; (Lifted Truck)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">Tire Outer Diameter:</span>
                <span className="font-mono font-black text-slate-200 text-sm">{tireDiameter}&quot; Tires</span>
              </div>
              <input
                type="range"
                min="31"
                max="38"
                step="1"
                value={tireDiameter}
                onChange={(e) => setTireDiameter(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>31.5&quot; OEM</span>
                <span>33&quot; Heavy Duty</span>
                <span>35&quot; Leveled</span>
                <span>37&quot; Lifted</span>
              </div>
            </div>
          </div>

          {/* Visual Geometry Representation */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Calculated Blade Attack Angle</span>
                <span className="text-2xl font-black font-mono text-white mt-1 block">
                  {attackAngle}°
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: 75° to 80° (Clean snow rolling)
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Blade Trip Spring Physics</span>
                <span className="text-lg font-bold text-slate-200 mt-1 block">
                  {isHeightHigh ? "Warning: Stiff/Binding" : isHeightLow ? "Premature Tripping" : "Full Dynamic Float"}
                </span>
                <span className="text-[11px] text-slate-400">
                  Protects truck frame from manhole impacts
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Cutting Edge Wear Pattern</span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">
                  {isHeightHigh ? "Heel Scraping (Fast Wear)" : isHeightLow ? "Toe Gouging" : "Uniform Flat Contact"}
                </span>
                <span className="text-[11px] text-slate-400">
                  Maximizes carbide/steel edge lifespan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Hydraulic Solenoid Activation Truth Matrix */}
      {activeToolTab === "hydraulics" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Hydraulic Solenoid Valve & Cartridge Truth Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any motion command to simulate coil activation and hydraulic flow routing.
            </p>
          </div>

          {/* Command Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "raise", label: "Raise / Lift Blade" },
              { id: "lower-float", label: "Lower / Float Detent" },
              { id: "angle-left", label: "Angle Left (Straight/V)" },
              { id: "angle-right", label: "Angle Right (Straight/V)" },
              { id: "scoop", label: "V-Plow Scoop Mode" },
              { id: "vee", label: "V-Plow Vee Mode" },
            ].map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => setActiveHydraulicMode(cmd.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeHydraulicMode === cmd.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cmd.label}
              </button>
            ))}
          </div>

          {/* Truth Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-3">Component / Solenoid</th>
                  <th className="p-3">Western / Fisher</th>
                  <th className="p-3">Boss SmartHitch 2</th>
                  <th className="p-3">Meyer EZ-Plus</th>
                  <th className="p-3">State in &quot;{activeHydraulicMode.toUpperCase()}&quot;</th>
                  <th className="p-3">Coil Ohms Spec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">12V DC Pump Motor</td>
                  <td className="p-3 text-slate-300">Starter Solenoid Lug</td>
                  <td className="p-3 text-slate-300">White Wire Relay</td>
                  <td className="p-3 text-slate-300">Starter Relay</td>
                  <td className="p-3">
                    {activeHydraulicMode === "lower-float" ? (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold">
                        OFF (Gravity)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                        ON (160A Draw)
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-400">&lt; 0.1 Ω</td>
                </tr>

                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">Valve A / S1 (Drop/Float)</td>
                  <td className="p-3 text-slate-300">S1 Cartridge</td>
                  <td className="p-3 text-slate-300">Valve B (Yellow)</td>
                  <td className="p-3 text-slate-300">A-Coil (Black/White)</td>
                  <td className="p-3">
                    {activeHydraulicMode === "lower-float" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold">
                        ENERGIZED (+12V)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">De-energized</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-300">7.5 - 9.0 Ω</td>
                </tr>

                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">Valve B / S2 (Lift)</td>
                  <td className="p-3 text-slate-300">S2 Cartridge</td>
                  <td className="p-3 text-slate-300">Valve A (Green)</td>
                  <td className="p-3 text-slate-300">B-Coil (Red/White)</td>
                  <td className="p-3">
                    {activeHydraulicMode === "raise" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold">
                        ENERGIZED (+12V)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">De-energized</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-300">7.5 - 9.0 Ω</td>
                </tr>

                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">Valve C / S3 (Angle / Wing)</td>
                  <td className="p-3 text-slate-300">S3 Cartridge</td>
                  <td className="p-3 text-slate-300">Valve C (Blue)</td>
                  <td className="p-3 text-slate-300">C-Coil (Green/White)</td>
                  <td className="p-3">
                    {activeHydraulicMode === "angle-left" || activeHydraulicMode === "scoop" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold">
                        ENERGIZED (+12V)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">De-energized</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-300">7.5 - 9.0 Ω</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tool 4: 18-Point Pre-Delivery & Storm Quality Checklist */}
      {activeToolTab === "checklist" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <span>18-Point Upfit Quality & Storm-Ready Inspection Sheet</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify torque specs, dielectric sealing, hydraulic bleed, and headlight aim for warranty certification.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Print Inspection Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                id: "chk1",
                category: "Mount Hardware & Undercarriage",
                label: "All 1/2\" Grade 8 frame bolts torqued to 119 ft-lbs / 5/8\" bolts to 230 ft-lbs with hardened washers.",
              },
              {
                id: "chk2",
                category: "Mount Hardware & Undercarriage",
                label: "Push beam center height measured between 14.5\" and 15.5\" from level shop floor.",
              },
              {
                id: "chk3",
                category: "Electrical & Lighting",
                label: "Dielectric silicone grease generously packed on all male & female harness pins and module ports.",
              },
              {
                id: "chk4",
                category: "Electrical & Lighting",
                label: "NHTSA 25-ft headlight aiming alignment verified on shop alignment wall for both low & high beams.",
              },
              {
                id: "chk5",
                category: "Electrical & Lighting",
                label: "Vehicle headlight cutoff relay flips cleanly with no flicker or vehicle BCM fault codes.",
              },
              {
                id: "chk6",
                category: "Hydraulics & Controls",
                label: "Hydraulic reservoir filled to fill mark with genuine low-temp (-40°F) snow plow fluid.",
              },
              {
                id: "chk7",
                category: "Hydraulics & Controls",
                label: "Cylinders cycled 10 times to purge trapped air from angling and lift circuits.",
              },
              {
                id: "chk8",
                category: "Axle Weight & Ballast",
                label: "Required rear ballast lbs loaded against tailgate and secured with ratchet straps.",
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  checklistItems[item.id]
                    ? "bg-slate-950 border-emerald-600/60 text-white"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checklistItems[item.id]}
                  onChange={() => {}}
                  className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <span className="text-xs font-medium leading-relaxed block mt-0.5">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
