import axiosClient from "./axiosClient";
import {
  IntakeDropdownBundle,
  PaginationParams,
  PaginatedResponse,
  IStateItem,
  IDistrictItem,
  ICourtItem,
  ICaseTypeItem,
  ICategoryItem,
  ISubCategoryItem,
  ISubjectItem,
  ICustodianRecord,
  IDepartmentItem,
  IRankItem,
  IDesignationItem,
  IRespondentGroupItem,
  IActionMappingItem,
  IStandingCounselItem,
} from "../types/master.types";

export type { IntakeDropdownBundle };

export const MastersAPI = {
  getIntakeDropdowns: async (): Promise<{ success: boolean; data: IntakeDropdownBundle }> => {
    const res = await axiosClient.get("/masters/dropdowns");
    return res.data;
  },

  // States, Zones, Ranges & Districts
  getStates: async (params?: PaginationParams): Promise<PaginatedResponse<IStateItem>> =>
    (await axiosClient.get("/masters/states", { params })).data,
  createState: async (payload: any) => (await axiosClient.post("/masters/states", payload)).data,
  updateState: async (id: string, payload: any) => (await axiosClient.put(`/masters/states/${id}`, payload)).data,
  deleteState: async (id: string) => (await axiosClient.delete(`/masters/states/${id}`)).data,

  getZones: async (stateId?: string) =>
    (await axiosClient.get("/masters/zones", { params: { stateId } })).data,
  createZone: async (payload: any) => (await axiosClient.post("/masters/zones", payload)).data,

  getRanges: async (params?: { zoneId?: string; stateId?: string }) =>
    (await axiosClient.get("/masters/ranges", { params })).data,
  createRange: async (payload: any) => (await axiosClient.post("/masters/ranges", payload)).data,

  getDistricts: async (
    params?: PaginationParams & { stateId?: string; zoneId?: string; rangeId?: string }
  ): Promise<PaginatedResponse<IDistrictItem>> =>
    (await axiosClient.get("/masters/districts", { params })).data,
  createDistrict: async (payload: any) => (await axiosClient.post("/masters/districts", payload)).data,
  deleteDistrict: async (id: string) => (await axiosClient.delete(`/masters/districts/${id}`)).data,

  // Courts & Case Types
  getCourts: async (params?: PaginationParams): Promise<PaginatedResponse<ICourtItem>> =>
    (await axiosClient.get("/masters/courts", { params })).data,
  createCourt: async (payload: any) => (await axiosClient.post("/masters/courts", payload)).data,
  deleteCourt: async (id: string) => (await axiosClient.delete(`/masters/courts/${id}`)).data,

  getCaseTypes: async (
    params?: PaginationParams & { courtId?: string }
  ): Promise<PaginatedResponse<ICaseTypeItem>> =>
    (await axiosClient.get("/masters/case-types", { params })).data,
  getCaseTypesByCourt: async (courtId: string) =>
    (await axiosClient.get(`/masters/case-types/by-court/${courtId}`)).data,
  createCaseType: async (payload: any) => (await axiosClient.post("/masters/case-types", payload)).data,
  deleteCaseType: async (id: string) => (await axiosClient.delete(`/masters/case-types/${id}`)).data,

  // Categories, Sub-Categories & Subjects
  getCategories: async (params?: PaginationParams): Promise<PaginatedResponse<ICategoryItem>> =>
    (await axiosClient.get("/masters/categories", { params })).data,
  createCategory: async (payload: any) => (await axiosClient.post("/masters/categories", payload)).data,

  getSubCategories: async (
    params?: PaginationParams & { categoryId?: string }
  ): Promise<PaginatedResponse<ISubCategoryItem>> =>
    (await axiosClient.get("/masters/sub-categories", { params })).data,
  getSubCategoriesByCategory: async (categoryId: string) =>
    (await axiosClient.get(`/masters/sub-categories/by-category/${categoryId}`)).data,
  createSubCategory: async (payload: any) => (await axiosClient.post("/masters/sub-categories", payload)).data,

  getSubjects: async (
    params?: PaginationParams & { categoryId?: string; subCategoryId?: string }
  ): Promise<PaginatedResponse<ISubjectItem>> =>
    (await axiosClient.get("/masters/subjects", { params })).data,
  getSubjectsBySubCategory: async (subCategoryId: string) =>
    (await axiosClient.get(`/masters/subjects/by-subcategory/${subCategoryId}`)).data,
  createSubject: async (payload: any) => (await axiosClient.post("/masters/subjects", payload)).data,

  // Custodians & Departments
  getCustodians: async (
    params?: PaginationParams & { categoryId?: string }
  ): Promise<PaginatedResponse<ICustodianRecord>> =>
    (await axiosClient.get("/masters/custodians", { params })).data,
  createCustodian: async (payload: any) => (await axiosClient.post("/masters/custodians", payload)).data,

  getDepartments: async (
    params?: PaginationParams & { parentFormation?: string }
  ): Promise<PaginatedResponse<IDepartmentItem>> =>
    (await axiosClient.get("/masters/departments", { params })).data,
  createDepartment: async (payload: any) => (await axiosClient.post("/masters/departments", payload)).data,

  getRanks: async (
    params?: PaginationParams & { cadreType?: string }
  ): Promise<PaginatedResponse<IRankItem>> =>
    (await axiosClient.get("/masters/ranks", { params })).data,
  createRank: async (payload: any) => (await axiosClient.post("/masters/ranks", payload)).data,

  getDesignations: async (
    params?: PaginationParams & { authorityLevel?: string }
  ): Promise<PaginatedResponse<IDesignationItem>> =>
    (await axiosClient.get("/masters/designations", { params })).data,
  createDesignation: async (payload: any) => (await axiosClient.post("/masters/designations", payload)).data,

  getRespondentGroups: async (params?: PaginationParams): Promise<PaginatedResponse<IRespondentGroupItem>> =>
    (await axiosClient.get("/masters/respondent-groups", { params })).data,
  createRespondentGroup: async (payload: any) => (await axiosClient.post("/masters/respondent-groups", payload)).data,

  getActionMappings: async (params?: PaginationParams): Promise<PaginatedResponse<IActionMappingItem>> =>
    (await axiosClient.get("/masters/action-mappings", { params })).data,
  createActionMapping: async (payload: any) => (await axiosClient.post("/masters/action-mappings", payload)).data,

  getStandingCounsels: async (params?: PaginationParams): Promise<PaginatedResponse<IStandingCounselItem>> =>
    (await axiosClient.get("/masters/standing-counsels", { params })).data,
  createStandingCounsel: async (payload: any) => (await axiosClient.post("/masters/standing-counsels", payload)).data,

  getAliases: async () => (await axiosClient.get("/masters/aliases")).data,
  createAlias: async (payload: any) => (await axiosClient.post("/masters/aliases", payload)).data,
};