import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

import AccessibilityAnalyzer from './AccessibilityAnalyzer';

vi.mock('@/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('AccessibilityAnalyzer', () => {
  beforeEach(() => {
    useAnalysisStore.setState({ selectedScreenReader: 'voiceover' });
  });

  it('스크린 리더 선택을 레이블이 있는 네이티브 select로 제공한다', async () => {
    const user = userEvent.setup();

    render(<AccessibilityAnalyzer />);

    const select = screen.getByRole('combobox', { name: '대본을 생성할 스크린 리더' });

    expect(select).toHaveValue('voiceover');

    await user.selectOptions(select, 'nvda');

    expect(select).toHaveValue('nvda');
    expect(useAnalysisStore.getState().selectedScreenReader).toBe('nvda');
  });
});
