# Claude Context

Quick reference for continuing development on Prolly.

## First Steps

1. Read `LEARNINGS.md` for compressed decisions and rationale
2. Read `rfc/0001-poc-scope.md` for milestones and scope
3. Check `README.md` in any directory for local context

## Project Structure

```
prolly/
├── app/                          # Svelte 5 PWA
│   └── src/lib/
│       ├── components/           # UI components (forms/, ui/)
│       ├── services/             # CRUD operations, validation
│       ├── stores/               # Svelte 5 rune stores
│       ├── commands/             # Command registry, keyboard
│       ├── actions/              # Svelte actions (keymap)
│       ├── db/                   # Dexie database setup
│       └── models/               # TypeScript interfaces
├── services/                     # Go backend (future)
├── rfc/                          # Design documents
└── docs/                         # Additional documentation
```

## Current State

- **M1: Foundation** - Complete (SvelteKit, Dexie, PWA, models)
- **M2: Command System** - Complete (keyboard nav, command palette, help)
- **M3: Core Entities** - In Progress (Phase 1 complete: services, forms, UI components)
- **Next**: M3 Phase 2 - Curriculum/Objective/Lesson/Project CRUD pages

## Key Patterns

- **Services**: `app/src/lib/services/` - CRUD with `ServiceResult<T>`, validation before DB ops
- **Forms**: `app/src/lib/components/forms/` - FormField, TextInput, TextArea, Select
- **UI**: `app/src/lib/components/ui/` - Button, Modal, ConfirmDialog, EmptyState, LoadingState
- **Toast**: `toastStore.success()`, `.error()`, `.warning()`, `.info()`
- **Commands**: `commandRegistry.register()`, keymap action with vim-like modal keys

## Conventions

- Node 24+ LTS, Go 1.25+
- Mermaid for diagrams
- RFCs: drafts in `rfc/drafts/`, accepted in `rfc/` (numbered)
- Dual license: MIT + Apache-2.0
- Make small signed commits, update LEARNINGS.md after significant work

## Entity Quick Reference

Core: User, Space, Membership, Curriculum, Objective, Lesson, Project, Resource
Tracking: Activity (append-only), Observation, Note, Feedback, Reflection, Progress
