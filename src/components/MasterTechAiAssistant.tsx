import React, { useState } from "react";
import {
  BrainCircuit,
  Wrench,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Copy,
  Printer,
  HelpCircle,
  Cpu,
  RotateCcw,
} from "lucide-react";

const COMMON_PRESETS = [
  {
    title: "Western FleetFlex: Flashing Red Light / No CAN Communication",
    vehicle: "2024 Ford F-250 Super Duty",
    plowSystem: "Western MVP3 9'6\" V-Plow with 3-Port Isolation Module",
    issueType: "Electrical & Multiplex CAN-Bus",
    symptoms:
      "Handheld controller power light flashes red 3 times repeatedly. Blade does not respond to raise or angle commands. 12V battery shows 12.6V.",
  },
  {
    title: "Boss SmartHitch 2: Solenoid Clicks But Pump Motor Won't Spin",
    vehicle: "2022 Chevrolet Silverado 2500HD",
    plowSystem: "Boss 8'2\" Power-V XT (13-Pin Harness)",
    issueType: "Hydraulic Pump Motor & Starter Solenoid",
    symptoms:
      "When moving joystick in any direction, underhood starter solenoid makes a sharp click, but 12V hydraulic pump motor does not turn. Lights operate normally.",
  },
  {
    title: "Fisher MinuteMount 2: Left High Beam Flickers When Plow Switched",
    vehicle: "2024 RAM 2500 Heavy Duty",
    plowSystem: "Fisher XV2 Stainless V-Plow",
    issueType: "Headlight Isolation & Vehicle BCM Pulse Width",
    symptoms:
      "When engaging plow headlight switch, driver side plow high beam flickers rapidly or shuts off, throwing vehicle BCM headlight out message.",
  },
  {
    title: "SaltDogg Spreader: Auger Motor Drawing 48 Amps & Blowing In-Cab 30A Fuse",
    vehicle: "2023 Ford F-350 DRW",
    plowSystem: "SaltDogg PRO2000 2.0yd Electric Poly Hopper",
    issueType: "Spreader Motor & Dual Controller",
    symptoms:
      "Controller powers on, spinner turns freely, but when auger is engaged at dial setting 3+, controller beeps overload code and 30A in-line fuse pops within 2 seconds.",
  },
  {
    title: "Custom Undercarriage Fab for 1997 International 4700 Dump Truck",
    vehicle: "1997 International 4700 Single Axle",
    plowSystem: "10ft Heavy Duty Reversible Municipal Blade",
    issueType: "Custom Subframe Fabrication & Push Beam Geometry",
    symptoms:
      "Discontinued factory push frame. Need structural steel plate thickness, cross-member gusseting, and Grade 8 bolt sizing to attach safely to C-channel frame rails.",
  },
];

export const MasterTechAiAssistant: React.FC = () => {
  const [vehicle, setVehicle] = useState("2024 Ford F-250 Super Duty 6.7L Diesel");
  const [plowSystem, setPlowSystem] = useState("Western MVP3 9'6\" V-Plow (FleetFlex)");
  const [issueType, setIssueType] = useState("Electrical & Isolation Module");
  const [symptoms, setSymptoms] = useState(
    "Handheld controller flashes red light when ignition is switched on. No hydraulic functions work."
  );

  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDiagnose = async () => {
    setLoading(true);
    setError(null);
    setDiagnosticResult(null);

    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle,
          plowSystem,
          issueType,
          symptoms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate diagnostic plan.");
      }
      setDiagnosticResult(data.result);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with master tech diagnostic engine.");
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: (typeof COMMON_PRESETS)[0]) => {
    setVehicle(preset.vehicle);
    setPlowSystem(preset.plowSystem);
    setIssueType(preset.issueType);
    setSymptoms(preset.symptoms);
  };

  const handleCopy = () => {
    if (diagnosticResult) {
      navigator.clipboard.writeText(diagnosticResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI-Powered Master Upfitter Tech</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Master Tech Diagnostic & Wiring Assistant
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Get technician-grade multimeter pinout testing procedures, isolation module wire color
              decoding, hydraulic cartridge coil Ohms, and vehicle BCM lighting troubleshooting
              for all commercial snow and ice equipment.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-2 text-xs bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-slate-300">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Trained on Commercial Snow Upfit Standards</span>
          </div>
        </div>
      </div>

      {/* Preset Problem Scenarios */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Common Shop Diagnostic Quick-Loads:</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any scenario to auto-fill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {COMMON_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset)}
              className="text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all text-xs group"
            >
              <div className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                {preset.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {preset.vehicle} • {preset.plowSystem}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Diagnostic Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Equipment & Issue Parameters</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Vehicle Chassis & Engine:
            </label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="e.g. 2024 Ford F-350 Super Duty 6.7L Diesel"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none"
              id="ai-diag-vehicle"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Plow / Salter System Model:
            </label>
            <input
              type="text"
              value={plowSystem}
              onChange={(e) => setPlowSystem(e.target.value)}
              placeholder="e.g. Western MVP3 9.5' Stainless V-Plow with 3-Port Isolation Module"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none"
              id="ai-diag-plow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              System Category:
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none"
              id="ai-diag-category"
            >
              <option value="Electrical & Isolation Module">Electrical & Isolation Module (Headlights/Fuses/CAN-Bus)</option>
              <option value="Hydraulic Valves & Pressure Relief">Hydraulic Valves & Pressure Relief (Creep/Slow Angle/Float)</option>
              <option value="Pump Motor & Starter Solenoid">Pump Motor & Starter Solenoid (Clicking/Low Voltage/Draw)</option>
              <option value="Spreader Auger & Spinner PWM Controls">Spreader Auger & Spinner PWM Controls (Jam/Over-Amp)</option>
              <option value="Custom Subframe Fabrication & Push Beam Geometry">Custom Subframe Fabrication & Push Beam Geometry</option>
              <option value="Axle Weight & Ballast Compliance">Axle Weight & Ballast Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Observed Symptoms & Multimeter Readings:
            </label>
            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe what happens, any error lights, multimeter test voltages, or clicking sounds..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs rounded-lg p-3 focus:outline-none"
              id="ai-diag-symptoms"
            />
          </div>

          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            id="ai-diag-submit-btn"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{loading ? "Analyzing Wiring Schematics & Hydraulic Spools..." : "Generate Master Tech Diagnostic Plan"}</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                <span>Shop Diagnostic & Test Plan</span>
              </h2>

              {diagnosticResult && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copied ? "Copied!" : "Copy Report"}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Job Card</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">
                  Consulting Commercial Upfit Database...
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Cross-referencing CAN-bus multiplex tables, isolation module pinouts, and hydraulic valve coil resistance specs.
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            ) : diagnosticResult ? (
              <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-4 max-h-[600px] overflow-y-auto font-sans whitespace-pre-wrap">
                {diagnosticResult}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">
                  No Active Diagnostic Run
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select a preset above or enter your vehicle, equipment model, and observed symptoms to generate a step-by-step test plan.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Safety Rule: Always disconnect main battery negative before probing solenoid coil lugs.</span>
            <span className="font-mono text-amber-400">PlowInstallations Tech AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
