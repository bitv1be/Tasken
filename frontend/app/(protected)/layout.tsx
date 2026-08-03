import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ProtectedOnly } from '@/app/components/auth/ProtectedOnly';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <ProtectedOnly>
      {children}
    </ProtectedOnly>
  );
}
