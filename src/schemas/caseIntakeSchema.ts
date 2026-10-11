import { z } from "zod";

export const petitionerItemSchema = z.object({
  rollNo: z.string().min(1, "Roll No / PNO is required").trim(),
  registrationNo: z.string().optional(),
  name: z.string().min(2, "Petitioner name is required").trim(),
  fatherName: z.string().optional(),
  role: z.enum(["Lead Petitioner", "Co-Petitioner"]),
  categoryClaimed: z.string().optional(),
  postClaimed: z.string().optional(),
  state: z.string().optional(),
  district: z.string().min(1, "District is required"),
});

export type PetitionerItemFormValues = z.infer<typeof petitionerItemSchema>;

export const caseIntakeFormSchema = z.object({
  mode: z.enum(["NOTICE", "WRIT", "CNR"]),
  regMode: z.enum(["NEW", "OLD"]),
  prevRegistrationNo: z.string().optional(),
  previousYear: z.string().optional(),

  noticeNumber: z.string().optional(),
  noticeYear: z.string().min(4, "Year is required"),
  noticeServiceDate: z.string().optional(),

  court: z.string().min(1, "Court is required"),
  courtId: z.string().optional(),
  courtCode: z.string(),
  benchLocation: z.enum(["Allahabad", "Lucknow", "New Delhi"]),

  caseType: z.string().min(1, "Case Type is required"),
  caseTypeId: z.string().optional(),
  caseNumber: z.string().optional(),
  caseYear: z.number().int().min(2000),

  cnrNumber: z.string().optional(),
  courtRoomNo: z.string().optional(),

  leadPetitioner: z.string().min(2, "Primary petitioner name is required").trim(),
  petitionerAdvocate: z.string().optional(),
  petitionerPhone: z.string().optional(),
  respondentString: z.string().min(2, "Respondent string is required"),

  sectionWing: z.string().min(1, "Department / Wing is required"),
  assignedOIC: z.string().min(1, "Officer-in-Charge is required"),
  assignedPairokar: z.string().min(1, "Pairokar is required"),

  category: z.string().min(1, "Category is required"),
  categoryId: z.string().optional(),
  subCategory: z.string().min(1, "Sub Category is required"),
  subCategoryId: z.string().optional(),
  disputeSubject: z.string().min(1, "Subject is required"),
  subjectId: z.string().optional(),
  examCycle: z.string(),

  hasActiveStay: z.boolean(),
  isContemptNotice: z.boolean(),
  remarks: z.string().optional(),
});

export type CaseIntakeFormValues = z.infer<typeof caseIntakeFormSchema>;