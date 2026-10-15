export interface ConnectedWritItem {
  writNumber: string;
  cnrNumber?: string;
  petitionerName?: string;
  taggedDate?: string;
}

export interface CaseItem {
  _id: string;
  fileNo: string;
  noticeNumber?: string;
  writNumber?: string;
  cnrNumber?: string;
  identifierTier: 1 | 2 | 3 | 4;
  court: string;
  courtCode: string;
  caseType: string;
  benchLocation: string;
  courtRoomNo?: string;
  coramBench?: string;
  leadPetitioner: string;
  respondentString: string;
  assignedOIC: string;
  assignedPairokar: string;
  sectionWing: string;
  category: string;
  subCategory?: string;
  disputeSubject: string;
  stage: string;
  judicialStatus: string;
  internalHold?: {
    location: string;
    holdDays: number;
  };
  ndoh: string | null;
  hasActiveStay: boolean;
  isContemptNotice: boolean;
  connectedWrits: ConnectedWritItem[];
  coPetitionersCount: number;
  syncStatus: "LIVE_SYNCED" | "SCHEDULED" | "MANUAL_DOCKET" | "DISCREPANCY";
  createdAt: string;
}

export interface PillsMetrics {
  all: number;
  withConnected: number;
  advanceNotice: number;
  stayInForce: number;
  contemptAlerts: number;
}

export interface CasesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}