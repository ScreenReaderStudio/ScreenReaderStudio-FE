import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from '@/app/page';

vi.mock('@/components/landing/MobileLanding', () => ({
  default: () => <div>모바일 브랜드 랜딩</div>,
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <div>데스크톱 헤더</div>,
}));

vi.mock('@/modules/analysis/components/AccessibilityAnalyzer', () => ({
  default: () => <div>분석 입력</div>,
}));

vi.mock('@/modules/analysis/components/ResultViewer', () => ({
  default: () => <div>분석 결과</div>,
}));

describe('Home', () => {
  it('모바일 랜딩과 데스크톱 분석기를 md breakpoint로 분리한다', () => {
    const { container } = render(<Home />);

    expect(screen.getByText('모바일 브랜드 랜딩').parentElement).toHaveClass('md:hidden');
    expect(screen.getByText('데스크톱 헤더').parentElement).toHaveClass('hidden', 'md:block');
    expect(container.firstElementChild).toHaveClass('md:hidden');
    expect(container.lastElementChild).toHaveClass('hidden', 'md:block');
  });
});
