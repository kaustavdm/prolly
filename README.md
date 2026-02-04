# Prolly

Learner and educator tool — from curriculum alignment, objective tracking, lesson/project planning to producing proof of learning.

## Vision

Bring the devtools ethos to learning. Whether you're an individual learner, a parent facilitating homeschool, or an educator in a classroom, Prolly helps you plan, track, and demonstrate learning progress.

## Architecture

- **Frontend**: Local-first PWA built with Svelte 5. All user data stored on-device via IndexedDB (Dexie). Offline-capable from day one.
- **Backend**: Go modular monolith providing sync, cloud storage, public profiles, and collaboration features (future).
- **Data Model**: Documents, events, and relations. Activities form an append-only log. Proof of learning emerges from the traversable graph of relations.

## Priorities

1. **Local-first POC**: Single-user, fully offline PWA with all core entities
2. **Keyboard-driven UX**: Combinatorial interfaces, command palette, vim-like composability
3. **Minimalist design**: Pixel-perfect, stays out of the way
4. **Cloud sync**: Optional sign-in for sync and backup (future)
5. **Collaboration**: Multi-user spaces, roles, shared curricula (future)

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Space** | Context boundary — personal workspace, class, cohort, or project group |
| **Curriculum** | Structured learning path containing objectives |
| **Objective** | Discrete learning goal, can have prerequisites (forms a DAG) |
| **Lesson** | Unit of instruction addressing objectives |
| **Project** | Larger body of work with milestones |
| **Activity** | Event in the learning process — the append-only log |
| **Observation** | Notes on progress — self, peer, or learner |
| **Reflection** | Periodic reflection with templated questions |

## User Model

- A **User** can be both a learner and an educator/facilitator
- Users join **Spaces** via **Membership** with assigned roles
- Roles (learner, educator, mentor) determine permissions within a space
- Single-player first, multi-player later

## Project Structure

```
prolly/
├── app/                  # Svelte 5 PWA
├── services/             # Go modular monolith
├── rfc/                  # Design documents
└── docs/                 # Additional documentation
```

## Documentation

Design decisions and specifications are documented as RFCs in the `rfc/` directory. Each RFC is numbered for sorting (e.g., `0001-poc-scope.md`).

## Development

### Prerequisites

- Node.js 24+ (LTS)
- Go 1.25+
- pnpm (recommended)

### Getting Started

```bash
# Frontend (not yet scaffolded)
cd app
pnpm install
pnpm dev

# Backend (not yet scaffolded)
cd services
go run ./cmd/prolly
```

## License

Dual-licensed under MIT and Apache-2.0. You may choose either license.
