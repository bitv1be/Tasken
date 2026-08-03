'use client';

import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/context/AuthContext';
import { FullScreenLoader } from './FullScreenLoader';

export function GuestOnly({
  children,
}: PropsWithChildren) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <FullScreenLoader />;
  }

  return children;
}
