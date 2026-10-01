/**
 * authAPI.ts — Real HTTP client for Django REST Framework backend
 * Base URL reads from VITE env var, falls back to localhost for dev.
 */

import type { AuthUser, LoginPayload, RegisterPayload } from './authTypes';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:8000/api';

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// ─── Helper: parse Django's { success, data, message } envelope ──────────────
async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Django DRF returns errors in different shapes — normalise them
    const detail =
      body?.message ??
      body?.detail ??
      body?.non_field_errors?.[0] ??
      Object.values(body ?? {})?.[0]?.[0] ??
      `Request failed (${res.status})`;
    throw new Error(String(detail));
  }
  return (body?.data ?? body) as T;
}

// ─── Map backend user object → frontend AuthUser ─────────────────────────────
function mapUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    // Backend stores first_name / last_name separately
    name: [raw.first_name, raw.last_name].filter(Boolean).join(' ') || String(raw.email ?? ''),
    // Backend returns 'CUSTOMER' | 'VENDOR' | 'ADMIN' — normalise to lowercase
    role: (String(raw.role ?? 'customer').toLowerCase()) as AuthUser['role'],
    avatarUrl: (raw.profile_picture as string | null) ?? null,
    isVerified: Boolean(raw.is_verified),
  };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginUserRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/accounts/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });

  const data = await parseResponse<{
    access: string;
    refresh: string;
    user?: Record<string, unknown>;
    email?: string;
    role?: string;
    id?: unknown;
  }>(res);

  // Django simplejwt login returns { access, refresh, ... user fields ... }
  const userRaw = data.user ?? data;
  return {
    user: mapUser(userRaw as Record<string, unknown>),
    accessToken: data.access,
    refreshToken: data.refresh,
  };
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const registerUserRequest = async (payload: RegisterPayload): Promise<{ userId: string; email: string }> => {
  // Backend expects: email, phone_number, password, first_name, last_name
  const [first_name = '', ...rest] = (payload.name ?? '').split(' ');
  const last_name = rest.join(' ');

  const res = await fetch(`${BASE_URL}/accounts/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      phone_number: payload.phone_number ?? '',
      first_name,
      last_name,
    }),
  });

  const data = await parseResponse<{ user?: { id: string; email: string } }>(res);
  return {
    userId: String(data.user?.id ?? ''),
    email: data.user?.email ?? payload.email,
  };
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
export const verifyOTPRequest = async (email: string, otp: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/accounts/otp/verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  await parseResponse(res);
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOTPRequest = async (email: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/accounts/otp/request/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  await parseResponse(res);
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPasswordRequest = async (email: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/accounts/password/forgot/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  await parseResponse(res);
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPasswordRequest = async (email: string, otp: string, password: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/accounts/password/reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, password }),
  });
  await parseResponse(res);
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutUserRequest = async (refreshToken: string): Promise<void> => {
  const accessToken = localStorage.getItem('tomiland_access');
  await fetch(`${BASE_URL}/accounts/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ refresh: refreshToken }),
  }).catch(() => {
    // Swallow network errors on logout — user is cleared locally regardless
  });
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
export const getProfileRequest = async (accessToken: string): Promise<AuthUser> => {
  const res = await fetch(`${BASE_URL}/accounts/profile/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await parseResponse<Record<string, unknown>>(res);
  return mapUser(data);
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
export const refreshTokenRequest = async (refresh: string): Promise<string> => {
  const res = await fetch(`${BASE_URL}/accounts/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await parseResponse<{ access: string }>(res);
  return data.access;
};
