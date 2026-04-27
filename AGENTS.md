# Repository Guidelines

## Project Structure & Module Organization

This repository is split into a Laravel API/admin backend and a Next.js storefront frontend.

- `backend/`: Laravel 12 app. Main code is in `app/`, routes in `routes/`, migrations/seeders in `database/`, Filament admin resources in `app/Filament/`, and PHPUnit tests in `tests/`.
- `frontend/`: Next.js 16 app. Pages are in `src/app/`, shared UI in `src/components/`, state in `src/stores/`, API helpers in `src/lib/`, and assets in `public/`.
- `frontend/tests/api/`: TypeScript API smoke/integration tests.
- `frontend/tests/e2e/`: Playwright browser tests and config.
- `docs/`, `deploy/`, `Drivers-Reference/`: plans, deployment material, and reference data.

## Build, Test, and Development Commands

Run commands from the relevant app directory.

- `cd frontend && npm run dev`: start the Next.js dev server with Turbopack.
- `cd frontend && npm run build`: build the production frontend.
- `cd frontend && npm run lint`: run ESLint.
- `cd frontend && npx playwright test -c tests/e2e/playwright.config.ts`: run browser tests against `http://localhost:3000`.
- `cd frontend && npx tsx tests/api/run-api-tests.ts`: run API tests.
- `cd backend && composer run dev`: run Laravel server, queue, logs, and Vite.
- `cd backend && composer test`: clear config and run `php artisan test`.
- `cd backend && npm run build`: build backend Vite assets.

## Coding Style & Naming Conventions

Frontend code uses TypeScript, React, Tailwind, ESLint, and aliases such as `@/components/...`. Use PascalCase for React components, camelCase for variables/functions, and colocate feature UI under the matching `src/components/*` or `src/app/*` area. Mark client-only components with `'use client'`.

Backend code follows Laravel conventions: PSR-4 classes under `App\\`, singular models, HTTP classes in `app/Http`, and service classes under `app/Services`.

## Testing Guidelines

Backend tests are PHPUnit/Laravel `*Test.php` files under `backend/tests/Feature` or `backend/tests/Unit`. Frontend E2E specs use Playwright `*.spec.ts`; API tests use `*.test.ts`. Add focused tests for API contracts, checkout/cart flows, auth, and seller account workflows.

## Commit & Pull Request Guidelines

Recent commits use short, descriptive Turkish summaries, for example `next.config: image whitelist'e ... ekle`. Keep commits scoped to one logical change.

Pull requests should include a summary, verification commands, related task links, and screenshots for UI changes. Call out migrations, environment changes, queue/search dependencies, and seed/import steps.

## Security & Configuration Tips

Do not commit real `.env` files, credentials, API keys, or generated secrets. Start from `backend/.env.example`. Treat payment, Firebase, Sentry, Meilisearch, and shipping credentials as sensitive.
