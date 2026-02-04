# RFC: Project Architecture

- **Status**: Draft
- **Authors**: Kaustav Das Modak, Claude
- **Created**: 2025-02-05
- **Depends on**: [RFC 0001: POC Scope](../0001-poc-scope.md)

## Summary

Prolly is a learning tool built as a local-first PWA with an optional cloud backend. This RFC defines the high-level architecture and guiding principles.

## Motivation

Learners and educators need tools that work reliably regardless of connectivity. By building local-first, we ensure the core experience is always available. Cloud features enhance but don't gate the experience.

## Architecture Overview

```mermaid
graph TB
    subgraph Device["User Device"]
        subgraph PWA["Svelte 5 PWA"]
            UI[UI Layer]
            Stores[Svelte Stores]
            Commands[Command System]

            UI --> Stores
            Commands --> Stores
            Stores --> Dexie

            subgraph Dexie["Dexie (IndexedDB)"]
                Docs[Documents]
                Blobs[Blobs]
            end
        end
    end

    Dexie -.->|future: sync| Cloud

    subgraph Cloud["Cloud Services (Go)"]
        API[API Server<br/>REST/WS]
        Sync[Sync Service]
        Storage[Storage]
    end
```

## Frontend: Svelte 5 PWA

### Technology Choices

- **Svelte 5**: Runes for reactivity, compiled output, small bundle size
- **SvelteKit**: File-based routing, SSR capability (though we'll primarily use SPA mode)
- **Dexie**: IndexedDB wrapper for local storage
- **Service Worker**: Offline capability via Vite PWA plugin or custom

### Principles

1. **Offline-first**: All features work without network
2. **Local data ownership**: User data lives on their device by default
3. **Progressive enhancement**: Cloud features layer on top

### Storage Strategy

- **Dexie tables**: Structured data (entities, relations)
- **Dexie blobs**: Rich media (images, files, attachments)
- **Separate local-only store**: Device settings, UI preferences

## Backend: Go Modular Monolith

### Technology Choices

- **Go 1.25+**: Single binary deployment, strong stdlib
- **Modular monolith**: Services as internal packages, can split later if needed
- **NATS**: Optional message bus for inter-service communication (future)

### Service Modules

| Module | Responsibility |
|--------|----------------|
| `api` | REST endpoints, WebSocket connections |
| `sync` | Client-server sync protocol |
| `storage` | Cloud persistence, file storage |
| `auth` | Authentication, sessions |
| `public` | Public profiles, shared projects |

### Design Principles

1. **Intentionally simple**: Avoid premature abstraction
2. **Single binary**: All modules compile to one executable
3. **Run modes**: Can run all services or specific modules via flags

```bash
# Run everything
prolly serve

# Run only API server
prolly serve --modules=api

# Run sync service standalone
prolly serve --modules=sync
```

## Sync Architecture (Future)

### Approach

Custom sync service over CRDTs (not PouchDB). Options being considered:

1. **Event-based sync**: Client sends activity events, server reconciles
2. **WebSocket**: Real-time bidirectional sync
3. **WebRTC DataChannel**: Peer-to-peer option via Pion

### Sync Flow

```mermaid
sequenceDiagram
    participant Client
    participant SyncService
    participant Storage

    Client->>Client: Make changes locally
    Client->>Client: Queue in sync queue

    alt Online
        Client->>SyncService: Push queued changes
        SyncService->>SyncService: Resolve conflicts
        SyncService->>Storage: Persist
        SyncService->>Client: Acknowledge + remote changes
        Client->>Client: Apply remote changes
    end
```

### Conflict Resolution

To be determined based on POC learnings. Likely a combination of:
- Last-write-wins for simple fields
- CRDTs for collaborative text
- Server-authoritative for specific operations

## Monorepo Structure

```
prolly/
├── app/                      # Svelte 5 PWA
│   ├── src/
│   │   ├── lib/
│   │   │   ├── db/           # Dexie setup
│   │   │   ├── models/       # TypeScript types
│   │   │   ├── stores/       # Svelte stores
│   │   │   ├── components/   # UI components
│   │   │   ├── actions/      # Svelte actions
│   │   │   └── commands/     # Command system
│   │   └── routes/           # SvelteKit pages
│   ├── static/
│   └── package.json
│
├── services/                 # Go backend
│   ├── cmd/prolly/           # Main entry point
│   ├── internal/
│   │   ├── models/           # Domain models
│   │   ├── api/              # HTTP handlers
│   │   ├── sync/             # Sync logic
│   │   └── storage/          # Persistence
│   └── go.mod
│
├── rfc/                      # Design documents
└── docs/                     # Additional docs
```

## Security Considerations

- All data encrypted at rest in cloud storage
- End-to-end encryption for sensitive data (future)
- Auth via standard OAuth2/OIDC providers
- No tracking, minimal telemetry (opt-in only)

## Alternatives & Tradeoffs

### Frontend Framework

| Option | Pros | Cons |
|--------|------|------|
| **Svelte 5** (chosen) | Compiled (small bundles), runes are intuitive, less boilerplate | Smaller ecosystem, fewer devs familiar |
| React | Large ecosystem, many devs know it, extensive tooling | Runtime overhead, more boilerplate, larger bundles |
| Vue 3 | Good balance, Composition API | Smaller ecosystem than React, two API styles |
| SolidJS | Fine-grained reactivity, small bundles | Smallest ecosystem, JSX required |

**Rationale**: PWA bundle size matters for offline caching. Svelte 5's compiled output and runes provide excellent DX with minimal runtime overhead.

### Backend Language

| Option | Pros | Cons |
|--------|------|------|
| **Go** (chosen) | Single binary, strong stdlib, excellent concurrency, fast compilation | Verbose error handling, no generics until recently |
| Rust | Maximum performance, memory safety | Steep learning curve, slower compilation |
| Node.js/TypeScript | Shared language with frontend, large ecosystem | Runtime overhead, dependency management |
| Elixir | Excellent concurrency, fault tolerance | Smaller ecosystem, different paradigm |

**Rationale**: Go's single binary deployment, strong standard library, and built-in concurrency make it ideal for a modular monolith that may later split.

### Backend Architecture

| Option | Pros | Cons |
|--------|------|------|
| **Modular monolith** (chosen) | Simple deployment, easy refactoring, shared memory | Must be careful about module boundaries |
| Microservices | Independent scaling, technology flexibility | Operational complexity, network overhead |
| Serverless | No server management, auto-scaling | Cold starts, vendor lock-in, state management |

**Rationale**: Start simple. Modular monolith with clear boundaries can be split later if needed.

### Sync Transport

| Option | Pros | Cons |
|--------|------|------|
| **WebSocket** (likely) | Bidirectional, widely supported, simple | Requires persistent connection |
| WebRTC DataChannel | P2P possible, lower latency | Complex NAT traversal, browser-only |
| Server-Sent Events + HTTP | Simple, works through proxies | Unidirectional, separate upload path |
| HTTP polling | Simplest, works everywhere | Latency, server load |

**Rationale**: WebSocket is the likely choice for balance of simplicity and capability. WebRTC DataChannel remains an option for P2P scenarios.

### Deployment Model

| Option | Pros | Cons |
|--------|------|------|
| **Separate frontend/backend** | Independent scaling, CDN for frontend | Two deployments to manage |
| Backend serves frontend | Single deployment, simpler CORS | Couples deployments, less CDN flexibility |
| Edge functions | Low latency, global | Limited runtime, vendor-specific |

**Rationale**: Decision deferred. For POC, frontend is purely static (PWA). Production deployment can be decided based on needs.

## Open Questions

1. Should the Go backend serve the frontend, or deploy separately?
2. WebRTC DataChannel for sync—worth the complexity?
3. Schema versioning strategy for Dexie migrations?

## References

- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [Svelte 5 Runes](https://svelte.dev/blog/runes)
- [Dexie.js](https://dexie.org/)
