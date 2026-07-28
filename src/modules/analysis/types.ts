import type { AxeResults } from 'axe-core';

export type ScreenReaderType = 'voiceover' | 'nvda';

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
