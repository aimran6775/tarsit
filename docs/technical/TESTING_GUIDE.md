# 🧪 Testing Guide

## Overview

This project includes comprehensive testing across multiple layers:
- **E2E Tests**: Full user journey testing with Playwright
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Security feature validation
- **Performance Tests**: Response time and load testing

## Running Tests

### Frontend (E2E Tests)

```bash
# Run all E2E tests
pnpm test

# Run specific test suites
pnpm test:user-journey    # Main user journey tests
pnpm test:business        # Business owner journey
pnpm test:reviews         # Reviews system tests
pnpm test:messaging       # Messaging system tests
pnpm test:map             # Map integration tests
pnpm test:admin           # Admin dashboard tests
pnpm test:smoke           # Quick smoke test

# Interactive mode
pnpm test:ui              # Playwright UI mode
pnpm test:headed          # Run with browser visible
pnpm test:debug           # Debug mode

# View test report
pnpm test:report
```

### Backend (Unit & Integration Tests)

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit            # Unit tests only
pnpm test:integration     # Integration/E2E tests
pnpm test:security        # Security tests
pnpm test:performance     # Performance tests

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# Run all tests
pnpm test:all
```

## Test Structure

### E2E Tests (`apps/web/e2e/`)

- `user-journey.spec.ts` - Main user flows (homepage, search, auth, etc.)
- `business-owner-journey.spec.ts` - Business registration and dashboard
- `reviews-journey.spec.ts` - Review submission and display
- `messaging-journey.spec.ts` - Real-time messaging
- `map-journey.spec.ts` - Map integration
- `admin-journey.spec.ts` - Admin dashboard
- `test-helpers.ts` - Reusable test utilities

### Unit Tests (`apps/api/src/**/*.spec.ts`)

- `password.validator.spec.ts` - Password strength validation
- `auth.service.spec.ts` - Authentication service
- `query-optimizer.util.spec.ts` - Query optimization utilities

### Integration Tests (`apps/api/test/*.e2e-spec.ts`)

- `auth.e2e-spec.ts` - Auth endpoint testing
- `security.e2e-spec.ts` - Security features (rate limiting, sanitization)
- `performance.e2e-spec.ts` - Performance benchmarks

## Test Coverage Goals

- **E2E Coverage**: All critical user journeys
- **Unit Coverage**: >80% for utilities and services
- **Integration Coverage**: All API endpoints
- **Security Coverage**: All security features

## Writing New Tests

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('Feature Name', async ({ page }) => {
  await page.goto('/path');
  await expect(page.locator('selector')).toBeVisible();
});
```

### Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { Service } from './service';

describe('Service', () => {
  it('should do something', () => {
    expect(service.method()).toBe(expected);
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Before deployment
- Nightly builds

## Debugging Failed Tests

1. Check screenshots in `playwright-results/`
2. Review test videos (on failure)
3. Use `test:debug` for step-by-step debugging
4. Check console logs in test output

## Performance Benchmarks

- Page load: < 2 seconds
- API response: < 500ms (cached), < 2s (uncached)
- Concurrent requests: Handle 10+ simultaneously
