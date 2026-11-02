import axiosClient from "./axiosClient";
import { RoleMetricItem, PermissionMatrixItem } from "../types/rbac.types";

export const RbacAPI = {
  getRoles: async (params?: { search?: string }) => {
    const res = await axiosClient.get<{ success: boolean; data: RoleMetricItem[] }>("/admin/roles", { params });
    return res.data;
  },

  createRole: async (payload: { roleName: string; roleCode: string; description?: string }) => {
    const res = await axiosClient.post("/admin/roles", payload);
    return res.data;
  },

  getRolePermissions: async (roleId: string) => {
    const res = await axiosClient.get<{ success: boolean; roleId: string; data: PermissionMatrixItem[] }>(
      `/admin/roles/${roleId}/permissions`
    );
    return res.data;
  },

  updateRolePermissions: async (
    roleId: string,
    payload: {
      description?: string;
      permissions: Array<{
        menuKey: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canSign: boolean;
        canExport: boolean;
        canDownload: boolean;
      }>;
    }
  ) => {
    const res = await axiosClient.put(`/admin/roles/${roleId}/permissions`, payload);
    return res.data;
  },
};