# Contract package instructions

These instructions apply to `packages/contracts`. Also follow the root instructions and [docs/API.md](../../docs/API.md).

- This package defines API boundary schemas and types.
- Keep it framework-independent: it must not depend on Expo, React Native, NestJS, or database implementations.
- Use Zod when runtime contracts are introduced and infer TypeScript types from schemas where appropriate.
- Database models, domain models, and API DTOs are distinct concepts.
- Never expose a database row directly to a client.
