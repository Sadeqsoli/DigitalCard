# Database architecture

PostgreSQL is the persistence source of truth. Drizzle schema definitions and migrations belong to `packages/database`. No product domain tables exist yet.

See [architecture](../ARCHITECTURE.md), [privacy](PRIVACY-MODEL.md), and [security](SECURITY.md).

## Persistence boundaries

- Clients never connect to PostgreSQL.
- The API accesses persistence through domain-appropriate repositories or database services.
- Database rows, domain objects, and public API DTOs are different representations.
- Durable invariants should use PostgreSQL constraints where practical in addition to application validation.

## Schema and migration policy

- Every schema change requires a versioned, reviewed migration.
- Never rewrite an already-applied shared migration.
- Never use schema-push workflows against staging or production.
- Never mutate production schema manually.
- Migrations and application rollout must be designed for the chosen deployment sequence.

## Modeling rules

- Use `timestamptz`; store time in UTC and localize only at presentation boundaries.
- Use application-generated UUIDv7 for business entity IDs unless a library or system table has a documented incompatible requirement.
- Prefer relational modeling for core concepts. JSONB is for genuinely flexible metadata.
- Add soft deletion only for a defined recovery or audit requirement.
- Derive indexes from concrete queries, constraints, and measured access paths.
- Raw SQL requires technical justification and the same review/testing standards as generated queries.

## Sensitive identity data

Do not retain unnecessary raw phone numbers, email addresses, or address-book data merely for discovery. Matching tokens require a keyed server-side construction such as HMAC, never plain unsalted hashing. The exact protocol, key lifecycle, and threat analysis must be approved before schema implementation; see [IDENTITY-MATCHING.md](IDENTITY-MATCHING.md).

## Operations

Production PostgreSQL is not publicly exposed. Backups must eventually be automated, encrypted, retained, stored off-server, and covered by a documented, tested restore procedure. See [infra instructions](../infra/AGENTS.md).
