# API architecture

The NestJS/Fastify API is the only application boundary to PostgreSQL. No product endpoints exist yet.

See [architecture](../ARCHITECTURE.md), [contracts instructions](../packages/contracts/AGENTS.md), [privacy](PRIVACY-MODEL.md), and [security](SECURITY.md).

## Version and flow

Product routes use the `/v1` namespace. Prefer:

```text
controller
  -> validated request contract
  -> application/domain service
  -> repository/database
  -> domain result
  -> response DTO
```

Controllers translate HTTP concerns and remain thin. Domain services implement business rules. Repositories isolate persistence. Transactions protect multi-step consistency where required.

## Contracts

- Boundary schemas and DTOs belong to `packages/contracts` and remain framework-independent.
- Use Zod when runtime contracts are introduced and infer TypeScript types where appropriate.
- Database rows, domain models, and API DTOs are distinct.
- Never return a database row directly to a client.
- Update contracts before implementations when an API shape changes.
- Add OpenAPI alongside the first endpoints and keep it derived from or consistent with runtime contracts.

## Identity, ownership, and privacy

- Authenticated identity comes from verified auth context, never a body-provided user ID.
- Resource ownership is loaded and authorized server-side.
- Public profile endpoints return dedicated DTOs containing only public profiles and public items.
- Private data requires explicit, verified sharing authorization.
- Authorization and privacy rules require integration tests.

## Errors and logging

Errors need stable machine-readable codes plus safe human-readable messages. Do not expose stack traces, persistence details, existence of unauthorized resources, secrets, or personal input. Logs and telemetry must not contain personal data.

The concrete error envelope, pagination style, public identifier/slug format, idempotency requirements, and consistency conventions should be decided with the first affected endpoints and recorded in an ADR if cross-cutting.
