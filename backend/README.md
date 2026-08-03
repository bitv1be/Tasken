# Tasken API

The Tasken backend is a Laravel 13 JSON API. It provides Sanctum bearer-token authentication, health/version endpoints, and owner-scoped todo CRUD backed by PostgreSQL in Docker or SQLite for the test suite.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Start Laravel, the queue worker, logs, and Vite together:

```bash
composer run dev
```

The full Tasken stack should normally be started from the repository root with `docker compose -f compose.dev.yml up --build`.

## API

- `GET /api/health`, `/api/ready`, `/api/version`
- `POST /api/auth/signup`, `/api/auth/login`
- `GET /api/auth/user`
- `POST /api/auth/logout`, `/api/auth/logout-all`
- `GET|POST /api/todos`
- `GET|PATCH|DELETE /api/todos/{todo}`

Authenticated routes require `Authorization: Bearer <token>`. Todo policies prevent access to another user's records.

## Verification

```bash
composer test
vendor/bin/pint --dirty --format agent
php artisan route:list --path=api --except-vendor
```

Keep `APP_NAME=Tasken` in environment configuration. Mail sender names, Slack logging identity, session cookies, cache prefixes, and Redis prefixes derive from that setting unless explicitly overridden.
