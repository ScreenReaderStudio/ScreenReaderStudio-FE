import { ReactNode } from 'react';

import { useSelectContext } from '@/components/ui/Select/context';
import { cn } from '@/shared/lib/cn';

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

export default function SelectContent({ children, className }: SelectContentProps) {
  const { isOpen } = useSelectContext();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-expanded={isOpen}
      className={cn(
        'absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {children}
    </div>
  );
}
