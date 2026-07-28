import { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {children}
    </div>
  );
}
