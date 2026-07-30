import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  cancelAnalysisJob,
  createAnalysisJob,
  getAnalysisJob,
  getAnalysisJobResult,
} from '@/modules/analysis/api/analysisApi';
import type { AnalysisJobResponse, AnalysisResponse } from '@/modules/analysis/types';
import { ApiError } from '@/shared/api/client';

import { useAnalysisStore } from './useAnalysisStore';

vi.mock('@/modules/analysis/api/analysisApi', () => ({
  cancelAnalysisJob: vi.fn(),
  createAnalysisJob: vi.fn(),
  getAnalysisJob: vi.fn(),
  getAnalysisJobResult: vi.fn(),
}));

const mockedCancelJob = vi.mocked(cancelAnalysisJob);
const mockedCreateJob = vi.mocked(createAnalysisJob);
const mockedGetJob = vi.mocked(getAnalysisJob);
const mockedGetResult = vi.mocked(getAnalysisJobResult);

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

const succeededJob: AnalysisJobResponse = {
  jobId: '5a35dc9d-b07b-4d31-9d40-d6d6f286f982',
  status: 'succeeded',
  stage: 'preparing_result',
  createdAt: '2026-07-30T00:00:00.000Z',
  startedAt: '2026-07-30T00:00:01.000Z',
  completedAt: '2026-07-30T00:00:02.000Z',
  expiresAt: '2026-07-31T00:00:02.000Z',
  pollAfterMs: 1,
};

function mockSuccessfulJob() {
  mockedCreateJob.mockResolvedValue({
    jobId: succeededJob.jobId,
    status: 'queued',
    pollAfterMs: 1,
  });
  mockedGetJob.mockResolvedValue(succeededJob);
  mockedGetResult.mockResolvedValue(analysisResponse);
}

describe('useAnalysisStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
    useAnalysisStore.setState({
      analysisResult: null,
      screenReaderScript: null,
      pageContent: null,
      isLoading: false,
      isCancelling: false,
      error: null,
      lastRequest: null,
      jobId: null,
      jobAccessToken: null,
      jobStatus: null,
      jobStage: null,
      elapsedSeconds: 0,
      selectedScreenReader: 'voiceover',
    });
  });

  it('작업을 생성하고 polling 완료 결과를 저장한다', async () => {
    mockSuccessfulJob();

    await useAnalysisStore.getState().analyze({ url: 'https://example.com' });

    expect(mockedCreateJob).toHaveBeenCalledWith(
      { url: 'https://example.com', screenReader: 'voiceover' },
      {
        accessToken: expect.stringMatching(/^[\w-]{43}$/),
        idempotencyKey: expect.stringMatching(/^[\w-]{43}$/),
      },
      expect.any(AbortSignal)
    );
    expect(mockedGetJob).toHaveBeenCalledWith(
      succeededJob.jobId,
      expect.any(String),
      expect.any(AbortSignal)
    );
    expect(useAnalysisStore.getState()).toMatchObject({
      analysisResult: analysisResponse.accessibilityAnalysis,
      pageContent: analysisResponse.pageContent,
      isLoading: false,
      error: null,
      jobStatus: 'succeeded',
    });
  });

  it('실패한 작업의 서버 오류 코드를 사용자 오류로 변환한다', async () => {
    mockedCreateJob.mockResolvedValue({
      jobId: succeededJob.jobId,
      status: 'queued',
      pollAfterMs: 1,
    });
    mockedGetJob.mockResolvedValue({
      ...succeededJob,
      status: 'failed',
      error: { code: 'ANALYSIS_TIMEOUT', message: '시간 초과' },
    });

    await useAnalysisStore.getState().analyze({ url: 'https://example.com' });

    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'ANALYSIS_TIMEOUT',
      retryable: true,
    });
  });

  it('작업 생성 네트워크 오류를 분류한다', async () => {
    vi.useFakeTimers();
    mockedCreateJob.mockRejectedValue(new TypeError('Failed to fetch'));

    const analysisPromise = useAnalysisStore.getState().analyze({ url: 'https://example.com' });
    await vi.runAllTimersAsync();
    await analysisPromise;

    expect(mockedCreateJob).toHaveBeenCalledTimes(4);
    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'NETWORK_ERROR',
      retryable: true,
    });
  });

  it('명시적 재시도는 새 작업을 생성한다', async () => {
    mockedCreateJob.mockRejectedValueOnce(new ApiError('Server error', 500));
    await useAnalysisStore.getState().analyze({ htmlContent: '<h1>제목</h1>' });

    mockSuccessfulJob();
    await useAnalysisStore.getState().retryAnalysis();

    expect(mockedCreateJob).toHaveBeenCalledTimes(2);
    expect(mockedCreateJob.mock.calls[1][0]).toEqual({
      htmlContent: '<h1>제목</h1>',
      screenReader: 'voiceover',
    });
    expect(useAnalysisStore.getState().analysisResult).toBe(analysisResponse.accessibilityAnalysis);
  });

  it('진행 중인 작업에 서버 취소를 요청한다', async () => {
    vi.useFakeTimers();
    mockedCreateJob.mockResolvedValue({
      jobId: succeededJob.jobId,
      status: 'queued',
      pollAfterMs: 1_000,
    });
    mockedCancelJob.mockResolvedValue({
      ...succeededJob,
      status: 'running',
    });
    mockedGetJob.mockResolvedValue({ ...succeededJob, status: 'cancelled' });

    const analysisPromise = useAnalysisStore.getState().analyze({ url: 'https://example.com' });
    await vi.advanceTimersByTimeAsync(0);
    await useAnalysisStore.getState().cancelAnalysis();
    await vi.advanceTimersByTimeAsync(1_000);
    await analysisPromise;

    expect(mockedCancelJob).toHaveBeenCalledWith(succeededJob.jobId, expect.any(String));
    expect(useAnalysisStore.getState().error).toMatchObject({
      code: 'ANALYSIS_CANCELLED',
      retryable: true,
    });
  });

  it('sessionStorage의 작업을 새로고침 후 복구한다', async () => {
    sessionStorage.setItem(
      'screen-reader-studio:analysis-job',
      JSON.stringify({
        accessToken: 'a'.repeat(43),
        createdAt: '2026-07-30T00:00:00.000Z',
        jobId: succeededJob.jobId,
        selectedScreenReader: 'nvda',
      })
    );
    mockedGetJob.mockResolvedValue(succeededJob);
    mockedGetResult.mockResolvedValue(analysisResponse);

    await useAnalysisStore.getState().resumeAnalysis();

    expect(mockedGetJob).toHaveBeenCalledWith(
      succeededJob.jobId,
      'a'.repeat(43),
      expect.any(AbortSignal)
    );
    expect(useAnalysisStore.getState()).toMatchObject({
      analysisResult: analysisResponse.accessibilityAnalysis,
      selectedScreenReader: 'nvda',
    });
    expect(sessionStorage.getItem('screen-reader-studio:analysis-job')).toBeNull();
  });
});
