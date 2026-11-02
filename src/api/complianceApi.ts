import axiosClient from "./axiosClient";
import {
  ActiveStayItem,
  StaysRosterResponse,
  ContemptRadarItem,
  ContemptRadarResponse,
  ArchivedComplianceItem,
} from "../types/compliance.types";

export type {
  ActiveStayItem,
  StaysRosterResponse,
  ContemptRadarItem,
  ContemptRadarResponse,
  ArchivedComplianceItem,
};

export interface RegisterStayPayload {
  caseId: string;
  stayOrderScope: string;
  stayDurationDays?: number;
  vacationDeadline?: string;
  vacationMotionStatus?: string;
}

export interface RegisterContemptPayload {
  caseId: string;
  contemptNumber: string;
  originalWrit: string;
  contemnorName: string;
  courtDirections: string;
  daysRemaining?: number;
  totalDays?: number;
  severity?: "CRITICAL" | "HIGH_WARNING" | "MONITORED";
}

export const ComplianceAPI = {
  // --- 5.1 Active Stays Roster ---
  getActiveStays: async (): Promise<StaysRosterResponse> => {
    const res = await axiosClient.get("/compliance/stays");
    return res.data;
  },

  registerStay: async (
    payload: RegisterStayPayload
  ): Promise<{ success: boolean; message: string; data: ActiveStayItem }> => {
    const res = await axiosClient.post("/compliance/stays", payload);
    return res.data;
  },

  updateVacationMotion: async (
    id: string,
    payload: { vacationMotionStatus: string; vacationFilingDate?: string }
  ): Promise<{ success: boolean; message: string; data: ActiveStayItem }> => {
    const res = await axiosClient.put(`/compliance/stays/${id}/vacation`, payload);
    return res.data;
  },

  downloadStaysPdf: async (): Promise<string> => {
    const res = await axiosClient.get("/compliance/stays/export-pdf", {
      responseType: "text",
    });
    return res.data;
  },

  // --- 5.2 Contempt Risk Radar ---
  getContemptRadar: async (): Promise<ContemptRadarResponse> => {
    const res = await axiosClient.get("/compliance/contempt");
    return res.data;
  },

  registerContempt: async (
    payload: RegisterContemptPayload
  ): Promise<{ success: boolean; message: string; data: ContemptRadarItem }> => {
    const res = await axiosClient.post("/compliance/contempt", payload);
    return res.data;
  },

  triggerRedZoneAlerts: async (): Promise<{ success: boolean; count: number; message: string }> => {
    const res = await axiosClient.post("/compliance/contempt/trigger-redzone-alerts");
    return res.data;
  },

  downloadContemptPdf: async (): Promise<string> => {
    const res = await axiosClient.get("/compliance/contempt/export-pdf", {
      responseType: "text",
    });
    return res.data;
  },

  // --- 5.3 Compliance Filing & Archival ---
  getArchivedCompliance: async (): Promise<{
    success: boolean;
    count: number;
    data: ArchivedComplianceItem[];
  }> => {
    const res = await axiosClient.get("/compliance/archives");
    return res.data;
  },

  archiveCase: async (payload: {
    caseId: string;
    actionTakenByBoard: string;
    complianceAffidavitDate?: string;
    complianceProofDocUrl?: string;
  }): Promise<{ success: boolean; message: string; data: ArchivedComplianceItem }> => {
    const res = await axiosClient.post("/compliance/archive-case", payload);
    return res.data;
  },

  downloadArchivesPdf: async (): Promise<string> => {
    const res = await axiosClient.get("/compliance/archives/export-pdf", {
      responseType: "text",
    });
    return res.data;
  },
};