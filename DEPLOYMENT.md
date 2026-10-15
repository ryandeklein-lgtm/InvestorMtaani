# Investor Mtaani deployment

## Runtime and layout

Use Node.js `^20.19.0` or `>=22.12.0`. The frontend is a Vite single-page application; the API is an Express service backed by PostgreSQL. Deploy `frontend` and `backend` as separate services, or serve `frontend/dist` behind a reverse proxy that sends `/api` requests to the backend.

## Backend service

1. Set the service root to `backend`.
2. Install with `npm ci` and start with `npm start`.
3. Set `NODE_ENV=production`, `PORT` (provided by the host), `FRONTEND_URL` (the exact public frontend origin), and `JWT_SECRET` (a unique random secret with at least 32 characters).
4. Configure either `DATABASE_URL` or all five `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` values. Set `DB_SSL=true` for hosted PostgreSQL with TLS. Certificate validation is enabled by default.
5. Set the host health check to `/healthz`. It returns `503` when PostgreSQL is unavailable.
6. Before starting the first release, run `npm run migrate` once against the target database, or configure it as the host's pre-deploy command. Back up production data before applying schema changes.

The repository includes a baseline schema for a new PostgreSQL database and incremental migrations for existing installations. Review the SQL against the actual database before applying it: `CREATE TABLE IF NOT EXISTS` does not reconcile a legacy table whose columns differ. Back up any existing database first.

## Frontend service

1. Set the service root to `frontend`.
2. Set `VITE_API_URL` to `https://your-api-host.example/api`, or `/api` when the frontend host reverse-proxies that path to the API.
3. Install with `npm ci` and build with `npm run build`.
4. Publish the generated `dist` directory as a static site. Configure history fallback so direct visits to routes such as `/terms` and `/business/123` serve `index.html`.

## Local setup

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`. Fill in local PostgreSQL credentials and generate a private JWT secret. Then install dependencies in each app directory, run the backend migrations, and start each dev server in its own terminal.

## Release blockers to resolve before taking real users or money

- The public legal pages are drafts with unfilled company, contact, privacy, and fee terms. Replace placeholders and obtain Kenyan legal and regulatory review before presenting the platform as transaction-ready.
- KYC submissions and documents are encrypted in PostgreSQL and have an authenticated admin review workflow. Before collecting real identity documents, configure a strong `KYC_ENCRYPTION_KEY`, confirm TLS and database access controls, choose a retention/deletion schedule, complete privacy notices and required registrations, and add malware scanning for uploads. The app does not yet scan documents for malware.
- Payment collection and transaction execution are not integrated. Do not accept funds or promise payment/settlement services until a payment provider account, callback validation, settlement/reconciliation process, transaction agreements, fees/refunds, and compliance approvals are configured and reviewed.
- Confirm the jurisdiction-specific licensing and operating model with qualified Kenyan counsel and the relevant regulator before facilitating investment offers, matching, or transactions.
- Confirm that the production database has the complete existing schema and test a restorable backup before deployment.
- Add a real admin account through the organization's controlled database provisioning process. Public registration cannot create admin users.
- Configure monitoring, error alerts, database backups, and a support/privacy contact before inviting the public.

## Current readiness boundary

This repository is prepared for a controlled technical review and deployment configuration. It is not ready to process live investments or money while the company identity, privacy contacts, compliance review, hosting/database accounts, live payment credentials, and transaction procedures remain undecided. The sandbox or development environment must not be presented as a live payment service.
