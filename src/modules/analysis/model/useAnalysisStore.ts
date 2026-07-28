import { create } from 'zustand';

import { performAnalysis } from '@/modules/analysis/api/analysisApi';
import { ANALYSIS_TIMEOUT_MS } from '@/modules/analysis/constants';
import type {
  AnalysisData,
  AnalysisError,
  AnalysisRequest,
  ScreenReaderType,
} from '@/modules/analysis/types';
import { ApiError } from '@/shared/api/client';

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

function createAnalysisError(error: unknown, signal: AbortSignal): AnalysisError {
  if (signal.aborted) {
    if (signal.reason === 'timeout') {
      return {
        code: 'ANALYSIS_TIMEOUT',
        message:
          '분석 제한 시간을 초과했습니다. 대상 페이지의 응답이 느리거나 콘텐츠가 많을 수 있습니다.',
        retryable: true,
      };
    }

    return {
      code: 'ANALYSIS_CANCELLED',
      message: '분석이 취소되었습니다.',
      retryable: true,
    };
  }

  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 422) {
      return {
        code: 'INVALID_REQUEST',
        message: error.message,
        retryable: false,
      };
    }

    if (error.status === 401 || error.status === 403) {
      return {
        code: 'TARGET_ACCESS_DENIED',
        message: '대상 페이지에 접근할 수 없습니다. 로그인 또는 접근 권한이 필요할 수 있습니다.',
        retryable: false,
      };
    }

    if (error.status === 408 || error.status === 504) {
      return {
        code: 'ANALYSIS_TIMEOUT',
        message:
          '분석 제한 시간을 초과했습니다. 대상 페이지의 응답이 느리거나 콘텐츠가 많을 수 있습니다.',
        retryable: true,
      };
    }

    if (error.status === 429) {
      return {
        code: 'RATE_LIMITED',
        message: '요청이 많아 분석을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      retryable: error.status >= 500,
    };
  }

  if (error instanceof TypeError) {
    return {
      code: 'NETWORK_ERROR',
      message: '분석 서버와 통신하지 못했습니다. 네트워크 연결을 확인해주세요.',
      retryable: true,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    retryable: true,
  };
}

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
