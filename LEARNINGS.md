# Learnings

Compressed insights from project planning sessions.

## Architecture Decisions

- **Local-first PWA** chosen over server-first for offline reliability in learning contexts
- **Svelte 5** for small bundles and runes reactivity; PWA bundle size matters
- **Dexie** over PouchDB—we want custom sync, not CouchDB replication
- **Go modular monolith** for backend—intentionally simple, single binary, split later if needed
- **UUIDv7** for IDs—time-sortable, offline-friendly, no coordination needed

## Data Model

- Documents with ID references, not normalized tables—maps well to IndexedDB
- **Activities** are append-only with versioning via `parentId`—edits create new versions, preserves audit trail
- **Progress** is persisted state (not derived)—Activities serve as audit log
- **Refs pattern** (`refs: { objectiveId?, lessonId?, ... }`) for polymorphic references
- Two Dexie databases: main (syncable) and local-only (settings, UI state)
- All mutable entities have `version: number` and `deletedAt?: string` for sync-readiness
- Soft deletes everywhere (except Activity)—required for future sync
- **DAG validation required** for Objective prerequisites—cycle detection mandatory
- Renamed "Retrospective" → "Reflection" for clarity
- Lesson has optional `curriculumId` for sequencing; can exist standalone or in curriculum

## User Model

- Single user can be both learner and educator/facilitator
- **Space** is the context boundary (personal, class, cohort, project)
- **Membership** links User to Space with roles—RBAC attachment point
- Start single-player; multi-player/collaboration comes later

## UX Principles

- **Keyboard-first**: vim-like modal keys (`n o` = new objective, `g h` = go home)
- **Focus mode rules**: Modal keys only active when no text input focused; prevents conflicts
- **Command palette** (`Cmd+K`) for discoverability—always available even in inputs
- **Escape** always returns to normal mode—never trap the user
- Minimalist chrome; content takes center stage
- Theming: token-based architecture, default light + dark themes
- **Component build order** follows milestones: primitives (M2) → entity cards (M3) → tracking (M4) → views (M5) → polish (M6)

## RFC Process

- Drafts go in `rfc/drafts/` with title only (no sequence number)
- Sequence number assigned on acceptance, file moves to `rfc/`
- Each RFC should have: Summary, Motivation, Specification, Alternatives & Tradeoffs, Open Questions

## POC Scope

In scope: local storage, PWA, personal space, curriculum/objective/lesson/project CRUD, activities, observations, notes, reflections, progress tracking, keyboard navigation, command palette, responsive design, dark mode

Out of scope: auth, cloud sync, multi-device, collaboration, public profiles

## Storage Patterns

- Name blob interface `StoredBlob` to avoid conflict with native `Blob`
- Blobs use `refCount` for garbage collection; `releaseBlob()` decrements, cleanup removes orphans
- `computeChecksum()` uses Web Crypto API `crypto.subtle.digest('SHA-256', buffer)`
- Always `URL.revokeObjectURL()` after using blob URLs—prevents memory leaks
- Wrap DB operations in `safeDbOperation()` for consistent error handling
- Define transaction boundaries explicitly—curriculum+objectives creation must be atomic
- Export format: `ProllyExport` interface with base64-encoded blobs for portability

## Implementation Patterns

- TypeScript interfaces are source of truth; Go structs mirror with `json` tags
- Conflict resolution by entity type: LWW for most, server-authoritative for Progress/DAG integrity
- `normalizeKey()` converts KeyboardEvent to string like `'Mod+k'` (Mod = Cmd/Ctrl)
- Global `keyboardStore` exposes mode to UI; `keymap` action writes to it
- Command registry: `async execute()` with try/catch, `onError` handlers for toast notifications
- **Svelte action keymap must listen on `window`**—divs are not focusable by default; `node.addEventListener` won't receive events
- **Svelte 5 `bind:this` requires `$state`**—use `let ref = $state<HTMLElement | null>(null)` for element refs
- **A11y for modal backdrops**: `role="presentation"` backdrops can use `svelte-ignore a11y_click_events_have_key_events`
- **A11y for dialogs**: Elements with `role="dialog"` must have `tabindex="-1"` for focus management

## Tech Stack Summary

| Layer | Choice |
|-------|--------|
| Frontend | Svelte 5 + SvelteKit |
| Local storage | Dexie (IndexedDB) |
| PWA | vite-plugin-pwa |
| Backend | Go 1.25+ modular monolith |
| Sync (future) | Custom over WebSocket, possibly WebRTC DataChannel |
