# Contact ingestion

Contact ingestion converts user-selected, platform-supported input into user-owned `Person` information while preserving consent, provenance, and platform limitations. It does not imply server upload or identity matching.

See [privacy](PRIVACY-MODEL.md), [product model](PRODUCT.md), and [identity matching](IDENTITY-MATCHING.md).

## Invariants

- Never read contacts silently or upload the full address book by default.
- Request permission with explicit user-facing context and only when the user invokes a relevant capability.
- Keep the application usable when access is denied.
- Support limited, full, and denied access where the OS exposes those states; do not fabricate parity across platforms.
- Import only the data needed for the user's explicit action.
- Imported contacts belong to the importing user.
- Never use imported data for advertising or tracking.

## Sources and provenance

Every imported value must retain enough provenance to explain where it came from and support later reconciliation. Sources may include:

- device contacts;
- an iOS contact container;
- an Android account/raw contact where the platform makes that available;
- vCard;
- share sheet;
- DigitalCard; or
- a future official external integration.

This list describes possible origins, not a promise that every platform exposes equivalent identifiers or metadata. Provenance requirements should be represented explicitly when the database model is designed; the exact fields are not yet approved.

## Platform boundary

Platform-specific permission, contact, import, and share behavior belongs behind mobile adapters. Avoid scattered OS checks. Broad installed-app scanning is prohibited. Social or external applications may be integrated only through supported platform mechanisms, official APIs, shared URLs/content, or explicitly declared app integrations.

## Reconciliation

An import or later DigitalCard match must not automatically overwrite locally saved information. Present meaningful differences to the user and let the user choose whether to link a DigitalCard profile, add selected information, or ignore the suggestion.

Before implementation, define how repeated imports identify source records, how deleted/changed source values are handled, and what provenance survives source removal. These decisions affect privacy and schema design and require an ADR if architectural.
