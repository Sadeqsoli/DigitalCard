# Security architecture

Security rules apply to application code, infrastructure, operational tooling, logs, and documentation examples. See [privacy](PRIVACY-MODEL.md), [identity matching](IDENTITY-MATCHING.md), and [API design](API.md).

## Trust boundaries

- Treat all client payloads, identifiers, ownership claims, and visibility claims as untrusted.
- Derive authenticated user identity from verified server auth context.
- Enforce resource authorization and privacy server-side on every protected operation.
- Keep PostgreSQL unreachable from public networks and clients.
- Use Caddy as the production external HTTP entry point; exact TLS/deployment configuration will be documented with production infrastructure.

## Authentication

Better Auth will own authentication and session lifecycle when authentication work is explicitly authorized. Do not implement password hashing, token issuance, session management, or a parallel auth system manually. Sensitive tokens must not be stored in AsyncStorage; native persistence requires an appropriate secure platform adapter.

## Secrets and personal data

- Never commit real secrets or bake them into container images.
- Keep development, staging, and production secrets separate.
- Never log passwords, session tokens, contact identifiers, email addresses, phone numbers, private profile values, or other personal data.
- Apply the same restrictions to structured logs, traces, analytics, crash reports, fixtures, snapshots, and error details.
- Machine-readable API errors must be useful without echoing sensitive input.

## Identity discovery

Contact discovery must minimize data and resist offline guessing, enumeration, replay, and unauthorized correlation. Plain unsalted identifier hashes are prohibited. The protocol requires a security-reviewed ADR before implementation.

## Dependency and change control

Dependencies require a technical justification and lockfile review. Architectural or security-boundary changes require an ADR. Scoped tasks must not include unrelated refactors that obscure security review.

## Operations

Containers must not run privileged without a documented reason. Pin important images, use health checks, and keep PostgreSQL private. Production backup design requires encryption, retention, off-server storage, and tested restoration. Incident response, retention, account recovery, and deletion policies remain to be defined before those features are implemented.
