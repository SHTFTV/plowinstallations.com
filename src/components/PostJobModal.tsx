import React, { useState } from "react";
import { PlusCircle, FileSpreadsheet, Truck, MapPin, DollarSign, Calendar } from "lucide-react";
import { JobListing } from "../types";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostJob: (job: JobListing) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onPostJob }) => {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState<JobListing["clientType"]>("Commercial Contractor");
  const [vehicle, setVehicle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [location, setLocation] = useState("");
  const [budgetRange, setBudgetRange] = useState("$800 - $1,400");
  const [targetDate, setTargetDate] = useState("Within 2 Weeks");
  const [urgency, setUrgency] = useState<JobListing["urgency"]>("Standard Pre-Season");
  const [scopeDescription, setScopeDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName || !vehicle || !equipment) return;

    const newJob: JobListing = {
      id: `job-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      clientName,
      clientType,
      vehicle,
      equipment,
      location: location || "Local Metro",
      state: "US",
      postedDate: new Date().toISOString().split("T")[0],
      targetDate,
      budgetRange,
      urgency,
      scopeDescription:
        scopeDescription ||
        "Professional installation and wiring required. Must test all lighting and hydraulic functions prior to signoff.",
      status: "Open",
      bidsCount: 0,
      bids: [],
    };

    onPostJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <span>Post Upfit RFP or Installation Request</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Broadcast your job to independent local shops and receive transparent quotes.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Job Headline / Title:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Install: 2024 F-250 with Western 8.5ft V-Plow & Tailgate Spreader"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Your Name / Company:</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Apex Commercial Snow"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Account Type:</label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Commercial Contractor">Commercial Contractor</option>
                <option value="Municipal Fleet">Municipal Fleet</option>
                <option value="Landscaper">Landscaper</option>
                <option value="Private Owner">Private Owner</option>
                <option value="Dealership">Dealership</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Vehicle Details:</label>
              <input
                type="text"
                required
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="2024 Ford F-350 Diesel Crew Cab"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Equipment to Install:</label>
              <input
                type="text"
                required
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Boss 9'2' D-VXT + TGS 1100 Spreader"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Location / Metro:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cleveland, OH"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Budget Target:</label>
              <input
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="$1,000 - $1,500"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Timeline / Urgency:</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Standard Pre-Season">Standard Pre-Season</option>
                <option value="Urgent Before Storm">Urgent Before Storm</option>
                <option value="Emergency 24hr">Emergency 24hr</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Detailed Scope & Specific Requirements:
            </label>
            <textarea
              rows={3}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="We supply the brand new in-crate plow and undercarriage mount. Need full mechanical frame mount, electrical headlight harness tie-in, cab controller mount, and dynamic hydraulic bleed test."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
              id="submit-post-rfp-btn"
            >
              Publish Job RFP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
