'use client';

import Script from 'next/script';

import Button from '@/components/ui/Button';

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js';

export default function KakaoLogin() {
  const kakaoJavaScriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  function handleLogin() {
    if (window.Kakao?.isInitialized()) {
      window.Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/kakao/callback`,
      });
    } else {
      console.error('Kakao SDK is not initialized');
    }
  }

  return (
    <>
      <Script
        src={KAKAO_SDK_URL}
        integrity="sha384-dok87au0gKqJdxs7msEdBPNnKSRT+/mhTVzq+qOhcL464zXwvcrpjeWvyj1kCdq6"
        crossOrigin="anonymous"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            try {
              window.Kakao.init(kakaoJavaScriptKey);
            } catch (error) {
              console.error('Failed to initialize Kakao SDK:', error);
            }
          }
        }}
      />
      <Button
        className="h-12 w-full border-0 bg-[#FEE500] text-base font-medium text-black shadow-sm hover:bg-[#FDD835]"
        onClick={handleLogin}
      >
        <div className="flex items-center gap-3">
          <svg
            aria-hidden="true"
            focusable="false"
            width="18"
            height="17"
            viewBox="0 0 18 17"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.99999 0.333374C13.7844 0.333374 17.6667 3.58671 17.6667 7.58337C17.6667 9.94171 16.4289 12.0417 14.4822 13.3334L13.1111 16.6667L9.33333 14.1667C9.22222 14.1667 9.11111 14.1667 8.99999 14.1667C4.21555 14.1667 0.333328 10.9134 0.333328 6.91671C0.333328 3.25004 4.21555 0.333374 8.99999 0.333374Z"
              fill="black"
            />
          </svg>
          카카오로 시작하기
        </div>
      </Button>
    </>
  );
}
