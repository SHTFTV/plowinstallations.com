import {ShopGuideCards} from './components/ShopGuideCards';
import {InstallerPreviewCards} from './components/InstallerPreviewCards';
import { KongPromo } from "./components/KongPromo";
import { PlowWowPromo } from "./components/PlowWowPromo";
import { useState } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { PlowInstallationPage } from "./components/PlowInstallationPage";
import { FitmentDatabase } from "./components/FitmentDatabase";
import { FitmentBallastCalculator } from "./components/FitmentBallastCalculator";
import { MasterTechAiAssistant } from "./components/MasterTechAiAssistant";
import { ShopBenchTools } from "./components/ShopBenchTools";
import { PartsExchangeView } from "./components/PartsExchangeView";
import { WorkOrderManager } from "./components/WorkOrderManager";
import { JobMarketplaceView } from "./components/JobMarketplaceView";
import { INITIAL_JOBS } from "./data/mockData";
import { JobListing, TruckPlowFitment, CompatiblePlowOption } from "./types";
import {CheckCircle2} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("shop");
  const [jobs] = useState<JobListing[]>(INITIAL_JOBS);

  const openInstallerDirectory = () => { window.location.href = "/installers/"; };

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

  const handleRequestQuoteFromFitment = () => openInstallerDirectory();

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
        onOpenPostJobModal={openInstallerDirectory}
      />

      {/* Primary Content Container */}
      <main className={activeTab === "shop" || activeTab === "directory" ? "flex-1 w-full" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"}>
        {(activeTab === "shop" || activeTab === "directory") && (
          <PlowInstallationPage
            onNavigateToFitment={() => setActiveTab("fitment")}
            onNavigateToCalculator={() => setActiveTab("calculator")}
            onNavigateToDiagnostics={() => setActiveTab("diagnostics")}
            onRequestQuoteWithDetails={openInstallerDirectory}
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
            onOpenPostJobModal={openInstallerDirectory}
            onSubmitBid={() => {}}
          />
        )}
      </main>

      <InstallerPreviewCards/>
      <ShopGuideCards/>
      <section className="pi-ad-slim" aria-label="Latest FISHER guide"><div><small>SHOP GUIDE · OCTOBER 29, 2026</small><h2>FISHER EZ-V. Match the whole setup.</h2><p>Half-ton fitment, used buying and questions to discuss with an installer.</p></div><a className="pi-button" href="/guides/fisher-ez-v-half-ton-used-plow-fitment-service/">Read the FISHER guide ↗</a></section>
      <section className="pi-ad-slim" aria-label="Weather readiness guide"><div><small>WINTER READINESS · OCTOBER 28</small><h2>Prepare the equipment enquiry.</h2><p>Prepare the setup and scope for your installer.</p></div><a className="pi-button" href="/guides/polar-vortex-preseason-plow-readiness-durand/">Read the guide ↗</a></section><section className="pi-ad-slim" aria-label="Latest installation guide"><div><small>SHOP GUIDE · OCTOBER 28, 2026</small><h2>Attach the plow. Understand the installation.</h2><p>WESTERN UltraMount 2: the mount, the match and the work to confirm.</p></div><a className="pi-button" href="/guides/western-ultramount-2-attachment-installation-guide/">Read the guide ↗</a></section><section className="pi-ad-slim" aria-label="Sno-Way lineup guide"><div><small>SHOP GUIDE · OCTOBER 27, 2026</small><h2>Sno-Way. Start with your truck and route.</h2><p>Straight, V or hinged wing? Prepare your fitment conversation with an installer.</p></div><a className="pi-button" href="/guides/sno-way-lineup-truck-plow-fitment-durand/">Explore the lineup ↗</a></section><section className="pi-ad-slim" aria-label="Latest shop guide"><div><small>SHOP GUIDE · OCTOBER 26, 2026</small><h2>Before the storm. Before the scramble.</h2><p>Identify your equipment, document the issue and confirm the parts conversation with an installer.</p></div><a className="pi-button" href="/guides/preseason-snowplow-parts-service-aldergrove/">Read the guide ↗</a></section>

      <PlowWowPromo />
      <KongPromo />

      <footer className="pi-network-footer"><div><strong>PlowInstallations · Installer network</strong><p>Independent installers, equipment guides and shop profiles across cities.</p></div><nav aria-label="Footer navigation"><a href="/installers/">Find an installer</a><a href="/guides/">Equipment guides</a><a href="https://www.industryarmymarketing.com/">Industry Army Marketing ↗</a></nav><p>© {new Date().getFullYear()} PlowInstallations</p></footer>
    </div>
  );
}
