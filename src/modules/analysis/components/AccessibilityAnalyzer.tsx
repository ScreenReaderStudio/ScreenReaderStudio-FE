'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';
import { useInputStore } from '@/modules/analysis/model/useInputStore';
import { useToast } from '@/providers/ToastProvider';
import { validateAnalysisInput } from '@/shared/lib/validation';

const CodeEditor = dynamic(() => import('@/modules/analysis/components/CodeEditor'), {
  ssr: false,
});

function AccessibilityAnalyzerContent() {
  const [selectedTab, setSelectedTab] = useState('url');
  const code = useInputStore((state) => state.code);
  const url = useInputStore((state) => state.url);
  const setUrl = useInputStore((state) => state.setUrl);
  const { analyze, isLoading, resumeAnalysis, selectedScreenReader, setSelectedScreenReader } =
    useAnalysisStore();
  const { showToast } = useToast();

  useEffect(() => {
    void resumeAnalysis();
  }, [resumeAnalysis]);

  async function handleAnalysisClick() {
    const input = selectedTab === 'code' ? { htmlContent: code } : { url: url.trim() };
    const validation = validateAnalysisInput(input);

    if (!validation.isValid) {
      showToast({
        message: validation.error ?? '분석 대상을 확인해주세요.',
        variant: 'alert',
      });
      return;
    }

    await analyze(input);
  }

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <div className="mb-3 flex gap-2">
        <div className="w-60">
          <label htmlFor="screen-reader" className="sr-only">
            대본을 생성할 스크린 리더
          </label>
          <select
            id="screen-reader"
            value={selectedScreenReader}
            onChange={(event) =>
              setSelectedScreenReader(event.target.value as 'voiceover' | 'nvda')
            }
            className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus-visible:ring-gray-100"
          >
            <option value="voiceover">VoiceOver (macOS/iOS)</option>
            <option value="nvda">NVDA (Windows)</option>
          </select>
        </div>
        <Button
          className="h-10 w-full bg-black text-white"
          onClick={handleAnalysisClick}
          disabled={isLoading}
        >
          {isLoading ? '분석 중...' : '분석'}
        </Button>
      </div>
      <TabsList aria-label="분석 대상 입력 방식" className="mb-3 grid w-full grid-cols-2">
        <TabsTrigger value="url">
          <Image src="/globe.svg" alt="" width={16} height={16} priority className="mr-2" />
          URL
        </TabsTrigger>
        <TabsTrigger value="code">
          <Image src="/code.svg" alt="" width={16} height={16} priority className="mr-2" />
          코드
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url">
        <input
          aria-label="분석할 웹페이지 URL"
          className="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground mb-3 flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-gray-100"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="rounded-md bg-blue-100 p-4 font-medium text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
          <div className="flex items-start gap-3">
            <div>
              <p className="mb-1 font-medium">URL 분석 안내</p>
              <ul className="space-y-1 text-xs">
                <li>• 분석에는 다소 시간이 소요될 수 있습니다 (최대 2분 내외)</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="code">
        <CodeEditor />
      </TabsContent>
    </Tabs>
  );
}

export default function AccessibilityAnalyzer() {
  return <AccessibilityAnalyzerContent />;
}
