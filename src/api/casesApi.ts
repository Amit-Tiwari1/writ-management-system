import axiosClient from "./axiosClient";

export interface ConnectedWrit {
  caseId?: string;
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
  petitionerAdvocate?: string;
  stateCounsel?: string;
  assignedOIC: string;
  assignedPairokar: string;
  sectionWing: string;
  category: string;
  subCategory?: string;
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
  internalHold: {
    currentHolderId?: string;
    location: string;
    holdDays: number;
    heldSince?: string;
  };
  ndoh: string | null;
  listingItemNo?: string;
  hasActiveStay: boolean;
  stayScope?: string;
  isContemptNotice: boolean;
  connectedWrits: ConnectedWrit[];
  coPetitionersCount: number;
  syncStatus: "LIVE_SYNCED" | "SCHEDULED" | "MANUAL_DOCKET" | "DISCREPANCY";
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CasesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PillsMetrics {
  all: number;
  withConnected: number;
  advanceNotice: number;
  stayInForce: number;
  contemptAlerts: number;
}

export interface CasesListResponse {
  success: boolean;
  data: CaseItem[];
  pagination: CasesPagination;
  pillsMetrics: PillsMetrics;
}

export interface CaseFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  court?: string;
  wing?: string;
  statusFilter?: "with_connected" | "advance_notice" | "stay" | "contempt" | "";
}

export interface LinkDiscoveredPayload {
  docketNo: string;
  caseNoYear: string;
  cnrNumber?: string;
  courtHall?: string;
  itemNo?: string;
  listingDate?: string;
}

export const CasesAPI = {
  getCases: async (params: CaseFilterQuery): Promise<CasesListResponse> => {
    const res = await axiosClient.get("/cases", { params });
    return res.data;
  },

  getCaseById: async (id: string) => {
    const res = await axiosClient.get(`/cases/${id}`);
    return res.data;
  },

  syncCaseWithECourts: async (id: string) => {
    const res = await axiosClient.post(`/cases/${id}/sync-ecourts`);
    return res.data;
  },

  // 2.4 Inward Discovery Desk Methods
  getUnclaimedDiscovery: async () => {
    const res = await axiosClient.get("/discovery/unclaimed");
    return res.data;
  },

  linkDiscoveredWritToNotice: async (payload: LinkDiscoveredPayload) => {
    const res = await axiosClient.post("/discovery/link-notice", payload);
    return res.data;
  },

  triggerScraper: async () => {
    const res = await axiosClient.post("/discovery/trigger-scraper");
    return res.data;
  },

  uploadCauseListPdf: async (formData: FormData) => {
    const res = await axiosClient.post("/discovery/upload-pdf-causelist", formData);
    return res.data;
  },
};