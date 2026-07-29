'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

import { loginWithKakao } from '@/modules/auth/api/authApi';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

function KakaoCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      const authorizationCode = code;

      async function sendCodeToBackend() {
        try {
          const { user } = await loginWithKakao(authorizationCode);
          login(user);
          router.replace('/');
        } catch (error) {
          console.error('카카오 로그인 처리 실패:', error);
          showToast({
            message: '로그인에 실패했습니다. 다시 시도해주세요.',
            variant: 'alert',
          });
          router.replace('/login');
        }
      }

      sendCodeToBackend();
    } else {
      showToast({ message: '비정상적인 접근입니다.', variant: 'alert' });
      router.replace('/login');
    }
  }, [searchParams, router, login, showToast]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>카카오 로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
}

export default function KakaoCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <p>카카오 로그인 준비 중...</p>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}
