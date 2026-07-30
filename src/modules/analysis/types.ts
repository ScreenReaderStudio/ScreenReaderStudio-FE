import type { AxeResults } from 'axe-core';

export type ScreenReaderType = 'voiceover' | 'nvda';

export type ServerAnalysisErrorCode =
  | 'ANALYSIS_TIMEOUT'
  | 'INVALID_REQUEST'
  | 'INVALID_HTML'
  | 'INVALID_URL'
  | 'RATE_LIMITED'
  | 'TARGET_ACCESS_DENIED'
  | 'TARGET_SECURITY_BLOCKED'
  | 'TARGET_UNREACHABLE'
  | 'UNSUPPORTED_CONTENT'
  | 'INTERNAL_ERROR'
  | 'IDEMPOTENCY_CONFLICT'
  | 'JOB_EXPIRED'
  | 'JOB_NOT_FOUND'
  | 'JOB_NOT_READY';

export type AnalysisErrorCode =
  | ServerAnalysisErrorCode
  | 'ANALYSIS_CANCELLED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
  recoveryMessage: string;
  retryable: boolean;
}

export interface ScreenReaderScriptItem {
  text: string;
  selector: string;
}

export interface AnalysisRequest {
  url?: string;
  htmlContent?: string;
  screenReader: ScreenReaderType;
}

export interface AnalysisResponse {
  accessibilityAnalysis: AxeResults;
  screenReaderScript: ScreenReaderScriptItem[];
  pageContent: string;
}

export type AnalysisJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export type AnalysisJobStage =
  | 'queued'
  | 'launching_browser'
  | 'loading_page'
  | 'analyzing_accessibility'
  | 'preparing_result';

export interface CreateAnalysisJobResponse {
  jobId: string;
  status: AnalysisJobStatus;
  pollAfterMs: number;
}

export interface AnalysisJobResponse extends CreateAnalysisJobResponse {
  stage: AnalysisJobStage;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
  error?: {
    code: ServerAnalysisErrorCode;
    message: string;
  };
}

export interface AnalysisData {
  analysisResult: AxeResults | null;
  screenReaderScript: ScreenReaderScriptItem[] | null;
  pageContent: string | null;
  selectedScreenReader: ScreenReaderType;
}

export interface SaveAnalysisRequest {
  jobId: string;
}

export interface SaveAnalysisResponse {
  id: string;
  shareableLink?: string;
}

export interface SharedAnalysisResponse extends AnalysisResponse {
  selectedScreenReader: ScreenReaderType;
}
