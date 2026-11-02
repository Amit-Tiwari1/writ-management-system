export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  totalCount: number;
  pagination?: {
    page: number;
    limit: number;
    pages: number;
  };
  data: T[];
}

export interface IStateItem {
  _id: string;
  stateName: string;
  stateCode: string;
  country?: string;
}

export interface IZoneItem {
  _id: string;
  zoneName: string;
  stateId: string | IStateItem;
  headquarters?: string;
}

export interface IRangeItem {
  _id: string;
  rangeName: string;
  zoneId: string | IZoneItem;
  stateId: string | IStateItem;
}

export interface IDistrictItem {
  _id: string;
  districtName: string;
  stateId: string | IStateItem;
  zoneId: string | IZoneItem;
  rangeId: string | IRangeItem;
  activeWritsCount?: number;
}

export interface ICourtItem {
  _id: string;
  courtName: string;
  shortCode: string;
  courtType?: string;
  location: string;
}

export interface ICaseTypeItem {
  _id: string;
  caseTypeName: string;
  shortName: string;
  courtId: string | ICourtItem;
  activeWritsCount?: number;
}

export interface ICategoryItem {
  _id: string;
  categoryName: string;
  description?: string;
  order: number;
}

export interface ISubCategoryItem {
  _id: string;
  subCategoryName: string;
  categoryId: string | ICategoryItem;
  defaultOfficerName?: string;
  defaultOfficerId?: string;
}

export interface ISubjectItem {
  _id: string;
  subjectTitle: string;
  categoryId: string | ICategoryItem;
  subCategoryId: string | ISubCategoryItem;
}

export interface ICustodianRecord {
  _id: string;
  categoryId?: {
    _id: string;
    categoryName: string;
  };
  subjectId?: {
    _id: string;
    subjectTitle: string;
  };
  officerName: string;
  designation: string;
  userId?: string;
  createdAt?: string;
}

export interface IRankItem {
  _id: string;
  rankName: string;
  shortCode: string;
  cadreType?: string;
  payLevelGrade?: string;
}

export interface IDesignationItem {
  _id: string;
  title: string;
  authorityLevel: string;
  defaultRole?: string;
  canSignPWC?: boolean;
  canForwardFiles?: boolean;
}

export interface IDepartmentItem {
  _id: string;
  unitName: string;
  unitCode: string;
  parentFormation?: string;
  headquarters?: string;
  activeWritsCount?: number;
}

export interface IRespondentGroupItem {
  _id: string;
  groupName: string;
  defaultRankTitle: string;
  defaultAddress: string;
  isOurOffice?: boolean;
}

export interface IStandingCounselItem {
  _id: string;
  name: string;
  monitoredBenches: string;
  autoFlag?: boolean;
}

export interface IActionMappingItem {
  _id: string;
  courtDecision: string;
  actionStatus: string;
  actionNotTaken: string;
  requiresComplianceDeadline: boolean;
  defaultDeadlineDays: number;
  impactScope?: string;
}

export interface IAliasItem {
  _id: string;
  keyword: string;
  language: string;
  category: string;
  matchWeight: string;
}

export interface IntakeDropdownBundle {
  states: IStateItem[];
  districts: IDistrictItem[];
  courts: ICourtItem[];
  caseTypes: ICaseTypeItem[];
  categories: ICategoryItem[];
  subCategories: ISubCategoryItem[];
  subjects: ISubjectItem[];
  ranks: IRankItem[];
  designations: IDesignationItem[];
  departments: IDepartmentItem[];
  respondentGroups: IRespondentGroupItem[];
  standingCounsels: IStandingCounselItem[];
}