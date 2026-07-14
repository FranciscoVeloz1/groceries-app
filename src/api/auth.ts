import { request } from './http';
import type { LoginRequest, LoginResponse, MeResponse, RefreshRequest, RefreshResponse } from './types';

export async function login(input: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: input
  });
}

export async function refresh(input: RefreshRequest): Promise<RefreshResponse> {
  return request<RefreshResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: input
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await request<void>('/api/v1/auth/logout', {
    method: 'POST',
    body: { refreshToken }
  });
}

export async function me(accessToken: string): Promise<MeResponse> {
  return request<MeResponse>('/api/v1/auth/me', {
    accessToken
  });
}
