import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { AuthService } from '../services/auth.service';
import { UserRole } from '@/config/roles';
import { getHomeRouteForRole } from '@/config/permissions';
import { loginFormSchema } from '@/utils/validators';
import { z } from 'zod';

type LoginParams = z.infer<typeof loginFormSchema>;

export function useAuthActions() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (params: LoginParams) => AuthService.login(params),
    onSuccess: (userDoc) => {
      toast.success(`Welcome back, ${userDoc.fullName}`);
      queryClient.invalidateQueries({ queryKey: ['auth_user'] });
      
      // Redirect to correct dashboard
      const targetHome = getHomeRouteForRole(userDoc.role);
      router.push(targetHome);
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to authenticate');
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      fullName,
      role,
      password,
    }: {
      email: string;
      fullName: string;
      role: UserRole;
      password: string;
    }) => AuthService.registerWithPassword(email, fullName, role, password),
    onSuccess: (userDoc) => {
      toast.success('Registration successful!');
      queryClient.invalidateQueries({ queryKey: ['auth_user'] });
      
      const targetHome = getHomeRouteForRole(userDoc.role);
      router.push(targetHome);
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to register account');
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: () => AuthService.loginWithGoogle(),
    onSuccess: (userDoc) => {
      toast.success(`Signed in as ${userDoc.fullName}`);
      queryClient.invalidateQueries({ queryKey: ['auth_user'] });
      
      const targetHome = getHomeRouteForRole(userDoc.role);
      router.push(targetHome);
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Google sign in failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear the ENTIRE React Query cache so no stale data from the previous
      // user can ever be served to the next authenticated session.
      queryClient.clear();
      toast.success('Signed out successfully');
      // Navigate only AFTER the cache is cleared and the server session cookie
      // has been deleted (AuthService.logout awaits deleteServerSession first).
      router.push('/login');
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Logout failed');
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
export default useAuthActions;
