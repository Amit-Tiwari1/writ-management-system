
/**
 * Common MongoDB reference types
 * Supports both raw ObjectId strings and populated Mongoose documents.
 */

export type MongoId = string;

export interface NamedReference {
  _id: MongoId;
  name?: string;
  title?: string;
  label?: string;
}

export interface CourtReference extends NamedReference {
  courtName?: string;
  shortCode?: string;
  location?: string;
}

export interface CaseTypeReference extends NamedReference {
  caseTypeName?: string;
  shortName?: string;
}

export interface CategoryReference extends NamedReference {
  categoryName?: string;
}

export interface SubCategoryReference extends NamedReference {
  subCategoryName?: string;
}

export interface SubjectReference extends NamedReference {
  subjectTitle?: string;
}

export interface UserReference {
  _id: MongoId;
  name?: string;
  officerName?: string;
  email?: string;
  designation?: string;
}

export type MasterIdReference<T> = MongoId | T;

export type UserIdReference = MongoId | UserReference;

// --------------------------------------------------
// Connected Writ
// --------------------------------------------------

export interface ConnectedWritItem {
  caseId?: MongoId;
  writNumber: string;
  cnrNumber?: string;
  petitionerName?: string;
  taggedDate?: string;
}

// --------------------------------------------------
// Internal Hold
// --------------------------------------------------

export interface InternalHoldItem {
  currentHolderId?: UserIdReference;
  location: string;
  holdDays: number;
  heldSince?: string;
}

// --------------------------------------------------
// Case Register Item
// --------------------------------------------------

export interface CaseItem {
  _id: MongoId;

  fileNo: string;

  noticeNumber?: string;
  writNumber?: string;
  cnrNumber?: string;

  identifierTier: 1 | 2 | 3 | 4;

  courtId?: MasterIdReference<CourtReference>;
  court: string;
  courtCode: string;

  caseTypeId?: MasterIdReference<CaseTypeReference>;
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

  assignedOIC: UserIdReference;
  assignedPairokar: UserIdReference;

  sectionWing: string;

  categoryId?: MasterIdReference<CategoryReference>;
  category: string;

  subCategoryId?: MasterIdReference<SubCategoryReference>;
  subCategory?: string;

  subjectId?: MasterIdReference<SubjectReference>;
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

  syncStatus:
    | "LIVE_SYNCED"
    | "SCHEDULED"
    | "MANUAL_DOCKET"
    | "DISCREPANCY";

  lastSyncedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------
// Petitioner Item
// --------------------------------------------------

export interface PetitionerItem {
  _id: MongoId;
  caseId: MongoId;
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

  stateId?: MasterIdReference<NamedReference>;
  districtId?: MasterIdReference<NamedReference>;

  status:
    | "ACTIVE"
    | "WITHDRAWN"
    | "DISMISSED_ON_MERIT"
    | "RELIEF_GRANTED";

  meritScore?: number;
  meritGrievance?: string;

  source: "MANUAL_ENTRY" | "CSV_IMPORT" | "ECOURTS_SYNC";

  batchUploadId?: string;

  createdAt: string;
}

// --------------------------------------------------
// Case Intake Petitioner Payload
// --------------------------------------------------

export interface CaseIntakePetitionerPayload {
  rollNo: string;
  registrationNo?: string;

  name: string;
  fatherName?: string;

  role: "Lead Petitioner" | "Co-Petitioner";

  categoryClaimed?: string;
  postClaimed?: string;

  state: string;
  district: string;

  stateId?: MongoId;
  districtId?: MongoId;

  meritScore?: number;
}

// --------------------------------------------------
// Case Intake API Payload
// --------------------------------------------------

export interface CaseIntakePayload {
  mode: "NOTICE" | "WRIT" | "CNR";

  noticeNumber?: string;
  writNumber?: string;
  cnrNumber?: string;

  court: string;
  courtId: MongoId;
  courtCode: string;

  caseType: string;
  caseTypeId: MongoId;

  caseNumber?: string;
  caseYear?: number;

  benchLocation: "Allahabad" | "Lucknow" | "New Delhi";

  courtRoomNo?: string;
  coramBench?: string;

  leadPetitioner: string;
  leadPetitionerRollNo?: string;
  leadPetitionerFatherName?: string;

  district: string;
  state: string;

  respondentString: string;

  petitionerAdvocate?: string;
  stateCounsel?: string;

  sectionWing: string;

  assignedOIC: MongoId;
  assignedPairokar: MongoId;

  category: string;
  categoryId: MongoId;

  subCategory?: string;
  subCategoryId: MongoId;

  disputeSubject: string;
  subjectId: MongoId;

  examCycle?: string;

  hasActiveStay: boolean;
  stayScope?: string;

  isContemptNotice: boolean;

  ndoh: string | null;

  remarks?: string;

  petitioners: CaseIntakePetitionerPayload[];
}

// --------------------------------------------------
// Case Hearing History
// --------------------------------------------------

export interface CaseHearingHistoryItem {
  _id: MongoId;
  caseId: MongoId;
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

  orderDocId?: MongoId;
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

// --------------------------------------------------
// Case Dashboard Metrics
// --------------------------------------------------

export interface PillsMetrics {
  all: number;
  withConnected: number;
  advanceNotice: number;
  stayInForce: number;
  contemptAlerts: number;
}

// --------------------------------------------------
// Pagination
// --------------------------------------------------

export interface CasesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --------------------------------------------------
// Case List API Response
// --------------------------------------------------

export interface CasesListResponse {
  success: boolean;
  data: CaseItem[];
  pagination: CasesPagination;
  pillsMetrics: PillsMetrics;
}
