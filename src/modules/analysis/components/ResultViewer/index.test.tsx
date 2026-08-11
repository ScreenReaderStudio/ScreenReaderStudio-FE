import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

import ResultViewer from './index';

import type { AxeResults } from 'axe-core';

vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: () => ({ isLoggedIn: false }),
}));

vi.mock('@/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

const analysisResult: AxeResults = {
  testEngine: { name: 'axe-core', version: '4.10.0' },
  testRunner: { name: 'axe' },
  testEnvironment: {
    userAgent: 'Vitest',
    windowHeight: 720,
    windowWidth: 1280,
  },
  url: 'https://example.com',
  timestamp: '2026-08-11T00:00:00.000Z',
  toolOptions: {},
  passes: [],
  violations: [],
  incomplete: [],
  inapplicable: [],
};

beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:https://studio.example/preview'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
});

afterAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: originalCreateObjectUrl,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: originalRevokeObjectUrl,
  });
});

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
        recoveryMessage: '네트워크 연결을 확인해주세요.',
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

  it('분석 결과 미리보기를 최소 권한 sandbox와 referrer 차단으로 격리한다', () => {
    useAnalysisStore.setState({
      analysisResult,
      pageContent: '<h1>분석 결과</h1>',
      screenReaderScript: [{ selector: 'h1', text: '분석 결과, 제목 레벨 1' }],
    });

    render(<ResultViewer />);

    const preview = screen.getByTitle('분석 결과 화면');

    expect(preview).toHaveAttribute('sandbox', 'allow-scripts');
    expect(preview.getAttribute('sandbox')).not.toContain('allow-same-origin');
    expect(preview).toHaveAttribute('referrerpolicy', 'no-referrer');
  });
});
