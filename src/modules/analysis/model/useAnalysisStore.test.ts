import { beforeEach, describe, expect, it, vi } from 'vitest';

import { performAnalysis } from '@/modules/analysis/api/analysisApi';
import { ANALYSIS_TIMEOUT_MS } from '@/modules/analysis/constants';
import type { AnalysisResponse } from '@/modules/analysis/types';
import { ApiError } from '@/shared/api/client';

import { useAnalysisStore } from './useAnalysisStore';

vi.mock('@/modules/analysis/api/analysisApi', () => ({
  performAnalysis: vi.fn(),
}));

const mockedPerformAnalysis = vi.mocked(performAnalysis);

const analysisResponse: AnalysisResponse = {
  accessibilityAnalysis: {
    testEngine: { name: 'axe-core', version: '4.10.0' },
    testRunner: { name: 'axe' },
    testEnvironment: {
      userAgent: 'Vitest',
      windowWidth: 1280,
      windowHeight: 720,
    },
    url: 'https://example.com',
    timestamp: '2026-07-28T00:00:00.000Z',
    toolOptions: {},
    passes: [],
    violations: [],
    incomplete: [],
    inapplicable: [],
  },
  screenReaderScript: [{ selector: 'h1', text: '제목' }],
  pageContent: '<h1>제목</h1>',
};

function mockPendingRequest() {
  mockedPerformAnalysis.mockImplementation((_request, signal) => {
    return new Promise((_resolve, reject) => {
      signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    });
  });
}

describe('useAnalysisStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    useAnalysisStore.getState().cancelAnalysis();
    useAnalysisStore.setState({
      analysisResult: null,
      screenReaderScript: null,
      pageContent: null,
      isLoading: false,
      error: null,
      lastRequest: null,
      selectedScreenReader: 'voiceover',
    });
  });

  it('분석 성공 결과를 저장한다', async () => {
    mockedPerformAnalysis.mockResolvedValue(analysisResponse);

    await useAnalysisStore.getState().analyze({ url: 'https://example.com' });

    expect(mockedPerformAnalysis).toHaveBeenCalledWith(
      {
        url: 'https://example.com',
        screenReader: 'voiceover',
      },
      expect.any(AbortSignal)
    );
    expect(useAnalysisStore.getState()).toMatchObject({
      analysisResult: analysisResponse.accessibilityAnalysis,
      screenReaderScript: analysisResponse.screenReaderScript,
      pageContent: analysisResponse.pageContent,
      isLoading: false,
      error: null,
    });
  });

  it('504 응답을 재시도 가능한 타임아웃 오류로 변환한다', async () => {
    mockedPerformAnalysis.mockRejectedValue(new ApiError('Gateway timeout', 504));

    await useAnalysisStore.getState().analyze({ url: 'https://example.com' });

    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'ANALYSIS_TIMEOUT',
      retryable: true,
    });
  });

  it('fetch TypeError를 네트워크 오류로 변환한다', async () => {
    mockedPerformAnalysis.mockRejectedValue(new TypeError('Failed to fetch'));

    await useAnalysisStore.getState().analyze({ url: 'https://example.com' });

    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'NETWORK_ERROR',
      retryable: true,
    });
  });

  it('마지막 요청으로 분석을 재시도한다', async () => {
    mockedPerformAnalysis
      .mockRejectedValueOnce(new ApiError('Server error', 500))
      .mockResolvedValueOnce(analysisResponse);

    await useAnalysisStore.getState().analyze({ htmlContent: '<h1>제목</h1>' });
    await useAnalysisStore.getState().retryAnalysis();

    expect(mockedPerformAnalysis).toHaveBeenCalledTimes(2);
    expect(mockedPerformAnalysis.mock.calls[1][0]).toEqual({
      htmlContent: '<h1>제목</h1>',
      screenReader: 'voiceover',
    });
    expect(useAnalysisStore.getState().analysisResult).toBe(analysisResponse.accessibilityAnalysis);
  });

  it('사용자가 진행 중인 분석을 취소할 수 있다', async () => {
    mockPendingRequest();

    const analysisPromise = useAnalysisStore.getState().analyze({ url: 'https://example.com' });
    useAnalysisStore.getState().cancelAnalysis();
    await analysisPromise;

    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'ANALYSIS_CANCELLED',
      retryable: true,
    });
    expect(useAnalysisStore.getState().isLoading).toBe(false);
  });

  it('프론트 제한 시간을 넘기면 분석 요청을 중단한다', async () => {
    vi.useFakeTimers();
    mockPendingRequest();

    const analysisPromise = useAnalysisStore.getState().analyze({ url: 'https://example.com' });
    await vi.advanceTimersByTimeAsync(ANALYSIS_TIMEOUT_MS);
    await analysisPromise;

    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'ANALYSIS_TIMEOUT',
      retryable: true,
    });
    expect(useAnalysisStore.getState().isLoading).toBe(false);
  });
});
