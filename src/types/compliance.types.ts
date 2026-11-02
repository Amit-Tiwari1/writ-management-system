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
  vacationMotionStatus:
    | "DRAFT PENDING CSC"
    | "LISTED FOR ARGUMENTS"
    | "URGENT ACTION REQUIRED"
    | "VACATION_FILED"
    | "DISPOSED";
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