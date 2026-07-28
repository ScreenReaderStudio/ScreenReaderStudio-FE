'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import Button from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useTabsContext } from '@/components/ui/Tabs/context';
import TabsContextProvider from '@/modules/analysis/components/TabsContextProvider';
import { useAnalysisStore } from '@/modules/analysis/model/useAnalysisStore';
import { useInputStore } from '@/modules/analysis/model/useInputStore';
import { useToast } from '@/providers/ToastProvider';
import { validateAnalysisInput } from '@/shared/lib/validation';

const CodeEditor = dynamic(() => import('@/modules/analysis/components/CodeEditor'), {
  ssr: false,
});

function AccessibilityAnalyzerContent() {
  const { selectedTab } = useTabsContext();
  const code = useInputStore((state) => state.code);
  const url = useInputStore((state) => state.url);
  const setUrl = useInputStore((state) => state.setUrl);
  const { analyze, isLoading, selectedScreenReader, setSelectedScreenReader } = useAnalysisStore();
  const { showToast } = useToast();

  async function handleAnalysisClick() {
    const input = selectedTab === 'code' ? { htmlContent: code } : { url: url.trim() };
    const validation = validateAnalysisInput(input);

    if (!validation.isValid) {
      showToast({ message: validation.error ?? '분석 대상을 확인해주세요.' });
      return;
    }

    await analyze(input);
  }

  return (
    <>
      <div className="mb-3 flex gap-2">
        <Select
          defaultValue={selectedScreenReader}
          onValueChange={(value) => setSelectedScreenReader(value as 'voiceover' | 'nvda')}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="VoiceOver (macOS/iOS)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="voiceover">VoiceOver (macOS/iOS)</SelectItem>
            <SelectItem value="nvda">NVDA (Windows)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="h-10 w-full bg-black text-white"
          onClick={handleAnalysisClick}
          disabled={isLoading}
        >
          {isLoading ? '분석 중...' : '분석'}
        </Button>
      </div>
      <TabsList className="mb-3 grid w-full grid-cols-2">
        <TabsTrigger value="url">
          <Image
            src="/globe.svg"
            alt="URL 아이콘"
            width={16}
            height={16}
            priority
            className="mr-2"
          />
          URL
        </TabsTrigger>
        <TabsTrigger value="code">
          <Image
            src="/code.svg"
            alt="코드 아이콘"
            width={16}
            height={16}
            priority
            className="mr-2"
          />
          코드
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url">
        <input
          aria-label="분석할 웹페이지 URL"
          className="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mb-3 flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
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
    </>
  );
}

export default function AccessibilityAnalyzer() {
  return (
    <TabsContextProvider className="w-full" defaultValue="url">
      <AccessibilityAnalyzerContent />
    </TabsContextProvider>
  );
}
