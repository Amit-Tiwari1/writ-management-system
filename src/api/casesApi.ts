import axiosClient from "./axiosClient";

import {
  CaseItem,
  CasesListResponse,
  CasesPagination,
  PillsMetrics,
  PetitionerItem,
  CaseHearingHistoryItem,
  CaseIntakePayload,
} from "../types/case.types";


export interface CaseFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  court?: string;
  wing?: string;
  statusFilter?: "with_connected" | "advance_notice" | "stay" | "contempt" | "";
  hearingDate?: string;
  caseType?: string;
  category?: string;
  subCategory?: string;
  subject?: string;
  oic?: string;
  state?: string;
}


export interface LinkDiscoveredPayload {
  docketNo: string;
  caseNoYear: string;
  cnrNumber?: string;
  courtHall?: string;
  itemNo?: string;
  listingDate?: string;
}


export interface DropdownWritItem {
  id: string;
  fileNo: string;
  writNumber: string;
  label: string;
  petitioner: string;
  court: string;
  stage: string;
  oic: string;
}


export interface DropdownWritsResponse {
  success: boolean;
  count: number;
  data: DropdownWritItem[];
}


export interface RecordHearingPayload {
  hearingDate: string;
  ndoh: string | null;
  courtRoomNo?: string;
  judgeCoram?: string;
  listingItemNo?: string;
  stageOfCase?: string;
  businessRecorded: string;
  orderType?: string;
  orderDocId?: string;
  orderDocumentUrl?: string;
}


export interface ActionMappingPayload {
  actionMappingId?: string;
  courtDecisionOutcome: string;
  actionStatus: string;
  requiresComplianceDeadline: boolean;
  defaultDeadlineDays?: number;
  customDeadlineDays?: number;
  exactDeadlineDate?: string;
  orderDate: string;
  courtDirections?: string;
  stayScope?: string;
  recordType?: "STAY" | "CONTEMPT" | "GENERAL_DIRECTION";
}


export const CasesAPI = {

  // -----------------------------------------
  // 2.1 Case Register
  // -----------------------------------------

  getCases: async (
    params: CaseFilterQuery
  ): Promise<CasesListResponse> => {
    const res = await axiosClient.get("/cases", { params });
    return res.data;
  },


  getCaseById: async (
    id: string
  ): Promise<{
    success: boolean;
    case: CaseItem;
    petitioners: PetitionerItem[];
    hearings?: CaseHearingHistoryItem[];
  }> => {
    const res = await axiosClient.get(`/cases/${id}`);
    return res.data;
  },


  // -----------------------------------------
  // 2.2 Case Intake Wizard
  // -----------------------------------------

  checkDuplicate: async (params: {
    fileNo?: string;
    noticeNumber?: string;
    writNumber?: string;
    cnrNumber?: string;
  }) => {
    const res = await axiosClient.get(
      "/intake/check-duplicate",
      { params }
    );

    return res.data;
  },


  /**
   * Register a new case.
   *
   * CaseIntakePayload ensures that required reference IDs
   * are passed instead of display names.
   */
  createCaseIntake: async (
    payload: CaseIntakePayload
  ): Promise<{
    success: boolean;
    message: string;
    case: CaseItem;
  }> => {
    const res = await axiosClient.post(
      "/intake/register",
      payload
    );

    return res.data;
  },


  mockVerifyCNR: async (cnrNumber: string) => {
    const res = await axiosClient.post(
      "/mock/ecourts/verify-cnr",
      { cnrNumber }
    );

    return res.data;
  },


  syncCaseWithECourts: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
    case: CaseItem;
  }> => {
    const res = await axiosClient.post(
      `/cases/${id}/sync-ecourts`
    );

    return res.data;
  },


  // -----------------------------------------
  // Hearing Proceedings & Undo Rollback
  // -----------------------------------------

  getCaseHearingHistory: async (
    id: string
  ): Promise<{
    success: boolean;
    count: number;
    data: CaseHearingHistoryItem[];
  }> => {
    const res = await axiosClient.get(
      `/cases/${id}/hearings`
    );

    return res.data;
  },


  recordHearing: async (
    id: string,
    payload: RecordHearingPayload
  ) => {
    const res = await axiosClient.post(
      `/cases/${id}/hearings`,
      payload
    );

    return res.data;
  },


  rollbackHearing: async (historyId: string) => {
    const res = await axiosClient.post(
      `/cases/hearings/${historyId}/rollback`
    );

    return res.data;
  },


  applyActionMapping: async (
    id: string,
    payload: ActionMappingPayload
  ) => {
    const res = await axiosClient.post(
      `/cases/${id}/action-mapping`,
      payload
    );

    return res.data;
  },


  // -----------------------------------------
  // 2.3 Co-Petitioners Registry
  // -----------------------------------------

  getCasePetitioners: async (
    caseId: string
  ): Promise<{
    success: boolean;
    count: number;
    data: PetitionerItem[];
  }> => {
    const res = await axiosClient.get(
      `/cases/${caseId}/petitioners`
    );

    return res.data;
  },


  addCoPetitioner: async (
    caseId: string,
    payload: any
  ) => {
    const res = await axiosClient.post(
      `/cases/${caseId}/petitioners`,
      payload
    );

    return res.data;
  },


  deletePetitioner: async (
    caseId: string,
    petitionerId: string
  ) => {
    const res = await axiosClient.delete(
      `/cases/${caseId}/petitioners/${petitionerId}`
    );

    return res.data;
  },


  bulkUploadPetitioners: async (
    caseId: string,
    petitioners: any[]
  ) => {
    const res = await axiosClient.post(
      `/cases/${caseId}/petitioners/bulk-upload`,
      { petitioners }
    );

    return res.data;
  },


  // -----------------------------------------
  // 2.4 Inward Discovery Desk
  // -----------------------------------------

  getUnclaimedDiscovery: async () => {
    const res = await axiosClient.get(
      "/discovery/unclaimed"
    );

    return res.data;
  },


  linkDiscoveredWritToNotice: async (
    payload: LinkDiscoveredPayload
  ) => {
    const res = await axiosClient.post(
      "/discovery/link-notice",
      payload
    );

    return res.data;
  },


  acceptDiscoveryItem: async (id: string) => {
    const res = await axiosClient.post(
      `/discovery/${id}/accept`
    );

    return res.data;
  },


  ignoreDiscoveryItem: async (id: string) => {
    const res = await axiosClient.post(
      `/discovery/${id}/ignore`
    );

    return res.data;
  },


  triggerScraper: async (
    bench?: "Allahabad" | "Lucknow"
  ) => {
    const res = await axiosClient.post(
      "/discovery/trigger-scraper",
      { bench }
    );

    return res.data;
  },


  uploadCauseListPdf: async (formData: FormData) => {
    const res = await axiosClient.post(
      "/discovery/upload-pdf",
      formData
    );

    return res.data;
  },


  // -----------------------------------------
  // Global Dropdowns
  // -----------------------------------------

  getDropdownWritsList: async (): Promise<DropdownWritsResponse> => {
    const res = await axiosClient.get(
      "/cases/dropdown-list"
    );

    return res.data;
  },


  downloadCaseDossierPdf: async (
    id: string
  ): Promise<string> => {
    const res = await axiosClient.get(
      `/cases/${id}/export-pdf`,
      {
        responseType: "text",
      }
    );

    return res.data;
  },

};


// -----------------------------------------
// Export Types
// -----------------------------------------

export type { CaseItem };

export type {
  CasesListResponse,
  CasesPagination,
  PillsMetrics,
  PetitionerItem,
  CaseHearingHistoryItem,
};