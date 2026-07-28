import { ReactNode } from 'react';

import { useTabsContext } from '@/components/ui/Tabs/context';
import { cn } from '@/shared/lib/cn';

interface TabsTriggerProps {
  children: ReactNode;
  className?: string;
  value: string;
}

export default function TabsTrigger({ children, className, value }: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = useTabsContext();
  const isActive = selectedTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap text-gray-700 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-gray-300',
        isActive ? 'bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100' : '',
        className
      )}
      onClick={() => setSelectedTab(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedTab(value);
        }
      }}
    >
      {children}
    </button>
  );
}
