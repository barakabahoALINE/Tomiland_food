import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  loginUserRequest,
  logoutUserRequest,
  registerUserRequest,
  verifyOTPRequest,
  resendOTPRequest,
  getProfileRequest,
  refreshTokenRequest,
  type AuthResponse,
} from './authAPI';
import type { AuthState, AuthUser, LoginPayload, RegisterPayload } from './authTypes';

// ─── Token persistence keys ───────────────────────────────────────────────────
const ACCESS_KEY  = 'tomiland_access';
const REFRESH_KEY = 'tomiland_refresh';

const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// ─── Initial state ────────────────────────────────────────────────────────────
const storedAccess  = localStorage.getItem(ACCESS_KEY);
const storedRefresh = localStorage.getItem(REFRESH_KEY);

const initialState: AuthState = {
  user: null,
  accessToken: storedAccess,
  refreshToken: storedRefresh,
  // Mark as authenticated optimistically when tokens exist.
  // restoreSession() will validate them on mount and clear if invalid.
  isAuthenticated: Boolean(storedAccess && storedRefresh),
  pendingVerification: false,
  pendingEmail: null,
  status: 'idle',
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected error occurred.';

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Login with email + password → get JWT tokens */
export const loginUser = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginUserRequest(payload);
      saveTokens(response.accessToken, response.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Register new account → triggers OTP email, does NOT log in yet */
export const registerUser = createAsyncThunk<{ userId: string; email: string }, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await registerUserRequest(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Verify OTP code sent to email after registration */
export const verifyOTP = createAsyncThunk<void, { email: string; otp: string }, { rejectValue: string }>(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      await verifyOTPRequest(email, otp);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Resend OTP to email */
export const resendOTP = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      await resendOTPRequest(email);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Logout — blacklists refresh token on the backend */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { auth: AuthState }).auth;
      if (state.refreshToken) {
        await logoutUserRequest(state.refreshToken);
      }
      clearTokens();
    } catch (error) {
      clearTokens(); // Always clear locally
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Restore session from localStorage access token on app load */
export const restoreSession = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem(ACCESS_KEY);
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (!access || !refresh) throw new Error('No stored session');

      // Try fetching profile with stored access token
      try {
        return await getProfileRequest(access);
      } catch {
        // Access token expired — try refreshing it
        const newAccess = await refreshTokenRequest(refresh);
        localStorage.setItem(ACCESS_KEY, newAccess);
        return await getProfileRequest(newAccess);
      }
    } catch (error) {
      clearTokens();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => { state.error = null; },
    resetAuth: () => { clearTokens(); return initialState; },
    setSession: (state, action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.error = null;
      saveTokens(action.payload.accessToken, action.payload.refreshToken);
    },
  },
  extraReducers: (builder) => {
    // ── LOGIN ──────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.pendingVerification = false;
        state.pendingEmail = null;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed. Please check your credentials.';
      });

    // ── REGISTER ───────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingVerification = true;
        state.pendingEmail = action.payload.email;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Registration failed. Please try again.';
      });

    // ── VERIFY OTP ─────────────────────────────────────────────────────────
    builder
      .addCase(verifyOTP.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.pendingVerification = false;
        // User must log in after verifying OTP
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'OTP verification failed.';
      });

    // ── RESEND OTP ─────────────────────────────────────────────────────────
    builder
      .addCase(resendOTP.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(resendOTP.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(resendOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to resend OTP.';
      });

    // ── LOGOUT ─────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.pending, (state) => { state.status = 'loading'; })
      .addCase(logoutUser.fulfilled, () => { clearTokens(); return { ...initialState, accessToken: null, refreshToken: null }; })
      .addCase(logoutUser.rejected, () => { clearTokens(); return { ...initialState, accessToken: null, refreshToken: null }; });

    // ── RESTORE SESSION ────────────────────────────────────────────────────
    builder
      .addCase(restoreSession.pending, (state) => { state.status = 'loading'; })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { clearAuthError, setSession, resetAuth } = authSlice.actions;
export default authSlice.reducer;
