# RFC: UI/UX Design System

- **Status**: Draft
- **Authors**: Kaustav Das Modak, Claude
- **Created**: 2025-02-05
- **Depends on**: [RFC 0001: POC Scope](../0001-poc-scope.md)

## Summary

Defines the design principles, interaction patterns, and component architecture for Prolly's user interface. Emphasizes keyboard-first interaction, combinatorial commands, and minimalist aesthetics.

## Design Principles

### 1. Keyboard-First

Every action reachable via keyboard. Mouse/touch supported but not required.

### 2. Combinatorial Interfaces

Commands compose like vim: modifiers + actions = behavior. Build complex operations from simple, memorable primitives.

### 3. Minimalist Chrome

Content takes center stage. UI elements appear contextually, not persistently. Reduce visual noise.

### 4. Progressive Disclosure

Start simple, reveal depth on demand. Don't overwhelm new users; don't constrain power users.

### 5. Pixel-Perfect

Precise spacing, alignment, typography. Consistent visual rhythm across all screen sizes.

### 6. Get Out of the Way

The tool serves learning, not itself. Invisible when working, helpful when needed.

## Interaction Model

### Command System

Central to the UX: a command palette and modal key system.

```mermaid
flowchart LR
    subgraph CommandPalette["Command Palette (⌘K)"]
        Search[Search Input]
        List[Command List]
        Search --> List
    end

    User -->|"⌘K / Ctrl+K"| CommandPalette
    CommandPalette -->|select| Action[Execute Action]
    User -->|"key sequence"| Modal[Modal Keys]
    Modal -->|complete| Action
```

### Key Binding Philosophy

Inspired by vim, adapted for learning context:

| Prefix | Meaning | Examples |
|--------|---------|----------|
| `n` | New / Create | `n o` (new objective), `n l` (new lesson) |
| `g` | Go / Navigate | `g o` (go to objectives), `g h` (go home) |
| `e` | Edit | `e e` (edit current), `e n` (edit name) |
| `d` | Delete | `d d` (delete current) |
| `m` | Mark / Toggle | `m c` (mark complete), `m s` (mark started) |
| `v` | View / Show | `v a` (view activities), `v p` (view progress) |
| `/` | Search | `/` (open search) |
| `?` | Help | `?` (show shortcuts) |

### Modal States

```mermaid
stateDiagram-v2
    [*] --> Normal

    Normal --> New: press 'n'
    New --> Normal: press target (o/l/p)
    New --> Normal: Escape

    Normal --> Go: press 'g'
    Go --> Normal: press destination
    Go --> Normal: Escape

    Normal --> Search: press '/'
    Search --> Normal: Enter/Escape

    Normal --> Edit: press 'i' or Enter
    Edit --> Normal: Escape

    Normal --> Help: press '?'
    Help --> Normal: Escape
```

### Escape Hatch

`Escape` always returns to normal mode. Never trap the user.

### Discoverability

- `?` shows all available commands for current context
- Command palette shows keyboard shortcuts inline
- First-run tutorial introduces key concepts

## Visual Design

### Typography

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
}
```

### Spacing Scale

```css
:root {
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
}
```

### Theming System

The design system supports multiple themes with a semantic token architecture. Themes define color values; components consume semantic tokens.

#### Architecture

```mermaid
flowchart LR
    subgraph Themes["Theme Definitions"]
        Light[Light Theme]
        Dark[Dark Theme]
        Custom[Custom Themes...]
    end

    subgraph Tokens["Semantic Tokens"]
        BG[--bg-*]
        Text[--text-*]
        Border[--border-*]
        Accent[--accent-*]
    end

    subgraph Components["Components"]
        Button[Button]
        Card[Card]
        Input[Input]
    end

    Themes --> Tokens
    Tokens --> Components
