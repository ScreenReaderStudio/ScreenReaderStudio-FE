'use client';

import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

export default function ScreenReaderScript({
  onScriptItemClick,
}: {
  onScriptItemClick: (selector: string, text: string) => void;
}) {
  const { screenReaderScript, isLoading, error } = useAnalysisStore();

  if (isLoading) {
    return <p>스크린 리더 대본을 생성 중입니다...</p>;
  }
  if (error) {
    return <p className="text-red-600 dark:text-red-400">오류: {error.message}</p>;
  }
  if (!screenReaderScript || screenReaderScript.length === 0) {
    return <p className="text-gray-900 dark:text-gray-100">생성된 대본이 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        총 {screenReaderScript.length}개의 탐색 항목 발견
      </p>
      <ul className="space-y-1 font-mono text-sm">
        {screenReaderScript.map((item, index) => (
          <li
            key={index}
            onClick={() => onScriptItemClick(item.selector, item.text)}
            className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <span className="mt-[0.5] text-xs text-gray-400 dark:text-gray-500">{index + 1}.</span>
            <span className="text-gray-900 dark:text-gray-100">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
