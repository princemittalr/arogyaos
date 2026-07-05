import { loginFormSchema, registerFormSchema } from '@/utils/validators';
import { z } from 'zod';

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormValues = {
  email: string;
};
