import { auth } from './client';
import {
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  confirmPasswordReset as fbConfirmPasswordReset,
  verifyPasswordResetCode as fbVerifyPasswordResetCode,
} from 'firebase/auth';

export const authHelpers = {
  signOut: () => fbSignOut(auth),
  
  sendPasswordReset: (email: string) => 
    fbSendPasswordResetEmail(auth, email, {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
    }),
    
  confirmPasswordReset: (code: string, newPass: string) => 
    fbConfirmPasswordReset(auth, code, newPass),
    
  verifyResetCode: (code: string) => 
    fbVerifyPasswordResetCode(auth, code),
};
export default authHelpers;
