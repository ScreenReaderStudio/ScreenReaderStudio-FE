import type {
  AnalysisError,
  AnalysisErrorCode,
  ServerAnalysisErrorCode,
} from '@/modules/analysis/types';
import { ApiError } from '@/shared/api/client';

type ErrorPresentation = Omit<AnalysisError, 'code'>;

const serverErrorPresentations: Record<ServerAnalysisErrorCode, ErrorPresentation> = {
  ANALYSIS_TIMEOUT: {
    message: '분석 제한 시간을 초과했습니다.',
    recoveryMessage: '잠시 후 다시 시도하거나 HTML 코드를 직접 입력해 분석해주세요.',
    retryable: true,
  },
  TARGET_UNREACHABLE: {
    message: '분석 대상 페이지에 연결할 수 없습니다.',
    recoveryMessage: 'URL과 대상 페이지의 접속 상태를 확인한 후 다시 시도해주세요.',
    retryable: true,
  },
  TARGET_ACCESS_DENIED: {
    message: '대상 페이지가 분석 요청의 접근을 허용하지 않았습니다.',
    recoveryMessage: '공개된 URL인지 확인하거나 HTML 코드를 직접 입력해주세요.',
    retryable: false,
  },
  TARGET_SECURITY_BLOCKED: {
    message: '보안 정책에 따라 해당 주소를 분석할 수 없습니다.',
    recoveryMessage: '공개된 HTTP 또는 HTTPS 주소를 입력해주세요.',
    retryable: false,
  },
  INVALID_REQUEST: {
    message: '분석 요청의 입력값이 올바르지 않습니다.',
    recoveryMessage: 'URL 또는 HTML 코드 중 하나만 입력하고 다시 확인해주세요.',
    retryable: false,
  },
  INVALID_URL: {
    message: 'URL 형식이 올바르지 않습니다.',
    recoveryMessage: 'http:// 또는 https://로 시작하는 공개 URL을 입력해주세요.',
    retryable: false,
  },
  INVALID_HTML: {
    message: '입력한 HTML 코드를 분석할 수 없습니다.',
    recoveryMessage: 'HTML 코드가 비어 있지 않은지와 허용된 길이인지 확인해주세요.',
    retryable: false,
  },
  UNSUPPORTED_CONTENT: {
    message: '해당 URL의 콘텐츠 형식은 분석할 수 없습니다.',
    recoveryMessage: 'HTML 문서의 URL을 입력하거나 HTML 코드를 직접 입력해주세요.',
    retryable: false,
  },
  RATE_LIMITED: {
    message: '요청이 많아 분석을 시작하지 못했습니다.',
    recoveryMessage: '잠시 후 다시 시도해주세요.',
    retryable: true,
  },
  INTERNAL_ERROR: {
    message: '서버 오류로 분석을 완료하지 못했습니다.',
    recoveryMessage: '잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 알려주세요.',
    retryable: true,
  },
  IDEMPOTENCY_CONFLICT: {
    message: '분석 요청을 안전하게 다시 시작하지 못했습니다.',
    recoveryMessage: '분석 버튼을 다시 눌러 새 작업을 시작해주세요.',
    retryable: true,
  },
  JOB_EXPIRED: {
    message: '분석 결과의 보관 기간이 만료되었습니다.',
    recoveryMessage: '분석 대상을 다시 제출해주세요.',
    retryable: true,
  },
  JOB_NOT_FOUND: {
    message: '진행 중이던 분석 작업을 찾을 수 없습니다.',
    recoveryMessage: '분석 대상을 다시 제출해주세요.',
    retryable: true,
  },
  JOB_NOT_READY: {
    message: '분석 결과가 아직 준비되지 않았습니다.',
    recoveryMessage: '잠시 후 다시 시도해주세요.',
    retryable: true,
  },
};

const serverAnalysisErrorCodes = new Set<string>(Object.keys(serverErrorPresentations));

function isServerAnalysisErrorCode(code: string | undefined): code is ServerAnalysisErrorCode {
  return code !== undefined && serverAnalysisErrorCodes.has(code);
}

function fromServerCode(code: ServerAnalysisErrorCode): AnalysisError {
  return { code, ...serverErrorPresentations[code] };
}

function fromHttpStatus(error: ApiError): AnalysisError {
  if (error.status === 400 || error.status === 422) {
    return fromServerCode('INVALID_REQUEST');
  }

  if (error.status === 401 || error.status === 403) {
    return fromServerCode('TARGET_ACCESS_DENIED');
  }

  if (error.status === 408 || error.status === 504) {
    return fromServerCode('ANALYSIS_TIMEOUT');
  }

  if (error.status === 429) {
    return fromServerCode('RATE_LIMITED');
  }

  return fromServerCode('INTERNAL_ERROR');
}

function createLocalError(code: AnalysisErrorCode, presentation: ErrorPresentation): AnalysisError {
  return { code, ...presentation };
}

export function createAnalysisError(error: unknown, signal: AbortSignal): AnalysisError {
  if (signal.aborted) {
    if (signal.reason === 'timeout') {
      return fromServerCode('ANALYSIS_TIMEOUT');
    }

    return createLocalError('ANALYSIS_CANCELLED', {
      message: '분석이 취소되었습니다.',
      recoveryMessage: '분석이 필요하면 다시 시도해주세요.',
      retryable: true,
    });
  }

  if (error instanceof ApiError) {
    return isServerAnalysisErrorCode(error.code)
      ? fromServerCode(error.code)
      : fromHttpStatus(error);
  }

  if (error instanceof TypeError) {
    return createLocalError('NETWORK_ERROR', {
      message: '분석 서버와 통신하지 못했습니다.',
      recoveryMessage: '네트워크 연결을 확인한 후 다시 시도해주세요.',
      retryable: true,
    });
  }

  return createLocalError('UNKNOWN_ERROR', {
    message: '알 수 없는 오류로 분석을 완료하지 못했습니다.',
    recoveryMessage: '잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 알려주세요.',
    retryable: true,
  });
}
