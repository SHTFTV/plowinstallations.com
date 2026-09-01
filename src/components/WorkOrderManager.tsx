import React, { useState } from "react";
import {
  ClipboardList,
  PlusCircle,
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Truck,
  Wrench,
  User,
  Phone,
  Scale,
} from "lucide-react";
import { WorkOrder } from "../types";

export const WorkOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([
    {
      id: "wo-1",
      orderNumber: "WO-2026-8801",
      customerName: "Crestview Landscaping LLC",
      customerPhone: "(585) 441-2090",
      customerCompany: "Crestview Snow & Ice Division",
      vehicleInfo: {
        year: 2024,
        make: "Ford",
        model: "F-350 Super Duty 6.7L Diesel Crew Cab DRW",
        vin: "1FT8W3BT9REC41920",
        mileage: "12,450 mi",
      },
      equipmentInfo: {
        plowBrand: "Western",
        plowModel: "MVP 3 9'6\" Stainless V-Plow",
        plowSerial: "W2409018442",
        spreaderBrand: "Western",
        spreaderModel: "Striker 2.0 cu yd Stainless",
        spreaderSerial: "ST2024-9102",
      },
      specsCalculated: {
        pushBeamHeightInches: 15.25,
        ballastRequiredLbs: 650,
        frontAxleMarginLbs: 480,
        grade8BoltTorqueFtLbs: 230,
      },
      checklist: {
        mountBoltsTorqued: true,
        dielectricGreased: true,
        isolationModuleFuses: true,
        nhtsaHeadlightAimChecked: true,
        hydraulicFluidBleed: true,
        emergencyFloatTested: true,
        ballastSecured: true,
        controllerCalibrated: true,
      },
      notes:
        "Customer requested dual battery isolator tie-in. Tested 10 cycles of V-wing actuation with 0.15V total voltage drop. Headlight isolation relay flips without flicker.",
      technicianName: "Dave Ricci (Master Upfitter)",
      totalLaborHours: 10,
      totalCost: 1850,
      createdAt: "2026-08-11",
      status: "Certified Complete",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<WorkOrder>(orders[0]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // New Work Order Form State
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [vYear, setVYear] = useState(2024);
  const [vMake, setVMake] = useState("Ford");
  const [vModel, setVModel] = useState("F-250 Super Duty 4x4");
  const [vVin, setVVin] = useState("");
  const [pBrand, setPBrand] = useState("Western");
  const [pModel, setPModel] = useState("Pro Plus 8.5ft Straight");
  const [pSerial, setPSerial] = useState("");
  const [beamHeight, setBeamHeight] = useState(15.0);
  const [ballastLbs, setBallastLbs] = useState(500);
  const [techName, setTechName] = useState("Certified Tech");
  const [laborHours, setLaborHours] = useState(8);
  const [totalCost, setTotalCost] = useState(1150);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      orderNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: custName || "Commercial Fleet Customer",
      customerPhone: custPhone || "(555) 123-4567",
      vehicleInfo: {
        year: vYear,
        make: vMake,
        model: vModel,
        vin: vVin || "VIN-NOT-RECORDED",
      },
      equipmentInfo: {
        plowBrand: pBrand,
        plowModel: pModel,
        plowSerial: pSerial || "SN-PENDING",
      },
      specsCalculated: {
        pushBeamHeightInches: beamHeight,
        ballastRequiredLbs: ballastLbs,
        frontAxleMarginLbs: 350,
        grade8BoltTorqueFtLbs: 230,
      },
      checklist: {
        mountBoltsTorqued: true,
        dielectricGreased: true,
        isolationModuleFuses: true,
        nhtsaHeadlightAimChecked: true,
        hydraulicFluidBleed: true,
        emergencyFloatTested: true,
        ballastSecured: true,
        controllerCalibrated: true,
      },
      notes: "Standard upfit completed and certified for winter commercial duty.",
      technicianName: techName,
      totalLaborHours: laborHours,
      totalCost: totalCost,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Certified Complete",
    };

    setOrders([newOrder, ...orders]);
    setSelectedOrder(newOrder);
    setIsCreatingOrder(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Shop Compliance & Customer Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Work Order & Upfit Compliance Certificate Generator
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Track installation serials, Grade 8 bolt torque certifications, push beam measurements,
              and print official customer compliance sheets for vehicle insurance and warranty protection.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingOrder(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 shrink-0"
            id="wo-new-btn"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Create New Work Order</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Orders List & Detailed Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Shop Work Orders ({orders.length})
          </div>

          <div className="space-y-2.5">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOrder?.id === order.id
                    ? "bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-400">{order.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                    {order.status}
                  </span>
                </div>

                <div className="mt-2">
                  <h4 className="text-xs font-bold text-white">{order.customerName}</h4>
                  <p className="text-[11px] text-slate-400">
                    {order.vehicleInfo.year} {order.vehicleInfo.make} {order.vehicleInfo.model}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{order.createdAt}</span>
                  <span className="font-mono text-slate-200 font-bold">${order.totalCost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Printable Certificate View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Certificate Header */}
              <div className="border-b-2 border-amber-500 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                    <span className="text-xl font-black text-white font-mono tracking-tight">
                      CERTIFICATE OF UPFIT COMPLIANCE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Commercial Snow & Ice Equipment Installation Quality Certification
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {selectedOrder.orderNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">Date: {selectedOrder.createdAt}</div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
                    title="Print Official Certificate"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer & Vehicle Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
                    Customer & Fleet Info
                  </span>
                  <div className="text-white font-bold text-sm">{selectedOrder.customerName}</div>
                  {selectedOrder.customerCompany && (
                    <div className="text-slate-300">{selectedOrder.customerCompany}</div>
                  )}
                  <div className="text-slate-400 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
                    Vehicle Chassis & VIN
                  </span>
                  <div className="text-white font-bold text-sm">
                    {selectedOrder.vehicleInfo.year} {selectedOrder.vehicleInfo.make}{" "}
                    {selectedOrder.vehicleInfo.model}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    VIN: <span className="text-slate-200">{selectedOrder.vehicleInfo.vin}</span>
                  </div>
                  {selectedOrder.vehicleInfo.mileage && (
                    <div className="text-slate-400 text-[11px]">
                      Odometer: {selectedOrder.vehicleInfo.mileage}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Installed */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
                  Equipment Installed & Verified
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Front Snow Plow:</span>
                    <span className="text-white font-bold">
                      {selectedOrder.equipmentInfo.plowBrand} {selectedOrder.equipmentInfo.plowModel}
                    </span>
                    <span className="text-slate-400 font-mono block text-[11px]">
                      Serial: {selectedOrder.equipmentInfo.plowSerial}
                    </span>
                  </div>

                  {selectedOrder.equipmentInfo.spreaderBrand && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Rear Salter / Spreader:</span>
                      <span className="text-white font-bold">
                        {selectedOrder.equipmentInfo.spreaderBrand}{" "}
                        {selectedOrder.equipmentInfo.spreaderModel}
                      </span>
                      <span className="text-slate-400 font-mono block text-[11px]">
                        Serial: {selectedOrder.equipmentInfo.spreaderSerial}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Measurements and Quality Checklist Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Push Beam Height</span>
                  <span className="text-base font-black font-mono text-white mt-0.5 block">
                    {selectedOrder.specsCalculated.pushBeamHeightInches}&quot;
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">14.5&quot;-15.5&quot; Target</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Counter-Ballast</span>
                  <span className="text-base font-black font-mono text-amber-400 mt-0.5 block">
                    {selectedOrder.specsCalculated.ballastRequiredLbs} lbs
                  </span>
                  <span className="text-[10px] text-slate-400">Against Tailgate</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Grade 8 Torque</span>
                  <span className="text-base font-black font-mono text-white mt-0.5 block">
                    {selectedOrder.specsCalculated.grade8BoltTorqueFtLbs} ft-lbs
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Torqued & Marked</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">FGAWR Margin</span>
                  <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">
                    +{selectedOrder.specsCalculated.frontAxleMarginLbs} lbs
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Safe / Passed</span>
                </div>
              </div>

              {/* Checklist Badges */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px] mb-2">
                  18-Point Quality Inspection Sign-Off
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>NHTSA Headlight Optical Aim Checked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dielectric Silicone on all Connectors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hydraulic Bleed & Pressure Relief Tested</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Isolation Module & Float Detent Functional</span>
                  </div>
                </div>
              </div>

              {/* Technician Signature Block */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Certified Lead Technician:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {selectedOrder.technicianName}
                  </span>
                </div>

                <div className="border border-dashed border-slate-700 px-4 py-2 rounded-lg text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Certification Stamp
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    PLOWINSTALLATIONS CERTIFIED UPFIT
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              Select a work order on the left to view compliance certificate.
            </div>
          )}
        </div>
      </div>

      {/* New Work Order Modal */}
      {isCreatingOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <span>Create New Upfit Work Order & Cert</span>
              </h3>
              <button
                onClick={() => setIsCreatingOrder(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Customer / Fleet Name:</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Apex Snow Management"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Customer Phone:</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="(585) 555-0192"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle Year:</label>
                  <input
                    type="number"
                    value={vYear}
                    onChange={(e) => setVYear(parseInt(e.target.value) || 2024)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle Make:</label>
                  <input
                    type="text"
                    value={vMake}
                    onChange={(e) => setVMake(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle Model:</label>
                  <input
                    type="text"
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chassis VIN #:</label>
                <input
                  type="text"
                  value={vVin}
                  onChange={(e) => setVVin(e.target.value)}
                  placeholder="1FT8W3BT9REC..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plow Brand:</label>
                  <input
                    type="text"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plow Model:</label>
                  <input
                    type="text"
                    value={pModel}
                    onChange={(e) => setPModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plow Serial #:</label>
                  <input
                    type="text"
                    value={pSerial}
                    onChange={(e) => setPSerial(e.target.value)}
                    placeholder="W2409..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Push Beam Height (Inches):
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={beamHeight}
                    onChange={(e) => setBeamHeight(parseFloat(e.target.value) || 15)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Installed Ballast (Lbs):
                  </label>
                  <input
                    type="number"
                    value={ballastLbs}
                    onChange={(e) => setBallastLbs(parseFloat(e.target.value) || 500)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lead Tech Name:</label>
                  <input
                    type="text"
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Labor Hours:</label>
                  <input
                    type="number"
                    value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 8)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Total Bill ($):</label>
                  <input
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingOrder(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  Generate Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
