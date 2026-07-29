import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import Button from '@/components/ui/Button';

describe('Button', () => {
  it('표준 HTML 속성과 ref를 실제 버튼에 전달한다', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <Button ref={ref} name="analyze" aria-describedby="analyze-help">
        분석
      </Button>
    );

    const button = screen.getByRole('button', { name: '분석' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('name', 'analyze');
    expect(button).toHaveAttribute('aria-describedby', 'analyze-help');
    expect(ref.current).toBe(button);
  });

  it('asChild 사용 시 링크의 의미를 유지한다', () => {
    render(
      <Button asChild>
        <a href="/login">로그인</a>
      </Button>
    );

    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
  });
});
