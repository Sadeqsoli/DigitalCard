# DigitalCard

Production-grade monorepo foundation for the DigitalCard mobile client, API, and shared packages. This bootstrap intentionally contains no product features, authentication, or database domain model.

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

`pnpm lint` also checks Prettier formatting. Tests currently pass with no test files because this bootstrap has no product behavior to test.

## Repository layout

```text
apps/
  mobile/       Expo SDK 57 application with Expo Router
  api/          NestJS application using the Fastify adapter
packages/
  database/     Drizzle/PostgreSQL package; schema is intentionally empty
  contracts/    Shared transport-contract boundary
  ui/           Shared UI boundary
  config/       Shared strict TypeScript configuration
  utils/        Shared utility boundary
infra/          Local infrastructure definitions
docs/           Architecture and repository guidance
.github/        CI workflows
```

## Bootstrap decisions

- The workspace requires Node 22.13+ because Expo SDK 57 targets that minimum. The package manager version is pinned for reproducible installs.
- Turborepo owns the workspace task graph. Builds and type checks run dependency-first and cache generated output.
- TypeScript strictness lives in `packages/config/typescript/base.json`. Expo extends its own required base first and then the repository base; Nest overrides only its module/decorator requirements.
- Workspace packages expose only their public `src/index.ts` entry point. No application currently depends on another workspace, preventing accidental coupling during bootstrap.
- PostgreSQL 17 runs only for local development. Example credentials are non-production placeholders, and the database is not required for foundation linting, testing, type checking, or building.
- Drizzle is installed in `@digitalcard/database`, but `schema.ts` exports no tables and no migrations exist.
- Better Auth is a fixed future architecture choice but is deliberately not installed or configured until authentication work begins.
- Mobile `build` performs an Android production export. Native store binaries remain an EAS/native-toolchain concern and are outside this foundation.
- The minimal mobile route renders an empty root view, and the API declares only an empty Nest module. These validate framework wiring without adding starter/example behavior.

## Environment

Copy `.env.example` to `.env` for local services. Never commit `.env` or production credentials. Stop the database with:

```sh
docker compose --env-file .env -f infra/compose.yaml down
```

Add `--volumes` only when you intentionally want to delete the local PostgreSQL data volume.
