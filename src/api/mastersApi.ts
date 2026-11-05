
import axiosClient from "./axiosClient";

import {
  MasterQueryParams,
  PaginatedResponse,
  IStateItem,
  IZoneItem,
  IRangeItem,
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
  IAliasItem,
} from "../types/master.types";

import type {
  StateFormValues,
  ZoneFormValues,
  RangeFormValues,
  DistrictFormValues,
  CourtFormValues,
  CaseTypeFormValues,
  CategoryFormValues,
  SubCategoryFormValues,
  SubjectFormValues,
  CustodianMappingFormValues,
  RankFormValues,
  DesignationFormValues,
  DepartmentFormValues,
  RespondentGroupFormValues,
  StandingCounselFormValues,
  ActionMappingFormValues,
  AliasFormValues,
} from "../schemas/masterSchema";

export interface MasterListParams extends MasterQueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface MasterMutationResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface MasterDeleteResponse {
  success: boolean;
  message?: string;
  usedBy?: string[];
}

export interface MasterIdParams {
  id: string;
}

export type CustodianPayload = CustodianMappingFormValues;


const getMaster = async <T>(
  endpoint: string,
  params?: MasterListParams,
): Promise<PaginatedResponse<T>> => {
  const response = await axiosClient.get<PaginatedResponse<T>>(
    endpoint,
    { params },
  );

  return response.data;
};

const createMaster = async <T, P>(
  endpoint: string,
  payload: P,
): Promise<MasterMutationResponse<T>> => {
  const response = await axiosClient.post<MasterMutationResponse<T>>(
    endpoint,
    payload,
  );

  return response.data;
};

const updateMaster = async <T, P>(
  endpoint: string,
  id: string,
  payload: Partial<P>,
): Promise<MasterMutationResponse<T>> => {
  const response = await axiosClient.put<MasterMutationResponse<T>>(
    `${endpoint}/${id}`,
    payload,
  );

  return response.data;
};

const deleteMaster = async (
  endpoint: string,
  id: string,
): Promise<MasterDeleteResponse> => {
  const response = await axiosClient.delete<MasterDeleteResponse>(
    `${endpoint}/${id}`,
  );

  return response.data;
};


