import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Создание аккаунта',
  description:
    'Создайте аккаунт Tasken для безопасного хранения личных задач.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
