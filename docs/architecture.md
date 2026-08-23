# Architecture boundary notes

This repository starts with framework and tooling boundaries only.

- `apps/mobile` owns native and Router entry points.
- `apps/api` owns HTTP process startup and Nest modules.
- `packages/database` will own database access and schemas.
- `packages/contracts` will own framework-neutral transport contracts.
- `packages/ui` will own reusable presentation components.
- `packages/config` owns shared tool configuration.
- `packages/utils` will own small framework-neutral helpers.

Dependencies should point from apps to packages and between packages only when a concrete use case appears. Packages must not import application code. Database schemas, authentication configuration, and product modules are intentionally deferred.
