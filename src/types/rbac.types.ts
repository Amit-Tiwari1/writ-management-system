export interface RoleMetricItem {
  _id: string;
  roleName: string;
  roleCode: string;
  description: string;
  usersAssignedCount: number;
}

export interface PermissionMatrixItem {
  menuId: string;
  menuKey: string;
  moduleTitle: string;
  groupTitle: string;
  subMenusCount: number;
  subMenus: Array<{
    key: string;
    label: string;
    path: string;
    icon: string;
  }>;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSign: boolean;
  canExport: boolean;
  canDownload: boolean;
}