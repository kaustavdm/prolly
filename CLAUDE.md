# Claude Context

Quick reference for continuing development on Prolly.

## First Steps

1. Read `LEARNINGS.md` for compressed decisions and rationale
2. Check `README.md` in any directory for local context
3. Read `rfc/0001-poc-scope.md` for current scope and milestones. Read other RFCs as needed.
4. Read `rfc/drafts/` for draft specifications. Draft specifications will not be implemented.

## Maintaining LEARNINGS.md

After each session or significant chunk of work, update `LEARNINGS.md` with new insights:

- **Add only high-value learnings**: decisions made, patterns discovered, gotchas encountered
- **Keep it compressed**: one line per insight when possible
- **Avoid duplication**: check existing content before adding
- **Categorize appropriately**: add to existing sections or create new ones if needed
- **Delete outdated info**: remove learnings that no longer apply

## Project Structure

```
prolly/
├── app/           # Svelte 5 PWA (not yet scaffolded)
├── services/      # Go backend (not yet scaffolded)
├── rfc/           # Design documents
│   ├── 0001-*.md  # Accepted RFCs
│   └── drafts/    # Draft RFCs
└── docs/          # Additional documentation
```

## Current State

- **Phase**: Pre-implementation (RFCs written, no code yet)
- **Next**: Scaffold `app/` with SvelteKit, Dexie, PWA setup (Milestone M1)

## Key Technical Choices

- Svelte 5 + SvelteKit + Dexie + vite-plugin-pwa
- Go 1.25+ modular monolith (future)
- UUIDv7 for all entity IDs
- CSS custom properties for theming (no Tailwind)

## Conventions

- Node 24+ LTS, Go 1.25+
- Use Mermaid for diagrams, not ASCII art
- RFCs: drafts in `rfc/drafts/` (no number), accepted in `rfc/` (numbered)
- Dual license: MIT + Apache-2.0
- For any new feature, first plan and draft a RFC and have it reviewed and accepted before implementing.

## Entity Quick Reference

Core: User, Space, Membership, Curriculum, Objective, Lesson, Project, Resource
Tracking: Activity (append-only), Observation, Note, Feedback, Reflection, Progress
