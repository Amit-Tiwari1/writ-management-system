
import { z } from "zod";

const requiredId = (message: string) =>
  z.string().trim().min(1, message);

const requiredText = (
  message: string,
  minLength = 2,
  maxLength?: number,
) => {
  let schema = z.string().trim().min(minLength, message);

  if (maxLength !== undefined) {
    schema = schema.max(
      maxLength,
      `Maximum ${maxLength} characters allowed`,
    );
  }

  return schema;
};

const optionalText = (defaultValue = "") =>
  z.string().trim().default(defaultValue);

const requiredUppercaseText = (
  message: string,
  minLength = 2,
  maxLength?: number,
) => {
  let schema = z.string().trim().toUpperCase().min(minLength, message);

  if (maxLength !== undefined) {
    schema = schema.max(
      maxLength,
      `Maximum ${maxLength} characters allowed`,
    );
  }

  return schema;
};

export const stateSchema = z.object({
  stateName: requiredText("State name is required"),
  stateCode: requiredUppercaseText("State code is required", 2, 10),
  country: z.string().trim().default("India"),
});


export const zoneSchema = z.object({
  zoneName: requiredText("Zone name is required"),
  stateId: requiredId("Please select a state"),
  headquarters: optionalText(""),
});

export const rangeSchema = z.object({
  rangeName: requiredText("Range name is required"),
  zoneId: requiredId("Please select a zone"),
  stateId: requiredId("Please select a state"),
});

export const districtSchema = z.object({
  districtName: requiredText("District name is required"),
  stateId: requiredId("Please select a state"),
  zoneId: requiredId("Please select a zone"),
  rangeId: requiredId("Please select a range"),
});

export const courtSchema = z.object({
  courtName: requiredText("Court name is required", 3),
  shortCode: requiredUppercaseText("Court short code is required", 2),
  courtType: z.string().trim().default("HIGH_COURT"),
  location: requiredText("Court location is required"),
});

export const caseTypeSchema = z.object({
  courtId: requiredId("Please select a court"),
  caseTypeName: requiredText("Case type name is required"),
  shortName: optionalText(""),
});

export const categorySchema = z.object({
  categoryName: requiredText("Category name is required"),
  description: optionalText(""),
  order: z
    .number({
      invalid_type_error: "Order must be a number",
    })
    .int("Order must be a whole number")
    .min(1, "Order must be at least 1")
    .default(1),
});

export const subCategorySchema = z.object({
  categoryId: requiredId("Please select a category"),
  subCategoryName: requiredText("Subcategory name is required"),
  defaultOfficerId: z
    .string()
    .trim()
    .default("")
    .transform((value) => value || null),
});

export const subjectSchema = z.object({
  categoryId: requiredId("Please select a category"),
  subCategoryId: requiredId("Please select a subcategory"),
  subjectTitle: requiredText("Subject title is required"),
});

export const custodianMappingSchema = z.object({
  categoryId: requiredId("Please select a case category"),
  subjectId: requiredId("Please select a litigation subject"),
  userId: requiredId("Please select an assigned officer"),
  designationId: requiredId("Please select a designation"),
});

export const rankSchema = z.object({
  rankName: requiredText("Rank name is required"),
  shortCode: requiredUppercaseText("Rank short code is required", 2),
  cadreType: requiredText("Cadre type is required"),
  payLevelGrade: requiredText("Pay level grade is required", 1),
});

export const designationSchema = z.object({
  title: requiredText("Designation title is required"),
  authorityLevel: requiredText("Authority level is required", 1),
  canSignPWC: z.boolean().default(false),
  canForwardFiles: z.boolean().default(true),
  defaultRole: z.string().trim().default("Officer-in-Charge (OIC)"),
});

export const departmentSchema = z.object({
  unitCode: requiredUppercaseText("Unit code is required", 2),
  unitName: requiredText("Unit name is required"),
  parentFormation: requiredText("Parent formation is required"),
  headquarters: z.string().trim().default("Lucknow"),
});

