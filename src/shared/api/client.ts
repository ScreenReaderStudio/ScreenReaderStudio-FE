export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_API_URL 환경 변수가 설정되지 않았습니다.');
  }

  return `${baseUrl}${endpoint}`;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
    };

    throw new ApiError(
      errorData.message || `요청이 실패했습니다. (상태: ${response.status})`,
      response.status,
      errorData.code
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json().catch(() => undefined) as Promise<T>;
}
