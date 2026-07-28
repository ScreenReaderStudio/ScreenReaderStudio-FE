import type { AxeResults } from 'axe-core';

export type ScreenReaderType = 'voiceover' | 'nvda';

export type AnalysisErrorCode =
  | 'ANALYSIS_CANCELLED'
  | 'ANALYSIS_TIMEOUT'
  | 'INVALID_REQUEST'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'TARGET_ACCESS_DENIED'
  | 'UNKNOWN_ERROR';

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
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
