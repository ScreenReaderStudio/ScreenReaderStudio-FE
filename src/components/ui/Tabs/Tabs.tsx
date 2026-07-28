import { ReactNode } from 'react';

import { TabsProvider } from '@/components/ui/Tabs/context';
import { cn } from '@/shared/lib/cn';

interface TabsProps {
  children: ReactNode;
  className?: string;
  defaultValue: string;
}

export default function Tabs({ children, className, defaultValue }: TabsProps) {
  return (
    <TabsProvider defaultValue={defaultValue}>
      <div dir="ltr" className={cn(className)}>
        {children}
      </div>
    </TabsProvider>
  );
}
