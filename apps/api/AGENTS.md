# API application instructions

These instructions apply to `apps/api`. Also follow the repository root `AGENTS.md` and relevant canonical documents.

## Architecture

The API uses NestJS, Fastify, PostgreSQL, and Drizzle. Better Auth will own authentication and session lifecycle when authentication is explicitly introduced; never implement password hashing or session management manually.

Organize major product domains as Nest modules. Controllers remain thin. Prefer this flow:

```text
Controller
  -> validated request contract
  -> application/domain service
  -> repository/database
  -> domain result
```

- API routes use the `/v1` namespace.
- Boundary DTOs come from `packages/contracts`.
- APIs require stable, machine-readable error codes.
- Add OpenAPI when endpoints are introduced.
- The database schema is owned by `packages/database`.
- Use transactions where multi-step consistency requires them.

## Identity, authorization, and privacy

- Authenticated identity comes only from verified auth context.
- Never accept user identity or resource ownership from the request body.
- Enforce authorization server-side.
- Public endpoints must not leak private profiles or fields.
- Never log secrets or personal data.
- Authorization and privacy rules require integration tests.

## Contact matching

- Never match by name alone; normalize identifiers before matching.
- Matching must support privacy-preserving tokens.
- Do not persist unnecessary raw address-book values on the server.
- Follow [docs/IDENTITY-MATCHING.md](../../docs/IDENTITY-MATCHING.md); record the exact security protocol in an ADR before implementation.

## Notifications

Preserve this ordering:

```text
domain event -> notification record -> delivery attempt
```

A push delivery failure must not roll back the domain event.
