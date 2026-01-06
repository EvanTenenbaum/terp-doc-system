# TERP Doc System

A monorepo containing two applications for TERP documentation automation:

1. **doc-bot** — Playwright-based automation that captures screenshots and generates step-by-step guides from TERP workflows
2. **companion** — A lightweight Next.js UI for searching and viewing generated guides

## What This Repo Is

This repository provides documentation tooling for TERP. It automates the creation of user guides by recording browser interactions and generates a searchable interface for those guides.

## What This Repo Is NOT

This is **not** the TERP application itself. This repo:

- Does not contain TERP runtime code
- Does not modify TERP functionality
- Does not require TERP source code access
- Only interacts with TERP as an external user would (via browser automation)

## Architecture Overview

```
terp-doc-system/
├── apps/
│   ├── doc-bot/           # Playwright automation + guide generator
│   └── companion/         # Guide viewer UI (Next.js)
├── shared/
│   ├── types/             # Shared TypeScript types
│   ├── guide-schema/      # Guide data structure definitions
│   └── utils/             # Shared utilities (minimal)
├── docs/                  # System documentation
└── .github/workflows/     # CI configuration
```

### How doc-bot and companion Relate

| Component | Purpose | Input | Output |
|-----------|---------|-------|--------|
| **doc-bot** | Captures TERP workflows | TERP credentials + flow definitions | JSON guides + screenshots |
| **companion** | Displays guides to users | Generated guides directory | Searchable web UI |

The data flow is unidirectional: `doc-bot` produces guides → `companion` consumes them.

## Why pnpm Workspaces?

We chose **pnpm workspaces** over npm workspaces or heavier tools (Nx, Turbo) because:

- Faster installation with content-addressable storage
- Strict dependency isolation prevents phantom dependencies
- Simple configuration (just `pnpm-workspace.yaml`)
- No additional tooling overhead

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Installation

```bash
# Install pnpm if needed
npm install -g pnpm

# Install all dependencies
pnpm install

# Install Playwright browsers (for doc-bot)
pnpm --filter doc-bot exec playwright install chromium
```

### Running the Applications

```bash
# Run doc-bot in development mode
pnpm dev:doc-bot

# Run companion UI in development mode
pnpm dev:companion

# Run documentation generation
pnpm docs:run

# Seed sample guides (for testing companion)
pnpm docs:seed

# Generate documentation report
pnpm docs:report
```

### Building

```bash
# Build all packages
pnpm build

# Build specific app
pnpm build:doc-bot
pnpm build:companion
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required By | Description |
|----------|-------------|-------------|
| `TERP_BASE_URL` | doc-bot | Base URL of TERP instance |
| `TERP_DOCBOT_EMAIL` | doc-bot | Email for doc-bot authentication |
| `TERP_DOCBOT_PASSWORD` | doc-bot | Password for doc-bot authentication |
| `DEV_DOCS_ENDPOINTS_SECRET` | doc-bot | Secret for dev documentation endpoints |
| `DOCS_OUTPUT_DIR` | doc-bot | Directory for generated guides |
| `GUIDES_DIR` | companion | Directory to read guides from |

See `.env.example` for detailed documentation.

## Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Monorepo structure | ✅ Ready | pnpm workspaces configured |
| doc-bot scaffold | ✅ Ready | Playwright configured, smoke test included |
| companion scaffold | ✅ Ready | Next.js with guide loader |
| Shared types | ✅ Ready | Guide schema defined |
| CI pipeline | ✅ Ready | Typecheck + build verification |
| Guide generation | 🔲 Stubbed | Flow implementations needed |
| Production auth | 🔲 Stubbed | Requires TERP credentials |

## Next Steps for Implementation

1. **doc-bot flows**: Implement actual TERP workflow captures in `apps/doc-bot/src/flows/`
2. **Guide templates**: Customize guide output format in `apps/doc-bot/src/guidegen/`
3. **Companion styling**: Enhance UI/UX in `apps/companion/`
4. **Authentication**: Configure persistent auth with real TERP credentials

## License

MIT
