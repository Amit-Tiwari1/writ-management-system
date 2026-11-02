export interface ConnectedWritItem {
  caseId?: string;
  writNumber: string;
  cnrNumber?: string;
  petitionerName?: string;
  taggedDate?: string;
}

export interface InternalHoldItem {
  currentHolderId?: string;
  location: string;
  holdDays: number;
  heldSince?: string;
}

export interface CaseItem {
  _id: string;
  fileNo: string;
  noticeNumber?: string;
  writNumber?: string;
  cnrNumber?: string;
  identifierTier: 1 | 2 | 3 | 4;
  courtId?: any;
  court: string;
  courtCode: string;
  caseTypeId?: any;
  caseType: string;
  caseNumber?: string;
  caseYear?: number;
  benchLocation: "Allahabad" | "Lucknow" | "New Delhi";
  courtRoomNo?: string;
  coramBench?: string;
  leadPetitioner: string;
  respondentString: string;
  petitionerAdvocate?: string;
  stateCounsel?: string;
  assignedOIC: string;
  assignedPairokar: string;
  sectionWing: string;
  categoryId?: any;
  category: string;
  subCategoryId?: any;
  subCategory?: string;
  subjectId?: any;
  disputeSubject: string;
  examCycle: string;
  stage: string;
  judicialStatus:
    | "PRE_NOTICE"
    | "ACTIVE"
    | "PENDING_PWC"
    | "STAY_IN_FORCE"
    | "CONTEMPT_NOTICE"
    | "DISPOSED"
    | "ARCHIVED";
  internalHold?: InternalHoldItem;
  ndoh: string | null;
  listingItemNo?: string;
  hasActiveStay: boolean;
  stayScope?: string;
  stayGrantedDate?: string;
  stayVacationDueDate?: string;
  isContemptNotice: boolean;
  contemptDeadlineDate?: string;
  connectedWrits: ConnectedWritItem[];
  coPetitionersCount: number;
  syncStatus: "LIVE_SYNCED" | "SCHEDULED" | "MANUAL_DOCKET" | "DISCREPANCY";
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PetitionerItem {
  _id: string;
  caseId: string;
  fileNo: string;
  rollNo: string;
  registrationNo?: string;
  name: string;
  fatherName?: string;
  role: "Lead Petitioner" | "Co-Petitioner";
  categoryClaimed: string;
  postClaimed: string;
  state: string;
  district: string;
  districtId?: any;
  stateId?: any;
  status: "ACTIVE" | "WITHDRAWN" | "DISMISSED_ON_MERIT" | "RELIEF_GRANTED";
  meritScore?: number;
  meritGrievance?: string;
  source: "MANUAL_ENTRY" | "CSV_IMPORT" | "ECOURTS_SYNC";
  batchUploadId?: string;
  createdAt: string;
}

export interface CaseHearingHistoryItem {
  _id: string;
  caseId: string;
  fileNo: string;
  hearingDate: string;
  ndoh: string | null;
  courtRoomNo?: string;
  judgeCoram?: string;
  listingItemNo?: string;
  stageOfCase?: string;
  businessRecorded: string;
  orderType:
    | "INTERIM_ORDER"
    | "ADJOURNMENT"
    | "FINAL_JUDGMENT"
    | "DIRECTION_ISSUED"
    | "COUNTER_AFFIDAVIT_CALLED"
    | "STAY_GRANTED"
    | "STAY_EXTENDED"
    | "STAY_VACATED"
    | "CONTEMPT_NOTICE_ISSUED";
  orderDocId?: string;
  orderDocumentUrl?: string;
  source: "MANUAL_ENTRY" | "ECOURTS_SCRAPER" | "ROLLBACK";
  enteredByOfficerName: string;
  enteredByDesignation: string;
  isOverridden: boolean;
  overriddenReason?: string;
  previousSnapshot?: {
    ndoh: string | null;
    stageOfCase?: string;
    courtRoomNo?: string;
    judicialStatus?: string;
  };
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

export interface CasesListResponse {
  success: boolean;
  data: CaseItem[];
  pagination: CasesPagination;
  pillsMetrics: PillsMetrics;
}