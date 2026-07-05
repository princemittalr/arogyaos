import { z } from 'zod';
import { ALL_ROLES } from '@/config/roles';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long');

export const userRoleSchema = z.enum(ALL_ROLES as [string, ...string[]]);

export const baseProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerFormSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: userRoleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
