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

The first implementation of private sharing, privacy-preserving identity matching, core domain persistence, organization authorization, or production deployment is expected to require one or more ADRs because important choices remain unresolved.
