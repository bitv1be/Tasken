'use client';

import {
  useState,
  type SubmitEvent,
} from 'react';

import Link from 'next/link';

import { EmailVerificationNotice } from '@/app/components/auth/EmailVerificationNotice';
import { useAuth } from '@/app/context/AuthContext';

import {
  ApiError,
  type LaravelValidationErrors,
} from '@/app/lib/api';

export default function SignupPage() {
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState('');

  const [error, setError] = useState('');

  const [fieldErrors, setFieldErrors] =
    useState<LaravelValidationErrors>({});

  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] =
    useState('');

  async function handleSubmit(
    event: SubmitEvent,
  ): Promise<void> {
    event.preventDefault();

    setError('');
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setFieldErrors({
        password_confirmation: [
          'Пароли не совпадают.',
        ],
      });

      return;
    }

    setSubmitting(true);

    try {
      const response = await signup({
        email,
        password,
        password_confirmation: passwordConfirmation,
        device_name: navigator.userAgent.slice(0, 255),
      });

      setRegisteredEmail(response.user.email);
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

  if (registeredEmail) {
    return (
      <main className="page-center">
        <EmailVerificationNotice
          email={registeredEmail}
        />
      </main>
    );
  }

  return (
    <main className="page-center">
      <section className="auth-card">
        <header className="auth-header">
          <span className="eyebrow">
            Tasken
          </span>

          <h1>Регистрация</h1>

          <p>
            Создайте аккаунт для начала работы.
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
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              minLength={8}
              required
            />

            {fieldErrors.password?.[0] && (
              <small className="field-error">
                {fieldErrors.password[0]}
              </small>
            )}
          </label>

          <label className="field">
            <span>Повторите пароль</span>

            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => {
                setPasswordConfirmation(
                  event.target.value,
                );
              }}
              placeholder="Повторите пароль"
              autoComplete="new-password"
              minLength={8}
              required
            />

            {fieldErrors.password_confirmation?.[0] && (
              <small className="field-error">
                {
                  fieldErrors
                    .password_confirmation[0]
                }
              </small>
            )}
          </label>

          <button
            className="button primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Создание аккаунта...'
              : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт?{' '}
          <Link href="/login">
            Войти
          </Link>
        </p>
      </section>
    </main>
  );
}
