import { ReactNode } from 'react';

import { useTabsContext } from '@/components/ui/Tabs/context';
import { cn } from '@/shared/lib/cn';

interface TabsContentProps {
  children: ReactNode;
  className?: string;
  value: string;
}

export default function TabsContent({ children, className, value }: TabsContentProps) {
  const { selectedTab } = useTabsContext();

  if (selectedTab !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      {children}
    </div>
  );
}
