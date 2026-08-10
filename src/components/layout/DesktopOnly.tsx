import UnsupportedDevice from '@/components/layout/UnsupportedDevice';

import type { ReactNode } from 'react';

interface DesktopOnlyProps {
  children: ReactNode;
}

export default function DesktopOnly({ children }: DesktopOnlyProps) {
  return (
    <>
      <div className="hidden md:block">{children}</div>
      <div className="md:hidden">
        <UnsupportedDevice />
      </div>
    </>
  );
}
