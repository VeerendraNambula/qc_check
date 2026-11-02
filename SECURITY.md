# Security and deployment status

This repository is a development/portfolio project and must not be treated as a production-ready application.

## Known limitations identified during repository review

- The login service currently returns a mock token rather than a signed, verifiable session token.
- The user and QC task controllers do not currently enforce authentication or role-based authorization guards.
- User read endpoints have historically returned complete database records; API response fields and access controls require a full review before deployment.
- The upload endpoint does not currently enforce an authenticated uploader, file-size limit, or strict file-type validation.
- Password recovery needs account-enumeration protection, rate limiting, and a production-safe email configuration.
- CORS currently accepts arbitrary origins while credentials are enabled.
- The application has no demonstrated production security test suite.

## Safe handling

- Never commit `.env` files, database exports, login payloads, reset tokens, user dumps, uploaded evidence, or generated logs.
- Use synthetic data only in public demonstrations.
- Store secrets in the deployment platform's secret manager.
- Rotate any credential or token that was previously committed to a public repository.
- Back up databases before applying schema changes.

## Before production use

Implement and test signed authentication, route guards and role-based authorization, response-field allowlists, DTO validation, rate limiting, secure password recovery, upload validation/storage controls, a strict CORS allowlist, and a reviewed migration/baselining process.
