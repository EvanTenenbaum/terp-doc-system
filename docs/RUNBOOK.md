# Runbook

This document provides step-by-step instructions for common operations.

## Initial Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/EvanTenenbaum/terp-doc-system.git
cd terp-doc-system

# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Install Playwright browsers
pnpm --filter doc-bot exec playwright install chromium

# Copy environment configuration
cp .env.example .env
# Edit .env with your values
```

## Running the Applications

### Start Companion UI (Development)

```bash
pnpm dev:companion
```

The UI will be available at http://localhost:3000

### Start Doc Bot (Interactive)

```bash
pnpm dev:doc-bot
```

This launches a browser for interactive testing.

### Generate Documentation

```bash
# Run all documentation flows
pnpm docs:run

# Seed sample guides (for testing)
pnpm docs:seed

# Generate status report
pnpm docs:report
```

## Creating New Documentation Flows

1. Create a new file in `apps/doc-bot/src/flows/` with `.flow.ts` extension
2. Use the example flow as a template
3. Run the flow: `pnpm --filter doc-bot exec playwright test --grep "your flow name"`

Example flow structure:

```typescript
import { test } from '@playwright/test';
import { captureScreenshot } from '../capture/index.js';
import { generateGuide, saveGuide } from '../guidegen/index.js';

test('my workflow', async ({ page }) => {
  // Navigate and capture
  await page.goto('/my-page');
  const screenshot = await captureScreenshot(page, { name: 'step-1' });
  
  // Generate and save guide
  const guide = await generateGuide({
    id: 'my-guide',
    title: 'My Guide',
    description: 'Description',
    category: 'Category',
    steps: [{ title: 'Step 1', description: 'Do this', screenshotPath: screenshot.path }],
  });
  await saveGuide(guide);
});
```

## Authentication Management

### Initial Setup

1. Set `TERP_DOCBOT_EMAIL` and `TERP_DOCBOT_PASSWORD` in `.env`
2. Run auth setup:

```bash
pnpm --filter doc-bot exec playwright test --project=setup
```

### Re-authenticate

If authentication expires:

```bash
# Clear existing auth state
rm -rf apps/doc-bot/storage-state/auth.json

# Re-run auth setup
pnpm --filter doc-bot exec playwright test --project=setup
```

## Troubleshooting

### Browser not launching

```bash
# Reinstall Playwright browsers
pnpm --filter doc-bot exec playwright install chromium
```

### Guides not appearing in Companion

1. Check that `GUIDES_DIR` points to the correct directory
2. Verify guide JSON files are valid
3. Check browser console for errors

### CI failing

1. Check that no secrets are required for the failing step
2. Verify all packages build successfully locally
3. Check for TypeScript errors: `pnpm typecheck`

## Building for Production

### Build All Packages

```bash
pnpm build
```

### Build Specific App

```bash
pnpm build:doc-bot
pnpm build:companion
```

## Updating Dependencies

```bash
# Update all dependencies
pnpm update -r

# Update specific package
pnpm --filter doc-bot update playwright
```
