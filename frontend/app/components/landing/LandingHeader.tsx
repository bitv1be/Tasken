'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';

import { useAuth } from '@/app/context/AuthContext';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function LandingHeader() {
  const { user, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const firstFocusable = mobileDialogRef.current
      ?.querySelector<HTMLElement>(focusableSelector);

    document.body.style.overflow = 'hidden';
    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab' || !mobileDialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        mobileDialogRef.current.querySelectorAll<HTMLElement>(
          focusableSelector,
        ),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);

    try {
      await logout();
      closeMenu();
    } finally {
      setLoggingOut(false);
    }
  }

  const navigationContent = loading ? (
    <div
      className="landing-auth-loading"
      role="status"
      aria-live="polite"
    >
      <span className="loader small" aria-hidden="true" />
      Проверяем сессию
    </div>
  ) : user ? (
    <>
      <Link
        href="/todos"
        className="button secondary compact"
        onClick={closeMenu}
      >
        Мои задачи
      </Link>

      <Link
        href="/dashboard"
        className="button secondary compact"
        onClick={closeMenu}
      >
        Аккаунт
      </Link>

      <button
        type="button"
        className="button primary compact"
        onClick={() => {
          void handleLogout();
        }}
        disabled={loggingOut}
      >
        {loggingOut ? 'Выход...' : 'Выйти'}
      </button>
    </>
  ) : (
    <>
      <Link
        href="/login"
        className="button secondary compact"
        onClick={closeMenu}
      >
        Войти
      </Link>

      <Link
        href="/signup"
        className="button primary compact"
        onClick={closeMenu}
      >
        Создать аккаунт
      </Link>
    </>
  );

  return (
    <header className="landing-site-header">
      <div className="landing-container landing-nav-shell">
        <Link
          href="/"
          className="landing-brand"
          aria-current="page"
        >
          <span className="landing-brand-mark" aria-hidden="true">
            T
          </span>
          <span>Tasken</span>
        </Link>

        <nav
          className="landing-nav-actions landing-desktop-nav"
          aria-label="Основная навигация"
        >
          {navigationContent}
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="landing-mobile-toggle"
          aria-label={
            menuOpen ? 'Закрыть меню' : 'Открыть меню'
          }
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => {
            setMenuOpen((currentState) => !currentState);
          }}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="landing-mobile-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMenu();
              menuButtonRef.current?.focus();
            }
          }}
        >
          <div
            ref={mobileDialogRef}
            id="landing-mobile-menu"
            className="landing-mobile-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Мобильная навигация"
          >
            <div className="landing-mobile-dialog-header">
              <span>Навигация</span>

              <button
                type="button"
                className="landing-mobile-close"
                aria-label="Закрыть меню"
                onClick={() => {
                  closeMenu();
                  menuButtonRef.current?.focus();
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <nav
              className="landing-mobile-nav"
              aria-label="Мобильная навигация"
            >
              {navigationContent}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
