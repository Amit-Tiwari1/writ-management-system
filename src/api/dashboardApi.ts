
import axiosClient from "./axiosClient";

import type {
  DashboardKpisResponse,
  ClassificationMatrixResponse,
  CourtDistributionResponse,
  OicWorkloadResponse,
  CalendarHeatmapResponse,
  HearingDateCasesResponse,
  MatrixRowItem,
  MatrixSummary,
  CourtForumItem,
  OicWorkloadItem,
  CalendarDayItem,
  HearingDateCaseItem,
} from "../types/dashboard.types";

// Re-export dashboard types for convenient imports elsewhere.
export type {
  DashboardKpisResponse,
  ClassificationMatrixResponse,
  CourtDistributionResponse,
  OicWorkloadResponse,
  CalendarHeatmapResponse,
  HearingDateCasesResponse,
  MatrixRowItem,
  MatrixSummary,
  CourtForumItem,
  OicWorkloadItem,
  CalendarDayItem,
  HearingDateCaseItem,
};

export const DashboardAPI = {
 

  getKpis: async (): Promise<DashboardKpisResponse> => {
    const res = await axiosClient.get("/dashboard/kpis");
    return res.data;
  },

  getMatrix: async (params?: {
    wing?: string;
    courtCode?: string;
    year?: string | number;
  }): Promise<ClassificationMatrixResponse> => {
    const res = await axiosClient.get("/dashboard/matrix", {
      params,
    });

    return res.data;
  },

  getCourtDistribution: async (): Promise<CourtDistributionResponse> => {
    const res = await axiosClient.get("/dashboard/court-distribution");
    return res.data;
  },


  getOicWorkload: async (): Promise<OicWorkloadResponse> => {
    const res = await axiosClient.get("/dashboard/oic-workload");
    return res.data;
  },


  getCalendarHeatmap: async (params?: {
    month?: number;
    year?: number;
  }): Promise<CalendarHeatmapResponse> => {
    const res = await axiosClient.get("/dashboard/calendar-heatmap", {
      params,
    });

    return res.data;
  },

  getCasesForHearingDate: async (
    dateString: string
  ): Promise<HearingDateCasesResponse> => {
    const res = await axiosClient.get("/dashboard/calendar-cases", {
      params: {
        date: dateString,
      },
    });

    return res.data;
  },
  downloadMatrixPdf: async (params?: {
    wing?: string;
    courtCode?: string;
    year?: string | number;
  }): Promise<string> => {
    const res = await axiosClient.get("/dashboard/matrix/export-pdf", {
      params,
      responseType: "text",
    });

    return res.data;
  },
};
