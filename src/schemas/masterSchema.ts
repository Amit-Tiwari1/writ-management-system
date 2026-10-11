import { z } from "zod";


export const respondentGroupSchema = z.object({
  groupName: z
    .string()
    .min(2, "Respondent group code must be at least 2 characters")
    .max(100, "Group code is too long")
    .transform((val) => val.trim().toUpperCase()),
  defaultRankTitle: z
    .string()
    .min(2, "Official title must be at least 2 characters")
    .max(150, "Title is too long")
    .transform((val) => val.trim()),
  defaultAddress: z
    .string()
    .min(5, "Official service address must be at least 5 characters")
    .transform((val) => val.trim()),
  isOurOffice: z.boolean().default(false),
});

export type RespondentGroupFormValues = z.infer<typeof respondentGroupSchema>;


export const stateSchema = z.object({
  stateName: z.string().min(2, "State name is required").trim(),
  stateCode: z.string().min(2, "State code is required").max(10).toUpperCase().trim(),
  country: z.string().default("India"),
});

export const zoneSchema = z.object({
  zoneName: z.string().min(2, "Zone name is required").trim(),
  stateId: z.string().min(1, "State selection is required"),
  headquarters: z.string().optional().default(""),
});

export const rangeSchema = z.object({
  rangeName: z.string().min(2, "Range name is required").trim(),
  zoneId: z.string().min(1, "Zone selection is required"),
  stateId: z.string().min(1, "State selection is required"),
});

export const districtSchema = z.object({
  districtName: z.string().min(2, "District name is required").trim(),
  stateId: z.string().min(1, "State selection is required"),
  zoneId: z.string().min(1, "Zone selection is required"),
  rangeId: z.string().min(1, "Range selection is required"),
});


export const courtSchema = z.object({
  courtName: z.string().min(3, "Court name is required").trim(),
  shortCode: z.string().min(2, "Short code is required").toUpperCase().trim(),
  courtType: z.string().default("HIGH_COURT"),
  location: z.string().min(2, "Location is required").trim(),
});

export const caseTypeSchema = z.object({
  courtId: z.string().min(1, "Court selection is required"),
  caseTypeName: z.string().min(2, "Case type name is required").trim(),
  shortName: z.string().default("").transform((v) => v.trim()),
});

export const categorySchema = z.object({
  categoryName: z.string().min(2, "Category name is required").trim(),
  description: z.string().optional().default(""),
  order: z.number().int().min(1).default(1),
});

export const subCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  subCategoryName: z.string().min(2, "Subcategory name is required").trim(),
  defaultOfficerName: z.string().optional().default("--"),
});

export const subjectSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "Subcategory is required"),
  subjectTitle: z.string().min(2, "Subject title is required").trim(),
});

export const rankSchema = z.object({
  rankName: z.string().min(2, "Rank name is required").trim(),
  shortCode: z.string().min(2, "Short code is required").toUpperCase().trim(),
  cadreType: z.string().min(2, "Cadre type is required").trim(),
  payLevelGrade: z.string().min(1, "Pay level grade is required").trim(),
});

export const designationSchema = z.object({
  title: z.string().min(2, "Designation title is required").trim(),
  authorityLevel: z.string().min(1, "Authority level is required").trim(),
  canSignPWC: z.boolean().default(false),
  canForwardFiles: z.boolean().default(true),
  defaultRole: z.string().default("Officer-in-Charge (OIC)"),
});

export const departmentSchema = z.object({
  unitCode: z.string().min(2, "Unit code is required").toUpperCase().trim(),
  unitName: z.string().min(2, "Unit name is required").trim(),
  parentFormation: z.string().min(2, "Parent formation is required").trim(),
  headquarters: z.string().default("Lucknow"),
});

export const actionMappingSchema = z.object({
  courtDecision: z.string().min(2, "Court decision is required").trim(),
  actionStatus: z.string().min(2, "Action status is required").trim(),
  actionNotTaken: z.string().min(2, "Action not taken text is required").trim(),
  requiresComplianceDeadline: z.boolean().default(false),
  defaultDeadlineDays: z.number().int().min(0).default(0),
  impactScope: z.string().default("Standard Workflow"),
});

export const aliasSchema = z.object({
  keyword: z.string().min(2, "Keyword is required").trim(),
  language: z.string().default("HINDI"),
  category: z.string().default("BOARD_ALIAS"),
  matchWeight: z.string().default("1.0"),
});