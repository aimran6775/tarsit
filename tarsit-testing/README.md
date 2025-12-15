# 🧪 Tarsit Testing Suite

Comprehensive testing system for the entire Tarsit platform. Tests every API endpoint, UI component, and user flow to ensure nothing fails.

## 🤖 NEW: Intelligent Test Agent

We now have an **autonomous test agent** that provides:
- ✨ Smart health checks before testing
- 🔄 Automatic retry on failures
- 🚦 Rate limit detection and handling
- 📊 Beautiful HTML reports
- 💡 Actionable recommendations
- 🎯 Full coverage of backend + frontend

### Quick Start with Test Agent

```bash
# Interactive menu (recommended for first time)
cd tarsit-testing
./quick-start.sh

# Or run directly
node test-agent.js

# Or use pnpm
pnpm test:agent
```

See [TEST_AGENT.md](TEST_AGENT.md) for complete documentation.

## Quick Start (Traditional Testing)

```bash
# Setup test database (first time only)
cd tarsit-testing
./setup-test-db.sh

# Test everything (backend + frontend)
pnpm test:tarsit

# Test backend only
pnpm test:tarsit:backend

# Test frontend only
pnpm test:tarsit:frontend
```

## Prerequisites

1. **Backend running:** `cd apps/api && pnpm dev`
2. **Frontend running:** `cd apps/web && pnpm dev`
3. **Test database setup:** Run `./setup-test-db.sh` once

## Structure

```
tarsit-testing/
├── backend/
│   ├── test-backend.js       # Main backend test runner
│   ├── config/
│   │   └── test-database.js   # Test database setup
│   ├── tests/
│   │   ├── auth.test.js       # Authentication tests
│   │   ├── businesses.test.js # Business CRUD tests
│   │   ├── reviews.test.js    # Reviews system tests
│   │   ├── messages.test.js   # Messaging tests
│   │   ├── appointments.test.js # Appointments tests
│   │   ├── search.test.js     # Search functionality
│   │   ├── uploads.test.js    # Image upload tests
│   │   ├── admin.test.js      # Admin endpoints
│   │   ├── categories.test.js # Categories
│   │   ├── favorites.test.js  # Favorites
│   │   ├── services.test.js   # Services
│   │   └── health.test.js     # Health checks
│   └── utils/
│       ├── test-helpers.js    # Test utilities
│       └── test-data.js       # Test data generators
├── frontend/
│   ├── test-frontend.js       # Main frontend test runner
│   └── tests/                 # (tests embedded in runner)
├── shared/
│   └── types.ts              # Shared test types
├── setup-test-db.sh           # Database setup script
└── run-tests.sh               # Run all tests
```

## Test Database

Uses a separate test database (`tarsit_test`) that mirrors production schema. 

- Test data is created for write operations
- Uses real data for read operations where appropriate
- Test data is cleaned up after tests complete

## Output Format

- **Summary:** Pass/Fail with key metrics
- **Detailed Logs:** Only shown on failures for debugging
- **Color-coded:** Green for pass, red for fail
- **Exit Codes:** 0 = all pass, 1 = failures

## What Gets Tested

### Backend Tests
- ✅ All API endpoints (85+ endpoints)
- ✅ Authentication flows
- ✅ CRUD operations
- ✅ Authorization checks
- ✅ Database operations
- ✅ Error handling
- ✅ Rate limiting
- ✅ Input validation

### Frontend Tests
- ✅ All pages load correctly
- ✅ Components render
- ✅ User flows work
- ✅ API integration
- ✅ Error handling
- ✅ Performance benchmarks

## Environment Variables

Set these in `apps/api/.env`:

```env
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/tarsit_test
API_URL=http://localhost:4000/api
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

**Backend not running?**
```bash
cd apps/api && pnpm dev
```

**Frontend not running?**
```bash
cd apps/web && pnpm dev
```

**Test database not set up?**
```bash
cd tarsit-testing && ./setup-test-db.sh
```

**Tests failing?**
- Check backend/frontend are running
- Check test database exists
- Review error messages in output
