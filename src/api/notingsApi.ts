import axiosClient from "./axiosClient";
import {
  INotingMinuteItem,
  ForwardableOfficer,
  SaveDraftPayload,
  SignAndForwardPayload,
  CaseNotingsResponse,
  SignatureVerifyResponse,
} from "../types/noting.types";

export type {
  INotingMinuteItem,
  ForwardableOfficer,
  SaveDraftPayload,
  SignAndForwardPayload,
  CaseNotingsResponse,
  SignatureVerifyResponse,
};

export const NotingsAPI = {
  getForwardableOfficers: async (): Promise<{ success: boolean; data: ForwardableOfficer[] }> => {
    const res = await axiosClient.get("/cases/authorities/officers-list");
    return res.data;
  },

  getCaseNotings: async (caseId: string): Promise<CaseNotingsResponse> => {
    const res = await axiosClient.get(`/cases/${caseId}/notings`);
    return res.data;
  },

  saveDraftNoting: async (caseId: string, payload: SaveDraftPayload): Promise<{ success: boolean; message: string; data: INotingMinuteItem }> => {
    const res = await axiosClient.post(`/cases/${caseId}/notings/draft`, payload);
    return res.data;
  },

  signAndForwardNoting: async (caseId: string, payload: SignAndForwardPayload): Promise<{ success: boolean; message: string; data: INotingMinuteItem }> => {
    const res = await axiosClient.post(`/cases/${caseId}/notings/sign-and-forward`, payload);
    return res.data;
  },

  verifySignature: async (caseId: string, minuteNo: number): Promise<SignatureVerifyResponse> => {
    const res = await axiosClient.get(`/cases/${caseId}/notings/${minuteNo}/verify-signature`);
    return res.data;
  },

  downloadPrintMemoPdf: async (caseId: string): Promise<string> => {
    const res = await axiosClient.get(`/cases/${caseId}/notings/print-memo`, {
      params: { format: "pdf" },
      responseType: "text",
    });
    return res.data;
  },
};