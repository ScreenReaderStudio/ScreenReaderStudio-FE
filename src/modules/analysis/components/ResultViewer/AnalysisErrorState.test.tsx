import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import AnalysisErrorState from './AnalysisErrorState';

describe('AnalysisErrorState', () => {
  it('오류를 알리고 오류 제목으로 포커스를 이동한다', () => {
    render(
      <AnalysisErrorState
        error={{
          code: 'NETWORK_ERROR',
          message: '분석 서버와 통신하지 못했습니다.',
          retryable: true,
        }}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '분석 서버에 연결할 수 없습니다' })).toHaveFocus();
  });

  it('재시도 가능한 오류에서 다시 시도를 실행한다', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <AnalysisErrorState
        error={{
          code: 'ANALYSIS_TIMEOUT',
          message: '분석 제한 시간을 초과했습니다.',
          retryable: true,
        }}
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('재시도할 수 없는 오류에는 다시 시도 버튼을 표시하지 않는다', () => {
    render(
      <AnalysisErrorState
        error={{
          code: 'INVALID_REQUEST',
          message: 'URL을 확인해주세요.',
          retryable: false,
        }}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });
});
