# Tarsit Testing Suite - Setup and Execution Guide

## Overview

The Tarsit testing suite is a comprehensive integration testing framework that validates:
- ✅ All backend API endpoints (68+ tests)
- ✅ Frontend pages and components
- ✅ User flows and interactions
- ✅ API integrations

## Prerequisites

### Required Services

Before running tests, you must have these services running:

1. **Backend API** (Required)
   ```bash
   cd apps/api
   pnpm install
   pnpm dev
   # Should be running on http://localhost:4000/api
   ```

2. **Frontend Application** (Required for frontend tests)
   ```bash
   cd apps/web
   pnpm install
   pnpm dev
   # Should be running on http://localhost:3000
   ```

3. **Database** (Required)
   - PostgreSQL database must be configured and accessible
   - Set `DATABASE_URL` in `apps/api/.env`

### Environment Configuration

Create `apps/api/.env` file with these required variables:

```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tarsit"

# JWT Secrets
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Other required variables (see .env.example)
```

**Important:** Ensure `NODE_ENV` is NOT set to `production` to avoid strict rate limiting during tests.

## Running Tests

### Quick Start

```bash
# From project root
cd tarsit-testing

# Run all tests (backend + frontend)
pnpm test:all

# Run only backend tests
pnpm test:backend

# Run only frontend tests
pnpm test:frontend
```

### Alternative Methods

```bash
# Using the bash script (checks service availability first)
./run-tests.sh

# Using package.json scripts from project root
cd ..
pnpm test:tarsit              # All tests
pnpm test:tarsit:backend      # Backend only
pnpm test:tarsit:frontend     # Frontend only
```

## Test Structure

### Backend Tests (`backend/`)

Tests are organized by feature:

- **Health Checks** (4 tests) - System health endpoints
- **Authentication** (11 tests) - Signup, login, password reset
- **Businesses** (8 tests) - CRUD operations for businesses
- **Reviews** (6 tests) - Review creation and management
- **Search** (7 tests) - Search functionality
- **Messages** (5 tests) - Messaging system
- **Appointments** (5 tests) - Appointment booking
- **Favorites** (3 tests) - Favorite businesses
- **Services** (4 tests) - Business services
- **Uploads** (2 tests) - File uploads
- **Admin** (12 tests) - Admin operations
- **Categories** (3 tests) - Category management

**Total: 68+ backend tests**

### Frontend Tests (`frontend/`)

- Page rendering tests
- Component functionality
- User flow testing
- API integration validation
- Performance benchmarks

## Understanding Test Results

### Success Output

```
╔══════════════════════════════════════════════════════════════╗
║         TARSIT BACKEND COMPREHENSIVE TESTING SUITE          ║
╚══════════════════════════════════════════════════════════════╝

API URL: http://localhost:4000/api
Test Database: postgresql://****@localhost:5432/tarsit

✓ Backend API is running at http://localhost:4000/api
✓ Database connection configured

Health Checks:
  ✓ GET /health - Basic health check (PASS - 45ms)
  ✓ GET /health/detailed - Detailed health check (PASS - 52ms)
  ...

════════════════════════════════════════════════════════════════
                      TEST SUMMARY
════════════════════════════════════════════════════════════════
Total Tests: 68
Passed: 65 (95.6%)
Failed: 3 (4.4%)
Duration: 45.2s
════════════════════════════════════════════════════════════════
```

### Common Error Messages

#### "Backend API is not running"

```
✗ Backend API is not running at http://localhost:4000/api
  Please start the backend: cd apps/api && pnpm dev
```

**Solution:** Start the backend API service.

#### "Rate limited - skipping test"

```
⚠️  Could not create test users: Rate limited
   Some tests may be skipped
```

**Solution:** 
- Wait 5-10 minutes between test runs
- Ensure `NODE_ENV` is set to `development` (not `production`)
- The rate limits are higher in development mode (100 req/min vs 3 req/min)

#### "Database connection failed"

```
⚠️  DATABASE_URL not configured
  Tests will run without direct database access (API-only mode)
```

**Solution:** Configure `DATABASE_URL` in `apps/api/.env`

## Rate Limiting

The backend has rate limiting enabled for security:

- **Production mode:** 3 requests/minute for signup/login
- **Development mode:** 100 requests/minute

Tests automatically use development-friendly limits when `NODE_ENV !== 'production'`.

### Avoiding Rate Limits

1. Set `NODE_ENV=development` in your `.env`
2. Wait 5-10 minutes between full test runs
3. Run individual test suites instead of all tests
4. Tests include automatic delays between requests

## Troubleshooting

### Tests are failing but services are running

1. **Check API health:**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Check database connection:**
   ```bash
   cd apps/api
   npx prisma db pull
   ```

3. **Check for existing test data conflicts:**
   - Tests create users with unique emails
   - Test data is cleaned up after tests
   - If cleanup failed, you may have orphaned test data

### Some tests are skipped

This is normal when:
- Test users couldn't be created (rate limiting)
- Tests depend on previous test results
- Optional features are not configured

### Performance issues

- First test run may be slower (cold start)
- Subsequent runs are faster (cached data)
- Database queries are optimized
- Tests run sequentially to avoid conflicts

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tarsit Tests
  run: |
    # Start services
    docker-compose up -d
    
    # Wait for services
    sleep 10
    
    # Run tests
    cd tarsit-testing
    pnpm test:all
```

## Test Coverage

Current coverage:
- ✅ All public API endpoints
- ✅ Authentication flows
- ✅ CRUD operations
- ✅ Search functionality
- ✅ Real-time features
- ✅ File uploads
- ✅ Admin operations
- ✅ Error handling

## Development

### Adding New Tests

1. Create test file in appropriate directory:
   ```javascript
   // backend/tests/my-feature.test.js
   const { expectStatus, expectData, runTest } = require('../utils/test-helpers');
   
   async function testMyFeature(context) {
     const { api } = context;
     const results = [];
     
     results.push(await runTest('My test', async () => {
       const response = await api.get('/my-endpoint');
       expectStatus(response, 200);
     }));
     
     return results;
   }
   
   module.exports = { testMyFeature };
   ```

2. Import in main test runner:
   ```javascript
   const { testMyFeature } = require('./tests/my-feature.test');
   ```

3. Add to test suites:
   ```javascript
   { name: 'My Feature', testFn: () => testMyFeature(context) }
   ```

### Test Helpers

Available helper functions:

- `expectStatus(response, status)` - Assert response status code
- `expectData(response, key?)` - Assert response has data
- `expect(condition, message)` - Assert a condition
- `expectProperty(obj, property)` - Assert object has property
- `wait(ms)` - Wait for specified milliseconds
- `generateTestEmail()` - Generate unique test email
- `generateTestPassword()` - Generate valid test password

## Additional Resources

- **Backend API Docs:** `apps/api/README.md`
- **Frontend Docs:** `apps/web/README.md`
- **Original Testing Guide:** `../TESTING_GUIDE.md`
- **Test Status Report:** `TESTING_STATUS.md`

## Support

If tests are consistently failing:
1. Check service logs for errors
2. Verify all environment variables are set
3. Ensure database is accessible
4. Review rate limiting configuration
5. Check for version compatibility issues

For issues specific to the testing suite, check:
- `TESTING_STATUS.md` - Current test status
- `TESTING_COMPLETE.md` - Implementation details
- `QUICK_FIX.md` - Common quick fixes
