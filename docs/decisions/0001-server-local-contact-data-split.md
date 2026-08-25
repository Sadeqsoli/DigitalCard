# ADR 0001: Keep full imported contacts local by default

- Status: accepted
- Date: 2026-08-23

## Context

Address books contain sensitive data about users and non-users. DigitalCard needs future contact ingestion and join discovery without making the server a default copy of every imported address book.

## Decision

Full imported People, contact sources, source links, and fields will live in a future mobile SQLite store by default. The conceptual local tables are `local_people`, `local_contact_sources`, `local_person_sources`, and `local_person_fields`.

PostgreSQL stores only opted-in, minimized discovery material: verified account tokens in `user_identifiers` and imported contact tokens in `contact_match_tokens`. Tokens must use an approved keyed construction such as HMAC. `contact_ref` is an opaque application-generated reference, not an operating-system contact identifier.

## Consequences

The server cannot act as an automatic full address-book backup. Contact features must handle local data lifecycle and cross-device expectations explicitly. A later threat-reviewed protocol must define normalization, token construction, key rotation, retention, rate limiting, and enumeration defenses before discovery runs.

## Alternatives considered

Uploading full contacts by default was rejected as disproportionate. Plain unsalted identifier hashes were rejected because phone and email input spaces are guessable.
