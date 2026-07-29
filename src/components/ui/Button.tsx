import { Slot } from 'radix-ui';
import { forwardRef } from 'react';

import { cn } from '@/shared/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  asChild?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'hover:bg-gray-700 bg-gray-800 text-white dark:hover:bg-gray-600 dark:bg-gray-700',
  secondary:
    'hover:bg-gray-50 bg-gray-100 text-gray-800 dark:hover:bg-gray-700 dark:bg-gray-800 dark:text-gray-100',
  outline:
    'hover:bg-gray-100 bg-white text-gray-800 border border-gray-200 dark:hover:bg-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700',
  ghost: 'hover:bg-gray-100 bg-transparent text-gray-800 dark:hover:bg-gray-800 dark:text-gray-100',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, type, variant = 'default', ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(
          'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-gray-100',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
