# DigitalCard engineering instructions

These rules apply to the entire repository. Before changing a file, also read the nearest folder-specific `AGENTS.md`; its rules refine these global rules without overriding them.

DigitalCard is a universal identity, contact-management, and profile-sharing platform. It handles sensitive personal data, so privacy and authorization are architectural invariants rather than UI features.

## Required reading

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then read the documents relevant to the task:

- [Product model](docs/PRODUCT.md)
- [Privacy model](docs/PRIVACY-MODEL.md)
- [Database rules](docs/DATABASE.md)
- [Contact ingestion](docs/CONTACT-INGESTION.md)
- [Identity matching](docs/IDENTITY-MATCHING.md)
- [Sharing model](docs/SHARING-MODEL.md)
- [Security](docs/SECURITY.md)
- [API boundaries](docs/API.md)
- [Architecture decisions](docs/decisions/README.md)

## Fixed technology

- TypeScript everywhere, in strict mode
- Node.js 22.13+, pnpm, and Turborepo
- Expo SDK 57, React Native, and Expo Router
- NestJS with Fastify
- PostgreSQL with Drizzle ORM
- Better Auth when authentication is introduced later
- Docker Compose; Caddy as the production reverse proxy

Do not replace or bypass these choices in a scoped task. Do not implement authentication before an explicitly authorized authentication task.

## Product domains

Respect these domain boundaries: Authentication, Profiles, Profile Items, People, Contact Sources, Identity Matching, Sharing, Connections, Organizations, Files, and Notifications. Identify the affected domains before implementation; avoid cross-domain coupling hidden in shared helpers.

## Global engineering rules

- Keep TypeScript strict mode enabled.
- Keep business logic out of UI components.
- Mobile and web clients must never access PostgreSQL directly.
- Database schema changes require versioned migrations. Never manually mutate a production schema.
- Never trust user IDs, resource ownership, or authorization claims from client payloads. Derive identity from verified server auth context and enforce authorization server-side.
- Never commit secrets.
- Never log passwords, session tokens, contact identifiers, email addresses, phone numbers, private profile values, or other personal data.
- Add dependencies only with a documented technical justification.
- Do not perform unrelated refactors during a scoped task.
- Record architectural changes as an ADR under `docs/decisions/` and update the canonical documents they affect.

## Privacy invariants

- Contacts are sensitive user data. Never collect them silently or upload the full address book by default.
- Collect data only after appropriate, contextual user consent.
- Preserve provenance for imported contact information.
- Never expose private profile data through public APIs or rely on client-side hiding to enforce privacy.
- Never implement broad installed-app scanning. Integrations must use explicitly supported platform mechanisms, official APIs, shared URLs/content, or explicitly declared app integrations.
- Do not use contact or installed-app information for advertising or tracking.

## Identity invariants

A `User`, a `Profile`, and an imported `Person` are distinct entities. Never collapse them into one database entity. A person in a user's address book may later link to a DigitalCard user, but never auto-merge people based only on display name.

Strong identity evidence may include a verified normalized phone number, verified normalized email address, or explicit DigitalCard identifier. Follow the matching and data-minimization rules in [docs/IDENTITY-MATCHING.md](docs/IDENTITY-MATCHING.md).

## Profile privacy invariant

Profiles and profile items each have `public` or `private` visibility. A public response may contain only a public profile and its public profile items. Private profiles and private fields require an explicit authorized sharing context.

## Workflow for every task

1. Read this file.
2. Read the nearest folder-specific `AGENTS.md`.
3. Read relevant architecture documentation.
4. Identify affected domain boundaries.
5. Update contracts first if an API shape changes.
6. Add a migration if persistence changes.
7. Implement domain/business logic.
8. Implement tests.
9. Implement API/UI integration.
10. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
11. Update documentation when behavior or architecture changes.

## Completion gate

A task is not complete until lint, typecheck, tests, and build pass; required migrations exist; documentation reflects architectural changes; and no secrets or sensitive data were introduced.
