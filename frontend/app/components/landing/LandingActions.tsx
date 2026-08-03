'use client';

import Link from 'next/link';

import { useAuth } from '@/app/context/AuthContext';

interface LandingActionsProps {
  variant: 'hero' | 'cta';
}

export function LandingActions({
  variant,
}: LandingActionsProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return variant === 'hero' ? (
      <>
        <div
          className="landing-action-loading"
          role="status"
          aria-live="polite"
        >
          <span className="loader small" aria-hidden="true" />
          Готовим ваши действия...
        </div>

        <p className="landing-account-note">
          Проверяем состояние вашей сессии.
        </p>
      </>
    ) : (
      <div
        className="landing-action-loading"
        role="status"
        aria-live="polite"
      >
        <span className="loader small" aria-hidden="true" />
        Проверяем сессию...
      </div>
    );
  }

  if (variant === 'cta') {
    return (
      <div className="landing-cta-actions">
        {user ? (
          <>
            <Link
              href="/todos"
              className="button primary landing-button"
            >
              Открыть задачи
            </Link>

            <Link
              href="/dashboard"
              className="button secondary landing-button"
            >
              Мой аккаунт
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="button primary landing-button"
            >
              Создать аккаунт
            </Link>

            <Link
              href="/login"
              className="button secondary landing-button"
            >
              Уже есть аккаунт
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {user && (
        <p className="landing-welcome">
          С возвращением, {user.email}
        </p>
      )}

      <div className="landing-hero-actions">
        {user ? (
          <>
            <Link
              href="/todos"
              className="button primary landing-button"
            >
              Открыть мои задачи
            </Link>

            <Link
              href="/dashboard"
              className="button secondary landing-button"
            >
              Перейти в аккаунт
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="button primary landing-button"
            >
              Начать бесплатно
            </Link>

            <Link
              href="/login"
              className="button secondary landing-button"
            >
              Войти
            </Link>
          </>
        )}
      </div>

      <p className="landing-account-note">
        {user
          ? 'Ваши задачи уже готовы и доступны только вам.'
          : 'Создайте аккаунт, чтобы сохранять задачи и открывать их с любого нового сеанса.'}
      </p>
    </>
  );
}
