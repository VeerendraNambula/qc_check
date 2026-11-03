# Security and deployment status

This is a development/portfolio project, not a production-ready application. Use synthetic data only.

## Implemented security controls

- Login requires a password and verifies bcrypt password hashes.
- Login issues signed HS256 bearer tokens with a one-hour expiry. The signing key is supplied through `JWT_SECRET`; the API fails closed when it is missing or shorter than 32 bytes.
- A global backend guard protects API routes. Only login, registration, password-recovery endpoints, and the health check are public.
- Public registration always creates a `USER` account. The client cannot choose its role, and profile update DTOs do not expose role changes.
- User administration is restricted to `ADMIN`; users can access and update only their own profile and change their own password after verifying the current password.
- QC task administration is restricted to `ADMIN`. Inspectors can view unassigned tasks and their own assigned tasks, claim unassigned work, submit checklist responses for their own assignments, and update only the final status of their assigned tasks.
- The frontend protects authenticated routes, clears local session data on logout, and clears expired sessions after a 401 response.
- User/task responses select non-secret fields. Password-reset tokens are stored as SHA-256 hashes.
- Uploads have a 5 MB limit, a JPEG/PNG/WebP MIME allowlist, random filenames, and file-signature checks.
- CORS uses the explicit `CORS_ORIGINS` allowlist. SMTP credentials are read from environment variables.

## Required deployment configuration

Set `JWT_SECRET` to a cryptographically random secret of at least 32 bytes in the backend deployment environment. Do not reuse the example value. Also configure `DATABASE_URL`, `CORS_ORIGINS`, and the SMTP/frontend recovery variables if password recovery is enabled. See `backend/.env.example` for the local template.

## Remaining production work

- Add rate limiting and abuse monitoring for login, registration, uploads, and password recovery.
- Review refresh-token/session revocation strategy and key rotation. Current access tokens remain valid for up to one hour after issue.
- Review upload storage, malware scanning, file serving, and retention policies before accepting real inspection evidence.
- Add comprehensive authorization integration tests for every route and business rule.
- Review dependency vulnerabilities and update the dependency tree deliberately.
- Back up and review/baseline existing databases before applying Prisma migrations; never use `prisma db push --accept-data-loss` on data that must be retained.

## Safe handling

Never commit real `.env` files, database exports, credentials, reset tokens, user dumps, uploaded evidence, or generated logs. Store production secrets in the deployment platform's secret manager and rotate any credential that has ever been exposed.
