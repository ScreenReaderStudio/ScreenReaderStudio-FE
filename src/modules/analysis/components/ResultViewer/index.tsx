'use client';

import { useRef, useMemo, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

import AnalysisErrorState from './AnalysisErrorState';
import IssuesList from './IssuesList';
import Placeholder from './Placeholder';
import {
  createSafePreviewDocument,
  postHighlightMessage as postHighlightMessageToPreview,
  PREVIEW_SANDBOX,
} from './previewDocument';
import ScreenReaderScript from './ScreenReaderScript';
import { saveAnalysis } from '../../api/analysisApi';
import { useAnalysisStore } from '../../model/useAnalysisStore';

export default function ResultViewer({ showShareButton = true }: { showShareButton?: boolean }) {
  const {
    isLoading,
    error,
    analysisResult,
    pageContent,
    jobAccessToken,
    jobId,
    jobStage,
    elapsedSeconds,
    isCancelling,
    cancelAnalysis,
    retryAnalysis,
  } = useAnalysisStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const iframeSrc = useMemo(() => {
    if (!pageContent || typeof window === 'undefined') {
      return undefined;
    }

    const previewDocument = createSafePreviewDocument(pageContent, window.location.origin);
    const blob = new Blob([previewDocument], { type: 'text/html;charset=utf-8' });

    return URL.createObjectURL(blob);
  }, [pageContent]);

  useEffect(() => {
    return () => {
      if (iframeSrc) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  async function handleSaveResult() {
    if (!analysisResult || !jobId || !jobAccessToken) {
      showToast({
        message: '분석할 URL 또는 HTML 콘텐츠가 없습니다. 먼저 분석을 수행해주세요.',
        variant: 'alert',
      });

      return;
    }

    setIsSaving(true);
    setShareableLink('');
    setIsSaved(false);

    try {
      const { id } = await saveAnalysis({ jobId }, jobAccessToken);
      const link = `${window.location.origin}/analysis/${id}`;
      setShareableLink(link);
      setIsSaved(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      showToast({ message, variant: 'alert' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopyLink() {
    if (!shareableLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareableLink);
      showToast({ message: '공유 링크가 클립보드에 복사되었습니다.' });
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      showToast({
        message: '링크 복사에 실패했습니다. 브라우저 설정을 확인해주세요.',
        variant: 'alert',
      });
    }
  }

  function postHighlightMessage(selector: string) {
    postHighlightMessageToPreview(iframeRef.current?.contentWindow ?? null, selector);
  }

  function handleHighlightAndSpeak(selector: string, textToSpeak: string) {
    postHighlightMessage(selector);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    window.speechSynthesis.speak(utterance);
  }

  function handleHighlightOnly(selector: string) {
    postHighlightMessage(selector);
    window.speechSynthesis.cancel();
  }

  if (isLoading && !analysisResult) {
    const stageLabels = {
      queued: '분석 순서를 기다리고 있습니다.',
      launching_browser: '분석 브라우저를 준비하고 있습니다.',
      loading_page: '분석할 페이지를 불러오고 있습니다.',
      analyzing_accessibility: '접근성 문제와 예상 대본을 분석하고 있습니다.',
      preparing_result: '분석 결과를 정리하고 있습니다.',
    };
    const statusMessage = isCancelling
      ? '분석을 취소하고 있습니다.'
      : stageLabels[jobStage ?? 'queued'];

    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="relative flex h-[60vh] w-full animate-pulse gap-4"
      >
        <span className="sr-only">
          {statusMessage} 경과 시간 {elapsedSeconds}초
        </span>
        <div className="flex-1 rounded-md border border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800"></div>

        <div className="w-1/3 space-y-4 rounded-md border border-gray-300 bg-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex w-full gap-2">
            <div className="h-10 flex-1 rounded-md bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-10 flex-1 rounded-md bg-gray-300 dark:bg-gray-700"></div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="h-4 w-full rounded-md bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-5/6 rounded-md bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-full rounded-md bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-4/6 rounded-md bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-full rounded-md bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-3/4 rounded-md bg-gray-300 dark:bg-gray-700"></div>
          </div>
          <Button
            onClick={cancelAnalysis}
            disabled={isCancelling}
            variant="outline"
            className="relative z-10 bg-white dark:bg-gray-900"
          >
            {isCancelling ? '취소 중...' : '분석 취소'}
          </Button>
          <p className="relative z-10 text-sm text-gray-700 dark:text-gray-200">
            {statusMessage} ({elapsedSeconds}초)
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <AnalysisErrorState error={error} onRetry={retryAnalysis} />;
  }

  if (!analysisResult) {
    return <Placeholder />;
  }

  return (
    <div className="flex h-[60vh] w-full gap-4">
      <div className="flex-1 rounded-md border border-gray-300 p-0.5 dark:border-gray-700">
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            sandbox={PREVIEW_SANDBOX}
            referrerPolicy="no-referrer"
            title="분석 결과 화면"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-900 dark:text-gray-100">
            콘텐츠를 불러올 수 없습니다.
          </div>
        )}
      </div>

      <div className="w-1/3 overflow-y-auto rounded-md border border-gray-300 p-4 dark:border-gray-700 dark:bg-gray-900">
        {showShareButton && isLoggedIn && analysisResult && jobId && jobAccessToken && (
          <div className="mb-4 space-y-2">
            {!isSaved ? (
              <Button
                onClick={handleSaveResult}
                disabled={isSaving}
                className="w-full rounded-md px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {isSaving ? '생성 중...' : '공유 링크 생성'}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    aria-label="공유 링크"
                    value={shareableLink}
                    readOnly
                    className="flex-grow rounded-md border border-gray-300 bg-gray-100 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <Button onClick={handleCopyLink} className="w-20 rounded-md px-3 py-2 text-sm">
                    링크 복사
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        <Tabs defaultValue="script" className="w-full">
          <TabsList aria-label="분석 결과 유형" className="mb-2 grid w-full grid-cols-2">
            <TabsTrigger value="script">스크린 리더 대본</TabsTrigger>
            <TabsTrigger value="issues">접근성 이슈</TabsTrigger>
          </TabsList>

          <TabsContent value="script">
            <ScreenReaderScript onScriptItemClick={handleHighlightAndSpeak} />
          </TabsContent>
          <TabsContent value="issues">
            <IssuesList onNodeClick={handleHighlightOnly} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
