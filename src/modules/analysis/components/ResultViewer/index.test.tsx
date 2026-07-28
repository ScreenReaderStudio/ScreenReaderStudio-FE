import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

import ResultViewer from './index';

vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: () => ({ isLoggedIn: false }),
}));

vi.mock('@/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('ResultViewer', () => {
  beforeEach(() => {
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

  it('분석 결과가 없어도 오류가 있으면 Placeholder 대신 오류를 표시한다', () => {
    useAnalysisStore.setState({
      error: {
        code: 'NETWORK_ERROR',
        message: '분석 서버와 통신하지 못했습니다.',
        retryable: true,
      },
    });

    render(<ResultViewer />);

    expect(
      screen.getByRole('heading', { name: '분석 서버에 연결할 수 없습니다' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("분석 대상을 입력하고 '분석' 버튼을 눌러주세요.")
    ).not.toBeInTheDocument();
  });
});
