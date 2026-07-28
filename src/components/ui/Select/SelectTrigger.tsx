import Image from 'next/image';
import { ReactNode } from 'react';

import { useSelectContext } from '@/components/ui/Select/context';
import { cn } from '@/shared/lib/cn';

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
}

export default function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = useSelectContext();

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <Image
        src="/chevron-down.svg"
        alt="스크린 리더 선택 드롭다운 확장 아이콘"
        width={16}
        height={16}
        className="mr-2"
      />
    </button>
  );
}
