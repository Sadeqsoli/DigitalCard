# Database architecture

PostgreSQL 17 is the server persistence source of truth. Drizzle schema definitions and immutable, versioned SQL migrations belong to `packages/database`. The first migration establishes the Better Auth core schema plus the DigitalCard V1 business schema; it does not implement product services or authentication flows.

See [architecture](../ARCHITECTURE.md), [privacy](PRIVACY-MODEL.md), and [security](SECURITY.md).

## Persistence boundaries

- Clients never connect to PostgreSQL.
- The API accesses persistence through domain-appropriate repositories or database services.
- Database rows, domain objects, and public API DTOs are different representations.
- Durable invariants use PostgreSQL constraints where practical in addition to application validation.
- Full imported address-book records are local-first and are not server business tables.

## Schema ownership and tables

Better Auth owns the generated `user`, `session`, `account`, and `verification` tables. They are generated from the pinned Better Auth version through its supported Drizzle tooling. DigitalCard code may reference them, but must not casually reshape or replace them.

DigitalCard owns these V1 business tables:

| Domain        | Tables                                                                 | Ownership or purpose                                                   |
| ------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| User identity | `user_handles`                                                         | One globally unique, normalized public handle per user                 |
| Files         | `files`                                                                | User-owned storage metadata; no file bytes or upload workflow          |
| Organizations | `organizations`, `organization_members`                                | Organization metadata and unique user membership                       |
| Profiles      | `profiles`, `profile_items`                                            | User-owned profiles and independently visible items                    |
| Discovery     | `user_identifiers`, `contact_match_tokens`                             | Verified and imported keyed match tokens; no raw discovery identifiers |
| Sharing       | `share_links`, `share_link_items`, `share_grants`, `share_grant_items` | Revocable token and recipient-bound access contexts                    |
| Relationships | `connections`, `user_blocks`                                           | One connection per unordered user pair; directional blocking           |
| Devices       | `devices`                                                              | User installation and delivery-address metadata                        |
| Notifications | `notifications`                                                        | Durable user notification records; delivery is separate                |
| Privacy       | `privacy_preferences`, `consent_events`                                | Conservative preferences and append-only product consent history       |

Profiles are always owned by one user. An optional organization provides context and does not own the profile. Imported `Person` and contact-source records are not represented by these server tables.

## IDs and time

- Application-owned business entities receive RFC 9562 UUIDv7 values from the centralized `createId()` helper before insertion. PostgreSQL columns remain `uuid`.
- Better Auth uses its supported UUID database-ID strategy for library-owned records; its IDs are not required to be UUIDv7.
- PostgreSQL 17 has no native `uuidv7()` dependency in this schema.
- DigitalCard business timestamps use `timestamptz` and represent UTC instants. Better Auth's generated column definitions remain library-owned.

See [ADR 0002](decisions/0002-database-id-strategy.md).

## Key invariants

- Handles are globally unique, lowercase, 3–32 characters, and limited to `a-z`, `0-9`, `_`, and `.`.
- Active profile slugs are unique per owner; different users may reuse a slug. Each user has at most one active default profile.
- Active organization slugs are globally unique.
- A user may appear only once in an organization.
- A connection cannot target the same user and is unique for the unordered user pair. Blocks are non-self and unique by direction.
- Active verified discovery tokens cannot identify multiple users. Match-token versions are positive and token values have a constrained hexadecimal representation.
- Share-token hashes are unique and raw share tokens are never stored. Usage counters and limits are constrained. Active direct grants are unique per profile and grantee.
- Privacy preferences default to discovery and join notifications being disabled.
- File sizes and profile-item sort orders cannot be negative; file digests use a constrained SHA-256 representation.

Cross-table conditions that PostgreSQL cannot express with ordinary constraints remain future domain-service responsibilities. In particular, a selected shared item must belong to the link/grant profile, a user cannot grant their own profile to themselves, and state-specific timestamps must agree with their status.

## Delete behavior

- Deleting a Better Auth user cascades through user-owned rows, memberships, identifiers, contact match tokens, grants received, connections, blocks, devices, notifications, privacy preferences, and consent events.
- Deleting a profile cascades to its items and sharing records. Deleting a link or grant cascades to its selected-item join rows.
- Deleting an organization cascades memberships but sets profile organization context to null.
- Deleting a referenced file sets organization logos and profile avatars to null.
- Deleting an actor user sets `notifications.actor_user_id` to null. Deleting a device sets `consent_events.device_id` to null.
- Soft deletion is limited to files, organizations, profiles, and profile items where active-record reuse or recovery needs justify it.

## Schema and migration policy

- Every schema change requires a versioned, reviewed migration.
- Never rewrite an already-applied shared migration.
- Never use schema-push workflows against staging or production.
- Never mutate production schema manually.
- Migrations and application rollout must be designed for the chosen deployment sequence.

The supported workflow is `schema definition -> db:generate -> reviewed SQL migration -> db:migrate`. `db:check` validates migration metadata, `db:test` runs destructive integration tests only against the dedicated test database, and `db:seed` inserts small non-production examples.

## Modeling rules

- Use `timestamptz`; store time in UTC and localize only at presentation boundaries.
- Use application-generated UUIDv7 for business entity IDs unless a library or system table has a documented incompatible requirement.
- Prefer relational modeling for core concepts. JSONB is for genuinely flexible metadata.
- Add soft deletion only for a defined recovery or audit requirement.
- Derive indexes from concrete queries, constraints, and measured access paths.
- Raw SQL requires technical justification and the same review/testing standards as generated queries.

## Sensitive identity data

`user_identifiers` and `contact_match_tokens` store constrained match tokens and explicit key versions, not raw identifiers. Matching tokens require a keyed server-side construction such as HMAC, never plain unsalted hashing. The exact normalization, token construction, key lifecycle, and threat controls must be approved before the matching runtime is implemented; see [IDENTITY-MATCHING.md](IDENTITY-MATCHING.md).

## Contact data split

The future mobile SQLite database will own full imported contact representations. Its conceptual tables are:

- `local_people`: a user-visible local Person record;
- `local_contact_sources`: a source container or import origin;
- `local_person_sources`: the provenance link between a Person and one or more sources;
- `local_person_fields`: imported values and field-level provenance.

These names define the intended boundary, not a finalized SQLite schema. The contact-ingestion task must define columns, local identifiers, merge behavior, encryption, and retention. PostgreSQL receives only opted-in, minimized matching material, with `contact_ref` as an opaque application reference rather than an operating-system contact identifier. See [ADR 0001](decisions/0001-server-local-contact-data-split.md) and [contact ingestion](CONTACT-INGESTION.md).

## Operations

Production PostgreSQL is not publicly exposed. Backups must eventually be automated, encrypted, retained, stored off-server, and covered by a documented, tested restore procedure. See [infra instructions](../infra/AGENTS.md).
