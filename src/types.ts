export type BrandType =
  | "Western"
  | "Boss"
  | "Fisher"
  | "SnowDogg"
  | "Meyer"
  | "SnowEx"
  | "Hiniker"
  | "Sno-Way"
  | "SaltDogg"
  | "Torwel"
  | "Custom / Multi-Brand";

export interface UsedEquipmentItem {
  id: string;
  title: string;
  category:
    | "Used Plow Blade & Assembly"
    | "Used V-Box / Tailgate Spreader"
    | "Used Snow Pusher / Box"
    | "Refurbished Power Unit & Pump"
    | "Used Undercarriage Mount & Beam"
    | "Used In-Cab Controller & Harness"
    | "UTV / Loader Attachment";
  brand: BrandType;
  condition:
    | "Like New / Low Hours"
    | "Shop Refurbished & Tested"
    | "Field Ready / Good Condition"
    | "Contractor Surplus";
  price: number;
  year?: number;
  seasonsUsed?: string;
  includesWiringOrMount?: string;
  description: string;
  inStock: boolean;
}

export type ShopPhotoCategory =
  | "bay" // Service bay, lift, door clearance, facility
  | "fabrication" // Custom subframe, push beam, reinforced bracket, custom hitch/welds
  | "inventory" // Used plows, refurbished spreaders, controller inventory, power units
  | "facility"; // Exterior shop signage, service truck rig, shop floor

export interface ShopPhoto {
  id: string;
  category: ShopPhotoCategory;
  title: string;
  url: string; // Sanitized data URL or validated image URL
  caption?: string;
  uploadedAt?: string;
  equipmentBrand?: BrandType;
  tags?: string[];
  isPrimary?: boolean;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  address: string;
  lat: number;
  lng: number;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  einVerified?: boolean;
  businessLicenseNo?: string;
  verificationBadge?: "Anti-Fake Verified" | "Master Upfitter" | "Certified Independent";
  subscriptionPlan?: string;
  listingPriceAnnual?: number;
  yearsInBusiness?: number;
  bayCount?: number;
  doorClearanceFt?: number;
  hasMobileRig: boolean;
  has247StormResponse: boolean;
  providesCustomFab: boolean;
  brands: BrandType[];
  specialties: string[];
  certifications: string[];
  emergencyPhone?: string;
  bio: string;
  completedInstalls?: number;
  usedEquipment?: UsedEquipmentItem[];
  photos?: ShopPhoto[];
}

export interface VehicleSpec {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
  engineWeightBonusLbs: number; // Diesel engines add ~500-700 lbs front load
  curbWeightLbs: number;
  fgawrLbs: number; // Front Gross Axle Weight Rating
  rgawrLbs: number; // Rear Gross Axle Weight Rating
  gvwrLbs: number;
  wheelbaseInches: number;
  frontOverhangInches: number; // front axle to bumper / mount
  bedLengthFt: number;
  hasPlowPrepPackage: boolean;
  alternatorAmps: number;
  hasDualBatteries: boolean;
}

export interface PlowBladeSpec {
  id: string;
  brand: BrandType;
  model: string;
  type: "Straight" | "V-Plow" | "Expandable Wing" | "Municipal Heavy" | "UTV/Light Duty";
  widthFt: number;
  weightLbs: number;
  heightInches: number;
  cuttingEdge: "Steel" | "Carbide" | "Rubber" | "Poly";
  electricalSystem: string;
  minVehicleClass: string;
  hydraulicReliefPsi: number;
  idealPushBeamHeightInches: number; // standard ~14.5 to 15.5
}

export interface SpreaderSpec {
  id: string;
  brand: BrandType;
  model: string;
  type: "Tailgate" | "V-Box Hopper" | "Under-Tailgate" | "Drop Spreader";
  capacityCuYd: number;
  dryWeightLbs: number;
  material: "Poly" | "Stainless Steel" | "Carbon Steel";
  powerType: "12V Dual Electric" | "Hydraulic" | "Gas Engine";
  idealVehicleClass: string;
}

export interface JobListing {
  id: string;
  title: string;
  clientType: "Commercial Contractor" | "Municipal Fleet" | "Landscaper" | "Private Owner" | "Dealership";
  clientName: string;
  location: string;
  state: string;
  postedDate: string;
  targetDate: string;
  vehicle: string;
  equipment: string;
  scopeDescription: string;
  budgetRange: string;
  status: "Open" | "Quoted" | "Awarded" | "Completed";
  bidsCount: number;
  urgency: "Standard Pre-Season" | "Urgent Before Storm" | "Emergency 24hr";
  bids: JobBid[];
}

