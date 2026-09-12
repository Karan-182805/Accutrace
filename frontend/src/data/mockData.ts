import { Inspection, Product, Violation, SystemUser, AppNotification } from '../types';

// Helper to generate SVG package mock image data URIs
const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const createPackageSvg = (rawTitle: string, rawSub: string, brandBg: string, accentColor: string, rawLines: string[]) => {
  // Text must be XML-escaped, otherwise labels containing "&" produce a broken image.
  const title = escapeXml(rawTitle);
  const sub = escapeXml(rawSub);
  const extraLines = rawLines.map(escapeXml);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
    <rect width="600" height="800" fill="#f8fafc" rx="16" />
    <rect x="20" y="20" width="560" height="760" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" rx="12" />
    <!-- Brand Banner -->
    <rect x="20" y="20" width="560" height="160" fill="${brandBg}" rx="12" />
    <text x="300" y="85" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="2">${title.toUpperCase()}</text>
    <text x="300" y="130" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="${accentColor}" text-anchor="middle">${sub}</text>
    
    <!-- Illustration Graphic -->
    <circle cx="300" cy="280" r="70" fill="#f1f5f9" stroke="${brandBg}" stroke-width="4" />
    <path d="M270 280 Q300 240 330 280 T390 280" stroke="${brandBg}" stroke-width="6" fill="none" />
    
    <!-- Mandatory Declaration Panel -->
    <rect x="50" y="380" width="500" height="370" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4" rx="8" />
    <text x="70" y="415" font-family="monospace" font-weight="bold" font-size="16" fill="#0f172a">MANDATORY LEGAL METROLOGY DECLARATIONS</text>
    <line x1="70" y1="425" x2="530" y2="425" stroke="#cbd5e1" stroke-width="2" />
    
    ${extraLines.map((line, idx) => `
      <text x="70" y="${460 + idx * 38}" font-family="monospace" font-size="15" font-weight="600" fill="#1e293b">${line}</text>
    `).join('')}
    
    <!-- Barcode -->
    <g transform="translate(380, 670)">
      <rect x="0" y="0" width="140" height="50" fill="#ffffff" stroke="#cbd5e1"/>
      <line x1="10" y1="5" x2="10" y2="40" stroke="#000" stroke-width="3"/>
      <line x1="18" y1="5" x2="18" y2="40" stroke="#000" stroke-width="1"/>
      <line x1="24" y1="5" x2="24" y2="40" stroke="#000" stroke-width="4"/>
      <line x1="34" y1="5" x2="34" y2="40" stroke="#000" stroke-width="2"/>
      <line x1="42" y1="5" x2="42" y2="40" stroke="#000" stroke-width="1"/>
      <line x1="50" y1="5" x2="50" y2="40" stroke="#000" stroke-width="3"/>
      <line x1="60" y1="5" x2="60" y2="40" stroke="#000" stroke-width="2"/>
      <line x1="70" y1="5" x2="70" y2="40" stroke="#000" stroke-width="4"/>
      <line x1="82" y1="5" x2="82" y2="40" stroke="#000" stroke-width="1"/>
      <line x1="90" y1="5" x2="90" y2="40" stroke="#000" stroke-width="3"/>
      <line x1="102" y1="5" x2="102" y2="40" stroke="#000" stroke-width="2"/>
      <line x1="115" y1="5" x2="115" y2="40" stroke="#000" stroke-width="3"/>
      <text x="70" y="48" font-family="monospace" font-size="9" text-anchor="middle">8901234567890</text>
    </g>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const sampleImages = {
  basmatiRiceFront: createPackageSvg(
    "FreshHarvest",
    "PREMIUM EXTRA LONG BASMATI RICE",
    "#1e3a8a",
    "#f59e0b",
    [
      "Mfd. By: FreshHarvest Foods Pvt. Ltd., Plot 42, Sector 8, Karnal, HR",
      "Net Quantity: 5 kg (Unit Sale Price: ₹124/kg)",
      "Maximum Retail Price: MRP ₹620 (Incl. of all taxes)",
      "Date of Packaging: 08/2026 | Batch No: B-9942",
      "Consumer Care: care@freshharvest.co.in | Tel: +91 1800-111-222",
      "Declaration Size: Font height approx 2.2 mm (Required: ≥3.0mm)"
    ]
  ),
  basmatiRiceBack: createPackageSvg(
    "FreshHarvest - Back Label",
    "NUTRITIONAL & COMPLIANCE PANEL",
    "#0f172a",
    "#38bdf8",
    [
      "Country of Origin: INDIA",
      "FSSAI Lic No: 10019064001842",
      "Storage: Store in cool dry place away from direct sunlight",
      "Customer Complaints: Manager, Legal Metrology Cell, Karnal",
      "E-mail: support@freshharvest.co.in (No Toll-Free Phone listed)",
      "Standard Packaging Norms: Compliant with PCR 2011 Schedule II"
    ]
  ),
  groundnutOil: createPackageSvg(
    "Fortune VIVO",
    "FILTERED GROUNDNUT OIL 1 LITRE",
    "#15803d",
    "#fef08a",
    [
      "Mfd. & Pkd By: Adani Wilmar Limited, Village Mithirohar, Gandhidham, GJ",
      "Net Quantity: 1 L (910 g at 30°C) | USP: ₹185/L",
      "Maximum Retail Price: ₹ 185.00 (Incl. of all taxes)",
      "Date of Mfg: 09/2026 | Best Before: 9 Months from packaging",
      "Consumer Care Executive: 1800-233-0000 | customercare@wilmar.in",
      "Font Height: 3.5 mm | Legibility: Clear High Contrast"
    ]
  ),
  turmericPowder: createPackageSvg(
    "Royal Spices",
    "PURE AGMARK TURMERIC POWDER 200g",
    "#b45309",
    "#fde047",
    [
      "Mfd. By: Royal Spices Ind., GIDC Phase 3, Unjha, Gujarat - 384170",
      "Net Quantity: 200 g (USP Missing)",
      "Maximum Retail Price: ₹ 85.00 (Taxes Included)",
      "Date of Packing: [BLURRED / UNREADABLE]",
      "Consumer Care: Contact Manager at Unjha Address",
      "Violations: Missing Unit Sale Price, Unclear Packing Date"
    ]
  )
};

export const mainInspectionResult: Inspection = {
  id: "LM-2026-10483",
  productId: "PRD-8821",
  productName: "FreshHarvest Premium Basmati Rice (5kg)",
  manufacturer: "FreshHarvest Foods Pvt. Ltd.",
  category: "Food Grain",
  batchLot: "B-9942 / Aug 2026",
  date: "2026-09-10",
  location: "Sub-Market Yard Zone 4, Azadpur, New Delhi",
  inspectorName: "R. K. Sharma (Dy. Controller)",
  score: 72,
  status: "Non-Compliant",
  totalChecks: 6,
  compliantCount: 3,
  reviewCount: 1,
  violationCount: 2,
  images: {
    front: sampleImages.basmatiRiceFront,
    back: sampleImages.basmatiRiceBack,
  },
  boundingBoxes: [
    {
      id: "box-1",
      label: "Manufacturer Details",
      x: 8,
      y: 56,
      width: 84,
      height: 6,
      status: "Compliant",
      ruleRef: "PCR 2011 - Rule 6(1)(a)",
      detectedText: "Mfd. By: FreshHarvest Foods Pvt. Ltd., Plot 42, Sector 8, Karnal, HR"
    },
    {
      id: "box-2",
      label: "Net Quantity",
      x: 8,
      y: 61,
      width: 84,
      height: 5,
      status: "Compliant",
      ruleRef: "PCR 2011 - Rule 6(1)(c)",
      detectedText: "Net Quantity: 5 kg (Unit Sale Price: ₹124/kg)"
    },
    {
      id: "box-3",
      label: "MRP Declaration",
      x: 8,
      y: 66,
      width: 84,
      height: 5,
      status: "Non-Compliant",
      ruleRef: "PCR 2011 - Rule 6(1)(e)",
      detectedText: "Maximum Retail Price: MRP ₹620 (Incl. of all taxes)"
    },
    {
      id: "box-4",
      label: "Date of Packaging",
      x: 8,
      y: 71,
      width: 84,
      height: 5,
      status: "Compliant",
      ruleRef: "PCR 2011 - Rule 6(1)(d)",
      detectedText: "Date of Packaging: 08/2026 | Batch No: B-9942"
    },
    {
      id: "box-5",
      label: "Consumer Care Details",
      x: 8,
      y: 76,
      width: 84,
      height: 5,
      status: "Requires Review",
      ruleRef: "PCR 2011 - Rule 6(2)",
      detectedText: "Consumer Care: care@freshharvest.co.in | Tel: +91 1800-111-222"
    },
    {
      id: "box-6",
      label: "Font Size & Readability",
      x: 8,
      y: 81,
      width: 84,
      height: 5,
      status: "Non-Compliant",
      ruleRef: "PCR 2011 - Rule 7(1)",
      detectedText: "Declaration Size: Font height approx 2.2 mm (Required: ≥3.0mm)"
    }
  ],
  checklist: [
    {
      id: "chk-1",
      requirement: "Manufacturer Details",
      ruleRef: "Rule 6(1)(a)",
      detectedValue: "FreshHarvest Foods Pvt. Ltd., Plot 42, Sector 8, Karnal",
      status: "Compliant",
      confidence: 98,
      observation: "Full name and complete postal address of the manufacturer clearly stated."
    },
    {
      id: "chk-2",
      requirement: "Net Quantity",
      ruleRef: "Rule 6(1)(c)",
      detectedValue: "5 kg (Unit Sale Price ₹124/kg)",
      status: "Compliant",
      confidence: 99,
      observation: "Standard unit symbol 'kg' used correctly without abbreviation errors."
    },
    {
      id: "chk-3",
      requirement: "MRP Declaration",
      ruleRef: "Rule 6(1)(e)",
      detectedValue: "MRP ₹620",
      status: "Non-Compliant",
      confidence: 91,
      severity: "High",
      expectedValue: "MRP ₹ 620.00 (Inclusive of all taxes) + mandatory USP prefix formatting",
      observation: "Missing mandatory statutory phrase 'Inclusive of all taxes' in mandatory font size block next to price figure.",
      recommendedAction: "Issue show-cause notice under Section 36(2) of Legal Metrology Act 2009 for improper MRP declaration formatting."
    },
    {
      id: "chk-4",
      requirement: "Date of Packaging",
      ruleRef: "Rule 6(1)(d)",
      detectedValue: "08/2026",
      status: "Compliant",
      confidence: 96,
      observation: "Month and year of manufacture/pack printed in standard MM/YYYY format."
    },
    {
      id: "chk-5",
      requirement: "Consumer Care",
      ruleRef: "Rule 6(2)",
      detectedValue: "Partially detected: care@freshharvest.co.in",
      status: "Requires Review",
      confidence: 74,
      severity: "Medium",
      expectedValue: "Name, Address, Telephone number and Email address of the officer dealing with consumer complaints",
      observation: "Toll-free telephone number missing physical officer title designation.",
      recommendedAction: "Request manufacturer clarification regarding complete postal officer address for grievance redressal."
    },
    {
      id: "chk-6",
      requirement: "Readability & Font Size",
      ruleRef: "Rule 7(1)",
      detectedValue: "Possible size issue: 2.2mm font height for 5kg pack",
      status: "Non-Compliant",
      confidence: 88,
      severity: "High",
      expectedValue: "Minimum height of numeral and letters = 3.0 mm for net quantity > 1kg up to 5kg (Table I, Rule 7)",
      observation: "Measured character height of net quantity declaration is 2.2 mm, which is below the mandatory 3.0 mm statutory height.",
      recommendedAction: "Seize non-compliant batch sample for physical optical comparator measurement under Rule 24."
    }
  ],
  officerRemarks: "Initial OCR visual analysis indicates critical font height deficiency under Rule 7 and missing tax inclusive wording on principal display panel. Physical inspection ticket generated."
};

export const mockProducts: Product[] = [
  {
    id: "PRD-8821",
    name: "FreshHarvest Premium Basmati Rice (5kg)",
    category: "Food Grain",
    manufacturer: "FreshHarvest Foods Pvt. Ltd.",
    lastInspectionDate: "2026-09-10",
    lastInspectionId: "LM-2026-10483",
    score: 72,
    violationsCount: 2,
    status: "Non-Compliant",
    image: sampleImages.basmatiRiceFront
  },
  {
    id: "PRD-9102",
    name: "Fortune VIVO Filtered Groundnut Oil (1L)",
    category: "Edible Oil",
    manufacturer: "Adani Wilmar Limited",
    lastInspectionDate: "2026-09-08",
    lastInspectionId: "LM-2026-10479",
    score: 96,
    violationsCount: 0,
    status: "Compliant",
    image: sampleImages.groundnutOil
  },
  {
    id: "PRD-7740",
    name: "Royal Spices Agmark Turmeric Powder (200g)",
    category: "Spices & Condiments",
    manufacturer: "Royal Spices India Ltd.",
    lastInspectionDate: "2026-09-07",
    lastInspectionId: "LM-2026-10472",
    score: 65,
    violationsCount: 3,
    status: "Non-Compliant",
    image: sampleImages.turmericPowder
  },
  {
    id: "PRD-6512",
    name: "Amul Pasteurised Salted Butter (500g)",
    category: "Dairy Products",
    manufacturer: "GCMMF Ltd. (Amul)",
    lastInspectionDate: "2026-09-06",
    lastInspectionId: "LM-2026-10468",
    score: 98,
    violationsCount: 0,
    status: "Compliant",
    image: sampleImages.basmatiRiceBack
  },
  {
    id: "PRD-4310",
    name: "NatureFresh Whole Wheat Chakki Atta (10kg)",
    category: "Food Grain",
    manufacturer: "Cargill India Pvt. Ltd.",
    lastInspectionDate: "2026-09-05",
    lastInspectionId: "LM-2026-10460",
    score: 84,
    violationsCount: 1,
    status: "Requires Review",
    image: sampleImages.basmatiRiceFront
  },
  {
    id: "PRD-3209",
    name: "GlowCare Anti-Aging Skin Cream (50g)",
    category: "Cosmetics & Personal Care",
    manufacturer: "GlowCare Cosmetics Corp",
    lastInspectionDate: "2026-09-04",
    lastInspectionId: "LM-2026-10452",
    score: 58,
    violationsCount: 4,
    status: "Non-Compliant",
    image: sampleImages.turmericPowder
  },
  {
    id: "PRD-5501",
    name: "PureDrop Packaged Drinking Water (1L)",
    category: "Beverages",
    manufacturer: "PureDrop Beverages Ltd.",
    lastInspectionDate: "2026-09-03",
    lastInspectionId: "LM-2026-10448",
    score: 94,
    violationsCount: 0,
    status: "Compliant",
    image: sampleImages.groundnutOil
  },
  {
    id: "PRD-9912",
    name: "Himalaya Herbal Baby Lotion (200ml)",
    category: "Baby Care",
    manufacturer: "Himalaya Wellness Company",
    lastInspectionDate: "2026-09-01",
    lastInspectionId: "LM-2026-10435",
    score: 68,
    violationsCount: 2,
    status: "Non-Compliant",
    image: sampleImages.basmatiRiceFront
  }
];

export const mockInspections: Inspection[] = [
  mainInspectionResult,
  {
    id: "LM-2026-10479",
    productId: "PRD-9102",
    productName: "Fortune VIVO Filtered Groundnut Oil (1L)",
    manufacturer: "Adani Wilmar Limited",
    category: "Edible Oil",
    batchLot: "AW-2026-08",
    date: "2026-09-08",
    location: "Supermarket Mart, Connaught Place, New Delhi",
    inspectorName: "V. K. Singh (Inspector)",
    score: 96,
    status: "Compliant",
    totalChecks: 6,
    compliantCount: 6,
    reviewCount: 0,
    violationCount: 0,
    images: { front: sampleImages.groundnutOil },
    boundingBoxes: [],
    checklist: []
  },
  {
    id: "LM-2026-10472",
    productId: "PRD-7740",
    productName: "Royal Spices Agmark Turmeric Powder (200g)",
    manufacturer: "Royal Spices India Ltd.",
    category: "Spices & Condiments",
    batchLot: "RS-901",
    date: "2026-09-07",
    location: "Retail Store, Sadar Bazaar, Delhi",
    inspectorName: "P. N. Reddy (Inspector)",
    score: 65,
    status: "Non-Compliant",
    totalChecks: 6,
    compliantCount: 3,
    reviewCount: 0,
    violationCount: 3,
    images: { front: sampleImages.turmericPowder },
    boundingBoxes: [],
    checklist: []
  },
  {
    id: "LM-2026-10468",
    productId: "PRD-6512",
    productName: "Amul Pasteurised Salted Butter (500g)",
    manufacturer: "GCMMF Ltd. (Amul)",
    category: "Dairy Products",
    batchLot: "AM-8812",
    date: "2026-09-06",
    location: "Cold Storage Wholesale Depot, Okhla",
    inspectorName: "R. K. Sharma (Dy. Controller)",
    score: 98,
    status: "Compliant",
    totalChecks: 6,
    compliantCount: 6,
    reviewCount: 0,
    violationCount: 0,
    images: { front: sampleImages.basmatiRiceBack },
    boundingBoxes: [],
    checklist: []
  },
  {
    id: "LM-2026-10460",
    productId: "PRD-4310",
    productName: "NatureFresh Whole Wheat Chakki Atta (10kg)",
    manufacturer: "Cargill India Pvt. Ltd.",
    category: "Food Grain",
    batchLot: "CG-2026-X",
    date: "2026-09-05",
    location: "Reliance Fresh, Dwarka Sector 12",
    inspectorName: "S. M. Gupta (Assistant Controller)",
    score: 84,
    status: "Requires Review",
    totalChecks: 6,
    compliantCount: 4,
    reviewCount: 2,
    violationCount: 0,
    images: { front: sampleImages.basmatiRiceFront },
    boundingBoxes: [],
    checklist: []
  },
  {
    id: "LM-2026-10452",
    productId: "PRD-3209",
    productName: "GlowCare Anti-Aging Skin Cream (50g)",
    category: "Cosmetics & Personal Care",
    manufacturer: "GlowCare Cosmetics Corp",
    batchLot: "GC-2026-X",
    date: "2026-09-04",
    location: "Beauty Plaza, Lajpat Nagar, Delhi",
    inspectorName: "V. K. Singh (Inspector)",
    score: 58,
    status: "Non-Compliant",
    totalChecks: 6,
    compliantCount: 2,
    reviewCount: 0,
    violationCount: 4,
    images: { front: sampleImages.turmericPowder },
    boundingBoxes: [],
    checklist: []
  }
];

export const mockViolations: Violation[] = [
  {
    id: "VIO-2026-881",
    inspectionId: "LM-2026-10483",
    productId: "PRD-8821",
    productName: "FreshHarvest Premium Basmati Rice (5kg)",
    violationType: "MRP Issue",
    severity: "High",
    detectedText: "Maximum Retail Price: MRP ₹620 (Incl. of all taxes)",
    ocrConfidence: 91,
    evidenceRegion: sampleImages.basmatiRiceFront,
    expectedRequirement: "Legal Metrology (Packaged Commodities) Rules 2011 Rule 6(1)(e): MRP declaration must contain 'Inclusive of all taxes' in clear legible font next to retail price.",
    actualObservation: "Missing mandatory statutory phrase formatting and missing unit sale price prefix breakdown.",
    recommendedAction: "Issue Notice under Section 36(2) of Legal Metrology Act 2009 to Manufacturer and Retailer.",
    status: "Pending Officer Review",
    officerVerified: false,
    date: "2026-09-10",
    inspectorName: "R. K. Sharma (Dy. Controller)"
  },
  {
    id: "VIO-2026-882",
    inspectionId: "LM-2026-10483",
    productId: "PRD-8821",
    productName: "FreshHarvest Premium Basmati Rice (5kg)",
    violationType: "Font & Readability",
    severity: "High",
    detectedText: "Declaration Size: Font height approx 2.2 mm (Required: ≥3.0mm)",
    ocrConfidence: 88,
    evidenceRegion: sampleImages.basmatiRiceFront,
    expectedRequirement: "Rule 7 Table I: For net quantity > 1kg up to 5kg, minimum height of numeral and letters shall be 3.0 mm.",
    actualObservation: "Measured font height is 2.2 mm (26.6% below minimum prescribed height threshold).",
    recommendedAction: "Seize non-compliant batch sample for optical comparator laboratory verification.",
    status: "Pending Officer Review",
    officerVerified: false,
    date: "2026-09-10",
    inspectorName: "R. K. Sharma (Dy. Controller)"
  },
  {
    id: "VIO-2026-875",
    inspectionId: "LM-2026-10472",
    productId: "PRD-7740",
    productName: "Royal Spices Agmark Turmeric Powder (200g)",
    violationType: "Date Declaration",
    severity: "High",
    detectedText: "Date of Packing: [BLURRED / UNREADABLE]",
    ocrConfidence: 45,
    evidenceRegion: sampleImages.turmericPowder,
    expectedRequirement: "Rule 6(1)(d): Month and year of packing or pre-packing must be prominently displayed.",
    actualObservation: "Packing date stamp completely smudged and unreadable on outer packaging.",
    recommendedAction: "Issue Compound Notice and penalty under Section 36(1).",
    status: "Notice Issued",
    officerVerified: true,
    date: "2026-09-07",
    inspectorName: "P. N. Reddy (Inspector)"
  },
  {
    id: "VIO-2026-869",
    inspectionId: "LM-2026-10452",
    productId: "PRD-3209",
    productName: "GlowCare Anti-Aging Skin Cream (50g)",
    violationType: "Missing Declaration",
    severity: "High",
    detectedText: "Country of Origin: [MISSING]",
    ocrConfidence: 99,
    evidenceRegion: sampleImages.turmericPowder,
    expectedRequirement: "Rule 6(1)(aa): Name of the country of origin or manufacture must be declared on imported packages or pre-packed cosmetics.",
    actualObservation: "No country of origin printed on front or back label.",
    recommendedAction: "Seizure of imported lot under Rule 27.",
    status: "Pending Officer Review",
    officerVerified: false,
    date: "2026-09-04",
    inspectorName: "V. K. Singh (Inspector)"
  },
  {
    id: "VIO-2026-850",
    inspectionId: "LM-2026-10435",
    productId: "PRD-9912",
    productName: "Himalaya Herbal Baby Lotion (200ml)",
    violationType: "MRP Issue",
    severity: "Medium",
    detectedText: "Dual Price Print: ₹240 and stickers with ₹280",
    ocrConfidence: 94,
    evidenceRegion: sampleImages.basmatiRiceFront,
    expectedRequirement: "Rule 18(2): No retail dealer or manufacturer shall alter or overwrite the MRP.",
    actualObservation: "Sticker applied over pre-printed MRP raising price from ₹240 to ₹280.",
    recommendedAction: "Prosecution of retail premises under Section 36(2).",
    status: "Reviewed",
    officerVerified: true,
    date: "2026-09-01",
    inspectorName: "S. M. Gupta"
  }
];

export const mockUsers: SystemUser[] = [
  {
    id: "USR-101",
    name: "R. K. Sharma",
    role: "Enforcement Officer",
    department: "Legal Metrology Enforcement Dept",
    zone: "North Zone - Delhi NCR",
    status: "Active",
    lastActive: "Just now",
    email: "rk.sharma@legalmetrology.gov.in",
    phone: "+91 98100 12345"
  },
  {
    id: "USR-102",
    name: "Dr. Ananya Sen",
    role: "Administrator",
    department: "Directorate of Legal Metrology, Ministry of Consumer Affairs",
    zone: "HQ - New Delhi",
    status: "Active",
    lastActive: "12 mins ago",
    email: "ananya.sen@nic.in",
    phone: "+91 98711 65432"
  },
  {
    id: "USR-103",
    name: "V. K. Singh",
    role: "Enforcement Officer",
    department: "District Controller Office",
    zone: "Central Zone - Delhi",
    status: "Active",
    lastActive: "1 hour ago",
    email: "vk.singh@legalmetrology.gov.in",
    phone: "+91 98188 99887"
  },
  {
    id: "USR-104",
    name: "P. N. Reddy",
    role: "Reviewer",
    department: "Legal Metrology Verification Cell",
    zone: "South Zone - Bengaluru",
    status: "Active",
    lastActive: "Yesterday",
    email: "pn.reddy@karnataka.gov.in",
    phone: "+91 94480 33221"
  },
  {
    id: "USR-105",
    name: "S. M. Gupta",
    role: "Enforcement Officer",
    department: "Standards & Testing Division",
    zone: "West Zone - Mumbai",
    status: "Inactive",
    lastActive: "3 days ago",
    email: "sm.gupta@maharashtra.gov.in",
    phone: "+91 98200 44556"
  }
];

export const mockNotifications: AppNotification[] = [
  {
    id: "NOTIF-1",
    title: "High Severity Violation Detected",
    message: "Basmati Rice 5kg (LM-2026-10483) failed font size requirement (Rule 7).",
    time: "10 mins ago",
    type: "urgent",
    read: false,
    inspectionId: "LM-2026-10483"
  },
  {
    id: "NOTIF-2",
    title: "Product Requires Officer Verification",
    message: "Consumer care telephone contact verification pending for NatureFresh Atta 10kg.",
    time: "2 hours ago",
    type: "warning",
    read: false,
    inspectionId: "LM-2026-10460"
  },
  {
    id: "NOTIF-3",
    title: "Monthly Inspection Summary Ready",
    message: "August 2026 Legal Metrology enforcement compliance rate: 73.7%.",
    time: "1 day ago",
    type: "info",
    read: true
  }
];

export const analyticsData = {
  monthlyCompliance: [
    { month: "Apr", compliant: 180, violations: 50, review: 12 },
    { month: "May", compliant: 210, violations: 55, review: 15 },
    { month: "Jun", compliant: 240, violations: 62, review: 18 },
    { month: "Jul", compliant: 220, violations: 58, review: 14 },
    { month: "Aug", compliant: 290, violations: 74, review: 20 },
    { month: "Sep", compliant: 947, violations: 271, review: 66 },
  ],
  violationsByType: [
    { name: "MRP Issue", count: 88, fill: "#dc2626" },
    { name: "Font & Readability", count: 64, fill: "#ef4444" },
    { name: "Missing Declaration", count: 48, fill: "#f97316" },
    { name: "Date Declaration", count: 32, fill: "#eab308" },
    { name: "Net Quantity Issue", count: 24, fill: "#84cc16" },
    { name: "Consumer Care", count: 15, fill: "#06b6d4" },
  ],
  categoryCompliance: [
    { category: "Food Grain", compliant: 320, nonCompliant: 85 },
    { category: "Edible Oil", compliant: 210, nonCompliant: 30 },
    { category: "Dairy Products", compliant: 195, nonCompliant: 22 },
    { category: "Cosmetics", compliant: 82, nonCompliant: 74 },
    { category: "Beverages", compliant: 140, nonCompliant: 60 },
  ],
  topViolatingManufacturers: [
    { name: "Royal Spices India Ltd.", count: 14 },
    { name: "GlowCare Cosmetics Corp", count: 12 },
    { name: "FreshHarvest Foods Pvt. Ltd.", count: 9 },
    { name: "Desi Flavors Packagers", count: 7 },
    { name: "Apex Consumer Products", count: 6 },
  ]
};
