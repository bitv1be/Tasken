# Tasken frontend

The Tasken frontend is a Next.js 16 App Router application. It provides the public landing page, authentication screens, account management, and the protected todo workspace.

## Setup

```bash
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

Open `http://localhost:3000` for frontend-only development. The complete same-origin application is available through the repository's Docker Compose stack at `http://localhost`.

`NEXT_PUBLIC_SITE_URL` must contain the deployed public origin at build time. It controls canonical URLs, Open Graph URLs, `robots.txt`, and `sitemap.xml`.

## Verification

```bash
bun run lint
bun run build
```

Only `/` is publicly indexable. Login, signup, account, and todo routes emit `noindex`; the sitemap contains only the public landing page. Tasken's application icons and social image are generated through Next.js metadata routes.
