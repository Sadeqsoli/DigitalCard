# DigitalCard

Production-grade monorepo foundation for the DigitalCard mobile client, API, and shared packages. It includes the V1 PostgreSQL persistence schema but intentionally contains no product APIs, authentication flows, or product UI.

## Prerequisites

- Node.js 22.13 or newer
- pnpm 11.22.0 (Corepack can provide the version declared in `package.json`)
- Docker with Docker Compose for the local PostgreSQL service
- Expo's platform prerequisites when running the mobile app on Android or iOS

## Getting started

```sh
corepack enable
pnpm install
Copy-Item .env.example .env # PowerShell; use `cp` on macOS/Linux
docker compose --env-file .env -f infra/compose.yaml up -d
```

Database integration tests use a separate, ephemeral PostgreSQL service and refuse the normal development database:

```sh
docker compose --env-file .env --profile test -f infra/compose.yaml up -d postgres-test
export TEST_DATABASE_URL=postgresql://digitalcard:digitalcard@localhost:5433/digitalcard_test
pnpm --filter @digitalcard/database db:test
```

In PowerShell, set the variable with `$env:TEST_DATABASE_URL='postgresql://digitalcard:digitalcard@localhost:5433/digitalcard_test'` instead of `export`. These are local example credentials only.

Apply the committed migration and load the optional development seed into the normal local database:

```sh
export DATABASE_URL=postgresql://digitalcard:digitalcard@localhost:5432/digitalcard
pnpm --filter @digitalcard/database db:migrate
pnpm --filter @digitalcard/database db:seed
```

In PowerShell, use `$env:DATABASE_URL='postgresql://digitalcard:digitalcard@localhost:5432/digitalcard'`.

Database development uses `db:generate` to create reviewed migrations and `db:check` to validate migration metadata. Shared environments must never use schema push.

Run the development processes separately:

```sh
pnpm dev
pnpm --filter @digitalcard/mobile android
pnpm --filter @digitalcard/mobile ios
```

The API listens on `API_PORT` (default `3000`). Expo starts its normal interactive development server. The mobile app is currently an intentionally blank Router route.

## Validation

The commands used locally and in CI are:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm lint` also checks Prettier formatting. Root `pnpm test` runs non-destructive unit tests and does not require PostgreSQL. Destructive constraint tests are intentionally separate: start the dedicated test service, set `TEST_DATABASE_URL`, and run `pnpm --filter @digitalcard/database db:test`. CI runs both suites.

## Repository layout

```text
apps/
  mobile/       Expo SDK 57 application with Expo Router
  api/          NestJS application using the Fastify adapter
packages/
  database/     Drizzle/PostgreSQL V1 schema, migrations, seed, and integration tests
  contracts/    Shared transport-contract boundary
  ui/           Shared UI boundary
  config/       Shared strict TypeScript configuration
  utils/        Shared utility boundary
infra/          Local infrastructure definitions
docs/           Architecture and repository guidance
.github/        CI workflows
```

## Engineering and architecture

All contributors and coding agents must read [AGENTS.md](AGENTS.md), the nearest folder-specific `AGENTS.md`, and [ARCHITECTURE.md](ARCHITECTURE.md) before making changes. The architecture entry point links the canonical product, privacy, database, contact, identity-matching, sharing, security, API, and ADR documentation.

## Bootstrap decisions

- The workspace requires Node 22.13+ because Expo SDK 57 targets that minimum. The package manager version is pinned for reproducible installs.
- Turborepo owns the workspace task graph. Builds and type checks run dependency-first and cache generated output.
- TypeScript strictness lives in `packages/config/typescript/base.json`. Expo extends its own required base first and then the repository base; Nest overrides only its module/decorator requirements.
- Workspace packages expose only their public `src/index.ts` entry point. No application currently depends on another workspace, preventing accidental coupling during bootstrap.
- PostgreSQL 17 runs for local development and real database integration tests. Example credentials are non-production placeholders; destructive tests refuse the normal development database.
- Drizzle owns a modular V1 schema and an immutable generated SQL migration. Business IDs are application-generated UUIDv7 values.
- Better Auth's pinned stable tooling owns and generates the core auth persistence schema with UUID-compatible IDs. Authentication behavior remains unimplemented.
- Full imported address-book data remains in the future mobile SQLite boundary by default; PostgreSQL stores only privacy-preserving discovery representations.
- Mobile `build` performs an Android production export. Native store binaries remain an EAS/native-toolchain concern and are outside this foundation.
- The minimal mobile route renders an empty root view, and the API declares only an empty Nest module. These validate framework wiring without adding starter/example behavior.

## Environment

Copy `.env.example` to `.env` for local services. Never commit `.env` or production credentials. Stop the database with:

```sh
docker compose --env-file .env -f infra/compose.yaml down
```

Add `--volumes` only when you intentionally want to delete the local PostgreSQL data volume.
