# Infrastructure instructions

These instructions apply to `infra`. Production assumes a Linux VPS running Docker Compose, Caddy, the API container, and PostgreSQL.

- PostgreSQL must not be publicly exposed.
- Obtain secrets from environment or secret-management facilities; never bake secrets into images.
- Do not run privileged containers without a documented reason.
- Pin important container versions and add appropriate health checks.
- Keep development, staging, and production secrets separate.
- Production requires database backups.
- The backup design must include automated creation, encryption, retention, off-server storage, and a documented restore procedure.
- A backup is not trusted until restoration has been tested.

Infrastructure architecture changes require an ADR and corresponding updates to the security/database documentation.
