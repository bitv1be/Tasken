import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Вход в аккаунт',
  description:
    'Войдите в Tasken, чтобы открыть сохранённые личные задачи.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
