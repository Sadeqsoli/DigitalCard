# DigitalCard architecture

This is the canonical architecture entry point. DigitalCard is a universal identity, contact-management, and profile-sharing platform for iOS, Android, and Web. The repository contains the framework foundation and the V1 server persistence model. It still has no product API endpoints, authentication flows, or product UI.

All contributors and agents must read [AGENTS.md](AGENTS.md) plus the nearest scoped `AGENTS.md` before making changes.

## System boundaries

```text
iOS / Android / Web
        |
        | versioned HTTPS API contracts
        v
NestJS API on Fastify
        |
        | repositories / transactions
        v
Drizzle ORM -> PostgreSQL
```

Clients never connect to PostgreSQL. The API is the authorization, privacy-filtering, and business-policy boundary. In production, Caddy will terminate and route external HTTP traffic to the API; PostgreSQL remains private.

## Repository boundaries

- `apps/mobile` owns Expo Router routes, client composition, and platform adapters.
- `apps/api` owns HTTP process startup, Nest domain modules, authorization enforcement, and application orchestration.
- `packages/contracts` owns framework-independent API boundary schemas and types.
- `packages/database` owns Drizzle schemas and versioned migrations.
- `packages/ui` owns presentation-only universal components.
- `packages/config` owns shared tooling configuration.
- `packages/utils` owns small framework-neutral utilities when concrete reuse exists.
- `infra` owns deployable infrastructure definitions and operational configuration.

Dependencies flow from applications toward packages. Packages must not import application code. Database models do not cross the API boundary, and shared packages should not become a place to hide domain coupling.

## Product domains

The planned domain boundaries are Authentication, Profiles, Profile Items, People, Contact Sources, Identity Matching, Sharing, Connections, Organizations, Files, and Notifications. Their agreed meanings and relationships are summarized in [docs/PRODUCT.md](docs/PRODUCT.md). Domain-module boundaries may evolve only through an ADR when implementation evidence warrants a change.

Three identity concepts are deliberately separate:

- A `User` is an authenticated DigitalCard account.
- A `Profile` is a shareable identity presentation owned or controlled through an authorized relationship.
- A `Person` is a user's imported contact representation and may not correspond to a DigitalCard user.

Never collapse these into one persistence entity. A later identity match creates a link opportunity, not an automatic merge.

## Persistence baseline

PostgreSQL 17 holds server-authoritative account, profile, sharing, organization, connection, notification, and privacy state. Better Auth owns its generated core tables; DigitalCard owns the business tables. Full imported address-book records remain local to the future mobile SQLite store by default, while PostgreSQL stores only keyed discovery tokens needed for matching. See [database architecture](docs/DATABASE.md) and [ADR 0001](docs/decisions/0001-server-local-contact-data-split.md).

Application-owned business records use application-generated UUIDv7 identifiers. Better Auth uses its supported UUID strategy for library-owned records. See [ADR 0002](docs/decisions/0002-database-id-strategy.md).

## Cross-cutting invariants

- The server enforces ownership, authorization, and privacy.
- A public response contains only a public profile and public profile items.
- Contacts require contextual consent, remain sensitive, and retain source provenance.
- Contact discovery minimizes raw data and never matches by display name alone.
- Persistence changes use reviewed, versioned migrations.
- Secrets and personal data do not enter source control or logs.
- Domain events are durable independently of notification-delivery success.

## Fixed technology

TypeScript strict mode, Node.js 22.13+, pnpm, Turborepo, Expo SDK 57, React Native, Expo Router, NestJS, Fastify, PostgreSQL, Drizzle ORM, Docker Compose, and production Caddy are fixed. Better Auth is reserved for the later authentication implementation.

## Canonical documentation

- [Product model](docs/PRODUCT.md)
- [Privacy model](docs/PRIVACY-MODEL.md)
- [Database](docs/DATABASE.md)
- [Contact ingestion](docs/CONTACT-INGESTION.md)
- [Identity matching](docs/IDENTITY-MATCHING.md)
- [Sharing model](docs/SHARING-MODEL.md)
- [Security](docs/SECURITY.md)
- [API](docs/API.md)
- [Architecture decision records](docs/decisions/README.md)

These documents capture current invariants and boundaries, not unapproved implementation detail. An architectural change requires an ADR and updates to every affected canonical document.
