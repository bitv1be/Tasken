# Repository Guidelines

## Project Structure & Module Organization

Tasken is split into two applications. `backend/` contains the Laravel 13 API: application code lives in `app/`, routes in `routes/`, migrations and factories in `database/`, and Pest tests in `tests/Unit` and `tests/Feature`. `frontend/` is a Next.js 16 application; App Router pages, components, context, and API helpers live under `frontend/app/`, while static assets belong in `frontend/public/`. Root Compose files orchestrate both apps with PostgreSQL and the Nginx configuration in `infrastructure/nginx/`. Follow the more specific `backend/AGENTS.md` and `frontend/AGENTS.md` when editing those trees.

## Build, Test, and Development Commands

- `docker compose -f compose.dev.yml up --build` builds and runs the complete development stack.
- `cd backend && composer install && bun install` installs backend dependencies.
- `cd backend && composer run dev` starts Laravel, its queue worker, logs, and Vite.
- `cd backend && composer test` clears cached configuration and runs the Pest suite.
- `cd frontend && bun install --frozen-lockfile && bun run dev` installs locked dependencies and starts Next.js.
- `cd frontend && bun run lint` checks ESLint rules; `bun run build` verifies a production build.

## Coding Style & Naming Conventions

PHP follows PSR-4 and Laravel conventions: four-space indentation, typed parameters and return values, PascalCase classes, camelCase methods, and snake_case database columns. Format changed PHP with `backend/vendor/bin/pint --dirty --format agent`. TypeScript is strict; use two-space indentation, PascalCase React components, camelCase hooks/functions, and the `@/` import alias. Keep route folders lowercase and follow neighboring code before introducing a new pattern.

## Testing Guidelines

Use Pest 5. Name PHP tests `*Test.php`; prefer feature tests for HTTP, authentication, and database behavior, and unit tests for isolated logic. Run a focused test with `cd backend && php artisan test --compact --filter=testName`. The suite uses in-memory SQLite. No frontend test runner or coverage threshold is configured, so frontend changes must at least pass lint and build.

## Commit & Pull Request Guidelines

The repository has no commits yet, so no historical convention exists. Use short, imperative subjects such as `Add task creation endpoint`, and keep each commit focused. Pull requests should explain behavior and verification, link relevant issues, call out migrations or API changes, and include screenshots for visible UI updates.

## Security & Configuration

Never commit `.env` files, credentials, tokens, or production data. Keep local settings in ignored environment files and document new required keys in the appropriate `.env.example` using safe placeholders.
