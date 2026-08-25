# Architecture decision records

Use an Architecture Decision Record (ADR) for changes that alter system boundaries, domain ownership, security/privacy posture, persistence strategy, public API conventions, infrastructure topology, or fixed technology choices.

ADRs explain why a decision was made; canonical documents describe the resulting current architecture. Update both in the same change.

## Naming

Use a monotonically numbered descriptive filename:

```text
0001-short-decision-title.md
```

Do not renumber accepted ADRs. A later decision supersedes an earlier record rather than rewriting its history.

## Minimal template

```md
# ADR NNNN: Decision title

- Status: proposed | accepted | superseded
- Date: YYYY-MM-DD
- Supersedes: ADR NNNN (if applicable)

## Context

What forces and constraints require a decision?

## Decision

What is the chosen boundary or approach?

## Consequences

What benefits, costs, risks, migrations, and follow-up work result?

## Alternatives considered

Which credible alternatives were rejected, and why?
```

## Accepted records

- [ADR 0001: Keep full imported contacts local by default](0001-server-local-contact-data-split.md)
- [ADR 0002: Separate Better Auth and business ID strategies](0002-database-id-strategy.md)
- [ADR 0003: Establish V1 sharing persistence contexts](0003-v1-sharing-persistence.md)

The first implementation of matching token construction, organization authorization, sharing authorization behavior, or production deployment is expected to require further ADRs because important choices remain unresolved.
