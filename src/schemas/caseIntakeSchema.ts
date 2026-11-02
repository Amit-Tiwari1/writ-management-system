import { z } from "zod";

export const petitionerItemSchema = z.object({
  rollNo: z.string().min(1, "Candidate Roll No / PNO is required *").trim(),
  registrationNo: z.string().optional(),
  name: z.string().min(2, "Petitioner name is required *").trim(),
  fatherName: z.string().optional(),
  role: z.enum(["Lead Petitioner", "Co-Petitioner"]).default("Co-Petitioner"),
  categoryClaimed: z.string().default("General"),
  postClaimed: z.string().default("Constable Civil Police"),
  state: z.string().default("Uttar Pradesh"),
  district: z.string().min(1, "District is required *"),
  districtId: z.string().optional(),
  stateId: z.string().optional(),
  meritScore: z.number().default(0),
});

export type PetitionerItemFormValues = z.infer<typeof petitionerItemSchema>;

export const caseIntakeFormSchema = z
  .object({
    mode: z.enum(["NOTICE", "WRIT", "CNR"]),
    regMode: z.enum(["NEW", "OLD"]),
    prevRegistrationNo: z.string().optional(),
    previousYear: z.string().optional(),

    noticeNumber: z.string().optional(),
    noticeYear: z.string().min(4, "Notice year is required *"),
    noticeServiceDate: z.string().optional(),

    court: z.string().min(1, "Court establishment is required *"),
    courtId: z.string().optional(),
    courtCode: z.string(),
    benchLocation: z.enum(["Allahabad", "Lucknow", "New Delhi"]),

    caseType: z.string().min(1, "Case Type is required *"),
    caseTypeId: z.string().optional(),
    caseNumber: z.string().optional(),
    caseYear: z.number().int().min(2000, "Valid case year is required *"),

    cnrNumber: z.string().optional(),
    courtRoomNo: z.string().optional(),
    coramBench: z.string().optional(),

    leadPetitioner: z.string().min(2, "Lead petitioner name is required *").trim(),
    leadPetitionerRollNo: z.string().optional(),
    leadPetitionerFatherName: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    districtId: z.string().optional(),
    stateId: z.string().optional(),

    petitionerAdvocate: z.string().optional(),
    petitionerPhone: z.string().optional(),
    respondentString: z.string().min(2, "Respondent is required *"),
    stateCounsel: z.string().optional(),

    sectionWing: z.string().min(1, "Department / Section Wing is required *"),
    assignedOIC: z.string().min(1, "Officer-in-Charge (OIC) is required *"),
    assignedPairokar: z.string().min(1, "High Court Pairokar is required *"),

    category: z.string().min(1, "Master Category is required *"),
    categoryId: z.string().optional(),
    subCategory: z.string().min(1, "Sub-Category / Exam Cycle is required *"),
    subCategoryId: z.string().optional(),
    disputeSubject: z.string().min(1, "Litigation Subject Issue is required *"),
    subjectId: z.string().optional(),
    examCycle: z.string(),

    hasActiveStay: z.boolean(),
    stayScope: z.string().optional(),
    isContemptNotice: z.boolean(),
    ndoh: z.string().optional().nullable(),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "CNR" && (!data.cnrNumber || data.cnrNumber.trim().length !== 16)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cnrNumber"],
        message: "A valid 16-digit alphanumeric CNR Number is required *",
      });
    }
    if (data.mode === "WRIT" && (!data.caseNumber || data.caseNumber.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["caseNumber"],
        message: "Court Case Number is required in Writ Mode *",
      });
    }
    if (data.mode === "NOTICE" && (!data.noticeNumber || data.noticeNumber.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["noticeNumber"],
        message: "Advance Notice / Diary Number is required *",
      });
    }
  });

export type CaseIntakeFormValues = z.infer<typeof caseIntakeFormSchema>;