'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib/cn';

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

const TabsList = forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-800',
        className
      )}
      {...props}
    />
  )
);

TabsList.displayName = TabsPrimitive.List.displayName;

export default TabsList;
