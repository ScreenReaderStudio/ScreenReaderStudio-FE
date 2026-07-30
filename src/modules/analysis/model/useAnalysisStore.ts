import { create } from 'zustand';

import {
  cancelAnalysisJob,
  createAnalysisJob,
  getAnalysisJob,
  getAnalysisJobResult,
} from '@/modules/analysis/api/analysisApi';
import type {
  AnalysisData,
  AnalysisError,
  AnalysisJobStage,
  AnalysisJobStatus,
  AnalysisRequest,
  ScreenReaderType,
} from '@/modules/analysis/types';
import { ApiError } from '@/shared/api/client';

import { createAnalysisError } from './analysisError';

type AnalysisInput = Omit<AnalysisRequest, 'screenReader'>;

interface StoredJob {
  accessToken: string;
  createdAt: string;
  jobId: string;
  selectedScreenReader: ScreenReaderType;
}

interface AnalysisState extends AnalysisData {
  isLoading: boolean;
  isCancelling: boolean;
  error: AnalysisError | null;
  lastRequest: AnalysisInput | null;
  jobId: string | null;
  jobAccessToken: string | null;
  jobStatus: AnalysisJobStatus | null;
  jobStage: AnalysisJobStage | null;
  elapsedSeconds: number;
  setSelectedScreenReader: (reader: ScreenReaderType) => void;
  analyze: (options: AnalysisInput) => Promise<void>;
  cancelAnalysis: () => Promise<void>;
  resumeAnalysis: () => Promise<void>;
  retryAnalysis: () => Promise<void>;
  setAnalysisData: (data: AnalysisData) => void;
}

const STORAGE_KEY = 'screen-reader-studio:analysis-job';
const MAX_POLL_FAILURES = 3;
let activeController: AbortController | null = null;
let elapsedTimer: number | null = null;

function createSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      },
      { once: true }
    );
  });
}

function saveStoredJob(job: StoredJob) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(job));
}

function readStoredJob(): StoredJob | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as StoredJob) : null;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function clearStoredJob() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function stopElapsedTimer() {
  if (elapsedTimer !== null) {
    window.clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function startElapsedTimer(createdAt: string, set: (state: Partial<AnalysisState>) => void) {
  stopElapsedTimer();
  const update = () => {
    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - new Date(createdAt).getTime()) / 1_000)
    );
    set({ elapsedSeconds });
  };
  update();
  elapsedTimer = window.setInterval(update, 1_000);
}

async function pollWithRetry(
  jobId: string,
  accessToken: string,
  signal: AbortSignal,
  pollAfterMs: number
) {
  let failures = 0;

  while (true) {
    try {
      await wait(failures === 0 ? pollAfterMs : pollAfterMs * 2 ** failures, signal);
      const job = await getAnalysisJob(jobId, accessToken, signal);
      failures = 0;
      return job;
    } catch (error) {
      if (signal.aborted || !(error instanceof TypeError) || failures >= MAX_POLL_FAILURES) {
        throw error;
      }
      failures += 1;
    }
  }
}

async function createJobWithRetry(
  request: AnalysisRequest,
  credentials: { accessToken: string; idempotencyKey: string },
  signal: AbortSignal
) {
  let failures = 0;

  while (true) {
    try {
      return await createAnalysisJob(request, credentials, signal);
    } catch (error) {
      if (signal.aborted || !(error instanceof TypeError) || failures >= MAX_POLL_FAILURES) {
        throw error;
      }

      await wait(500 * 2 ** failures, signal);
      failures += 1;
    }
  }
}

