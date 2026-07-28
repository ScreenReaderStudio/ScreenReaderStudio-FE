import { apiRequest } from '@/shared/api/client';

import type { KakaoLoginResponse, User } from '../types';

export function getCurrentUser() {
  return apiRequest<User>('/api/users/me');
}

export function loginWithKakao(code: string) {
  return apiRequest<KakaoLoginResponse>('/api/auth/kakao', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function logoutUser() {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  });
}
