import type { Metadata } from 'next';

import { LandingPage } from '@/app/components/landing/LandingPage';
import { getSiteUrl } from '@/app/lib/site';

const title = 'Личные задачи без лишнего шума';
const description =
  'Tasken помогает создавать, организовывать и выполнять личные задачи с безопасным хранением и поддержкой Markdown.';
const canonicalUrl = new URL('/', getSiteUrl()).toString();

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'Tasken',
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tasken',
    url: canonicalUrl,
    description,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
    inLanguage: 'ru',
    featureList: [
      'Создание и организация личных задач',
      'Редактирование и удаление задач',
      'Фильтрация активных и завершённых задач',
      'Описание задач с помощью Markdown',
      'Безопасное хранение через Laravel API',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            '\\u003c',
          ),
        }}
      />
      <LandingPage />
    </>
  );
}