export const useAnalysisStore = create<AnalysisState>((set, get) => {
  async function monitorJob(
    storedJob: StoredJob,
    controller: AbortController,
    initialPollAfterMs = 0
  ) {
    let pollAfterMs = initialPollAfterMs;
    startElapsedTimer(storedJob.createdAt, set);

    try {
      while (!controller.signal.aborted) {
        const job =
          pollAfterMs === 0
            ? await getAnalysisJob(storedJob.jobId, storedJob.accessToken, controller.signal)
            : await pollWithRetry(
                storedJob.jobId,
                storedJob.accessToken,
                controller.signal,
                pollAfterMs
              );

        if (activeController !== controller) {
          return;
        }

        set({
          jobStage: job.stage,
          jobStatus: job.status,
          isCancelling: job.status === 'running' && get().isCancelling,
        });

        if (job.status === 'succeeded') {
          const result = await getAnalysisJobResult(
            storedJob.jobId,
            storedJob.accessToken,
            controller.signal
          );
          set({
            analysisResult: result.accessibilityAnalysis,
            screenReaderScript: result.screenReaderScript,
            pageContent: result.pageContent,
            selectedScreenReader: storedJob.selectedScreenReader,
            isLoading: false,
            isCancelling: false,
            error: null,
          });
          clearStoredJob();
          return;
        }

        if (job.status === 'failed') {
          throw new ApiError(
            job.error?.message ?? '분석 작업이 실패했습니다.',
            500,
            job.error?.code ?? 'INTERNAL_ERROR'
          );
        }

        if (job.status === 'cancelled') {
          controller.abort('cancelled');
          throw new DOMException('The operation was aborted.', 'AbortError');
        }

        pollAfterMs = job.pollAfterMs;
      }
    } catch (error) {
      if (activeController !== controller) {
        return;
      }

      clearStoredJob();
      set({
        error: createAnalysisError(error, controller.signal),
        isLoading: false,
        isCancelling: false,
      });
    } finally {
      if (activeController === controller) {
        activeController = null;
        stopElapsedTimer();
      }
    }
  }

  return {
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

    setSelectedScreenReader: (reader) => set({ selectedScreenReader: reader }),

    setAnalysisData: ({
      analysisResult,
      screenReaderScript,
      pageContent,
      selectedScreenReader,
    }) => {
      activeController?.abort('superseded');
      activeController = null;
      stopElapsedTimer();

      set({
        analysisResult,
        screenReaderScript,
        pageContent,
        selectedScreenReader,
        isLoading: false,
        isCancelling: false,
        error: null,
        jobId: null,
        jobAccessToken: null,
        jobStatus: null,
        jobStage: null,
      });
    },

    analyze: async ({ url, htmlContent }) => {
      activeController?.abort('superseded');
      const controller = new AbortController();
      const request = { url, htmlContent };
      const { selectedScreenReader } = get();
      const credentials = {
        accessToken: createSecret(),
        idempotencyKey: createSecret(),
      };
      activeController = controller;
      clearStoredJob();

      set({
        isLoading: true,
        isCancelling: false,
        error: null,
        analysisResult: null,
        screenReaderScript: null,
        pageContent: null,
        lastRequest: request,
        jobId: null,
        jobAccessToken: null,
        jobStatus: null,
        jobStage: 'queued',
        elapsedSeconds: 0,
      });

      try {
        const job = await createJobWithRetry(
          { url, htmlContent, screenReader: selectedScreenReader },
          credentials,
          controller.signal
        );
        const storedJob = {
          accessToken: credentials.accessToken,
          createdAt: new Date().toISOString(),
          jobId: job.jobId,
          selectedScreenReader,
        };
        saveStoredJob(storedJob);
        set({
          jobId: job.jobId,
          jobAccessToken: credentials.accessToken,
          jobStatus: job.status,
        });
        await monitorJob(storedJob, controller, job.pollAfterMs);
      } catch (error) {
        if (activeController === controller) {
          clearStoredJob();
          activeController = null;
          set({ error: createAnalysisError(error, controller.signal), isLoading: false });
        }
      }
    },

    cancelAnalysis: async () => {
      const { jobId, jobAccessToken } = get();

      if (!jobId || !jobAccessToken) {
        activeController?.abort('cancelled');
        return;
      }

      set({ isCancelling: true });
      try {
        await cancelAnalysisJob(jobId, jobAccessToken);
      } catch {
        set({ isCancelling: false });
      }
    },

    resumeAnalysis: async () => {
      if (activeController || get().analysisResult) {
        return;
      }

      const storedJob = readStoredJob();

      if (!storedJob) {
        return;
      }

      const controller = new AbortController();
      activeController = controller;
      set({
        isLoading: true,
        error: null,
        jobId: storedJob.jobId,
        jobAccessToken: storedJob.accessToken,
        jobStatus: 'queued',
        jobStage: 'queued',
        selectedScreenReader: storedJob.selectedScreenReader,
      });
      await monitorJob(storedJob, controller);
    },

    retryAnalysis: async () => {
      const lastRequest = get().lastRequest;

      if (lastRequest) {
        await get().analyze(lastRequest);
      }
    },
  };
});
