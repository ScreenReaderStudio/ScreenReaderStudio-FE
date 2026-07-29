import { create } from 'zustand';

import { performAnalysis } from '@/modules/analysis/api/analysisApi';
import { ANALYSIS_TIMEOUT_MS } from '@/modules/analysis/constants';
import type {
  AnalysisData,
  AnalysisError,
  AnalysisRequest,
  ScreenReaderType,
} from '@/modules/analysis/types';

import { createAnalysisError } from './analysisError';
type AnalysisInput = Omit<AnalysisRequest, 'screenReader'>;

interface AnalysisState extends AnalysisData {
  isLoading: boolean;
  error: AnalysisError | null;
  lastRequest: AnalysisInput | null;
  setSelectedScreenReader: (reader: ScreenReaderType) => void;
  analyze: (options: AnalysisInput) => Promise<void>;
  cancelAnalysis: () => void;
  retryAnalysis: () => Promise<void>;
  setAnalysisData: (data: AnalysisData) => void;
}

let activeController: AbortController | null = null;

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  analysisResult: null,
  screenReaderScript: null,
  pageContent: null,
  isLoading: false,
  error: null,
  lastRequest: null,
  selectedScreenReader: 'voiceover',

  setSelectedScreenReader: (reader) => set({ selectedScreenReader: reader }),

  setAnalysisData: ({ analysisResult, screenReaderScript, pageContent, selectedScreenReader }) => {
    const controller = activeController;
    activeController = null;
    controller?.abort('superseded');

    set({
      analysisResult,
      screenReaderScript,
      pageContent,
      selectedScreenReader,
      isLoading: false,
      error: null,
    });
  },

  analyze: async ({ url, htmlContent }) => {
    activeController?.abort('superseded');

    const controller = new AbortController();
    const request = { url, htmlContent };
    const timeoutId = window.setTimeout(() => controller.abort('timeout'), ANALYSIS_TIMEOUT_MS);
    const { selectedScreenReader } = get();
    activeController = controller;

    set({
      isLoading: true,
      error: null,
      analysisResult: null,
      screenReaderScript: null,
      pageContent: null,
      lastRequest: request,
    });

    try {
      const { accessibilityAnalysis, screenReaderScript, pageContent } = await performAnalysis(
        {
          url,
          htmlContent,
          screenReader: selectedScreenReader,
        },
        controller.signal
      );

      if (activeController !== controller) {
        return;
      }

      set({
        analysisResult: accessibilityAnalysis,
        screenReaderScript,
        pageContent,
        isLoading: false,
      });
    } catch (error) {
      if (activeController !== controller) {
        return;
      }

      set({ error: createAnalysisError(error, controller.signal), isLoading: false });
    } finally {
      window.clearTimeout(timeoutId);

      if (activeController === controller) {
        activeController = null;
      }
    }
  },

  cancelAnalysis: () => {
    activeController?.abort('cancelled');
  },

  retryAnalysis: async () => {
    const lastRequest = get().lastRequest;

    if (lastRequest) {
      await get().analyze(lastRequest);
    }
  },
}));
