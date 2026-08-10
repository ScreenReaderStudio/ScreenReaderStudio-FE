import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MobileLinkShareButton from '@/components/landing/MobileLinkShareButton';

const originalClipboard = navigator.clipboard;
const originalShare = navigator.share;

function setNavigatorProperty(name: 'clipboard' | 'share', value: unknown) {
  Object.defineProperty(navigator, name, {
    configurable: true,
    value,
  });
}

describe('MobileLinkShareButton', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setNavigatorProperty('clipboard', originalClipboard);
    setNavigatorProperty('share', originalShare);
  });

  it('Web Share API가 있으면 홈 링크와 서비스 설명을 공유한다', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', share);

    render(<MobileLinkShareButton />);

    await user.click(screen.getByRole('button', { name: 'PC에서 사용할 링크 보내기' }));

    expect(share).toHaveBeenCalledWith({
      title: 'Screen Reader Studio',
      text: '웹 접근성 분석을 태블릿 또는 PC에서 시작해 보세요.',
      url: new URL('/', window.location.href).toString(),
    });
    expect(screen.getByText('링크를 공유했어요.')).toBeInTheDocument();
  });

  it('Web Share API가 없으면 홈 링크를 클립보드에 복사한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', undefined);
    setNavigatorProperty('clipboard', { writeText });

    render(<MobileLinkShareButton />);

    await user.click(screen.getByRole('button', { name: 'PC에서 사용할 링크 보내기' }));

    expect(writeText).toHaveBeenCalledWith(new URL('/', window.location.href).toString());
    expect(
      screen.getByText('링크를 복사했어요. 태블릿이나 PC로 보내서 열어주세요.')
    ).toBeInTheDocument();
  });

  it('공유 API 오류가 발생하면 클립보드 복사를 시도한다', async () => {
    const share = vi.fn().mockRejectedValue(new Error('share failed'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProperty('share', share);
    setNavigatorProperty('clipboard', { writeText });

    render(<MobileLinkShareButton />);

    await user.click(screen.getByRole('button', { name: 'PC에서 사용할 링크 보내기' }));

    expect(writeText).toHaveBeenCalledWith(new URL('/', window.location.href).toString());
    expect(
      screen.getByText('링크를 복사했어요. 태블릿이나 PC로 보내서 열어주세요.')
    ).toBeInTheDocument();
  });

  it('사용자가 공유를 취소하면 오류나 클립보드 복사를 실행하지 않는다', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    const writeText = vi.fn();
    setNavigatorProperty('share', share);
    setNavigatorProperty('clipboard', { writeText });

    render(<MobileLinkShareButton />);

    await user.click(screen.getByRole('button', { name: 'PC에서 사용할 링크 보내기' }));

    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText(/링크를 (공유|복사)했어요/)).not.toBeInTheDocument();
    expect(screen.queryByText(/링크를 보내지 못했어요/)).not.toBeInTheDocument();
  });

  it('공유와 클립보드 복사가 모두 불가능하면 복구 방법을 안내한다', async () => {
    setNavigatorProperty('share', undefined);
    setNavigatorProperty('clipboard', undefined);

    render(<MobileLinkShareButton />);

    await user.click(screen.getByRole('button', { name: 'PC에서 사용할 링크 보내기' }));

    expect(
      screen.getByText('링크를 보내지 못했어요. 브라우저 주소창에서 주소를 복사해 주세요.')
    ).toBeInTheDocument();
  });
});
