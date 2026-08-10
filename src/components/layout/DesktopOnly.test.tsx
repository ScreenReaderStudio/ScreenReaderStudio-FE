import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DesktopOnly from '@/components/layout/DesktopOnly';

describe('DesktopOnly', () => {
  it('데스크톱 콘텐츠와 모바일 기기 안내를 반응형 영역으로 분리한다', () => {
    const { container } = render(
      <DesktopOnly>
        <p>데스크톱 콘텐츠</p>
      </DesktopOnly>
    );

    expect(screen.getByText('데스크톱 콘텐츠')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '서비스 이용 안내' })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('hidden', 'md:block');
    expect(container.lastElementChild).toHaveClass('md:hidden');
  });
});
