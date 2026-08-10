import localFont from 'next/font/local';

import { AuthProvider } from '@/modules/auth/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';

import type { Metadata } from 'next';
import './globals.css';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'Screen Reader Studio',
  description: '개발 단계에서 확인하기 어려운 접근성 문제를 개선해 보세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <body className={`${pretendard.className} min-h-dvh w-full`}>
        <AuthProvider>
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
