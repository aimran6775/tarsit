# Backend Scripts

This directory contains utility scripts for testing and managing the Tarsit API backend.

## Available Scripts

### `test-backend-ready.js`

A comprehensive backend readiness test that validates all critical API endpoints and functionality.

**Purpose:**
- Ensures the backend is fully functional before frontend development
- Validates all critical endpoints and flows
- Tests authentication, authorization, and business logic
- Provides detailed test reports with color-coded output

**Usage:**
```bash
# Basic usage (default: http://localhost:4000)
node scripts/test-backend-ready.js

# Or use npm script
pnpm test:ready

# Custom API URL
API_URL=http://localhost:4000 node scripts/test-backend-ready.js
node scripts/test-backend-ready.js --url=http://localhost:4000

# Custom test credentials
TEST_EMAIL=admin@test.com TEST_PASSWORD=Secret123! pnpm test:ready
```

**What it tests:**
1. ✅ Health check endpoints
2. ✅ API documentation availability
3. ✅ Authentication (signup, login, JWT)
4. ✅ Protected endpoint access
5. ✅ Categories listing
6. ✅ Business CRUD operations
7. ✅ Reviews system
8. ✅ Appointments
9. ✅ Search functionality
10. ✅ Analytics
11. ✅ Automatic cleanup

**Output:**
- Color-coded test results (✓ green for pass, ✗ red for fail)
- Detailed error messages for failures
- Summary statistics (total, passed, failed, pass rate)
- Exit code 0 for success, 1 for failure (CI/CD friendly)

**Requirements:**
- Backend must be running (`pnpm dev`)
- Database must be accessible
- Node.js environment

**Example Output:**
```
═══════════════════════════════════════════════════════
   TARSIT BACKEND READINESS TEST
═══════════════════════════════════════════════════════

Testing API at: http://localhost:4000

═══ Health Check Endpoints ═══
  ✓ Basic health check
    Uptime: 123s
  ✓ Detailed health check
    Database: healthy
  ✓ Readiness check
    All services ready

═══ Authentication Flow ═══
  ✓ User signup
  ✓ User login
  ✓ Protected endpoint access

... (more tests)

═══ Test Summary ═══
Total Tests: 15
Passed: 15
Failed: 0
Pass Rate: 100%

🎉 All tests passed! Backend is ready for use.
```

## Adding New Scripts

When adding new scripts to this directory:

1. Make them executable: `chmod +x scripts/your-script.js`
2. Add a shebang line: `#!/usr/bin/env node`
3. Document usage in this README
4. Add npm script to `package.json` if appropriate
5. Follow the existing code style and patterns

## Environment Variables

Scripts in this directory may use the following environment variables:

- `API_URL` - Base URL of the API (default: http://localhost:4000)
- `TEST_EMAIL` - Email for test user
- `TEST_PASSWORD` - Password for test user
- `NODE_ENV` - Environment (development, test, production)

## CI/CD Integration

These scripts are designed to work in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Test Backend Readiness
  run: pnpm test:ready
  env:
    API_URL: http://localhost:4000
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Exit Codes

All scripts follow standard exit code conventions:
- `0` - Success
- `1` - Failure/Error

This makes them suitable for use in CI/CD pipelines and automation.
