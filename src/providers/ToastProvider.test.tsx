import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ToastProvider, useToast } from '@/providers/ToastProvider';

function ToastControls() {
  const { showToast } = useToast();

  return (
    <>
      <button type="button" onClick={() => showToast({ message: '저장했습니다.' })}>
        상태 알림 표시
      </button>
      <button
        type="button"
        onClick={() => showToast({ message: '저장하지 못했습니다.', variant: 'alert' })}
      >
        오류 알림 표시
      </button>
    </>
  );
}

describe('ToastProvider', () => {
  it('일반 상태와 오류를 서로 다른 live region 역할로 알린다', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastControls />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: '상태 알림 표시' }));
    expect(screen.getByRole('status')).toHaveTextContent('저장했습니다.');

    await user.click(screen.getByRole('button', { name: '오류 알림 표시' }));
    expect(screen.getByRole('alert')).toHaveTextContent('저장하지 못했습니다.');
  });

  it('닫기 버튼으로 알림을 제거한다', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastControls />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: '오류 알림 표시' }));
    await user.click(screen.getByRole('button', { name: '알림 닫기' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
