import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Please enter your Officer ID, Mobile, or Email")
    .max(100, "Identifier is too long"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;