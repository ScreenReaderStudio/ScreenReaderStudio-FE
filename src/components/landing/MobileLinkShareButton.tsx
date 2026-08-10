'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button';

type ShareStatus = 'idle' | 'success' | 'error';

const SHARE_TITLE = 'Screen Reader Studio';
const SHARE_TEXT = '웹 접근성 분석을 태블릿 또는 PC에서 시작해 보세요.';

function isShareCancelled(error: unknown) {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

export default function MobileLinkShareButton() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<ShareStatus>('idle');

  async function copyShareUrl(shareUrl: string) {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API is unavailable.');
    }

    await navigator.clipboard.writeText(shareUrl);
    setStatus('success');
    setMessage('링크를 복사했어요. 태블릿이나 PC로 보내서 열어주세요.');
  }

  async function handleShare() {
    const shareUrl = new URL('/', window.location.href).toString();

    setMessage('');
    setStatus('idle');

    if (navigator.share) {
      try {
        await navigator.share({
          title: SHARE_TITLE,
          text: SHARE_TEXT,
          url: shareUrl,
        });
        setStatus('success');
        setMessage('링크를 공유했어요.');
        return;
      } catch (error) {
        if (isShareCancelled(error)) {
          return;
        }
      }
    }

    try {
      await copyShareUrl(shareUrl);
    } catch {
      setStatus('error');
      setMessage('링크를 보내지 못했어요. 브라우저 주소창에서 주소를 복사해 주세요.');
    }
  }

  return (
    <div>
      <Button onClick={handleShare} className="h-12 rounded-xl text-base">
        PC에서 사용할 링크 보내기
      </Button>
      <p
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm break-keep ${
          status === 'error' ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
