import Image from 'next/image';

import MobileLanding from '@/components/landing/MobileLanding';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import AccessibilityAnalyzer from '@/modules/analysis/components/AccessibilityAnalyzer';
import ResultViewer from '@/modules/analysis/components/ResultViewer';

export default function Home() {
  return (
    <>
      <div className="md:hidden">
        <MobileLanding />
      </div>
      <div className="hidden md:block">
        <Header />
        <div className="p-6">
          <div className="mb-8">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
              접근성 분석기
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              웹페이지 URL이나 HTML 코드를 입력하여 스크린 리더가 어떻게 읽어주는지 확인하고 접근성
              문제를 개선하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  <Image src="/folded.svg" alt="" width={24} height={24} priority />
                  분석 대상 입력
                </CardTitle>
                <CardDescription className="my-3">
                  코드를 직접 입력하거나 웹페이지 URL을 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessibilityAnalyzer />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>
                  <Image src="/eye.svg" alt="" width={24} height={24} priority />
                  분석 결과
                </CardTitle>
                <CardDescription className="my-3">
                  스크린 리더 대본과 접근성 이슈를 확인하세요. 로그인한 사용자에 한하여 결과를
                  공유할 수 있는 기능이 제공됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResultViewer />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
