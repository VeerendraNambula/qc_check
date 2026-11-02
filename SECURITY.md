# Security and deployment status

This repository is a development/portfolio project and must not be treated as a production-ready application.

## Known limitations identified during repository review

- Login still returns a placeholder token, not a signed or verifiable session.
- User and QC task controllers do not currently enforce authentication or role-based authorization guards.
- The upload endpoint does not enforce an authenticated uploader or inspect file signatures; its MIME filter can be spoofed despite size and extension checks.
- Password recovery requires a configured mail transport and still needs rate limiting and abuse monitoring.
- CORS now uses an explicit `CORS_ORIGINS` allowlist; configure the production frontend origin in the deployment environment.
- The application does not yet demonstrate a production security test suite.

## Improvements made in this cleanup

- Removed committed database exports, login test payloads, user seed data, uploaded evidence images, and generated diagnostic/build logs from the current branch.
- User and assigned-user API responses now explicitly select non-secret fields rather than returning password hashes or password-reset tokens.
- Login now requires a password and only accepts bcrypt password hashes; the plaintext-password fallback was removed.
- User/task responses avoid returning password hashes and reset tokens; DTO validation and a CORS origin allowlist are enabled.
- Uploads have a 5 MB limit, an image MIME allowlist, and cryptographically random filenames.
- Password-reset links are no longer printed to application logs, account-not-found responses are generic, and SMTP credentials must come from environment variables.
- Docker startup no longer runs schema synchronization with `--accept-data-loss` or seeds accounts automatically.
- Added ignore rules for local secrets, uploads, dumps, logs, and build artifacts.

## Safe handling

- Never commit `.env` files, database exports, login payloads, reset tokens, user dumps, uploaded evidence, or generated logs.
- Use synthetic data only in public demonstrations.
- Store secrets in the deployment platform's secret manager.
- Rotate credentials and invalidate reset tokens that were previously committed to a public repository.
- Back up databases before applying schema changes.

## Before production use

Implement and test signed authentication, route guards and role-based authorization, rate limiting, stronger upload signature validation and storage controls, secure password recovery, and a reviewed migration/baselining process.
