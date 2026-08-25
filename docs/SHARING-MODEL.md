# Sharing model

Sharing grants deliberate access to eligible profile information. It does not alter the distinction between a User, Profile, Person, or locally imported value.

See [privacy](PRIVACY-MODEL.md), [product model](PRODUCT.md), and [API boundaries](API.md).

## Public resolution

A public page or endpoint can return a profile only when the profile is public, and can include only public profile items. Private profiles are absent from public account/profile discovery.

The API constructs a dedicated, server-filtered public DTO. Clients must never receive private fields and then hide them.

## Explicit sharing contexts

A private profile or private profile item requires an explicit authorized sharing context. The server must verify that context, its scope, and its continued validity for every protected read. Possession of a user ID, profile ID, guessed URL, or client-side flag is not authorization.

The V1 persistence model supports two explicit contexts:

- `share_links` holds a unique hash of a bearer token, never the raw token. Links may expire, be revoked, and have a positive maximum-use limit.
- `share_link_items` selects profile items when a link uses `selected_items` scope.
- `share_grants` authorizes a specific DigitalCard grantee for a profile and may expire or be revoked. Only one non-revoked grant exists for a profile/grantee pair.
- `share_grant_items` selects profile items when a grant uses `selected_items` scope.

Both mechanisms use `public_items`, `all_items`, or `selected_items` scope. `public_items` never elevates visibility. `all_items` and `selected_items` are protected contexts whose validity, expiry, revocation, ownership, and scope must be checked by the future server-side sharing service on every read. A selected item must belong to the same profile as its link or grant; that cross-table rule is enforced later in transactional domain logic.

The schema does not define link-token generation, URL shape, transfer policy, concurrency-safe use consumption, audit events, or connection-derived access. Before those behaviors are implemented, product and security decisions must define:

- who may grant access and to whom;
- token entropy, presentation, and redemption behavior;
- whether link access is transferable;
- use-limit concurrency and audit expectations;
- notification expectations; and
- behavior after visibility, ownership, or relationship changes.

The accepted persistence boundary is recorded in [ADR 0003](decisions/0003-v1-sharing-persistence.md). Further choices that alter its authorization or threat boundary require another ADR.

## Linking matched contacts

Linking a DigitalCard profile to a Person does not automatically overwrite imported information or grant access to private information. The user explicitly chooses whether to link, selectively add values, or ignore the match.
