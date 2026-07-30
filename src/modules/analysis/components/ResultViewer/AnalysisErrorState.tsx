'use client';

import { useEffect, useRef } from 'react';

import Button from '@/components/ui/Button';
import type { AnalysisError } from '@/modules/analysis/types';

const errorTitles: Record<AnalysisError['code'], string> = {
  ANALYSIS_CANCELLED: '분석이 취소되었습니다',
  ANALYSIS_TIMEOUT: '분석 시간이 초과되었습니다',
  INTERNAL_ERROR: '분석 서버에 문제가 발생했습니다',
  IDEMPOTENCY_CONFLICT: '분석 요청을 다시 시작하지 못했습니다',
  INVALID_HTML: 'HTML 코드를 확인해주세요',
  INVALID_REQUEST: '분석 대상을 확인해주세요',
  INVALID_URL: 'URL을 확인해주세요',
  NETWORK_ERROR: '분석 서버에 연결할 수 없습니다',
  JOB_EXPIRED: '분석 결과가 만료되었습니다',
  JOB_NOT_FOUND: '분석 작업을 찾을 수 없습니다',
  JOB_NOT_READY: '분석 결과를 준비하고 있습니다',
  RATE_LIMITED: '잠시 후 다시 시도해주세요',
  TARGET_ACCESS_DENIED: '대상 페이지에 접근할 수 없습니다',
  TARGET_SECURITY_BLOCKED: '보안 정책상 분석할 수 없는 주소입니다',
  TARGET_UNREACHABLE: '대상 페이지에 연결할 수 없습니다',
  UNKNOWN_ERROR: '분석을 완료하지 못했습니다',
  UNSUPPORTED_CONTENT: '지원하지 않는 콘텐츠 형식입니다',
};

export default function AnalysisErrorState({
  error,
  onRetry,
}: {
  error: AnalysisError;
  onRetry: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [error]);

  return (
    <div
      role="alert"
      className="flex h-[60vh] w-full items-center justify-center rounded-md border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30"
    >
      <div className="max-w-lg">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold text-red-900 outline-none dark:text-red-100"
        >
          {errorTitles[error.code]}
        </h2>
        <p className="mt-3 text-sm break-keep text-red-800 dark:text-red-200">{error.message}</p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{error.recoveryMessage}</p>
        {error.retryable && (
          <Button onClick={onRetry} className="mx-auto mt-5 w-auto min-w-32">
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
