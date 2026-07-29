import { describe, expect, it } from 'vitest';

import type { ServerAnalysisErrorCode } from '@/modules/analysis/types';
import { ApiError } from '@/shared/api/client';

import { createAnalysisError } from './analysisError';

const serverErrorExpectations: Array<{
  code: ServerAnalysisErrorCode;
  retryable: boolean;
}> = [
  { code: 'ANALYSIS_TIMEOUT', retryable: true },
  { code: 'TARGET_UNREACHABLE', retryable: true },
  { code: 'TARGET_ACCESS_DENIED', retryable: false },
  { code: 'TARGET_SECURITY_BLOCKED', retryable: false },
  { code: 'INVALID_REQUEST', retryable: false },
  { code: 'INVALID_URL', retryable: false },
  { code: 'INVALID_HTML', retryable: false },
  { code: 'UNSUPPORTED_CONTENT', retryable: false },
  { code: 'RATE_LIMITED', retryable: true },
  { code: 'INTERNAL_ERROR', retryable: true },
];

describe('createAnalysisError', () => {
  it.each(serverErrorExpectations)(
    '백엔드 $code 계약을 사용자 복구 동작으로 변환한다',
    ({ code, retryable }) => {
      const error = createAnalysisError(
        new ApiError('백엔드 메시지', 500, code),
        new AbortController().signal
      );

      expect(error).toMatchObject({ code, retryable });
      expect(error.message).not.toBe('');
      expect(error.recoveryMessage).not.toBe('');
    }
  );

  it('알 수 없는 백엔드 코드는 HTTP 상태를 안전한 계약으로 대체한다', () => {
    const error = createAnalysisError(
      new ApiError('노출하지 않을 메시지', 504, 'FUTURE_ERROR'),
      new AbortController().signal
    );

    expect(error).toMatchObject({
      code: 'ANALYSIS_TIMEOUT',
      retryable: true,
    });
  });
});