```

#### Theme Structure

```typescript
interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    // Surfaces
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;

    // Borders
    borderDefault: string;
    borderStrong: string;

    // Accents
    accentPrimary: string;
    accentSuccess: string;
    accentWarning: string;
    accentError: string;
  };
}
```

#### Default Light Theme

```css
[data-theme="light"] {
  /* Surfaces */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;

  /* Text */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  /* Borders */
  --border-default: #e5e7eb;
  --border-strong: #d1d5db;

  /* Accents */
  --accent-primary: #2563eb;
  --accent-success: #059669;
  --accent-warning: #d97706;
  --accent-error: #dc2626;

  /* Focus */
  --focus-ring: 0 0 0 2px var(--accent-primary);
}
```

#### Default Dark Theme

```css
[data-theme="dark"] {
  /* Surfaces */
  --bg-primary: #0f0f0f;
  --bg-secondary: #171717;
  --bg-tertiary: #262626;

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-tertiary: #737373;

  /* Borders */
  --border-default: #262626;
  --border-strong: #404040;

  /* Accents */
  --accent-primary: #3b82f6;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-error: #ef4444;

  /* Focus */
  --focus-ring: 0 0 0 2px var(--accent-primary);
}
```

#### Theme Selection

```typescript
type ThemePreference = 'light' | 'dark' | 'system';

function applyTheme(preference: ThemePreference) {
  let theme: 'light' | 'dark';

  if (preference === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } else {
    theme = preference;
  }

  document.documentElement.setAttribute('data-theme', theme);
}

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (currentPreference === 'system') {
      applyTheme('system');
    }
  });
```

#### Future: Custom Themes

The architecture supports custom themes by:
1. Defining a new theme object with required color tokens
2. Generating CSS custom properties from the theme
3. Storing user theme preferences in local settings

Custom themes are out of scope for POC but the token-based architecture enables them
```

### Layout

```mermaid
flowchart TB
    subgraph Layout["App Layout"]
        Header["Header (contextual)"]
        subgraph Main["Main Area"]
            Sidebar["Sidebar<br/>(collapsible)"]
            Content["Main Content"]
        end
        CommandBar["Command Bar / Status"]
    end

    Header --> Main
    Main --> CommandBar
    Sidebar --- Content
```

- Sidebar collapses on mobile
- Command bar appears on keyboard activation
- Header minimal or hidden when not needed

## Component Architecture

### Primitive Components

```
Button
├── variant: primary | secondary | ghost | danger
├── size: sm | md | lg
└── disabled, loading states

Input
├── type: text | search | textarea
├── size: sm | md | lg
└── error state, help text

Card
├── variant: default | interactive | selected
└── padding options

Badge
├── variant: default | success | warning | error
└── size: sm | md

Modal
├── size: sm | md | lg | full
└── closeable, escapeable

Dropdown
├── trigger
├── items
└── keyboard navigation
```

### Compound Components

```
CommandPalette
├── SearchInput
├── CommandList
│   └── CommandItem (icon, label, shortcut)
└── keyboard navigation + fuzzy search

ObjectiveCard
├── Status indicator
├── Title
├── Progress
└── Actions (contextual)

ActivityFeed
├── ActivityItem
│   ├── Icon
│   ├── Description
│   └── Timestamp
└── Load more / virtualization

NavigationTree
├── TreeNode (recursive)
│   ├── Expand/collapse
│   ├── Label
│   └── Children
└── keyboard navigation
```

## Responsive Behavior

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

### Adaptations

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Sidebar | Hidden (swipe/button to show) | Collapsible | Persistent |
| Command palette | Full screen | Centered modal | Centered modal |
| Navigation | Bottom bar | Sidebar | Sidebar |
| Lists | Single column | Single column | Multi-column option |

### Touch Considerations

- Minimum touch target: 44x44px
- Swipe gestures for common actions
- Long-press for context menu (mirror right-click)

## Keyboard System Implementation

### Svelte Action for Key Bindings

```typescript
// actions/keymap.ts
type KeyHandler = (event: KeyboardEvent) => void | boolean;

interface Keymap {
  [key: string]: KeyHandler | Keymap;
}

export function keymap(node: HTMLElement, keymap: Keymap) {
  let currentMode: Keymap = keymap;
  let modeStack: Keymap[] = [];

  function handleKeydown(event: KeyboardEvent) {
    const key = normalizeKey(event);
    const handler = currentMode[key];

    if (typeof handler === 'function') {
      const result = handler(event);
      if (result !== false) {
        event.preventDefault();
      }
      // Reset to root after action
      currentMode = keymap;
      modeStack = [];
    } else if (typeof handler === 'object') {
      // Enter sub-mode
      modeStack.push(currentMode);
      currentMode = handler;
      event.preventDefault();
    } else if (key === 'Escape') {
      // Reset to root
      currentMode = keymap;
      modeStack = [];
    }
  }

  node.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    },
    update(newKeymap: Keymap) {
      keymap = newKeymap;
      currentMode = keymap;
      modeStack = [];
    }
  };
}
```

