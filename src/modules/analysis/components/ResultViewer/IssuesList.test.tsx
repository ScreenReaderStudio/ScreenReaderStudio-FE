import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

import IssuesList from './IssuesList';

import type { AxeResults } from 'axe-core';

const analysisResult: AxeResults = {
  testEngine: { name: 'axe-core', version: '4.10.0' },
  testRunner: { name: 'axe' },
  testEnvironment: {
    userAgent: 'Vitest',
    windowWidth: 1280,
    windowHeight: 720,
  },
  timestamp: '2026-07-29T00:00:00.000Z',
  url: 'https://example.com',
  toolOptions: {},
  passes: [],
  incomplete: [],
  inapplicable: [],
  violations: [
    {
      id: 'image-alt',
      impact: 'critical',
      tags: ['cat.text-alternatives'],
      description: '이미지에 대체 텍스트가 있어야 합니다.',
      help: '이미지에 대체 텍스트가 없습니다.',
      helpUrl: 'https://dequeuniversity.com/rules/axe/image-alt',
      nodes: [
        {
          any: [],
          all: [],
          none: [],
          impact: 'critical',
          html: '<img src="example.png">',
          target: ['img'],
          failureSummary: 'alt 속성을 추가하세요.',
        },
      ],
    },
  ],
};

describe('IssuesList', () => {
  beforeEach(() => {
    useAnalysisStore.setState({
      analysisResult,
      isLoading: false,
      error: null,
    });
  });

  it('영향 요소를 키보드로 활성화할 수 있는 버튼으로 제공한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<IssuesList onNodeClick={handleClick} />);

    const nodeButton = screen.getByRole('button', {
      name: /영향 요소 1, 미리보기에서 강조/,
    });

    nodeButton.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledWith('img');
  });
});