export const respondentGroupSchema = z.object({
  groupName: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Respondent group code must be at least 2 characters")
    .max(100, "Group code cannot exceed 100 characters"),

  defaultRankId: z
    .string()
    .trim()
    .min(1, "Please select a default rank")
    .max(150, "Default rank cannot exceed 150 characters"),

  defaultAddress: z
    .string()
    .trim()
    .min(5, "Official service address must be at least 5 characters"),

  isOurOffice: z.boolean().default(false),
});

export const standingCounselSchema = z.object({
  name: requiredText("Counsel name is required"),
  monitoredBenches: requiredText("Monitored bench selection is required"),
  autoFlag: z.boolean().default(true),
});

export const actionMappingSchema = z.object({
  courtDecision: requiredText("Court decision is required"),
  actionStatus: requiredText("Action status is required"),
  actionNotTaken: requiredText("Action not taken text is required"),

  requiresComplianceDeadline: z.boolean().default(false),

  defaultDeadlineDays: z
    .number({
      invalid_type_error: "Deadline days must be a number",
    })
    .int("Deadline days must be a whole number")
    .min(0, "Deadline days cannot be negative")
    .default(0),

  impactScope: z.string().trim().default("Standard Workflow"),
});

export const aliasSchema = z.object({
  keyword: requiredText("Keyword is required"),
  language: z.string().trim().default("HINDI"),
  category: z.string().trim().default("BOARD_ALIAS"),
  matchWeight: z.string().trim().default("1.0"),
});
export type StateFormInput = z.input<typeof stateSchema>;
export type ZoneFormInput = z.input<typeof zoneSchema>;
export type RangeFormInput = z.input<typeof rangeSchema>;
export type DistrictFormInput = z.input<typeof districtSchema>;
export type CourtFormInput = z.input<typeof courtSchema>;
export type CaseTypeFormInput = z.input<typeof caseTypeSchema>;
export type CategoryFormInput = z.input<typeof categorySchema>;
export type SubCategoryFormInput = z.input<typeof subCategorySchema>;
export type SubjectFormInput = z.input<typeof subjectSchema>;
export type CustodianMappingFormInput = z.input<typeof custodianMappingSchema>;
export type RankFormInput = z.input<typeof rankSchema>;
export type DesignationFormInput = z.input<typeof designationSchema>;
export type DepartmentFormInput = z.input<typeof departmentSchema>;
export type RespondentGroupFormInput = z.input<typeof respondentGroupSchema>;
export type StandingCounselFormInput = z.input<typeof standingCounselSchema>;
export type ActionMappingFormInput = z.input<typeof actionMappingSchema>;
export type AliasFormInput = z.input<typeof aliasSchema>;
export type StateFormValues = z.infer<typeof stateSchema>;
export type ZoneFormValues = z.infer<typeof zoneSchema>;
export type RangeFormValues = z.infer<typeof rangeSchema>;
export type DistrictFormValues = z.infer<typeof districtSchema>;
export type CourtFormValues = z.infer<typeof courtSchema>;
export type CaseTypeFormValues = z.infer<typeof caseTypeSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type SubCategoryFormValues = z.infer<typeof subCategorySchema>;
export type SubjectFormValues = z.infer<typeof subjectSchema>;
export type CustodianMappingFormValues = z.infer<typeof custodianMappingSchema>;
export type RankFormValues = z.infer<typeof rankSchema>;
export type DesignationFormValues = z.infer<typeof designationSchema>;
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
export type RespondentGroupFormValues = z.infer<typeof respondentGroupSchema>;
export type StandingCounselFormValues = z.infer<typeof standingCounselSchema>;
export type ActionMappingFormValues = z.infer<typeof actionMappingSchema>;
export type AliasFormValues = z.infer<typeof aliasSchema>;
