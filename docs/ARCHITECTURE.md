# Architecture Overview

This document describes the architecture of the TERP Doc System.

## System Components

The system consists of two main applications and shared packages:

### doc-bot

The documentation automation engine built with Playwright. It navigates through TERP workflows, captures screenshots, and generates structured guides.

**Key responsibilities:**
- Browser automation via Playwright
- Screenshot capture at each workflow step
- Guide generation in JSON format
- Persistent authentication management

**Technology stack:**
- Node.js + TypeScript
- Playwright for browser automation
- File-based storage for guides

### companion

A lightweight Next.js application that serves as the user-facing documentation viewer.

**Key responsibilities:**
- Load and display generated guides
- Keyword-based search functionality
- Step-by-step guide rendering with screenshots

**Technology stack:**
- Next.js 14 (App Router)
- React 18
- File-based guide loading

### shared packages

Minimal shared code to ensure consistency between apps:

- **guide-schema**: TypeScript type definitions for guides
- **types**: Aggregated type exports
- **utils**: Common utilities (use sparingly)

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    TERP     │────▶│   doc-bot    │────▶│   Guides    │
│  Instance   │     │  (Playwright)│     │   (JSON)    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  companion  │
                                         │  (Next.js)  │
                                         └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │    Users    │
                                         └─────────────┘
```

## Directory Structure

```
terp-doc-system/
├── apps/
│   ├── doc-bot/           # Playwright automation
│   │   ├── src/
│   │   │   ├── config/    # Environment configuration
│   │   │   ├── flows/     # Playwright test files
│   │   │   ├── runner/    # CLI entry points
│   │   │   ├── capture/   # Screenshot utilities
│   │   │   ├── guidegen/  # Guide generation
│   │   │   └── storage/   # State management
│   │   └── playwright.config.ts
│   │
│   └── companion/         # Next.js UI
│       ├── app/           # App Router pages
│       ├── components/    # React components
│       ├── lib/           # Utilities
│       └── guides/        # Sample guides
│
├── shared/
│   ├── guide-schema/      # Type definitions
│   ├── types/             # Type aggregation
│   └── utils/             # Common utilities
│
├── docs/                  # System documentation
└── .github/workflows/     # CI configuration
```

## Design Decisions

### Why pnpm workspaces?

We chose pnpm workspaces for the monorepo structure because:

1. **Simplicity**: Minimal configuration required
2. **Performance**: Content-addressable storage is fast
3. **Strictness**: Prevents phantom dependencies
4. **No overhead**: No additional tooling (Nx, Turbo) needed

### Why file-based guide storage?

Guides are stored as JSON files rather than a database because:

1. **Simplicity**: No database setup required
2. **Portability**: Guides can be versioned in git
3. **Transparency**: Easy to inspect and debug
4. **Flexibility**: Can be migrated to a database later if needed

### Why separate apps in one repo?

Both apps live in one repository because:

1. **Access control**: Some engineers may only have access to this repo
2. **Shared types**: Ensures type consistency between producer and consumer
3. **Simplified deployment**: Single CI/CD pipeline
4. **Clear boundaries**: Monorepo structure maintains separation of concerns
