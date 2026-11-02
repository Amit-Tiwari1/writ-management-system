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
  pagination?: {
    page: number;
    limit: number;
    pages: number;
  };
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