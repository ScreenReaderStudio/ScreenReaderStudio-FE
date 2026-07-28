'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import { logoutUser } from '@/modules/auth/api/authApi';
import { useAuth } from '@/modules/auth/AuthProvider';
import { ApiError } from '@/shared/api/client';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
      logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('로그아웃 실패');
      } else {
        console.error('로그아웃 요청 중 에러 발생:', error);
      }
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100"
        >
          Screen Reader Studio
        </Link>
        {isLoggedIn ? (
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex w-20 items-center tracking-tight"
          >
            로그아웃
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/login')}
            variant="ghost"
            className="flex w-20 items-center tracking-tight"
          >
            로그인
          </Button>
        )}
      </div>
    </header>
  );
}
