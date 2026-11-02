import { z } from "zod";

export const notingDraftSchema = z.object({
  minuteTitle: z.string().optional(),
  notingPurpose: z.enum([
    "PWC / Legal Opinion",
    "Direction to Section",
    "Para-Wise Comments (PWC) Approval",
    "File Movement",
    "Other",
  ]),
  fontEncoding: z.enum(["Unicode", "Kruti Dev 14"]),
  content: z.string().min(5, "Noting minute content cannot be empty (min 5 characters) *").trim(),
  forwardToUserId: z.string().optional(),
  turnaroundDueDate: z.string().optional(),
  fileUrgency: z.enum(["Routine", "Urgent", "High Priority (NDOH)"]),
});

export type NotingDraftFormValues = z.infer<typeof notingDraftSchema>;

export const signAndForwardSchema = notingDraftSchema.extend({
  forwardToUserId: z.string().min(1, "Target recipient officer is required to route the dak *"),
});

export type SignAndForwardFormValues = z.infer<typeof signAndForwardSchema>;