export const MastersAPI = {

  getStates: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IStateItem>> =>
    getMaster<IStateItem>("/masters/states", params),

  createState: (
    payload: StateFormValues,
  ): Promise<MasterMutationResponse<IStateItem>> =>
    createMaster<IStateItem, StateFormValues>(
      "/masters/states",
      payload,
    ),

  updateState: (
    id: string,
    payload: Partial<StateFormValues>,
  ): Promise<MasterMutationResponse<IStateItem>> =>
    updateMaster<IStateItem, StateFormValues>(
      "/masters/states",
      id,
      payload,
    ),

  deleteState: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/states", id),


  getZones: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IZoneItem>> =>
    getMaster<IZoneItem>("/masters/zones", params),

  createZone: (
    payload: ZoneFormValues,
  ): Promise<MasterMutationResponse<IZoneItem>> =>
    createMaster<IZoneItem, ZoneFormValues>(
      "/masters/zones",
      payload,
    ),

  updateZone: (
    id: string,
    payload: Partial<ZoneFormValues>,
  ): Promise<MasterMutationResponse<IZoneItem>> =>
    updateMaster<IZoneItem, ZoneFormValues>(
      "/masters/zones",
      id,
      payload,
    ),

  deleteZone: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/zones", id),

 
  getRanges: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IRangeItem>> =>
    getMaster<IRangeItem>("/masters/ranges", params),

  createRange: (
    payload: RangeFormValues,
  ): Promise<MasterMutationResponse<IRangeItem>> =>
    createMaster<IRangeItem, RangeFormValues>(
      "/masters/ranges",
      payload,
    ),

  updateRange: (
    id: string,
    payload: Partial<RangeFormValues>,
  ): Promise<MasterMutationResponse<IRangeItem>> =>
    updateMaster<IRangeItem, RangeFormValues>(
      "/masters/ranges",
      id,
      payload,
    ),

  deleteRange: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/ranges", id),

 
  getDistricts: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IDistrictItem>> =>
    getMaster<IDistrictItem>("/masters/districts", params),

  createDistrict: (
    payload: DistrictFormValues,
  ): Promise<MasterMutationResponse<IDistrictItem>> =>
    createMaster<IDistrictItem, DistrictFormValues>(
      "/masters/districts",
      payload,
    ),

  updateDistrict: (
    id: string,
    payload: Partial<DistrictFormValues>,
  ): Promise<MasterMutationResponse<IDistrictItem>> =>
    updateMaster<IDistrictItem, DistrictFormValues>(
      "/masters/districts",
      id,
      payload,
    ),

  deleteDistrict: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/districts", id),

 
  getCourts: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<ICourtItem>> =>
    getMaster<ICourtItem>("/masters/courts", params),

  createCourt: (
    payload: CourtFormValues,
  ): Promise<MasterMutationResponse<ICourtItem>> =>
    createMaster<ICourtItem, CourtFormValues>(
      "/masters/courts",
      payload,
    ),

  updateCourt: (
    id: string,
    payload: Partial<CourtFormValues>,
  ): Promise<MasterMutationResponse<ICourtItem>> =>
    updateMaster<ICourtItem, CourtFormValues>(
      "/masters/courts",
      id,
      payload,
    ),

  deleteCourt: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/courts", id),

 
  getCaseTypes: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<ICaseTypeItem>> =>
    getMaster<ICaseTypeItem>("/masters/case-types", params),

  createCaseType: (
    payload: CaseTypeFormValues,
  ): Promise<MasterMutationResponse<ICaseTypeItem>> =>
    createMaster<ICaseTypeItem, CaseTypeFormValues>(
      "/masters/case-types",
      payload,
    ),

  updateCaseType: (
    id: string,
    payload: Partial<CaseTypeFormValues>,
  ): Promise<MasterMutationResponse<ICaseTypeItem>> =>
    updateMaster<ICaseTypeItem, CaseTypeFormValues>(
      "/masters/case-types",
      id,
      payload,
    ),

  deleteCaseType: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/case-types", id),


  getCategories: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<ICategoryItem>> =>
    getMaster<ICategoryItem>("/masters/categories", params),

  createCategory: (
    payload: CategoryFormValues,
  ): Promise<MasterMutationResponse<ICategoryItem>> =>
    createMaster<ICategoryItem, CategoryFormValues>(
      "/masters/categories",
      payload,
    ),

  updateCategory: (
    id: string,
    payload: Partial<CategoryFormValues>,
  ): Promise<MasterMutationResponse<ICategoryItem>> =>
    updateMaster<ICategoryItem, CategoryFormValues>(
      "/masters/categories",
      id,
      payload,
    ),

  deleteCategory: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/categories", id),

  getSubCategories: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<ISubCategoryItem>> =>
    getMaster<ISubCategoryItem>("/masters/sub-categories", params),

  createSubCategory: (
    payload: SubCategoryFormValues,
  ): Promise<MasterMutationResponse<ISubCategoryItem>> =>
    createMaster<ISubCategoryItem, SubCategoryFormValues>(
      "/masters/sub-categories",
      payload,
    ),

  updateSubCategory: (
    id: string,
    payload: Partial<SubCategoryFormValues>,
  ): Promise<MasterMutationResponse<ISubCategoryItem>> =>
    updateMaster<ISubCategoryItem, SubCategoryFormValues>(
      "/masters/sub-categories",
      id,
      payload,
    ),

  deleteSubCategory: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/sub-categories", id),

  getSubjects: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<ISubjectItem>> =>
    getMaster<ISubjectItem>("/masters/subjects", params),

  createSubject: (
    payload: SubjectFormValues,
  ): Promise<MasterMutationResponse<ISubjectItem>> =>
    createMaster<ISubjectItem, SubjectFormValues>(
      "/masters/subjects",
      payload,
    ),

  updateSubject: (
    id: string,
    payload: Partial<SubjectFormValues>,
  ): Promise<MasterMutationResponse<ISubjectItem>> =>
    updateMaster<ISubjectItem, SubjectFormValues>(
      "/masters/subjects",
      id,
      payload,
    ),

  deleteSubject: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/subjects", id),


  getCustodians: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<ICustodianRecord>> =>
    getMaster<ICustodianRecord>(
      "/masters/subject-custodians",
      params,
    ),

  createCustodian: (
    payload: CustodianMappingFormValues,
  ): Promise<MasterMutationResponse<ICustodianRecord>> =>
    
    createMaster<ICustodianRecord, CustodianMappingFormValues>(
      "/masters/subject-custodians",
      payload,
    ),

  updateCustodian: (
    id: string,
    payload: Partial<CustodianMappingFormValues>,
  ): Promise<MasterMutationResponse<ICustodianRecord>> =>
    updateMaster<ICustodianRecord, CustodianMappingFormValues>(
      "/masters/subject-custodians",
      id,
      payload,
    ),

  deleteCustodian: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/subject-custodians", id),


  getDepartments: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IDepartmentItem>> =>
    getMaster<IDepartmentItem>("/masters/departments", params),

  createDepartment: (
    payload: DepartmentFormValues,
  ): Promise<MasterMutationResponse<IDepartmentItem>> =>
    createMaster<IDepartmentItem, DepartmentFormValues>(
      "/masters/departments",
      payload,
    ),

  updateDepartment: (
    id: string,
    payload: Partial<DepartmentFormValues>,
  ): Promise<MasterMutationResponse<IDepartmentItem>> =>
    updateMaster<IDepartmentItem, DepartmentFormValues>(
      "/masters/departments",
      id,
      payload,
    ),

  deleteDepartment: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/departments", id),


  getRanks: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IRankItem>> =>
    getMaster<IRankItem>("/masters/ranks", params),

  createRank: (
    payload: RankFormValues,
  ): Promise<MasterMutationResponse<IRankItem>> =>
    createMaster<IRankItem, RankFormValues>(
      "/masters/ranks",
      payload,
    ),

  updateRank: (
    id: string,
    payload: Partial<RankFormValues>,
  ): Promise<MasterMutationResponse<IRankItem>> =>
    updateMaster<IRankItem, RankFormValues>(
      "/masters/ranks",
      id,
      payload,
    ),

  deleteRank: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/ranks", id),

 
  getDesignations: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IDesignationItem>> =>
    getMaster<IDesignationItem>("/masters/designations", params),

  createDesignation: (
    payload: DesignationFormValues,
  ): Promise<MasterMutationResponse<IDesignationItem>> =>
    createMaster<IDesignationItem, DesignationFormValues>(
      "/masters/designations",
      payload,
    ),

  updateDesignation: (
    id: string,
    payload: Partial<DesignationFormValues>,
  ): Promise<MasterMutationResponse<IDesignationItem>> =>
    updateMaster<IDesignationItem, DesignationFormValues>(
      "/masters/designations",
      id,
      payload,
    ),

  deleteDesignation: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/designations", id),


  getRespondentGroups: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IRespondentGroupItem>> =>
    getMaster<IRespondentGroupItem>(
      "/masters/respondent-groups",
      params,
    ),

  createRespondentGroup: (
    payload: RespondentGroupFormValues,
  ): Promise<MasterMutationResponse<IRespondentGroupItem>> =>
    createMaster<IRespondentGroupItem, RespondentGroupFormValues>(
      "/masters/respondent-groups",
      payload,
    ),

  updateRespondentGroup: (
    id: string,
    payload: Partial<RespondentGroupFormValues>,
  ): Promise<MasterMutationResponse<IRespondentGroupItem>> =>
    updateMaster<IRespondentGroupItem, RespondentGroupFormValues>(
      "/masters/respondent-groups",
      id,
      payload,
    ),

  deleteRespondentGroup: (
    id: string,
  ): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/respondent-groups", id),

 
  getActionMappings: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IActionMappingItem>> =>
    getMaster<IActionMappingItem>("/masters/action-mappings", params),

  createActionMapping: (
    payload: ActionMappingFormValues,
  ): Promise<MasterMutationResponse<IActionMappingItem>> =>
    createMaster<IActionMappingItem, ActionMappingFormValues>(
      "/masters/action-mappings",
      payload,
    ),

  updateActionMapping: (
    id: string,
    payload: Partial<ActionMappingFormValues>,
  ): Promise<MasterMutationResponse<IActionMappingItem>> =>
    updateMaster<IActionMappingItem, ActionMappingFormValues>(
      "/masters/action-mappings",
      id,
      payload,
    ),

  deleteActionMapping: (
    id: string,
  ): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/action-mappings", id),

 
  getStandingCounsels: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IStandingCounselItem>> =>
    getMaster<IStandingCounselItem>(
      "/masters/standing-counsels",
      params,
    ),

  createStandingCounsel: (
    payload: StandingCounselFormValues,
  ): Promise<MasterMutationResponse<IStandingCounselItem>> =>
    createMaster<IStandingCounselItem, StandingCounselFormValues>(
      "/masters/standing-counsels",
      payload,
    ),

  updateStandingCounsel: (
    id: string,
    payload: Partial<StandingCounselFormValues>,
  ): Promise<MasterMutationResponse<IStandingCounselItem>> =>
    updateMaster<IStandingCounselItem, StandingCounselFormValues>(
      "/masters/standing-counsels",
      id,
      payload,
    ),

  deleteStandingCounsel: (
    id: string,
  ): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/standing-counsels", id),

  /* ==========================================
     17. ALIASES
  ========================================== */

  getAliases: (
    params?: MasterListParams,
  ): Promise<PaginatedResponse<IAliasItem>> =>
    getMaster<IAliasItem>("/masters/aliases", params),

  createAlias: (
    payload: AliasFormValues,
  ): Promise<MasterMutationResponse<IAliasItem>> =>
    createMaster<IAliasItem, AliasFormValues>(
      "/masters/aliases",
      payload,
    ),

  updateAlias: (
    id: string,
    payload: Partial<AliasFormValues>,
  ): Promise<MasterMutationResponse<IAliasItem>> =>
    updateMaster<IAliasItem, AliasFormValues>(
      "/masters/aliases",
      id,
      payload,
    ),

  deleteAlias: (id: string): Promise<MasterDeleteResponse> =>
    deleteMaster("/masters/aliases", id),
};
