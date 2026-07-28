import { create } from 'zustand';

import { performAnalysis } from '@/modules/analysis/api/analysisApi';
import type { AnalysisData, AnalysisRequest, ScreenReaderType } from '@/modules/analysis/types';

interface AnalysisState extends AnalysisData {
  isLoading: boolean;
  error: string | null;
  setSelectedScreenReader: (reader: ScreenReaderType) => void;
  analyze: (options: Omit<AnalysisRequest, 'screenReader'>) => Promise<void>;
  setAnalysisData: (data: AnalysisData) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analysisResult: null,
  screenReaderScript: null,
  pageContent: null,
  isLoading: false,
  error: null,
  selectedScreenReader: 'voiceover',

  setSelectedScreenReader: (reader) => set({ selectedScreenReader: reader }),

  setAnalysisData: ({ analysisResult, screenReaderScript, pageContent, selectedScreenReader }) =>
    set({
      analysisResult,
      screenReaderScript,
      pageContent,
      selectedScreenReader,
      isLoading: false,
      error: null,
    }),

  analyze: async ({ url, htmlContent }) => {
    const { selectedScreenReader } = useAnalysisStore.getState();
    set({
      isLoading: true,
      error: null,
      analysisResult: null,
      screenReaderScript: null,
      pageContent: null,
    });

    try {
      const { accessibilityAnalysis, screenReaderScript, pageContent } = await performAnalysis({
        url,
        htmlContent,
        screenReader: selectedScreenReader,
      });
      set({
        analysisResult: accessibilityAnalysis,
        screenReaderScript,
        pageContent,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: message, isLoading: false });
    }
  },
}));
