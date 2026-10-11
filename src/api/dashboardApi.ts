import axiosClient from "./axiosClient";

export interface DashboardKpisResponse {
  success: boolean;
  data: {
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
  };
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
    instructionsPwc: number;
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

export const DashboardAPI = {
  // 1. Top 4 High-Level KPI Cards
  getKpis: async (): Promise<DashboardKpisResponse> => {
    const res = await axiosClient.get("/dashboard/kpis");
    return res.data;
  },

  // 2. Multi-Dimensional Writ Classification Matrix
  getMatrix: async (params?: {
    wing?: string;
    courtCode?: string;
    year?: string;
  }): Promise<ClassificationMatrixResponse> => {
    const res = await axiosClient.get("/dashboard/matrix", { params });
    return res.data;
  },

  // 3. Court Forum Breakdown
  getCourtDistribution: async (): Promise<CourtDistributionResponse> => {
    const res = await axiosClient.get("/dashboard/court-distribution");
    return res.data;
  },

  // 4. OIC Pending Workload Roster
  getOicWorkload: async (): Promise<OicWorkloadResponse> => {
    const res = await axiosClient.get("/dashboard/oic-workload");
    return res.data;
  },

  // 5. Monthly Hearing Calendar Heatmap
  getCalendarHeatmap: async (params?: {
    month?: number;
    year?: number;
  }): Promise<CalendarHeatmapResponse> => {
    const res = await axiosClient.get("/dashboard/calendar-heatmap", { params });
    return res.data;
  },
};