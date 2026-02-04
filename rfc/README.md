# RFCs

Design documents for Prolly. Each RFC covers architecture, engineering, design, or product specifications.

## Process

1. **Draft**: Create a new RFC in `rfc/drafts/` with a descriptive filename (e.g., `my-feature.md`)
2. **Review**: Open a pull request for discussion and iteration
3. **Accept**: Once approved, assign the next sequence number and move to `rfc/` (e.g., `0002-my-feature.md`)
4. **Implement**: Build what the RFC describes
5. **Supersede**: If replaced, mark as superseded and reference the new RFC

## RFC Header

Every RFC must include these fields:

```markdown
# RFC: Title (or # RFC NNNN: Title for accepted)

- **Status**: Draft | Accepted | Implemented | Superseded
- **Authors**: Name1, Name2, Claude (credit AI models used)
- **Created**: YYYY-MM-DD
- **Depends on**: [RFC NNNN](./path.md) (if applicable)
```

## Directory Structure

```
rfc/
├── README.md
├── 0001-poc-scope.md           # Accepted RFCs (numbered)
├── 0002-*.md
└── drafts/                      # Draft RFCs (no number)
    └── new-feature.md
```

## Status

| Status | Meaning |
|--------|---------|
| Draft | In `drafts/`, open for discussion |
| Accepted | Numbered, moved to `rfc/`, ready for implementation |
| Implemented | Completed and in codebase |
| Superseded | Replaced by another RFC |

## Accepted RFCs

| RFC | Title | Status |
|-----|-------|--------|
| [0001](./0001-poc-scope.md) | POC Scope & Milestones | Accepted |
| [0002](./0002-project-architecture.md) | Project Architecture | Accepted |
| [0003](./0003-data-model.md) | Data Model | Accepted |
| [0004](./0004-local-first-storage.md) | Local-First Storage | Accepted |
| [0005](./0005-ui-ux-design-system.md) | UI/UX Design System | Accepted |

## Drafts

No drafts currently.
