# ADR 0002: Separate Better Auth and business ID strategies

- Status: accepted
- Date: 2026-08-23

## Context

DigitalCard needs UUID-compatible foreign keys and application-generated, time-ordered business identifiers on PostgreSQL 17. Better Auth owns its persistence models and supports UUID database IDs, while PostgreSQL 17 does not provide native `uuidv7()`.

## Decision

DigitalCard application-owned business entities use RFC 9562 UUIDv7 generated through the centralized `createId()` helper and stored in PostgreSQL `uuid` columns. The helper delegates generation to the pinned `uuid` library.

Better Auth uses its supported UUID database-ID strategy for `user`, `session`, `account`, and `verification`. Auth-owned IDs are UUID-compatible but are not required to be UUIDv7. Auth schema remains generated from the pinned library tooling.

## Consequences

Business inserts must assign IDs in application code. Database migrations do not depend on PostgreSQL 18 functionality. Better Auth upgrades require regeneration and review of its owned schema rather than manual approximation.

## Alternatives considered

Random UUIDs for all business records were rejected because UUIDv7 is the approved business convention. Database-generated UUIDv7 was rejected because PostgreSQL 17 lacks the required native function. Reimplementing UUIDv7 or Better Auth tables manually was rejected as unnecessary maintenance risk.
