export interface IDigitalSignature {
  signerName: string;
  signerDesignation: string;
  signerSection: string;
  signedAt: string;
  certificateSerialNumber: string;
  issuerAuthority: string;
  sha256Seal: string;
  isValid: boolean;
}

export type NotingPurpose =
  | "PWC / Legal Opinion"
  | "Direction to Section"
  | "Para-Wise Comments (PWC) Approval"
  | "File Movement"
  | "Other";

export type FontEncoding = "Unicode" | "Kruti Dev 14";

export type MinuteStatus = "DRAFT" | "SIGNED_AND_FORWARDED";

export type FileUrgency = "Routine" | "Urgent" | "High Priority (NDOH)";

export interface INotingMinuteItem {
  _id: string;
  caseId: string;
  minuteNumber: number;
  minuteTitle: string;
  notingPurpose: NotingPurpose;
  fontEncoding: FontEncoding;
  content: string;
  authorId: string;
  authorName: string;
  authorDesignation: string;
  status: MinuteStatus;
  forwardToUserId?: string;
  forwardedToOfficerName?: string;
  forwardedToDesignation?: string;
  turnaroundDueDate?: string;
  fileUrgency: FileUrgency;
  signature?: IDigitalSignature;
  createdAt: string;
  updatedAt: string;
}

export interface ForwardableOfficer {
  userId: string;
  displayName: string;
  name: string;
  designation: string;
  section: string;
  role: string;
}

export interface SaveDraftPayload {
  content: string;
  minuteTitle?: string;
  notingPurpose?: NotingPurpose;
  fontEncoding?: FontEncoding;
  forwardToUserId?: string;
  turnaroundDueDate?: string;
  fileUrgency?: FileUrgency;
}

export interface SignAndForwardPayload extends SaveDraftPayload {
  minuteId?: string;
  forwardToUserId: string;
}

export interface CaseNotingsResponse {
  success: boolean;
  totalMinutes: number;
  signedMinutesCount: number;
  activeDraft: INotingMinuteItem | null;
  data: INotingMinuteItem[];
}

export interface SignatureVerificationAudit {
  minuteNumber: number;
  minuteTitle: string;
  signedBy: string;
  designation: string;
  section: string;
  timestamp: string;
  certificateSerial: string;
  caAuthority: string;
  sha256HashSeal: string;
  integrityCheck: string;
}

export interface SignatureVerifyResponse {
  success: boolean;
  isSigned: boolean;
  verificationStatus: string;
  auditDetails?: SignatureVerificationAudit;
  message?: string;
}