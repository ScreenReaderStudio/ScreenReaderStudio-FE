import { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export default function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'flex items-center gap-2 text-2xl leading-none font-semibold tracking-tight text-gray-900 dark:text-gray-100',
        className
      )}
    >
      {children}
    </h3>
  );
}
