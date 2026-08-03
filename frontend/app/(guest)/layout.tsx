import type { ReactNode } from 'react';

import { GuestOnly } from '@/app/components/auth/GuestOnly';

interface GuestLayoutProps {
  children: ReactNode;
}

export default function GuestLayout({
  children,
}: GuestLayoutProps) {
  return (
    <GuestOnly>
      {children}
    </GuestOnly>
  );
}
