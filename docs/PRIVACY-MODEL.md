# Privacy model

Privacy is enforced at server and data boundaries, not by client presentation. See [sharing](SHARING-MODEL.md), [security](SECURITY.md), and [API design](API.md).

## Profile visibility

| Profile visibility | Item visibility | Public response |
| ------------------ | --------------- | --------------- |
| public             | public          | eligible        |
| public             | private         | excluded        |
| private            | public          | excluded        |
| private            | private         | excluded        |

A public page or endpoint may return data only from the first case. A private profile does not appear in public account/profile discovery. Private profiles and private items require an explicit, server-verified sharing context with sufficient scope.

The server must construct dedicated public DTOs. Returning a broad object and hiding fields in the mobile/web UI is not privacy enforcement.

## Contacts

Contacts are sensitive, user-owned data.

- Explain the purpose before requesting operating-system permission.
- Never collect contacts silently or upload the full address book by default.
- Continue to provide useful application behavior when permission is denied.
- Represent limited, full, and denied access only where an OS actually exposes those states.
- Collect and transmit only the minimum data needed for an explicit user action.
- Preserve provenance for imported values.
- Do not use contact data for advertising or tracking.

See [CONTACT-INGESTION.md](CONTACT-INGESTION.md) and [IDENTITY-MATCHING.md](IDENTITY-MATCHING.md).

## Installed applications and external integrations

Broad installed-app scanning is prohibited. Android and iOS expose different capabilities, and documentation or UI must not claim data the OS does not provide. Use only platform-supported share/open mechanisms, official APIs, shared URLs/content, or explicitly declared integrations. Installed-app information must not be used for tracking or advertising.

## Enforcement boundaries

- The client may request an operation but cannot assert identity, ownership, visibility eligibility, or sharing authorization.
- The API derives authenticated identity from verified server context and authorizes every protected access.
- Persistence and query design must make privacy-safe access paths reviewable.
- Logs, analytics, traces, and error reports must exclude personal data and secrets.

The V1 server schema records product-level grant/revoke transitions in append-only `consent_events`; it does not mirror operating-system permission databases. Retention periods, account-deletion semantics, legal export, consent vocabulary, and policy-version requirements still need explicit product/legal decisions before their behavior is implemented.
