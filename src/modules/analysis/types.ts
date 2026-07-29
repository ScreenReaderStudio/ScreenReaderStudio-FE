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
  | 'INTERNAL_ERROR';

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

export interface AnalysisData {
  analysisResult: AxeResults | null;
  screenReaderScript: ScreenReaderScriptItem[] | null;
  pageContent: string | null;
  selectedScreenReader: ScreenReaderType;
}

export interface SaveAnalysisRequest {
  pageContent: string;
  accessibilityAnalysis: AxeResults;
  screenReaderScript: ScreenReaderScriptItem[];
  selectedScreenReader: ScreenReaderType;
}

export interface SaveAnalysisResponse {
  id: string;
  shareableLink?: string;
}

export interface SharedAnalysisResponse extends AnalysisResponse {
  selectedScreenReader: ScreenReaderType;
}
