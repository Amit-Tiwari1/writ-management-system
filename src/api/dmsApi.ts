import axiosClient from "./axiosClient";

export interface ICaseDocumentItem {
  _id: string;
  caseId: string;
  folderCategory: "01_petitions" | "02_notings" | "03_counter_affidavits" | "04_orders" | "05_compliance_proofs";
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  s3Bucket: string;
  sha256Hash: string;
  version: string;
  isVerifiedCopy: boolean;
  uploadedBy: string;
  annotations: Array<{
    _id?: string;
    pageNumber: number;
    selectedText?: string;
    comment: string;
    authorName: string;
    authorDesignation: string;
    createdAt?: string;
  }>;
  ocrTextContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StructuredFoldersResponse {
  success: boolean;
  totalCount: number;
  data: {
    "01_petitions": ICaseDocumentItem[];
    "02_notings": ICaseDocumentItem[];
    "03_counter_affidavits": ICaseDocumentItem[];
    "04_orders": ICaseDocumentItem[];
    "05_compliance_proofs": ICaseDocumentItem[];
  };
}

export const DmsAPI = {
    
  getCaseDocuments: async (caseId: string): Promise<StructuredFoldersResponse> => {
    const res = await axiosClient.get(`/cases/${caseId}/documents`);
    return res.data;
  },

  uploadDocument: async (caseId: string, formData: FormData) => {
    const res = await axiosClient.post(`/cases/${caseId}/documents/upload`, formData);
    return res.data;
  },

  viewDocumentStream: async (docId: string) => {
    const res = await axiosClient.get(`/cases/documents/${docId}/view`);
    return res.data;
  },

  deleteDocument: async (docId: string) => {
    const res = await axiosClient.delete(`/cases/documents/${docId}`);
    return res.data;
  },

  addAnnotation: async (docId: string, payload: { pageNumber: number; selectedText?: string; comment: string }) => {
    const res = await axiosClient.post(`/cases/documents/${docId}/annotations`, payload);
    return res.data;
  },

  searchOcr: async (caseId: string, query: string) => {
    const res = await axiosClient.get(`/cases/${caseId}/documents/search-ocr`, {
      params: { q: query },
    });
    return res.data;
  },
};