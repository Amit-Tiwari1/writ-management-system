import { z } from "zod";

/**
 * Common MongoDB ObjectId validation
 */
const requiredObjectId = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message);


/**
 * Petitioner Schema
 */
export const petitionerItemSchema = z.object({
  rollNo: z
    .string()
    .trim()
    .min(1, "Candidate Roll No / PNO is required *"),

  registrationNo: z.string().optional(),

  name: z
    .string()
    .trim()
    .min(2, "Petitioner name is required *"),

  fatherName: z.string().optional(),

  role: z
    .enum(["Lead Petitioner", "Co-Petitioner"])
    .default("Co-Petitioner"),

  categoryClaimed: z
    .string()
    .default("General"),

  postClaimed: z
    .string()
    .default("Constable Civil Police"),

  state: z
    .string()
    .default("Uttar Pradesh"),

  district: z
    .string()
    .trim()
    .min(1, "District is required *"),

  // Optional until backend requirement is confirmed
  districtId: z.string().optional(),

  stateId: z.string().optional(),

  meritScore: z
    .number()
    .default(0),
});

export type PetitionerItemFormValues = z.infer<
  typeof petitionerItemSchema
>;


/**
 * Case Intake Form Schema
 */
export const caseIntakeFormSchema = z
  .object({
    // -----------------------------------------
    // Registration Mode
    // -----------------------------------------

    mode: z.enum(["NOTICE", "WRIT", "CNR"]),

    regMode: z.enum(["NEW", "OLD"]),

    prevRegistrationNo: z.string().optional(),

    previousYear: z.string().optional(),


    // -----------------------------------------
    // Notice Details
    // -----------------------------------------

    noticeNumber: z.string().optional(),

    noticeYear: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Valid 4-digit Notice Year is required *"),

    noticeServiceDate: z.string().optional(),


    // -----------------------------------------
    // Court Details
    // -----------------------------------------

    court: z
      .string()
      .trim()
      .min(1, "Court establishment is required *"),

    courtId: requiredObjectId(
      "Please select a valid Court Establishment *"
    ),

    courtCode: z.string(),

    benchLocation: z.enum([
      "Allahabad",
      "Lucknow",
      "New Delhi",
    ]),


    // -----------------------------------------
    // Case Type Details
    // -----------------------------------------

    caseType: z
      .string()
      .trim()
      .min(1, "Case Type is required *"),

    caseTypeId: requiredObjectId(
      "Please select a valid Case Type *"
    ),

    caseNumber: z.string().optional(),

    caseYear: z
      .number()
      .int()
      .min(2000, "Valid case year is required *"),


    // -----------------------------------------
    // CNR Details
    // -----------------------------------------

    cnrNumber: z.string().optional(),

    courtRoomNo: z.string().optional(),

    coramBench: z.string().optional(),


    // -----------------------------------------
    // Lead Petitioner Details
    // -----------------------------------------

    leadPetitioner: z
      .string()
      .trim()
      .min(2, "Lead petitioner name is required *"),

    leadPetitionerRollNo: z.string().optional(),

    leadPetitionerFatherName: z.string().optional(),

    district: z.string().optional(),

    state: z.string().optional(),

    // Optional until backend requirement is confirmed
    districtId: z.string().optional(),

    stateId: z.string().optional(),


    // -----------------------------------------
    // Advocate & Respondent Details
    // -----------------------------------------

    petitionerAdvocate: z.string().optional(),

    petitionerPhone: z.string().optional(),

    respondentString: z
      .string()
      .trim()
      .min(2, "Respondent is required *"),

    stateCounsel: z.string().optional(),


    // -----------------------------------------
    // Department & Assigned Officers
    // -----------------------------------------

    sectionWing: z
      .string()
      .trim()
      .min(1, "Department / Section Wing is required *"),

    assignedOIC: requiredObjectId(
      "Please select a valid Officer-in-Charge (OIC) *"
    ),

    assignedPairokar: requiredObjectId(
      "Please select a valid High Court Pairokar *"
    ),


    // -----------------------------------------
    // Litigation Classification
    // -----------------------------------------

    category: z
      .string()
      .trim()
      .min(1, "Master Category is required *"),

    categoryId: requiredObjectId(
      "Please select a valid Master Category *"
    ),

    subCategory: z
      .string()
      .trim()
      .min(1, "Sub-Category / Exam Cycle is required *"),

    subCategoryId: requiredObjectId(
      "Please select a valid Sub-Category *"
    ),

    disputeSubject: z
      .string()
      .trim()
      .min(1, "Litigation Subject Issue is required *"),

    subjectId: requiredObjectId(
      "Please select a valid Litigation Subject *"
    ),

    examCycle: z.string(),


    // -----------------------------------------
    // Stay & Contempt Details
    // -----------------------------------------

    hasActiveStay: z.boolean(),

    stayScope: z.string().optional(),

    isContemptNotice: z.boolean(),


    // -----------------------------------------
    // Hearing & Additional Details
    // -----------------------------------------

    ndoh: z.string().optional().nullable(),

    remarks: z.string().optional(),
  })

  /**
   * Conditional Validation
   */
  .superRefine((data, ctx) => {

    // CNR Mode Validation
    if (data.mode === "CNR") {
      const cnr = data.cnrNumber?.trim() || "";

      if (!/^[A-Za-z0-9]{16}$/.test(cnr)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cnrNumber"],
          message:
            "A valid 16-digit alphanumeric CNR Number is required *",
        });
      }
    }


    // WRIT Mode Validation
    if (data.mode === "WRIT") {
      const caseNumber = data.caseNumber?.trim() || "";

      if (!caseNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["caseNumber"],
          message:
            "Court Case Number is required in Writ Mode *",
        });
      }
    }


    // NOTICE Mode Validation
    if (data.mode === "NOTICE") {
      const noticeNumber = data.noticeNumber?.trim() || "";

      if (!noticeNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["noticeNumber"],
          message:
            "Advance Notice / Diary Number is required *",
        });
      }
    }
  });


export type CaseIntakeFormValues = z.infer<
  typeof caseIntakeFormSchema
>;