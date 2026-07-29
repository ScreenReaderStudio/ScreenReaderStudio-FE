import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

function TestTabs() {
  return (
    <Tabs defaultValue="first">
      <TabsList aria-label="테스트 탭">
        <TabsTrigger value="first">첫 번째</TabsTrigger>
        <TabsTrigger value="second">두 번째</TabsTrigger>
        <TabsTrigger value="third">세 번째</TabsTrigger>
      </TabsList>
      <TabsContent value="first">첫 번째 내용</TabsContent>
      <TabsContent value="second">두 번째 내용</TabsContent>
      <TabsContent value="third">세 번째 내용</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('탭과 패널을 접근성 속성으로 연결한다', () => {
    render(<TestTabs />);

    const firstTab = screen.getByRole('tab', { name: '첫 번째' });
    const firstPanel = screen.getByRole('tabpanel', { name: '첫 번째' });

    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    expect(firstTab).toHaveAttribute('aria-controls', firstPanel.id);
    expect(firstPanel).toHaveAttribute('aria-labelledby', firstTab.id);
  });

  it('방향키와 Home, End 키로 탭을 이동하고 활성화한다', async () => {
    const user = userEvent.setup();
    render(<TestTabs />);

    const firstTab = screen.getByRole('tab', { name: '첫 번째' });
    const secondTab = screen.getByRole('tab', { name: '두 번째' });
    const thirdTab = screen.getByRole('tab', { name: '세 번째' });

    act(() => firstTab.focus());
    await user.keyboard('{ArrowRight}');

    expect(secondTab).toHaveFocus();
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: '두 번째' })).toBeVisible();

    await user.keyboard('{End}');
    expect(thirdTab).toHaveFocus();
    expect(thirdTab).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Home}');
    expect(firstTab).toHaveFocus();
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });
});
