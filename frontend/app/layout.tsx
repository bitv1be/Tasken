import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/app/context/AuthContext';
import { getSiteUrl } from '@/app/lib/site';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: 'Tasken',
  title: {
    default: 'Tasken',
    template: '%s | Tasken',
  },
  description:
    'Tasken — приложение для безопасного управления личными задачами.',
  category: 'productivity',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#18181b',
  colorScheme: 'light',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
