import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MobileLanding from '@/components/landing/MobileLanding';

describe('MobileLanding', () => {
  it('서비스 가치와 핵심 기능을 제목 계층에 맞게 소개한다', () => {
    render(<MobileLanding />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '스크린 리더가 읽는 웹을, 개발 중에 미리 확인하세요.',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '접근성 문제를 더 빠르게 발견하세요.' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: '주소나 코드로 바로 분석' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: '읽히는 순서를 대본과 음성으로 확인',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: '문제 요소를 원본 화면과 함께 발견' })
    ).toBeInTheDocument();
  });

  it('넓은 화면 이용 안내와 링크 공유 행동을 제공한다', () => {
    render(<MobileLanding />);

    expect(
      screen.getByRole('heading', { name: '분석은 더 넓은 화면에서 시작해 주세요.' })
    ).toBeInTheDocument();
    expect(screen.getByText(/768px 이상의 태블릿과 PC에서 제공하고 있어요/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PC에서 사용할 링크 보내기' })).toBeInTheDocument();
  });

  it('제품 모형과 기능 아이콘을 장식 이미지로 제공한다', () => {
    render(<MobileLanding />);

    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});
