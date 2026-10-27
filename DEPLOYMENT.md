# Investor Mtaani deployment

## Runtime and layout

Use Node.js `^20.19.0` or `>=22.12.0`. The frontend is a Vite single-page application; the API is an Express service backed by PostgreSQL. Deploy `frontend` and `backend` as separate services, or serve `frontend/dist` behind a reverse proxy that sends `/api` requests to the backend.

## Backend service

1. Set the service root to `backend`.
2. Install with `npm ci` and start with `npm start`.
3. Set `NODE_ENV=production`, `PORT` (provided by the host), `FRONTEND_URL` (one or more exact HTTPS frontend origins, comma-separated), and `JWT_SECRET` (a unique random secret with at least 32 characters).
4. Configure either `DATABASE_URL` or all five `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` values. Production startup requires `DB_SSL=true`; PostgreSQL certificate validation is enabled and cannot be disabled in production.
5. Set `KYC_ENCRYPTION_KEY` to a unique, securely stored 32-byte key encoded as 64 hexadecimal characters. Production startup fails if it is missing or malformed. Keep the same key across restarts and backups; changing it makes existing encrypted KYC records and saved drafts unreadable.
6. Set `TRUST_PROXY=true` when the host places the API behind one trusted reverse proxy so rate limits use the real client address. Keep it false for direct exposure.
7. Set the host health check to `/healthz`. It returns `503` when PostgreSQL is unavailable.
8. Before starting the first release, run `npm run migrate` once against the target database, or configure it as the host's pre-deploy command. This includes the encrypted user-drafts table used by resumable profile and KYC forms. Back up production data before applying schema changes.

The repository includes a baseline schema for a new PostgreSQL database and incremental migrations for existing installations. Review the SQL against the actual database before applying it: `CREATE TABLE IF NOT EXISTS` does not reconcile a legacy table whose columns differ. Back up any existing database first.

## Frontend service

1. Set the service root to `frontend`.
2. Set `VITE_API_URL` to `https://your-api-host.example/api`, or `/api` when the frontend host reverse-proxies that path to the API.
3. Install with `npm ci` and build with `npm run build`.
4. Publish the generated `dist` directory as a static site. Configure history fallback so direct visits to routes such as `/terms` and `/business/123` serve `index.html`.

For Vercel, set the project root directory to `frontend` (recommended) or the repository root with the output directory set to `frontend/dist`. The root and frontend Vercel configurations both rewrite app routes to `index.html`, allowing React Router to load nested links and browser refreshes. Redeploy after changing this configuration.

## Hosting details to obtain before the production deployment

- Hosting provider and project ownership for the frontend, API, and PostgreSQL database; identify who can manage billing, access, and recovery.
- Production frontend and API domains, DNS ownership, and HTTPS certificates. The API's `FRONTEND_URL` must list the exact frontend origin or origins.
- Managed PostgreSQL connection settings, TLS requirements, private-network rules, backup retention, and a named person responsible for restore testing.
- A managed secret store and separate production values for `JWT_SECRET` and `KYC_ENCRYPTION_KEY`. The KYC key must be backed up securely and remain stable across deployments.
- The organization’s legal name, support/privacy contact, approved public terms and privacy notice, fee wording, and the outcome of Kenyan legal/regulatory review.
- A controlled way to provision the initial administrator; never send admin credentials in the hosting request or commit them to this repository.
- If community media is enabled for real users, durable object storage/CDN, storage access policy, retention, and backup arrangements. The current database-backed media path is suitable for controlled review, not sustained public growth.
- Monitoring and alert recipients, incident owner, and a user support contact.

Keep real credentials and secret values in the host's secret manager. The request should identify which team will create each value and where it will be stored, rather than putting the values in tickets or source control.

## Local setup

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`. Fill in local PostgreSQL credentials and generate a private JWT secret. Then install dependencies in each app directory, run the backend migrations, and start each dev server in its own terminal.

## Release blockers to resolve before taking real users or money

- The public legal pages are drafts with unfilled company, contact, privacy, and fee terms. Replace placeholders and obtain Kenyan legal and regulatory review before presenting the platform as transaction-ready.
- KYC submissions, documents, and resumable form drafts are encrypted in PostgreSQL and have authenticated access controls. Before collecting real identity documents, configure a strong `KYC_ENCRYPTION_KEY` (64 hex characters), confirm TLS and database access controls, choose a retention/deletion schedule, complete privacy notices and required registrations, and add malware scanning for uploads. The app does not yet scan documents for malware.
- Payment collection and transaction execution are not integrated. Do not accept funds or promise payment/settlement services until a payment provider account, callback validation, settlement/reconciliation process, transaction agreements, fees/refunds, and compliance approvals are configured and reviewed.
- Confirm the jurisdiction-specific licensing and operating model with qualified Kenyan counsel and the relevant regulator before facilitating investment offers, matching, or transactions.
- Confirm that the production database has the complete existing schema and test a restorable backup before deployment.
- Community posts support one public photo or video per update (up to 25 MB); media bytes are currently stored in PostgreSQL. Before inviting the public, choose and configure durable object storage/CDN, backups and retention for growing media, plus a moderation and reporting process. Posts are shown only while the associated business profile is approved.
- Add a real admin account through the organization's controlled database provisioning process. Public registration cannot create admin users.
- Configure monitoring, error alerts, database backups, and a support/privacy contact before inviting the public.

## Current readiness boundary

This repository is prepared for a controlled technical review and deployment configuration. It is not ready to process live investments or money while the company identity, privacy contacts, compliance review, hosting/database accounts, live payment credentials, and transaction procedures remain undecided. The sandbox or development environment must not be presented as a live payment service.
