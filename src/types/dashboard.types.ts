
export interface DashboardKpis {
  activeWrits: {
    total: number;
    filedThisMonth: number;
    previous: number;
  };
  pendingInCourt: {
    total: number;
    description: string;
  };
  actionInBoard: {
    total: number;
    pwcAwaited: number;
    toBeClosed: number;
  };
  complianceRate: {
    rate: number;
    target: number;
  };
}

export interface DashboardKpisResponse {
  success: boolean;
  data: DashboardKpis;
}

export interface MatrixRowItem {
  caseType: string;
  label: string;

  atAGlance: {
    previous: number;
    inCurrentMonth: number;
    total: number;
  };

  closed: {
    closed: number;
    toBeClosed: number;
  };

  pending: {
    inBoard: number;
    inUnits: number;
    inCourt: number;
  };

  dismissedWithdrawn: {
    dismissed: number;
    withdrawn: number;
  };

  representationPending: {
    pwcInstructions: number;
    allowedOff: number;
    disposedOff: number;
    otherPending: number;
  };
}

export interface MatrixSummary {
  previous: number;
  inCurrentMonth: number;
  total: number;
  closed: number;
  toBeClosed: number;
  inBoard: number;
  inUnits: number;
  inCourt: number;
  instructionsPwc: number;
  allowedOff: number;
  disposedOff: number;
  otherPending: number;
}

export interface ClassificationMatrixResponse {
  success: boolean;
  data: {
    rows: MatrixRowItem[];
    summary: MatrixSummary;
  };
}

export interface CourtForumItem {
  courtId: string;
  courtName: string;
  shortCode: string;
  location: string;
  activeCount: number;
}

export interface CourtDistributionResponse {
  success: boolean;
  data: {
    totalActive: number;
    courts: CourtForumItem[];
  };
}

export interface OicWorkloadItem {
  sNo: number;
  officerId: string;
  officerName: string;
  designation: string;
  sectionWing: string;
  total: number;
  actionDue: number;
  commentsNotSent: number;
  caNotFiled: number;
  toBeClosed: number;
  status: "success" | "warning" | "danger";
}

export interface OicWorkloadResponse {
  success: boolean;
  count: number;
  data: OicWorkloadItem[];
}

export interface CalendarDayItem {
  day: number;
  dateStr?: string;
  count: number;
  isHighRisk: boolean;
}

export interface CalendarHeatmapResponse {
  success: boolean;
  data: {
    year: number;
    month: number;
    days: CalendarDayItem[];
  };
}

export interface HearingDateCaseItem {
  _id: string;
  fileNo: string;
  writNumber?: string;
  cnrNumber?: string;
  courtCode: string;
  benchLocation?: string;
  courtRoomNo?: string;
  leadPetitioner: string;
  petitionerAdvocate?: string;
  assignedOIC?: string;
  stage?: string;
  hasActiveStay?: boolean;
  isContemptNotice?: boolean;
}

export interface HearingDateCasesResponse {
  success: boolean;
  count: number;
  date: string;
  data: HearingDateCaseItem[];
}
