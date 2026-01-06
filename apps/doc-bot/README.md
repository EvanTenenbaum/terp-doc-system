# Doc Bot

Playwright-based documentation automation for TERP. This application captures browser interactions and generates step-by-step guides with screenshots.

## Overview

Doc Bot automates the creation of user documentation by:

1. Navigating through TERP workflows using Playwright
2. Capturing screenshots at each step
3. Generating structured JSON guides
4. Storing guides for consumption by the Companion UI

## Directory Structure

```
apps/doc-bot/
├── src/
│   ├── config/      # Configuration and environment handling
│   ├── flows/       # Playwright test files that capture workflows
│   ├── runner/      # CLI entry points (run, seed, report)
│   ├── capture/     # Screenshot capture utilities
│   ├── guidegen/    # Guide generation and storage
│   └── storage/     # Persistent state management
├── playwright.config.ts
├── package.json
└── README.md
```

## Quick Start

```bash
# Install dependencies (from repo root)
pnpm install

# Install Playwright browsers
pnpm --filter doc-bot exec playwright install chromium

# Run smoke test (no credentials needed)
pnpm --filter doc-bot test:smoke

# Seed sample guides
pnpm docs:seed

# Run interactive mode
pnpm dev:doc-bot
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TERP_BASE_URL` | Yes | Base URL of TERP instance |
| `TERP_DOCBOT_EMAIL` | For auth | Email for doc-bot user |
| `TERP_DOCBOT_PASSWORD` | For auth | Password for doc-bot user |
| `DEV_DOCS_ENDPOINTS_SECRET` | Optional | Secret for dev endpoints |
| `DOCS_OUTPUT_DIR` | Optional | Custom output directory |

## Creating New Flows

1. Create a new file in `src/flows/` with the `.flow.ts` extension
2. Use the example flow as a template
3. Capture screenshots using the `capture` module
4. Generate guides using the `guidegen` module

Example:

```typescript
import { test } from '@playwright/test';
import { captureScreenshot } from '../capture/index.js';
import { generateGuide, saveGuide } from '../guidegen/index.js';

test('my workflow', async ({ page }) => {
  await page.goto('/my-page');
  
  const screenshot = await captureScreenshot(page, {
    name: 'my-step',
  });
  
  const guide = await generateGuide({
    id: 'my-guide',
    title: 'My Guide',
    description: 'How to do something',
    category: 'My Category',
    steps: [{ title: 'Step 1', description: 'Do this', screenshotPath: screenshot.path }],
  });
  
  await saveGuide(guide);
});
```

## Running Tests

```bash
# Run all tests
pnpm --filter doc-bot test

# Run smoke tests only
pnpm --filter doc-bot test:smoke

# Run with UI
pnpm --filter doc-bot exec playwright test --ui
```

## Authentication

Doc Bot uses Playwright's `storageState` for persistent authentication:

1. Set `TERP_DOCBOT_EMAIL` and `TERP_DOCBOT_PASSWORD` in `.env`
2. Run the auth setup: `pnpm --filter doc-bot exec playwright test --project=setup`
3. Auth state is saved to `storage-state/auth.json`
4. Subsequent runs reuse the saved state

## Output

Generated guides are saved to `DOCS_OUTPUT_DIR` (default: `./guides-output/`) as JSON files. Screenshots are saved to `./screenshots/`.

## Troubleshooting

**Browser not launching**: Run `pnpm --filter doc-bot exec playwright install chromium`

**Auth failing**: Delete `storage-state/auth.json` and re-run auth setup

**Screenshots not saving**: Check that `DOCS_OUTPUT_DIR` is writable
