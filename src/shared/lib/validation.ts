import { VALIDATION } from '@/shared/config/constants';

export function isValidUrl(url: string): boolean {
  if (!url || url.length === 0) return false;
  if (url.length > VALIDATION.MAX_URL_LENGTH) return false;
  return VALIDATION.URL_PATTERN.test(url);
}

export function isValidCode(code: string): boolean {
  if (!code || code.length < VALIDATION.MIN_CODE_LENGTH) return false;
  return true;
}

export function validateAnalysisInput(input: { url?: string; htmlContent?: string }): {
  isValid: boolean;
  error?: string;
} {
  const { url, htmlContent } = input;

  if (!url && !htmlContent) {
    return { isValid: false, error: 'URL 또는 HTML 코드를 입력해주세요.' };
  }

  if (url && !isValidUrl(url)) {
    return { isValid: false, error: '유효한 URL을 입력해주세요.' };
  }

  if (htmlContent && !isValidCode(htmlContent)) {
    return {
      isValid: false,
      error: `최소 ${VALIDATION.MIN_CODE_LENGTH}자 이상의 코드를 입력해주세요.`,
    };
  }

  return { isValid: true };
}
