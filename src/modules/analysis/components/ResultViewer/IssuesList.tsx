'use client';

import { useMemo } from 'react';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

const impactStyles: { [key: string]: { container: string; badge: string; title: string } } = {
  critical: {
    container: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
    badge:
      'bg-red-100 text-red-800 border-transparent hover:bg-red-200/60 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900/70',
    title: 'text-red-900 dark:text-red-200',
  },
  serious: {
    container: 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30',
    badge:
      'bg-orange-100 text-orange-800 border-transparent hover:bg-orange-200/60 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-900/70',
    title: 'text-orange-900 dark:text-orange-200',
  },
  moderate: {
    container: 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30',
    badge:
      'bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-200/60 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900/70',
    title: 'text-yellow-900 dark:text-yellow-200',
  },
  minor: {
    container: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
    badge:
      'bg-gray-100 text-gray-800 border-transparent hover:bg-gray-200/60 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    title: 'text-gray-900 dark:text-gray-100',
  },
};

export default function IssuesList({ onNodeClick }: { onNodeClick: (selector: string) => void }) {
  const { analysisResult, isLoading, error } = useAnalysisStore();
  const sortedViolations = useMemo(() => {
    if (!analysisResult?.violations) {
      return [];
    }

    const impactOrder: { [key: string]: number } = {
      critical: 0,
      serious: 1,
      moderate: 2,
      minor: 3,
    };

    return analysisResult.violations.slice().sort((a, b) => {
      const impactA = a.impact ? impactOrder[a.impact] : 99;
      const impactB = b.impact ? impactOrder[b.impact] : 99;
      return impactA - impactB;
    });
  }, [analysisResult]);

  if (isLoading) {
    return <p>접근성 이슈를 분석 중입니다...</p>;
  }
  if (error) {
    return <p className="text-red-600 dark:text-red-400">오류: {error.message}</p>;
  }
  if (!analysisResult || sortedViolations.length === 0) {
    return <p className="text-gray-900 dark:text-gray-100">발견된 접근성 이슈가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        총 {sortedViolations.length}개의 위반 사항 발견
      </p>
      <ul className="space-y-3">
        {sortedViolations.map((violation) => {
          const styles = impactStyles[violation.impact || 'minor'] || impactStyles.minor;

          return (
            <li
              key={violation.id}
              className={`rounded-md border p-4 shadow-sm ${styles.container}`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className={`font-semibold ${styles.title}`}>{violation.help}</p>
                <div className={`shrink-0 rounded px-2 py-1 text-xs capitalize ${styles.badge}`}>
                  {violation.impact}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {violation.description}
              </p>
              <a
                href={violation.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-blue-500 hover:underline dark:text-blue-400"
              >
                자세히 보기
              </a>
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  영향 요소:
                </h4>
                {violation.nodes.map((node, nodeIndex) => {
                  const target = node.target;
                  const selector = Array.isArray(target) ? target[0] : target;

                  if (typeof selector !== 'string') {
                    return (
                      <div
                        key={nodeIndex}
                        className="rounded bg-gray-50 p-2 font-mono text-xs break-all dark:bg-gray-800 dark:text-gray-200"
                      >
                        <code>{node.html}</code>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={nodeIndex}
                      className="cursor-pointer rounded bg-gray-50 p-2 font-mono text-xs break-all transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => onNodeClick(selector)}
                    >
                      <code>{node.html}</code>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