export interface JobBid {
  id: string;
  shopId: string;
  shopName: string;
  shopLocation: string;
  shopRating: number;
  estimatedLaborHours: number;
  laborTotal: number;
  partsTotal: number;
  totalQuote: number;
  estimatedDaysToComplete: number;
  notes: string;
  includesWarrantyMonths: number;
  submittedAt: string;
}

export interface PartListing {
  id: string;
  title: string;
  category: "Mount Kits & Push Beams" | "Electrical & Harnesses" | "Hydraulics & Pumps" | "Controllers" | "Salter Spreader Parts" | "Cutting Edges";
  brand: BrandType;
  partNumber?: string;
  fitsVehicles?: string;
  fitsPlows?: string;
  condition: "New in Box" | "Refurbished" | "Good Used" | "Custom Fabricated";
  price: number;
  sellerShopName: string;
  location: string;
  state: string;
  phone: string;
  description: string;
  postedDate: string;
}

export interface HarnessPin {
  pinNumber: number | string;
  wireColor: string;
  gauge: string;
  function: string;
  typicalVoltage: string;
  testProcedure: string;
}

export interface HarnessSystem {
  id: string;
  name: string;
  brand: BrandType;
  plugType: string;
  description: string;
  commonIssues: string[];
  pins: HarnessPin[];
}

export type CommercialLevel =
  | "Level 1 — Pickup/Contractor"
  | "Level 2 — Commercial/Municipal"
  | "Level 3 — Specialty Equipment"
  | "Level 4 — Spreaders & Liquid De-Icing";

export type BrandAuthTier =
  | "Authorized Dealer"
  | "Certified Installer"
  | "Independent Specialist"
  | "Authorized Service Center";

export type AudienceMode = "Consumer" | "Contractor" | "Installer" | "Manufacturer";

export type PlowCategoryType =
  | "Straight Blade"
  | "V-Plow"
  | "Wide-Out / Expandable"
  | "Municipal Severe-Duty"
  | "UTV / Mid-Size"
  | "Underbody Scraper"
  | "Pusher / Containment"
  | "V-Box & Tailgate Spreader";

export type ServiceTypeOption =
  | "New Plow Installation"
  | "Plow Removal & Re-install"
  | "Emergency Storm Repair"
  | "Hydraulic Valve & Cylinder Service"
  | "Electrical Harness & Isolation Module"
  | "Spreader & Salter Upfit"
  | "Underbody Scraper Installation"
  | "Custom Subframe Fabrication";

export interface PlowBrandInfo {
  id: string;
  name: string;
  slug: string;
  commercialLevel: CommercialLevel;
  country: "United States" | "Canada" | "International";
  isCanadian?: boolean;
  tagline: string;
  headquarters: string;
  foundedYear?: number;
  description: string;
  keyTechnologies: string[];
  popularModels: string[];
  vehicleSuitability: string[];
  websiteUrl: string;
  officialDealerLocatorUrl?: string;
  newsHeadline?: string;
  newsSummary?: string;
  newsUrl?: string;
  badgeColor: string;
}

export interface CompatiblePlowOption {
  brand: string;
  model: string;
  plowType: PlowCategoryType;
  bladeWidthFt: number;
  weightLbs: number;
  mountKitPart: string;
  lightingHarnessPart: string;
  controllerType: string;
  minBallastRequiredLbs: number;
  estLaborHours: number;
  fitmentLevel: "Direct Bolt-On" | "Plow Prep Required" | "Heavy Suspension Upgrade";
  notes: string;
}

export interface TruckPlowFitment {
  id: string;
  make: string;
  model: string;
  yearRange: string;
  yearMin: number;
  yearMax: number;
  cabTypes: string[];
  bedLengths: string[];
  engineOptions: string[];
  gvwrLbs: number;
  frontGawrLbs: number;
  plowPrepPackageCode?: string;
  plowPrepDescription: string;
  suspensionNotes?: string;
  compatiblePlows: CompatiblePlowOption[];
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    vin: string;
    mileage?: string;
  };
  equipmentInfo: {
    plowBrand: string;
    plowModel: string;
    plowSerial: string;
    spreaderBrand?: string;
    spreaderModel?: string;
    spreaderSerial?: string;
  };
  specsCalculated: {
    pushBeamHeightInches: number;
    ballastRequiredLbs: number;
    frontAxleMarginLbs: number;
    grade8BoltTorqueFtLbs: number;
  };
  checklist: {
    mountBoltsTorqued: boolean;
    dielectricGreased: boolean;
    isolationModuleFuses: boolean;
    nhtsaHeadlightAimChecked: boolean;
    hydraulicFluidBleed: boolean;
    emergencyFloatTested: boolean;
    ballastSecured: boolean;
    controllerCalibrated: boolean;
  };
  notes: string;
  technicianName: string;
  totalLaborHours: number;
  totalCost: number;
  createdAt: string;
  status: "Draft" | "In-Progress" | "Certified Complete";
}
