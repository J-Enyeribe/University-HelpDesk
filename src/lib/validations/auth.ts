import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(12, 'Password must be at least 12 characters').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;