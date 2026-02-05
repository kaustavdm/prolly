# Learnings

Compressed insights from project planning sessions.

## Architecture Decisions

- **Local-first PWA** for offline reliability; **Svelte 5** for small bundles + runes; **Dexie** for custom sync
- **Go modular monolith** backend—single binary, split later if needed
- **UUIDv7** for IDs—time-sortable, offline-friendly, no coordination
- **Single-user by default**—no login required; `DEFAULT_USER_ID` constant + `getOrCreateDefault()` for implicit user

## Data Model

- Documents with ID refs, not normalized tables—maps to IndexedDB
- **Activities** append-only with `parentId` versioning; **Progress** is persisted state, Activities are audit log
- **Refs pattern** (`refs: { objectiveId?, lessonId?, ... }`) for polymorphic references
- Two Dexie DBs: main (syncable) + local-only (settings, UI state)
- Soft deletes everywhere (except Activity); `version: number` + `deletedAt?: string` for sync-readiness
- **DAG validation** for Objective prerequisites—cycle detection mandatory

## User & Space Model

- Single user can be learner and educator; **Space** is context boundary (personal, class, project)
- **Membership** links User to Space with roles—RBAC attachment point
- Start single-player; multi-player comes later

## UX Principles

- **Keyboard-first**: vim-like modal keys (`n o` = new objective, `g h` = go home)
- Modal keys only active when no text input focused; **Escape** always returns to normal mode
- **Command palette** (`Cmd+K`) always available; minimalist chrome, content-first

## Workflow

- **Signed commits required**; small commits—one logical change per commit
- **RFC process**: drafts in `rfc/drafts/`, accepted in `rfc/` (numbered)

## POC Scope

**In**: local storage, PWA, personal space, CRUD for all entities, activities, tracking, keyboard nav, command palette, responsive, dark mode  
**Out**: auth, cloud sync, multi-device, collaboration, public profiles

## Service Layer

- **ServiceResult<T>**: `{ success, data?, error? }` with `ok()/err()` helpers
- Validation in `services/validation/`; composable validators (`required`, `maxLength`, `validateUrl`)
- Timestamp helpers: `createTimestamp()`, `updateTimestamp()`, `softDeleteFields()`
- Version increment on every write; cascading deletes in transactions
- **UserService single-user pattern**: `DEFAULT_USER_ID` + `getOrCreateDefault()` for login-free local experience

## Component Patterns

- **Form components**: `$bindable()` for values, Snippet for children; **FormField** wraps any input
- **Button/LinkButton**: Button for actions, LinkButton for navigation—avoids inline .btn styles
- **Card components**: CurriculumCard, ObjectiveCard, LessonCard, ProjectCard for entity lists
- **EmptyState** for empty lists; **Toast** via Svelte 5 runes store
- **Modal/ConfirmDialog**: ConfirmDialog wraps Modal; animation via CSS `@keyframes`

## Implementation Patterns

- TypeScript interfaces are source of truth; `normalizeKey()` for keyboard events (`'Mod+k'`)
- Keymap action listens on `window`—divs aren't focusable; KeyHandler accepts Promise
- `$state` for `bind:this` refs; A11y: `role="presentation"` for backdrops, `tabindex="-1"` for dialogs
- **liveQuery subscriptions** for reactive dashboard data

## Dependency Management

- Pin major versions during active development; `@types/node` must match Node.js major
- Security updates via patch/minor; defer major bumps to polish phase
- **`vite-plugin-pwa` 1.x**: Breaking config changes—test thoroughly before upgrading

## Tech Stack Summary

| Layer | Choice |
|-------|--------|
| Frontend | Svelte 5 + SvelteKit |
| Local storage | Dexie (IndexedDB) |
| PWA | vite-plugin-pwa |
| Backend | Go 1.25+ modular monolith |
| Sync (future) | Custom over WebSocket, possibly WebRTC DataChannel |
