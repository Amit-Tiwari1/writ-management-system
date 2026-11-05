

export type MasterId = string;
export type MasterReference<T> = MasterId | T;
export type MasterView = "list" | "options";
export type MasterResource =
  | "states"
  | "zones"
  | "ranges"
  | "districts"
  | "courts"
  | "caseTypes"
  | "categories"
  | "subCategories"
  | "subjects"
  | "subjectCustodians"
  | "departments"
  | "ranks"
  | "designations"
  | "respondentGroups"
  | "actionMappings"
  | "standingCounsels"
  | "aliases";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MasterQueryParams extends PaginationParams {
  view?: MasterView;
  stateId?: MasterId;
  zoneId?: MasterId;
  rangeId?: MasterId;
  courtId?: MasterId;
  categoryId?: MasterId;
  subCategoryId?: MasterId;
  subjectId?: MasterId;
  userId?: MasterId;
  designationId?: MasterId;
  defaultOfficerId?: MasterId;
  parentFormation?: string;
  cadreType?: string;
  defaultRankId?: string;
  authorityLevel?: string;
  language?: string;
  category?: string;
}
export interface PaginatedResponse<T> {
  success: boolean;
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
  data: T[];
}
export interface MasterDropdownOption {
  id: string;
  name: string;
}
export interface IUserReference {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  designation?: string;
}
export interface IStateReference {
  _id: string;
  stateName: string;
  stateCode?: string;
}
export interface IZoneReference {
  _id: string;
  zoneName: string;
}
export interface IRangeReference {
  _id: string;
  rangeName: string;
}
export interface IDistrictReference {
  _id: string;
  districtName: string;
}
export interface ICourtReference {
  _id: string;
  courtName: string;
  shortCode?: string;
}
export interface ICaseTypeReference {
  _id: string;
  caseTypeName: string;
  shortName?: string;
}
export interface ICategoryReference {
  _id: string;
  categoryName: string;
}
export interface ISubCategoryReference {
  _id: string;
  subCategoryName: string;
}
export interface ISubjectReference {
  _id: string;
  subjectTitle: string;
}
export interface IDesignationReference {
  _id: string;
  title: string;
  authorityLevel?: string;
  defaultRole?: string;
}
export interface IStateItem {
  _id: string;
  stateName: string;
  stateCode: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface IZoneItem {
  _id: string;
  zoneName: string;
  stateId: MasterReference<IStateReference>;
  headquarters?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface IRangeItem {
  _id: string;
  rangeName: string;
  zoneId: MasterReference<IZoneReference>;
  stateId: MasterReference<IStateReference>;
  createdAt?: string;
  updatedAt?: string;
}
export interface IDistrictItem {
  _id: string;
  districtName: string;
  stateId: MasterReference<IStateReference>;
  zoneId: MasterReference<IZoneReference>;
  rangeId: MasterReference<IRangeReference>;
  activeWritsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface ICourtItem {
  _id: string;
  courtName: string;
  shortCode: string;
  courtType?: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface ICaseTypeItem {
  _id: string;
  caseTypeName: string;
  shortName: string;
  courtId: MasterReference<ICourtReference>;
  activeWritsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface ICategoryItem {
  _id: string;
  categoryName: string;
  description?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface ISubCategoryItem {
  _id: string;
  subCategoryName: string;
  categoryId: MasterReference<ICategoryReference>;
  defaultOfficerId?: MasterReference<IUserReference> | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface ISubjectItem {
  _id: string;
  subjectTitle: string;
  categoryId: MasterReference<ICategoryReference>;
  subCategoryId: MasterReference<ISubCategoryReference>;
  createdAt?: string;
  updatedAt?: string;
}
export interface ICustodianRecord {
  _id: string;
  categoryId: MasterReference<ICategoryReference>;
  subjectId: MasterReference<ISubjectReference>;
  userId: MasterReference<IUserReference>;
  designationId: MasterReference<IDesignationReference>;
  createdAt?: string;
  updatedAt?: string;
}
export interface IRankItem {
  _id: string;
  rankName: string;
  shortCode: string;
  cadreType?: string;
  payLevelGrade?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface IDesignationItem {
  _id: string;
  title: string;
  authorityLevel: string;
  defaultRole?: string;
  canSignPWC?: boolean;
  canForwardFiles?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface IDepartmentItem {
  _id: string;
  unitName: string;
  unitCode: string;
  parentFormation?: string;
  headquarters?: string;
  activeWritsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface IRespondentGroupItem {
  _id: string;
  groupName: string;
  defaultRankId: string;
  defaultAddress: string;
  isOurOffice?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IActionMappingItem {
  _id: string;
  courtDecision: string;
  actionStatus: string;
  actionNotTaken: string;
  requiresComplianceDeadline: boolean;
  defaultDeadlineDays: number;
  impactScope?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface IAliasItem {
  _id: string;
  keyword: string;
  language: string;
  category: string;
  matchWeight: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface IStandingCounselItem {
  _id: string;
  name: string;
  monitoredBenches: string;
  autoFlag?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StateQueryParams extends MasterQueryParams {}

export interface ZoneQueryParams extends MasterQueryParams {}

export interface RangeQueryParams extends MasterQueryParams {}

export interface DistrictQueryParams extends MasterQueryParams {}

export interface CourtQueryParams extends MasterQueryParams {}

export interface CaseTypeQueryParams extends MasterQueryParams {}

export interface CategoryQueryParams extends MasterQueryParams {}

export interface SubCategoryQueryParams extends MasterQueryParams {}

export interface SubjectQueryParams extends MasterQueryParams {}

export interface CustodianQueryParams extends MasterQueryParams {}

export interface DepartmentQueryParams extends MasterQueryParams {}

export interface RankQueryParams extends MasterQueryParams {}

export interface DesignationQueryParams extends MasterQueryParams {}

export interface RespondentGroupQueryParams extends MasterQueryParams {}

export interface ActionMappingQueryParams extends MasterQueryParams {}

export interface StandingCounselQueryParams extends MasterQueryParams {}

export interface AliasQueryParams extends MasterQueryParams {}

export type MasterDropdownResponse =
  PaginatedResponse<MasterDropdownOption>;
