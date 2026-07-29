import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

import ScreenReaderScript from './ScreenReaderScript';

describe('ScreenReaderScript', () => {
  beforeEach(() => {
    useAnalysisStore.setState({
      screenReaderScript: [{ selector: 'h1', text: '페이지 제목' }],
      isLoading: false,
      error: null,
    });
  });

  it('대본 항목을 키보드로 활성화할 수 있는 버튼으로 제공한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ScreenReaderScript onScriptItemClick={handleClick} />);

    const itemButton = screen.getByRole('button', {
      name: /페이지 제목.*미리보기에서 강조하고 읽기/,
    });

    await user.tab();
    expect(itemButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledWith('h1', '페이지 제목');
  });
});
