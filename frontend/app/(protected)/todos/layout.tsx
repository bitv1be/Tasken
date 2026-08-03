import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Мои задачи',
  description:
    'Личный список активных и завершённых задач пользователя Tasken.',
};

export default function TodosLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
