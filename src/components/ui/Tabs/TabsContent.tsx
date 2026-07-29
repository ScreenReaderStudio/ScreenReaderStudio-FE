'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib/cn';

type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

const TabsContent = forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'mt-2 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-gray-100',
        className
      )}
      {...props}
    />
  )
);

TabsContent.displayName = TabsPrimitive.Content.displayName;

export default TabsContent;
