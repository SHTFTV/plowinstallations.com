import React, { useState } from "react";
import {
  PackageCheck,
  Search,
  PlusCircle,
  Phone,
  Tag,
  MapPin,
  Building2,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { PartListing, BrandType } from "../types";
import { INITIAL_PARTS } from "../data/mockData";

interface PartsExchangeViewProps {
  onAddNewPart?: (part: PartListing) => void;
}

export const PartsExchangeView: React.FC<PartsExchangeViewProps> = () => {
  const [parts, setParts] = useState<PartListing[]>(INITIAL_PARTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [isAddingPart, setIsAddingPart] = useState(false);

  // New Part Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<PartListing["category"]>("Mount Kits & Push Beams");
  const [newBrand, setNewBrand] = useState<BrandType>("Western");
  const [newPartNumber, setNewPartNumber] = useState("");
  const [newFitsVehicles, setNewFitsVehicles] = useState("");
  const [newCondition, setNewCondition] = useState<PartListing["condition"]>("New in Box");
  const [newPrice, setNewPrice] = useState<number>(350);
  const [newShopName, setNewShopName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.title.toLowerCase().includes(search.toLowerCase()) ||
      (part.partNumber && part.partNumber.toLowerCase().includes(search.toLowerCase())) ||
      (part.fitsVehicles && part.fitsVehicles.toLowerCase().includes(search.toLowerCase())) ||
      part.sellerShopName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "All" || part.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newShopName) return;

    const newListing: PartListing = {
      id: `part-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      brand: newBrand,
      partNumber: newPartNumber,
      fitsVehicles: newFitsVehicles,
      condition: newCondition,
      price: newPrice,
      sellerShopName: newShopName,
      location: newLocation || "Independent Shop",
      state: "US",
      phone: newPhone || "(555) 000-0000",
      description: newDescription,
      postedDate: new Date().toISOString().split("T")[0],
    };

    setParts([newListing, ...parts]);
    setIsAddingPart(false);
    // Reset form
    setNewTitle("");
    setNewPartNumber("");
    setNewDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Decentralized Surplus & Hard-to-Find Brackets</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              P2P Mount Kit & Parts Exchange
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Independent shops trade surplus inventory, discontinued push beam mounts, refurbished
              isolation modules, hydraulic pumps, and spreader augers directly with zero distributor markups.
            </p>
          </div>

          <button
            onClick={() => setIsAddingPart(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 shrink-0"
            id="parts-list-item-btn"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>List Surplus Part / Mount</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU #31268, vehicle, brand, or shop..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Category:</span>
          {[
            "All",
            "Mount Kits & Push Beams",
            "Electrical & Harnesses",
            "Hydraulics & Pumps",
            "Controllers",
            "Salter Spreader Parts",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                category === cat
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredParts.map((part) => (
          <div
            key={part.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            id={`part-card-${part.id}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[11px] font-bold">
                  {part.brand}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    part.condition === "New in Box"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}
                >
                  {part.condition}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {part.title}
                </h3>
                {part.partNumber && (
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    OEM Part #: <span className="text-slate-200 font-bold">{part.partNumber}</span>
                  </p>
                )}
              </div>

              {part.fitsVehicles && (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
                  <span className="text-slate-400 font-semibold block">Vehicle Fitment:</span>
                  <span className="text-slate-200 font-medium">{part.fitsVehicles}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {part.description}
              </p>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-lg font-mono font-black text-amber-400">
                  ${part.price.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span className="truncate max-w-[120px]">{part.sellerShopName}</span>
                </div>
              </div>

              <a
                href={`tel:${part.phone.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contact Shop</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Part Modal */}
      {isAddingPart && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>List Surplus Mount Kit or Equipment Part</span>
              </h3>
              <button
                onClick={() => setIsAddingPart(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Part Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Western Mount Kit #31268 Ford F-250 4x4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mount Kits & Push Beams">Mount Kits & Push Beams</option>
                    <option value="Electrical & Harnesses">Electrical & Harnesses</option>
                    <option value="Hydraulics & Pumps">Hydraulics & Pumps</option>
                    <option value="Controllers">Controllers</option>
                    <option value="Salter Spreader Parts">Salter Spreader Parts</option>
                    <option value="Cutting Edges">Cutting Edges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Brand:</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Western">Western</option>
                    <option value="Boss">Boss</option>
                    <option value="Fisher">Fisher</option>
                    <option value="SnowDogg">SnowDogg</option>
                    <option value="Meyer">Meyer</option>
                    <option value="SnowEx">SnowEx</option>
                    <option value="SaltDogg">SaltDogg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">OEM Part #:</label>
                  <input
                    type="text"
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    placeholder="e.g. 31268"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condition:</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="New in Box">New in Box</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Good Used">Good Used</option>
                    <option value="Custom Fabricated">Custom Fabricated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Price ($):</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fits Vehicles:</label>
                <input
                  type="text"
                  value={newFitsVehicles}
                  onChange={(e) => setNewFitsVehicles(e.target.value)}
                  placeholder="e.g. 2017-2024 Ford Super Duty 4x4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Selling Shop Name:</label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="Your Shop Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contact Phone:</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(716) 555-0199"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description & Condition Details:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Includes bolt bags, fresh powdercoat, tested coils, etc."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingPart(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
