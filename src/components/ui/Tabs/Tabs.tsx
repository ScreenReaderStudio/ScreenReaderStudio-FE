'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib/cn';

type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

const Tabs = forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} orientation={orientation} className={cn(className)} {...props} />
  )
);

Tabs.displayName = TabsPrimitive.Root.displayName;

export default Tabs;
