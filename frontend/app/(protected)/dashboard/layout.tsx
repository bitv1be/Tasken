import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Личный аккаунт',
  description: 'Настройки и сведения личного аккаунта Tasken.',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
