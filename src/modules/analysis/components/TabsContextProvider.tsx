import { Tabs } from '@/components/ui/Tabs';

import type { ReactNode } from 'react';

interface TabsContextProviderProps {
  className?: string;
  children: ReactNode;
  defaultValue: string;
}

export default function TabsContextProvider({
  children,
  defaultValue = 'code',
  className,
}: TabsContextProviderProps) {
  return (
    <Tabs defaultValue={defaultValue} className={className}>
      {children}
    </Tabs>
  );
}
