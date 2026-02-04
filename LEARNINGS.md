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
- **Activities** are append-only log (events); **Progress** is persisted state (can reconcile later)
- **Refs pattern** (`refs: { objectiveId?, lessonId?, ... }`) for polymorphic references
- Two Dexie databases: main (syncable) and local-only (settings, UI state)
- Renamed "Retrospective" → "Reflection" for clarity

## User Model

- Single user can be both learner and educator/facilitator
- **Space** is the context boundary (personal, class, cohort, project)
- **Membership** links User to Space with roles—RBAC attachment point
- Start single-player; multi-player/collaboration comes later

## UX Principles

- **Keyboard-first**: vim-like modal keys (`n o` = new objective, `g h` = go home)
- **Command palette** (`Cmd+K`) for discoverability
- **Escape** always returns to normal mode—never trap the user
- Minimalist chrome; content takes center stage
- Theming: token-based architecture, default light + dark themes

## RFC Process

- Drafts go in `rfc/drafts/` with title only (no sequence number)
- Sequence number assigned on acceptance, file moves to `rfc/`
- Each RFC should have: Summary, Motivation, Specification, Alternatives & Tradeoffs, Open Questions

## POC Scope

In scope: local storage, PWA, personal space, curriculum/objective/lesson/project CRUD, activities, observations, notes, reflections, progress tracking, keyboard navigation, command palette, responsive design, dark mode

Out of scope: auth, cloud sync, multi-device, collaboration, public profiles

## Tech Stack Summary

| Layer | Choice |
|-------|--------|
| Frontend | Svelte 5 + SvelteKit |
| Local storage | Dexie (IndexedDB) |
| PWA | vite-plugin-pwa |
| Backend | Go 1.25+ modular monolith |
| Sync (future) | Custom over WebSocket, possibly WebRTC DataChannel |
