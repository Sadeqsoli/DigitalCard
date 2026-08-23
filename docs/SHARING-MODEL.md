# Sharing model

Sharing grants deliberate access to eligible profile information. It does not alter the distinction between a User, Profile, Person, or locally imported value.

See [privacy](PRIVACY-MODEL.md), [product model](PRODUCT.md), and [API boundaries](API.md).

## Public resolution

A public page or endpoint can return a profile only when the profile is public, and can include only public profile items. Private profiles are absent from public account/profile discovery.

The API constructs a dedicated, server-filtered public DTO. Clients must never receive private fields and then hide them.

## Private sharing

A private profile or private profile item requires an explicit authorized sharing context. The server must verify that context, its scope, and its continued validity for every protected read. Possession of a user ID, profile ID, guessed URL, or client-side flag is not authorization.

The mechanism for private sharing—such as recipient-bound grants, revocable links, connection-based access, expiry, or combinations—has not been approved. Before implementation, product and security decisions must define:

- who may grant access and to whom;
- item/profile scope;
- expiry and revocation behavior;
- whether access is transferable;
- audit and notification expectations; and
- behavior after visibility, ownership, or relationship changes.

These choices require an ADR because they affect contracts, persistence, and threat boundaries.

## Linking matched contacts

Linking a DigitalCard profile to a Person does not automatically overwrite imported information or grant access to private information. The user explicitly chooses whether to link, selectively add values, or ignore the match.
