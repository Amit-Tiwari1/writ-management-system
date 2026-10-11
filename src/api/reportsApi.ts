import axiosClient from "./axiosClient";

export interface ReportItem {
  sNo: number;
  _id: string;
  fileNo: string;
  writOrNotice: string;
  cnrNumber: string;
  court: string;
  caseType: string;
  petitioner: string;
  respondent: string;
  wing: string;
  category: string;
  examCycle: string;
  oic: string;
  ndoh: string;
  status: string;
  stage: string;
  hasStay: boolean;
  isContempt: boolean;
}

export interface ReportDataResponse {
  success: boolean;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ReportItem[];
}

export const ReportsAPI = {
  // 1. Get Live Report Data for Table Grid
  getReportData: async (params: Record<string, any>): Promise<ReportDataResponse> => {
    const res = await axiosClient.get("/reports/data", { params });
    return res.data;
  },

  // 2. Download Excel Blob
  downloadExcel: async (params: Record<string, any>) => {
    const res = await axiosClient.get("/reports/export-excel", {
      params,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `UPPRPB_MIS_${params.reportType || "Report"}_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // 3. Download Watermarked PDF Blob
  downloadPdf: async (params: Record<string, any>) => {
    const res = await axiosClient.get("/reports/export-pdf", {
      params,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `UPPRPB_MIS_${params.reportType || "Report"}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};