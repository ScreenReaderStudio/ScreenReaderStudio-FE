import Image from 'next/image';
import { ReactNode } from 'react';

import { useSelectContext } from '@/components/ui/Select/context';
import { cn } from '@/shared/lib/cn';

interface SelectItemProps {
  children: ReactNode;
  className?: string;
  value: string;
}

export default function SelectItem({ children, className, value }: SelectItemProps) {
  const { selectedValue, onValueChange } = useSelectContext();

  return (
    <button
      type="button"
      role="option"
      aria-selected={selectedValue === value}
      className={cn(
        'relative flex w-full cursor-default items-center rounded-sm border border-transparent py-1.5 pr-2 pl-2 text-sm outline-none select-none hover:border-black hover:bg-gray-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onValueChange(value);
      }}
    >
      {selectedValue === value ? (
        <Image
          src="/check.svg"
          alt="선택된 옵션 아이콘"
          width={16}
          height={16}
          priority
          className="mr-2"
        />
      ) : (
        <div className="mr-2 w-4" />
      )}
      {children}
    </button>
  );
}
