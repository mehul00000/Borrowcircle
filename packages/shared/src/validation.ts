import { z } from 'zod';
import { CONDITIONS } from './constants';

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const signInSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Password is required') });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(80),
  username: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only')
    .optional()
    .or(z.literal('')),
  bio: z.string().trim().max(400, 'Keep it under 400 characters').optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  locality: z.string().trim().max(80).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

export const itemDetailsSchema = z.object({
  title: z.string().trim().min(4, 'Give the item a clear title').max(90),
  description: z.string().trim().min(20, 'Describe the item in at least 20 characters').max(2000),
  category_id: z.string().uuid('Choose a category'),
  condition: z.enum(CONDITIONS as [string, ...string[]]),
});

export const borrowingTermsSchema = z
  .object({
    borrowing_fee: z.coerce.number().int('Whole rupees only').min(0, 'Fee cannot be negative').max(1000000),
    security_deposit: z.coerce.number().int('Whole rupees only').min(0, 'Deposit cannot be negative').max(10000000),
    minimum_days: z.coerce.number().int().min(1, 'Minimum is 1 day').max(90),
    maximum_days: z.coerce.number().int().min(1).max(365).nullable().optional(),
    borrowing_rules: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine((d) => !d.maximum_days || d.maximum_days >= d.minimum_days, {
    message: 'Maximum duration cannot be shorter than the minimum',
    path: ['maximum_days'],
  });

const dateRangeBase = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a start date'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a return date'),
});

export const dateRangeSchema = dateRangeBase.refine((d) => d.end_date > d.start_date, {
  message: 'Return date must be after the start date',
  path: ['end_date'],
});

export const borrowRequestSchema = dateRangeBase
  .extend({ message: z.string().trim().max(500).optional().or(z.literal('')) })
  .refine((d) => d.end_date > d.start_date, { message: 'Return date must be after the start date', path: ['end_date'] });

export const conditionReportSchema = z.object({
  report_type: z.enum(['HANDOVER', 'RETURN']),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  image_paths: z.array(z.string()).max(6, 'Up to 6 photos'),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  comment: z.string().trim().max(600).optional().or(z.literal('')),
});

export const reportSchema = z.object({
  reason: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  reported_user_id: z.string().uuid().nullable().optional(),
  reported_item_id: z.string().uuid().nullable().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ItemDetailsInput = z.infer<typeof itemDetailsSchema>;
export type BorrowingTermsInput = z.infer<typeof borrowingTermsSchema>;
export type BorrowRequestInput = z.infer<typeof borrowRequestSchema>;

/** Flatten a ZodError into { field: firstMessage } for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
