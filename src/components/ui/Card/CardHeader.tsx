import { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export default function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('flex flex-col space-y-1', className)}>{children}</div>;
}
