import Link from 'next/link';

import { FeatureCard } from './FeatureCard';
import { LandingActions } from './LandingActions';
import { LandingHeader } from './LandingHeader';

const features = [
  {
    number: '01',
    title: 'Создавайте и организуйте',
    description:
      'Фиксируйте личные задачи с понятным названием и подробным описанием.',
  },
  {
    number: '02',
    title: 'Редактируйте без ограничений',
    description:
      'Обновляйте содержание задачи или удаляйте то, что больше не актуально.',
  },
  {
    number: '03',
    title: 'Следите за прогрессом',
    description:
      'Отмечайте задачи выполненными и возвращайте их в активную работу.',
  },
  {
    number: '04',
    title: 'Фильтруйте список',
    description:
      'Переключайтесь между всеми, активными и завершёнными задачами.',
  },
  {
    number: '05',
    title: 'Пишите в Markdown',
    description:
      'Добавляйте списки, ссылки, акценты и блоки кода с безопасным просмотром.',
  },
  {
    number: '06',
    title: 'Оставайтесь синхронизированы',
    description:
      'Изменения сохраняются через Laravel API и остаются доступны после входа.',
  },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />

      <main>
        <section
          className="landing-hero"
          aria-labelledby="landing-title"
        >
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-kicker">
                Личное пространство для задач
              </span>

              <h1 id="landing-title">
                Порядок в задачах.
                <span> Спокойствие в голове.</span>
              </h1>

              <p className="landing-hero-description">
                Tasken помогает создавать, организовывать,
                редактировать и выполнять личные задачи в одном
                понятном пространстве.
              </p>

              <LandingActions variant="hero" />
            </div>

            <div
              className="landing-preview"
              aria-label="Пример списка задач Tasken"
            >
              <div className="landing-preview-header">
                <div>
                  <span>Сегодня</span>
                  <strong>Мои задачи</strong>
                </div>

                <span className="landing-preview-count">3</span>
              </div>

              <div className="landing-preview-list">
                <div className="landing-preview-task completed">
                  <span aria-hidden="true">✓</span>
                  <div>
                    <strong>Составить план недели</strong>
                    <small>Выполнено</small>
                  </div>
                </div>

                <div className="landing-preview-task">
                  <span aria-hidden="true" />
                  <div>
                    <strong>Подготовить заметки</strong>
                    <small>Описание в Markdown</small>
                  </div>
                </div>

                <div className="landing-preview-task">
                  <span aria-hidden="true" />
                  <div>
                    <strong>Проверить новые задачи</strong>
                    <small>Активно</small>
                  </div>
                </div>
              </div>

              <div className="landing-preview-footer">
                <span aria-hidden="true">◆</span>
                Синхронизировано с Laravel API
              </div>
            </div>
          </div>
        </section>

        <section
          className="landing-features"
          aria-labelledby="features-title"
        >
          <div className="landing-container">
            <header className="landing-section-heading">
              <span className="eyebrow">Всё необходимое</span>
              <h2 id="features-title">
                От идеи до выполненной задачи
              </h2>
              <p>
                Короткий и предсказуемый рабочий процесс без
                перегруженных экранов.
              </p>
            </header>

            <div className="landing-feature-grid">
              {features.map((feature) => (
                <FeatureCard key={feature.number} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-security-section"
          aria-labelledby="security-title"
        >
          <div className="landing-container landing-security-card">
            <div className="landing-security-mark" aria-hidden="true">
              ✓
            </div>

            <div>
              <span className="eyebrow">Личное остаётся личным</span>
              <h2 id="security-title">
                Задачи доступны только их владельцу
              </h2>
              <p>
                Данные постоянно хранятся в базе, а Laravel API
                проверяет авторизацию для просмотра и каждого
                изменения. Другие пользователи не получают доступа
                к вашему списку.
              </p>
            </div>
          </div>
        </section>

        <section
          className="landing-cta-section"
          aria-labelledby="cta-title"
        >
          <div className="landing-container landing-cta-card">
            <div>
              <span className="eyebrow">
                Начните с одной задачи
              </span>
              <h2 id="cta-title">
                Освободите место для важного
              </h2>
              <p>
                Добавьте первую задачу сейчас — Tasken сохранит её
                и поможет довести до результата.
              </p>
            </div>

            <LandingActions variant="cta" />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <Link href="/" className="landing-brand">
            <span className="landing-brand-mark" aria-hidden="true">
              T
            </span>
            <span>Tasken</span>
          </Link>

          <p>Личные задачи. Безопасно и понятно.</p>
        </div>
      </footer>
    </div>
  );
}
