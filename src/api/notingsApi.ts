import axiosClient from "./axiosClient";

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

export interface INotingMinuteItem {
  _id: string;
  caseId: string;
  minuteNumber: number;
  minuteTitle: string;
  notingPurpose: "PWC / Legal Opinion" | "Direction to Section" | "Para-Wise Comments (PWC) Approval" | "File Movement" | "Other";
  fontEncoding: "Unicode" | "Kruti Dev 14";
  content: string;
  authorId: string;
  authorName: string;
  authorDesignation: string;
  status: "DRAFT" | "SIGNED_AND_FORWARDED";
  forwardToUserId?: string;
  forwardedToOfficerName?: string;
  forwardedToDesignation?: string;
  turnaroundDueDate?: string;
  fileUrgency: "Routine" | "Urgent" | "High Priority (NDOH)";
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
  notingPurpose?: string;
  fontEncoding?: string;
  forwardToUserId?: string;
  turnaroundDueDate?: string;
  fileUrgency?: string;
}

export interface SignAndForwardPayload extends SaveDraftPayload {
  minuteId?: string;
  forwardToUserId: string;
}

export const NotingsAPI = {
  getForwardableOfficers: async () => {
    const res = await axiosClient.get<{ success: boolean; data: ForwardableOfficer[] }>(
      "/cases/authorities/officers-list"
    );
    return res.data;
  },

  getCaseNotings: async (caseId: string) => {
    const res = await axiosClient.get<{
      success: boolean;
      totalMinutes: number;
      signedMinutesCount: number;
      activeDraft: INotingMinuteItem | null;
      data: INotingMinuteItem[];
    }>(`/cases/${caseId}/notings`);
    return res.data;
  },

  saveDraftNoting: async (caseId: string, payload: SaveDraftPayload) => {
    const res = await axiosClient.post(`/cases/${caseId}/notings/draft`, payload);
    return res.data;
  },

  signAndForwardNoting: async (caseId: string, payload: SignAndForwardPayload) => {
    const res = await axiosClient.post(`/cases/${caseId}/notings/sign-and-forward`, payload);
    return res.data;
  },

  verifySignature: async (caseId: string, minuteNo: number) => {
    const res = await axiosClient.get(`/cases/${caseId}/notings/${minuteNo}/verify-signature`);
    return res.data;
  },

  getPrintMemo: async (caseId: string) => {
    const res = await axiosClient.get(`/cases/${caseId}/notings/print-memo`);
    return res.data;
  },
};