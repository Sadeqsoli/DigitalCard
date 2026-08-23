# Mobile application instructions

These instructions apply to `apps/mobile`. Also follow the repository root `AGENTS.md` and the canonical architecture documents.

## Scope and structure

The Expo application targets iOS, Android, and Web. Prefer universal TypeScript implementations and feature-oriented organization:

```text
src/
  features/
  components/
  hooks/
  services/
  adapters/
  store/
  lib/
```

Create these directories only when concrete code needs them. Route files should compose features; screens and visual components must not contain business rules.

## Data and state

- API DTOs must come from `packages/contracts`; never reuse database row types in client code.
- Never access PostgreSQL from the client.
- Use TanStack Query for server state when server state is introduced.
- Zustand may hold local client state when its use is justified.
- Use React Hook Form with Zod when forms and runtime form contracts are introduced.
- Public profile rendering must consume a server-filtered public DTO. Never filter private data only in the UI.

Do not add these libraries speculatively. Add them when the corresponding capability is implemented and document the justification.

## Security and platform behavior

- Never store sensitive authentication tokens in AsyncStorage. Native sensitive persistence requires an appropriate secure platform adapter.
- Put platform-specific contact, permission, and sharing behavior behind adapters; avoid scattered `Platform.OS` checks.
- The app must remain usable when contact permission is denied.
- Support limited, full, and denied contact access where the operating system exposes those states. Do not invent states or capabilities an OS does not expose.
- Explain why access is needed before requesting permission.
- Critical privacy, permission, contact-ingestion, and sharing flows require tests.
