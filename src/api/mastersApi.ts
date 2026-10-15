import axiosClient from "./axiosClient";

export interface MasterItem {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface IntakeDropdownBundle {
  states: Array<{ _id: string; stateName: string; stateCode: string }>;
  districts: Array<{
    _id: string;
    districtName: string;
    stateId: any;
    zoneId: any;
    rangeId: any;
  }>;
  courts: Array<{ _id: string; courtName: string; shortCode: string; location: string }>;
  caseTypes: Array<{
    _id: string;
    caseTypeName: string;
    shortName: string;
    courtId: any;
  }>;
  categories: Array<{ _id: string; categoryName: string; order: number }>;
  ranks: Array<{ _id: string; rankName: string; shortCode: string }>;
  designations: Array<{ _id: string; title: string; authorityLevel: string }>;
  departments: Array<{ _id: string; unitName: string; unitCode: string }>;
}

export const MastersAPI = {
  getIntakeDropdowns: async (): Promise<{ success: boolean; data: IntakeDropdownBundle }> => {
    const res = await axiosClient.get("/masters/dropdowns");
    return res.data;
  },

  getStates: async () => (await axiosClient.get("/masters/states")).data,
  createState: async (payload: any) => (await axiosClient.post("/masters/states", payload)).data,
  updateState: async (id: string, payload: any) => (await axiosClient.put(`/masters/states/${id}`, payload)).data,
  deleteState: async (id: string) => (await axiosClient.delete(`/masters/states/${id}`)).data,

  getZones: async (stateId?: string) =>
    (await axiosClient.get("/masters/zones", { params: { stateId } })).data,
  createZone: async (payload: any) => (await axiosClient.post("/masters/zones", payload)).data,

  getRanges: async (params?: { zoneId?: string; stateId?: string }) =>
    (await axiosClient.get("/masters/ranges", { params })).data,
  createRange: async (payload: any) => (await axiosClient.post("/masters/ranges", payload)).data,

  getDistricts: async (params?: { stateId?: string; zoneId?: string; rangeId?: string }) =>
    (await axiosClient.get("/masters/districts", { params })).data,
  createDistrict: async (payload: any) => (await axiosClient.post("/masters/districts", payload)).data,
  deleteDistrict: async (id: string) => (await axiosClient.delete(`/masters/districts/${id}`)).data,

  getCourts: async () => (await axiosClient.get("/masters/courts")).data,
  createCourt: async (payload: any) => (await axiosClient.post("/masters/courts", payload)).data,
  deleteCourt: async (id: string) => (await axiosClient.delete(`/masters/courts/${id}`)).data,

  getCaseTypes: async (courtId?: string) =>
    (await axiosClient.get("/masters/case-types", { params: { courtId } })).data,
  createCaseType: async (payload: any) => (await axiosClient.post("/masters/case-types", payload)).data,
  deleteCaseType: async (id: string) => (await axiosClient.delete(`/masters/case-types/${id}`)).data,

  getCategories: async () => (await axiosClient.get("/masters/categories")).data,
  createCategory: async (payload: any) => (await axiosClient.post("/masters/categories", payload)).data,

  getSubCategories: async (categoryId?: string) =>
    (await axiosClient.get("/masters/sub-categories", { params: { categoryId } })).data,
  createSubCategory: async (payload: any) => (await axiosClient.post("/masters/sub-categories", payload)).data,

  getSubjects: async (params?: { categoryId?: string; subCategoryId?: string }) =>
    (await axiosClient.get("/masters/subjects", { params })).data,
  createSubject: async (payload: any) => (await axiosClient.post("/masters/subjects", payload)).data,

  getCustodians: async () => (await axiosClient.get("/masters/custodians")).data,
  createCustodian: async (payload: any) => (await axiosClient.post("/masters/custodians", payload)).data,

  getDepartments: async () => (await axiosClient.get("/masters/departments")).data,
  createDepartment: async (payload: any) => (await axiosClient.post("/masters/departments", payload)).data,

  getRanks: async () => (await axiosClient.get("/masters/ranks")).data,
  createRank: async (payload: any) => (await axiosClient.post("/masters/ranks", payload)).data,

  getDesignations: async () => (await axiosClient.get("/masters/designations")).data,
  createDesignation: async (payload: any) => (await axiosClient.post("/masters/designations", payload)).data,

  getRespondentGroups: async () => (await axiosClient.get("/masters/respondent-groups")).data,
  createRespondentGroup: async (payload: any) => (await axiosClient.post("/masters/respondent-groups", payload)).data,

  getActionMappings: async () => (await axiosClient.get("/masters/action-mappings")).data,
  createActionMapping: async (payload: any) => (await axiosClient.post("/masters/action-mappings", payload)).data,

  getAliases: async () => (await axiosClient.get("/masters/aliases")).data,
  createAlias: async (payload: any) => (await axiosClient.post("/masters/aliases", payload)).data,
};