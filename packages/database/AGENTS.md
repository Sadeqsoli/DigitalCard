# Database package instructions

These instructions apply to `packages/database`. Also follow the root instructions and [docs/DATABASE.md](../../docs/DATABASE.md).

- PostgreSQL is the persistence source of truth; Drizzle owns application schema definitions.
- Every schema change requires a versioned migration. Never rewrite an already-applied shared migration or use schema-push workflows for staging/production.
- Prefer database constraints for durable invariants.
- Use `timestamptz` and store UTC.
- Use JSONB only for flexible metadata, not core relational modeling.
- Use application-generated UUIDv7 for business entity IDs unless a library or system table requires another strategy.
- Use soft deletion only when recovery or audit requirements justify it.
- Evaluate indexes against actual access paths.
- Do not expose database row models as public contracts.
- Raw SQL requires a documented justification.
- Sensitive contact matching must use a keyed server-side construction such as HMAC, never plain unsalted hashing.
- Never retain unnecessary raw identifiers merely to support discovery.
