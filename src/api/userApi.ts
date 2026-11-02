import axiosClient from "./axiosClient";
import {
  UserDropdownBundle,
  StaffUsersResponse,
  StaffUserItem,
  AuditLogsResponse,
  AuditLogItem,
} from "../types/user.types";

export type {
  UserDropdownBundle,
  StaffUsersResponse,
  StaffUserItem,
  AuditLogsResponse,
  AuditLogItem,
};

export const AdminAPI = {
  getUserFormDropdowns: async () => {
    const res = await axiosClient.get<{ success: boolean; data: UserDropdownBundle }>(
      "/admin/users/form-dropdowns"
    );
    return res.data;
  },

  getUsersList: async (params?: {
    search?: string;
    role?: string;
    designation?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
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

  updateStaffUser: async (
    id: string,
    payload: Partial<{
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
    }>
  ) => {
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