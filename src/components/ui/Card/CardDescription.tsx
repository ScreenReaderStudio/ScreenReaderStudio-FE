import { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export default function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('my-2 text-sm text-gray-600 dark:text-gray-400', className)}>{children}</p>
  );
}
