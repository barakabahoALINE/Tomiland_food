import type { AuthUser, LoginPayload, RegisterPayload } from './authTypes';

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

const wait = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

export const loginUserRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  if (!payload.email || !payload.password) {
    throw new Error('Email and password are required.');
  }

  await wait(250);

  return {
    user: {
      id: 'auth-user-1',
      email: payload.email,
      name: payload.email.split('@')[0],
      role: 'customer',
    },
    token: `token-${Date.now()}`,
  };
};

export const registerUserRequest = async (payload: RegisterPayload): Promise<AuthResponse> => {
  if (!payload.name || !payload.email || !payload.password) {
    throw new Error('Please provide your name, email, and password.');
  }

  await wait(250);

  return {
    user: {
      id: `auth-user-${Date.now()}`,
      email: payload.email,
      name: payload.name,
      role: payload.role ?? 'customer',
    },
    token: `token-${Date.now()}`,
  };
};

export const logoutUserRequest = async (): Promise<void> => {
  await wait(100);
};
