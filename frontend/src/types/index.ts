export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review';
export type Severity = 'High' | 'Medium' | 'Low';

export type ViolationType = 
  | 'Missing Declaration'
  | 'MRP Issue'
  | 'Net Quantity Issue'
  | 'Manufacturer Details'
  | 'Consumer Care Details'
  | 'Date Declaration'
  | 'Font & Readability'
  | 'E-commerce Mandatory';

export interface BoundingBox {
  id: string;
  label: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage
  height: number; // percentage
  status: ComplianceStatus;
  ruleRef: string;
  detectedText: string;
  imageKey?: ImageSlot; // which uploaded image the box belongs to (defaults to front)
}

export type ImageSlot = 'front' | 'back' | 'side';

/** Location of a declaration on one of the uploaded images, in % of image size. */
export interface EvidenceRegion {
  imageKey: ImageSlot;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One raw text region returned by the OCR model. */
export interface OcrRegion {
  text: string;
  confidence: number; // 0-100
  heightPx: number;
  heightMm?: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ChecklistItem {
  id: string;
  requirement: string;
  ruleRef: string;
  detectedValue: string;
  status: ComplianceStatus;
  confidence: number; // percentage 0-100
  observation?: string;
  expectedValue?: string | null;
  severity?: Severity | null;
  recommendedAction?: string | null;
  field?: string;
  evidence?: EvidenceRegion | null;
}

export interface Violation {
  id: string;
  inspectionId: string;
  productId: string;
  productName: string;
  violationType: ViolationType;
  severity: Severity;
  detectedText: string;
  ocrConfidence: number;
  evidenceRegion: string;
  expectedRequirement: string;
  actualObservation: string;
  recommendedAction: string;
  status: 'Pending Officer Review' | 'Reviewed' | 'Notice Issued' | 'Dismissed';
  remarks?: string;
  officerVerified: boolean;
  date: string;
  inspectorName: string;
}

export interface Inspection {
  id: string;
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  batchLot: string;
  date: string;
  location: string;
  inspectorName: string;
  score: number;
  status: ComplianceStatus;
  totalChecks: number;
  compliantCount: number;
  reviewCount: number;
  violationCount: number;
  images: {
    front: string;
    back?: string;
    side?: string;
  };
  boundingBoxes: BoundingBox[];
  checklist: ChecklistItem[];
  officerRemarks?: string;
  violations?: Violation[];

  // ---- Present only on inspections produced by the OCR model (backend) ----
  source?: 'model' | 'mock';
  imageSizes?: Partial<Record<ImageSlot, { width: number; height: number }>>;
  ocr?: Partial<Record<ImageSlot, OcrRegion[]>>;
  calibrated?: boolean;
  reportAvailable?: { pdf: boolean; json: boolean };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  lastInspectionDate: string;
  lastInspectionId: string;
  score: number;
  violationsCount: number;
  status: ComplianceStatus;
  image: string;
}

export interface SystemUser {
  id: string;
  name: string;
  role: 'Administrator' | 'Enforcement Officer' | 'Reviewer';
  department: string;
  zone: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  email: string;
  phone: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'urgent' | 'warning' | 'info';
  read: boolean;
  inspectionId?: string;
}
