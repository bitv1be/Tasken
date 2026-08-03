'use client';

import {
  useState,
  type SubmitEvent
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/context/AuthContext';

import {
  ApiError,
  type LaravelValidationErrors,
} from '@/app/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] =
    useState<LaravelValidationErrors>({});

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: SubmitEvent,
  ): Promise<void> {
    event.preventDefault();

    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login({
        email,
        password,
        device_name: navigator.userAgent.slice(0, 255),
      });

      router.replace('/dashboard');
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
        setFieldErrors(caughtError.errors);
      } else {
        setError('Не удалось подключиться к серверу.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-center">
      <section className="auth-card">
        <header className="auth-header">
          <span className="eyebrow">
            Tasken
          </span>

          <h1>Вход</h1>

          <p>
            Войдите в свой аккаунт, чтобы продолжить.
          </p>
        </header>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label className="field">
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              placeholder="user@example.com"
              autoComplete="email"
              required
            />

            {fieldErrors.email?.[0] && (
              <small className="field-error">
                {fieldErrors.email[0]}
              </small>
            )}
          </label>

          <label className="field">
            <span>Пароль</span>

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />

            {fieldErrors.password?.[0] && (
              <small className="field-error">
                {fieldErrors.password[0]}
              </small>
            )}
          </label>

          <button
            className="button primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Выполняется вход...'
              : 'Войти'}
          </button>
        </form>

        <p className="auth-footer">
          Нет аккаунта?{' '}
          <Link href="/signup">
            Зарегистрироваться
          </Link>
        </p>
      </section>
    </main>
  );
}
