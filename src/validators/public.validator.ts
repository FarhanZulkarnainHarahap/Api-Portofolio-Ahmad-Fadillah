import { z } from "zod";

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().or(z.literal("")),
    company: z.string().max(160).optional().or(z.literal("")),
    subject: z.string().min(3).max(160),
    message: z.string().min(10).max(5000),
    website: z.string().max(0).optional(),
  }),
});
