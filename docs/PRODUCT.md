# Product model

DigitalCard provides identity profiles, contact management, and deliberate profile sharing. This document defines the agreed product concepts and boundaries reflected by the V1 server persistence model without prescribing unapproved service behavior.

See [the architecture entry point](../ARCHITECTURE.md), [privacy model](PRIVACY-MODEL.md), and [sharing model](SHARING-MODEL.md).

## Core concepts

- **User:** an authenticated DigitalCard account. Authentication will be implemented later with Better Auth.
- **Profile:** a shareable presentation of identity. A user may have multiple profiles such as personal, work, business, or custom.
- **Profile Item:** an individual piece of profile information. Its visibility is independent of the containing profile.
- **Person:** an address-book/contact representation belonging to the importing user. A Person is not necessarily a DigitalCard user.
- **Contact Source:** provenance for imported information, such as device contacts, an iOS container, an Android account/raw contact where available, vCard, share sheet, DigitalCard, or a future official integration.

`User`, `Profile`, and `Person` remain distinct even if later linked.

## Domain responsibilities

- **Authentication:** account identity and session lifecycle.
- **Profiles / Profile Items:** identity presentation, visibility, and profile content.
- **People / Contact Sources:** user-owned contact representations and provenance.
- **Identity Matching:** evidence-based discovery of a possible relationship between a Person and a DigitalCard user.
- **Sharing:** explicit contexts that grant access to eligible profile data.
- **Connections:** one relationship record between an unordered pair of users, optionally carrying profile context. Transition and authorization semantics remain to be decided.
- **Organizations:** organization metadata and unique user memberships with owner/admin/member roles. Invitation, role-transition, and authorization semantics remain to be decided; profiles remain user-owned in V1.
- **Files:** metadata and authorized access for stored content; storage architecture remains to be decided.
- **Notifications:** durable user notification records and independent delivery attempts.

## Visibility model

A profile is `public` or `private`. Every profile item is independently `public` or `private`. Public resolution is an intersection: the profile must be public and only its public items may be returned. See [PRIVACY-MODEL.md](PRIVACY-MODEL.md).

A private profile is excluded from public account/profile discovery and requires an explicit authorized sharing context.

## Imported contacts and later discovery

Imported contacts belong to the importing user and retain provenance. The product should support discovering when an existing contact joins DigitalCard without uploading the full address book by default or retaining unnecessary raw identifiers.

When strong identity evidence suggests a match, DigitalCard may notify the importing user and present newly available profile information. It must not automatically overwrite locally saved information. The user chooses whether to:

- link the DigitalCard profile;
- add selected information; or
- ignore the match.

## Product invariants

- Never auto-merge people based on display name.
- Never treat imported contact data as account ownership evidence.
- Never silently collect contacts or use contact/app information for advertising or tracking.
- Integrate external applications only through platform-supported mechanisms, official APIs, shared content/URLs, or explicitly declared integrations.
