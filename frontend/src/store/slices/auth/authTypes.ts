export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'vendor' | 'admin';
  avatarUrl?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
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
  role?: AuthUser['role'];
}