### Command Registry

```typescript
// commands/registry.ts
interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
  when?: () => boolean;  // Contextual availability
}

class CommandRegistry {
  private commands = new Map<string, Command>();

  register(command: Command) {
    this.commands.set(command.id, command);
  }

  execute(id: string) {
    const command = this.commands.get(id);
    if (command && (!command.when || command.when())) {
      command.action();
    }
  }

  getAvailable(): Command[] {
    return Array.from(this.commands.values())
      .filter(cmd => !cmd.when || cmd.when());
  }

  search(query: string): Command[] {
    const available = this.getAvailable();
    return fuzzyMatch(available, query, cmd => cmd.label);
  }
}
```

## Accessibility

### Requirements

- WCAG 2.1 AA compliance minimum
- All interactive elements focusable
- Visible focus indicators
- Screen reader support for dynamic content
- Reduced motion support

### Implementation

```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Visible focus */
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

```svelte
<!-- Announce dynamic changes -->
<div aria-live="polite" class="sr-only">
  {announcements}
</div>
```

## Animation Principles

1. **Purposeful**: Animation conveys meaning, not decoration
2. **Fast**: 150-200ms for micro-interactions, 300ms max for transitions
3. **Subtle**: Ease-out for entering, ease-in for exiting
4. **Skippable**: Respect `prefers-reduced-motion`

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Alternatives & Tradeoffs

### Keyboard System

| Approach | Pros | Cons |
|----------|------|------|
| **Vim-like modal** (chosen) | Powerful, composable, memorable | Learning curve, conflicts with text input |
| Single-key shortcuts | Simpler, immediate | Limited namespace, many modifier keys |
| Command palette only | Discoverable, searchable | Slower for power users |
| Emacs-style chords | Powerful | Finger gymnastics, harder to remember |

**Rationale**: Vim-like modals provide composability without requiring modifier keys. The learning curve is acceptable for a power-user-oriented tool.

### Styling Approach

| Approach | Pros | Cons |
|----------|------|------|
| **CSS custom properties** (chosen) | Native, no build step, themeable | Verbose, no nesting |
| Tailwind CSS | Rapid prototyping, consistent | Large class strings, build dependency |
| CSS-in-JS (styled-components) | Scoped, dynamic | Runtime cost, bundle size |
| Sass/SCSS | Powerful, familiar | Build step, less native |

**Rationale**: CSS custom properties are sufficient for our needs, work without build tools, and integrate naturally with theming.

### Component Library

| Approach | Pros | Cons |
|----------|------|------|
| **Custom components** (chosen) | Full control, minimal bundle, matches design | More work upfront |
| Radix + custom styling | Accessible primitives, unstyled | Additional dependency |
| shadcn/ui (Svelte port) | Pre-built, customizable | React-first ecosystem |
| Skeleton UI | Svelte-native, themed | Opinionated styling |

**Rationale**: Build custom components for full control over behavior and styling. May adopt Radix primitives for complex accessibility needs (modals, dropdowns).

### Icon Set

| Option | Pros | Cons |
|--------|------|------|
| Lucide | Consistent, large set, tree-shakeable | Another dependency |
| Heroicons | Clean, two styles (outline/solid) | Smaller set |
| Custom SVGs | Full control, no dependency | Design effort |
| Iconify | Huge selection, unified API | Runtime fetching or large bundle |

**Decision pending**: Evaluate Lucide vs Heroicons based on coverage of needed icons.

### Animation Library

| Approach | Pros | Cons |
|----------|------|------|
| **CSS transitions** (chosen) | Native, performant, simple | Limited orchestration |
| Svelte transitions | Built-in, declarative | Svelte-specific |
| Motion One | Small, performant | Another dependency |
| Framer Motion | Powerful | React-only |

**Rationale**: Start with CSS transitions and Svelte's built-in transitions. Add Motion One only if complex orchestration is needed.

## Open Questions

1. Icon set: Lucide, Heroicons, or custom?
2. Should we support user-customizable key bindings?
3. How to handle keyboard conflicts with browser/OS shortcuts?
4. Rich text editing approach for lesson content?

## References

- [Vim Cheat Sheet](https://vim.rtorr.com/)
- [Linear's Keyboard-First Design](https://linear.app/docs/keyboard-shortcuts)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
