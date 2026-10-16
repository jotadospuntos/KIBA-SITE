import { z } from 'zod';
import { emailSchema } from '@/lib/debt-schedule/schema';

/* Who is uploading. Email is required: it's how the upload finds the same
   GoHighLevel contact the funding application created. */
export const taxContactSchema = z.object({
  contactName: z.string().trim().min(1, 'Please enter your name.').max(120),
  businessName: z.string().trim().min(1, 'Please enter your business name.').max(160),
  email: emailSchema,
  phone: z.string().trim().max(30).optional()
});

export type TaxContact = z.infer<typeof taxContactSchema>;
