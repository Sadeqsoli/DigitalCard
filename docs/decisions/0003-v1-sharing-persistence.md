# ADR 0003: Establish V1 sharing persistence contexts

- Status: accepted
- Date: 2026-08-23

## Context

Private profile information requires an explicit, revocable server-authorized context. The V1 schema needs to represent link-based sharing and direct user grants without implementing endpoint or token behavior prematurely.

## Decision

Persist token-based contexts in `share_links`, storing only unique token hashes, and recipient-bound contexts in `share_grants`. Both use `public_items`, `all_items`, or `selected_items` scope and support expiry and revocation. Selected-item membership lives in composite-key join tables `share_link_items` and `share_grant_items`.

## Consequences

Future server logic must validate ownership, scope, expiry, revocation, use limits, and selected-item profile membership transactionally. The schema does not imply that connections grant access, and it does not define token format, transfer policy, URL design, or audit behavior.

## Alternatives considered

Encoding item IDs in JSON was rejected because membership is relational. Storing raw bearer tokens was rejected because a database disclosure would immediately reveal usable credentials. Treating client-side visibility as authorization was rejected by the privacy model.
