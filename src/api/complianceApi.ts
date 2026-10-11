import axiosClient from "./axiosClient";

export interface ActiveStayItem {
  _id: string;
  caseId: string;
  caseAndCnr: {
    writNumber: string;
    cnrNumber?: string;
    fileNo: string;
  };
  courtAndCoram: {
    court: string;
    coram?: string;
  };
  stayOrderScope?: string;
  orderDateAndDuration: {
    orderDate?: string;
    stayDurationDays: number;
  };
  vacationMotionStatus: string;
  vacationDeadline?: string;
  oic: string;
}

export interface StaysRosterResponse {
  success: boolean;
  metrics: {
    totalActiveStays: number;
    vacationMotionsDueUnder7Days: number;
    vacationApplicationsFiled: number;
    averageStayDurationDays: number;
  };
  data: ActiveStayItem[];
}

export interface ContemptRadarItem {
  _id: string;
  caseId: string;
  severity: "CRITICAL" | "HIGH_WARNING" | "MONITORED";
  contemptCaseAndWrit: {
    contemptNumber: string;
    originalWrit: string;
    court: string;
  };
  petitionerAndContemnor: {
    petitioner: string;
    contemnor: string;
  };
  courtDirections: string;
  countdown: {
    daysRemaining: number;
    totalDays: number;
  };
  complianceProgress: string;
  oic: string;
}

export interface ContemptRadarResponse {
  success: boolean;
  summary: {
    totalShowCauseMatters: number;
    level3CriticalUnder3Days: number;
    level2HighWarningUnder7Days: number;
    level1MonitoredUnder14Days: number;
  };
  data: ContemptRadarItem[];
}

export interface ArchivedComplianceItem {
  _id: string;
  caseId: string;
  caseNoAndCnr: {
    writNumber: string;
    cnrNumber?: string;
  };
  petitionerAndCourt: {
    petitioner: string;
    court: string;
  };
  judicialDirectionGiven: string;
  actionTakenByBoard: string;
  complianceAffidavitFiled: {
    date: string;
    proofDocUrl: string;
  };
  closedByAndDate: {
    closedBy: string;
    closedAt: string;
  };
  status: string;
}

export const ComplianceAPI = {
  // 5.1 Stays
  getActiveStays: async (): Promise<StaysRosterResponse> => {
    const res = await axiosClient.get("/compliance/stays");
    return res.data;
  },
  registerStay: async (payload: any) => {
    const res = await axiosClient.post("/compliance/stays", payload);
    return res.data;
  },
  updateVacationMotion: async (id: string, payload: { vacationMotionStatus: string; vacationFilingDate?: string }) => {
    const res = await axiosClient.put(`/compliance/stays/${id}/vacation`, payload);
    return res.data;
  },

  // 5.2 Contempt
  getContemptRadar: async (): Promise<ContemptRadarResponse> => {
    const res = await axiosClient.get("/compliance/contempt");
    return res.data;
  },
  registerContempt: async (payload: any) => {
    const res = await axiosClient.post("/compliance/contempt", payload);
    return res.data;
  },
  triggerRedZoneAlerts: async () => {
    const res = await axiosClient.post("/compliance/contempt/trigger-redzone-alerts");
    return res.data;
  },

  // 5.3 Archival
  getArchivedCompliance: async () => {
    const res = await axiosClient.get<{ success: boolean; count: number; data: ArchivedComplianceItem[] }>(
      "/compliance/archives"
    );
    return res.data;
  },
  archiveCase: async (payload: {
    caseId: string;
    actionTakenByBoard: string;
    complianceAffidavitDate?: string;
    complianceProofDocUrl?: string;
  }) => {
    const res = await axiosClient.post("/compliance/archive-case", payload);
    return res.data;
  },
};