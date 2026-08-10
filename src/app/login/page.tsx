import Image from 'next/image';
import Link from 'next/link';

import DesktopOnly from '@/components/layout/DesktopOnly';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Separator from '@/components/ui/Separator';
import KakaoLogin from '@/modules/auth/components/KakaoLogin';

export default function Login() {
  return (
    <DesktopOnly>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100"
          >
            <Image src="/arrow-left.svg" alt="" width={16} height={16} priority />
            돌아가기
          </Link>
        </div>

        <Card className="h-1/5 w-1/4 border-0 shadow-lg">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="w-full justify-center text-xl">시작하기</CardTitle>
            <CardDescription>
              카카오 계정으로 간편하게 로그인하고
              <br />
              분석 결과를 저장하고 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <KakaoLogin />
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  또는
                </span>
              </div>
            </div>
            <Button variant="outline" className="h-12 w-full" asChild>
              <Link href="/">
                게스트로 계속하기
                <span className="text-xs text-gray-500 dark:text-gray-400">(결과 저장 불가)</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DesktopOnly>
  );
}
