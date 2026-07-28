'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Header from '@/components/layout/Header';
import { getSharedAnalysis } from '@/modules/analysis/api/analysisApi';
import ResultViewer from '@/modules/analysis/components/ResultViewer';
import { screenReader } from '@/modules/analysis/constants';
import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';

export default function SharedAnalysisPage() {
  const { id } = useParams();
  const { analysisResult, setAnalysisData, selectedScreenReader } = useAnalysisStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    async function fetchAnalysis() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getSharedAnalysis(String(id), signal);
        setAnalysisData({
          analysisResult: data.accessibilityAnalysis,
          screenReaderScript: data.screenReaderScript,
          pageContent: data.pageContent,
          selectedScreenReader: data.selectedScreenReader,
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();

    return () => {
      controller.abort();
    };
  }, [id, setAnalysisData]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-900 dark:text-gray-100">
        결과를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 dark:text-red-400">
        오류: {error}
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          접근성 분석 리포트
        </h1>
        <p className="mb-3 text-gray-600 dark:text-gray-400">
          {analysisResult?.url}의 접근성 분석 결과입니다. 스크린 리더 대본을 생성할 때{' '}
          {screenReader[selectedScreenReader]}를 기준으로 생성되었습니다.
        </p>
        <ResultViewer showShareButton={false} />
      </div>
    </>
  );
}
