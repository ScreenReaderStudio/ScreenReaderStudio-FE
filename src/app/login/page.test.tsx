import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Login from '@/app/login/page';

vi.mock('@/modules/auth/components/KakaoLogin', () => ({
  default: () => <button type="button">카카오로 시작하기</button>,
}));

describe('Login', () => {
  it('데스크톱 로그인 화면과 모바일 기기 안내를 함께 구성한다', () => {
    render(<Login />);

    expect(screen.getByRole('heading', { name: '시작하기' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '서비스 이용 안내' })).toBeInTheDocument();
  });
});
