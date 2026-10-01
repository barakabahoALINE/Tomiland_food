// Roles match Django backend exactly (lowercase after normalisation in authAPI)
export type UserRole = 'customer' | 'vendor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  isVerified?: boolean;
  phone_number?: string;
}

export interface AuthState {
  user: AuthUser | null;
  /** JWT access token — also stored in localStorage for persistence */
  accessToken: string | null;
  /** JWT refresh token — stored in localStorage for silent re-login */
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** Whether email/OTP verification is pending after registration */
  pendingVerification: boolean;
  pendingEmail: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  role?: UserRole;
}
