'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/app/context/AuthContext';

type LogoutAction =
  | 'current'
  | 'all'
  | null;

export default function DashboardPage() {
  const {
    user,
    logout,
    logoutAll,
  } = useAuth();

  const [logoutAction, setLogoutAction] =
    useState<LogoutAction>(null);

  if (!user) {
    return null;
  }

  async function handleLogout(): Promise<void> {
    setLogoutAction('current');

    try {
      await logout();
    } finally {
      setLogoutAction(null);
    }
  }

  async function handleLogoutAll(): Promise<void> {
    setLogoutAction('all');

    try {
      await logoutAll();
    } finally {
      setLogoutAction(null);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">
            Tasken
          </span>

          <h1>Панель управления</h1>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={handleLogout}
          disabled={logoutAction !== null}
        >
          {logoutAction === 'current'
            ? 'Выход...'
            : 'Выйти'}
        </button>
      </header>

      <section className="dashboard-grid">
        <article className="panel profile-panel">
          <div className="avatar">
            {user.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="muted">
              Вы авторизованы как
            </span>

            <h2>{user.email}</h2>
          </div>
        </article>

        <article className="panel todo-dashboard-panel">
          <div>
            <span className="eyebrow">
              Личные задачи
            </span>

            <h2>Список задач</h2>

            <p>
              Создавайте, редактируйте и отмечайте
              выполненные задачи на отдельной странице.
            </p>
          </div>

          <Link
            href="/todos"
            className="button primary"
          >
            Управлять задачами
          </Link>
        </article>

        <article className="panel">
          <h2>Данные аккаунта</h2>

          <dl className="details-list">
            <div>
              <dt>ID</dt>
              <dd>{user.id}</dd>
            </div>

            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div>
              <dt>Дата регистрации</dt>

              <dd>
                {new Date(
                  user.created_at,
                ).toLocaleString('ru-RU')}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel danger-panel">
          <div>
            <h2>Завершить все сессии</h2>

            <p>
              Все API-токены пользователя будут
              удалены.
            </p>
          </div>

          <button
            type="button"
            className="button danger"
            onClick={handleLogoutAll}
            disabled={logoutAction !== null}
          >
            {logoutAction === 'all'
              ? 'Завершение...'
              : 'Выйти со всех устройств'}
          </button>
        </article>
      </section>
    </main>
  );
}
