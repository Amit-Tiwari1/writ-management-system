import axiosClient from "./axiosClient";

export interface UserDropdownBundle {
  ranks: Array<{ _id: string; rankName: string; shortCode: string }>;
  designations: Array<{ _id: string; title: string; authorityLevel: string }>;
  departments: Array<{ _id: string; unitName: string; unitCode: string }>;
  roles: Array<{ _id: string; roleName: string; roleCode: string }>;
  courtBenches: string[];
}

export interface StaffUserItem {
  _id: string;
  sNo: number;
  officerName: string;
  designationAndWing: {
    designation: string;
    wing: string;
  };
  userIdLogin: string;
  contactAndEmail: {
    contact: string;
    email: string;
  };
  assignedRole: string;
  roleId?: string;
  rank?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface StaffUsersResponse {
  success: boolean;
  activeStaffCount: number;
  totalCount: number;
  data: StaffUserItem[];
}

export interface AuditLogItem {
  _id: string;
  logIdAndTime: {
    logId: string;
    time: string;
  };
  performedByUser: string;
  sourceIp: string;
  actionType: string;
  targetDossier: string;
  mutationTransactionSummary: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  sha256ChainHash: string;
  payloadSnapshot: any;
}

export interface AuditLogsResponse {
  success: boolean;
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
  data: AuditLogItem[];
}

export const AdminAPI = {

  getUserFormDropdowns: async () => {
    const res = await axiosClient.get<{ success: boolean; data: UserDropdownBundle }>(
      "/admin/users/form-dropdowns"
    );
    return res.data;
  },

  getUsersList: async (params?: { search?: string; role?: string; status?: string }) => {
    const res = await axiosClient.get<StaffUsersResponse>("/admin/users", { params });
    return res.data;
  },

  createStaffUser: async (payload: {
    name: string;
    username: string;
    password: string;
    rank?: string;
    designation: string;
    section: string;
    mobile?: string;
    email?: string;
    roleId: string;
    courtBench?: string;
  }) => {
    const res = await axiosClient.post("/admin/users", payload);
    return res.data;
  },

  updateStaffUser: async (id: string, payload: Partial<{
    name: string;
    rank: string;
    designation: string;
    section: string;
    mobile: string;
    email: string;
    roleId: string;
    status: "ACTIVE" | "INACTIVE";
    courtBench: string;
    password?: string;
  }>) => {
    const res = await axiosClient.put(`/admin/users/${id}`, payload);
    return res.data;
  },

  getAuditLogs: async (params?: {
  search?: string;
  severity?: string;
  page?: number;
  limit?: number;
}): Promise<AuditLogsResponse> => {
  const res = await axiosClient.get("/admin/audit-logs", { params });
  return res.data;
},
};