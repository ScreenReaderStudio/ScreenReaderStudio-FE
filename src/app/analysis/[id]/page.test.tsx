import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SharedAnalysisPage from '@/app/analysis/[id]/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({}),
}));

vi.mock('@/modules/analysis/model/useAnalysisStore', () => ({
  useAnalysisStore: () => ({
    analysisResult: null,
    selectedScreenReader: 'nvda',
    setAnalysisData: vi.fn(),
  }),
}));

describe('SharedAnalysisPage', () => {
  it('공유 리포트가 준비되는 동안에도 모바일 기기 안내를 제공한다', () => {
    render(<SharedAnalysisPage />);

    expect(screen.getByText('결과를 불러오는 중...')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '서비스 이용 안내' })).toBeInTheDocument();
  });
});
