'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib/cn';

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

const TabsTrigger = forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap text-gray-700 transition-all focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:text-gray-300 dark:focus-visible:ring-gray-100 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100',
        className
      )}
      {...props}
    />
  )
);

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export default TabsTrigger;
