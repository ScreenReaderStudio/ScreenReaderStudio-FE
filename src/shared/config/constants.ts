export const SCREEN_READER_OPTIONS = [
  { value: 'voiceover', label: 'VoiceOver (macOS/iOS)' },
  { value: 'nvda', label: 'NVDA (Windows)' },
] as const;

export const TOAST_PLACEMENTS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

export const ANALYSIS_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const API_ENDPOINTS = {
  USERS_ME: '/api/users/me',
  AUTH_LOGOUT: '/api/auth/logout',
  ANALYSIS_PERFORM: '/api/analysis/perform',
  ANALYSIS_SAVE: '/api/analysis',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ANALYSIS: '/analysis',
} as const;

export const VALIDATION = {
  URL_PATTERN: /^https?:\/\/.+/,
  MIN_CODE_LENGTH: 10,
  MAX_URL_LENGTH: 2048,
} as const;

export const UI_CONSTANTS = {
  IFRAME_HEIGHT: '60vh',
  MAX_TOAST_WIDTH: '90vw',
  MIN_TOAST_WIDTH: '40',
} as const;
