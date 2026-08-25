# Identity matching

Identity matching may discover that a user-owned `Person` corresponds to a DigitalCard user. A match is evidence for a possible link; it is never permission to merge records, reveal private data, or overwrite local contact information.

See [product model](PRODUCT.md), [contact ingestion](CONTACT-INGESTION.md), [privacy](PRIVACY-MODEL.md), and [security](SECURITY.md).

## Evidence rules

Never match by display name alone. Strong evidence may include:

- a verified normalized phone number;
- a verified normalized email address; or
- an explicit DigitalCard identifier.

Normalization must be defined per identifier type and occur before token construction or comparison. Client-supplied verification or ownership claims are not trusted; the server must rely on verified account context and approved evidence.

## Privacy-preserving boundary

- Do not upload the full address book by default.
- Do not persist unnecessary raw address-book identifiers on the server.
- Plain unsalted hashes of phone numbers or email addresses are prohibited because their input spaces are guessable.
- Sensitive discovery material must use an approved keyed server-side construction, such as HMAC, with key separation and rotation considerations.
- Matching output must not become a public enumeration endpoint or disclose whether arbitrary people use DigitalCard.

The V1 PostgreSQL schema contains two server-side discovery tables:

- `user_identifiers` stores a DigitalCard user's verified identifier kind, keyed match token, key version, verification time, and optional revocation time.
- `contact_match_tokens` stores an importing user's opaque `contact_ref`, identifier kind, keyed match token, key version, and retention timestamps.

Neither table is a profile-display source. `contact_match_tokens` deliberately has no display name, raw phone, raw email, social username, company, or address-book metadata. Full People, sources, and fields remain in the future mobile SQLite store by default as described in [DATABASE.md](DATABASE.md) and [ADR 0001](decisions/0001-server-local-contact-data-split.md).

The schema supports versioned keyed tokens and efficient equality matching, but the exact token protocol is deliberately not defined yet. Before runtime implementation, an ADR and threat review must resolve normalization rules, where tokens are constructed, key custody/rotation, replay and enumeration resistance, deletion/retention, false-positive handling, rate limits, and how verified identifiers enter or leave the match set.

## Match lifecycle invariant

When a contact later matches a DigitalCard user:

1. preserve the original Person and its provenance;
2. create or propose a distinct link rather than merging identities;
3. reveal only profile information allowed by public visibility or an explicit authorized sharing context;
4. optionally create a notification record; and
5. let the user link the profile, add selected information, or ignore the match.

Push delivery is a later attempt and cannot control whether the domain event or notification record commits.
