'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ApiError, authApi } from '@/app/lib/api';

interface EmailVerificationNoticeProps {
  email: string;
  onBack?: () => void;
}

export function EmailVerificationNotice({
  email,
  onBack,
}: EmailVerificationNoticeProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  async function resendVerification(): Promise<void> {
    setMessage('');
    setError('');
    setResending(true);

    try {
      await authApi.resendVerification(email);

      setMessage(
        'Новое письмо отправлено. Проверьте также папку «Спам».',
      );
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError('Не удалось подключиться к серверу.');
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="auth-card">
      <header className="auth-header">
        <span className="eyebrow">
          Tasken
        </span>

        <h1>Подтвердите email</h1>

        <p>
          Мы отправили ссылку для подтверждения на{' '}
          <strong className="verification-email">
            {email}
          </strong>
          . Перейдите по ней, а затем войдите в аккаунт.
        </p>
      </header>

      {message && (
        <div className="alert success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      <div className="auth-form">
        <button
          className="button primary"
          type="button"
          disabled={resending}
          onClick={() => {
            void resendVerification();
          }}
        >
          {resending
            ? 'Отправка...'
            : 'Отправить письмо ещё раз'}
        </button>

        {onBack ? (
          <button
            className="button secondary"
            type="button"
            onClick={onBack}
          >
            Вернуться ко входу
          </button>
        ) : (
          <Link className="button secondary" href="/login">
            Перейти ко входу
          </Link>
        )}
      </div>
    </section>
  );
}
