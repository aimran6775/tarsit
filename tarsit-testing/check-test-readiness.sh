#!/bin/bash

# Tarsit Testing Readiness Checker
# Validates that all prerequisites are met before running tests

set +e  # Don't exit on error, we want to check everything

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Tarsit Testing Readiness Checker               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Backend API
echo -e "${CYAN}[1/6] Checking Backend API...${NC}"
API_URL="${API_URL:-http://localhost:4000/api}"
if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}  ✓ Backend API is running at $API_URL${NC}"
else
  echo -e "${RED}  ✗ Backend API is NOT running at $API_URL${NC}"
  echo -e "${YELLOW}    Start with: cd apps/api && pnpm dev${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check 2: Frontend
echo -e "${CYAN}[2/6] Checking Frontend...${NC}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}  ✓ Frontend is running at $FRONTEND_URL${NC}"
else
  echo -e "${YELLOW}  ⚠ Frontend is NOT running at $FRONTEND_URL${NC}"
  echo -e "${YELLOW}    Start with: cd apps/web && pnpm dev${NC}"
  echo -e "${YELLOW}    (Only required for frontend tests)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check 3: Environment file
echo -e "${CYAN}[3/6] Checking Environment Configuration...${NC}"
if [ -f "../apps/api/.env" ]; then
  echo -e "${GREEN}  ✓ Environment file exists: apps/api/.env${NC}"
  
  # Check for required variables
  if grep -q "DATABASE_URL=" "../apps/api/.env"; then
    echo -e "${GREEN}    ✓ DATABASE_URL is configured${NC}"
  else
    echo -e "${RED}    ✗ DATABASE_URL is NOT configured${NC}"
    ERRORS=$((ERRORS + 1))
  fi
  
  if grep -q "JWT_ACCESS_SECRET=" "../apps/api/.env"; then
    echo -e "${GREEN}    ✓ JWT_ACCESS_SECRET is configured${NC}"
  else
    echo -e "${YELLOW}    ⚠ JWT_ACCESS_SECRET is NOT configured${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # Check NODE_ENV
  if grep -q "NODE_ENV=production" "../apps/api/.env"; then
    echo -e "${YELLOW}    ⚠ NODE_ENV is set to 'production'${NC}"
    echo -e "${YELLOW}      This will enforce strict rate limiting${NC}"
    echo -e "${YELLOW}      Consider changing to 'development' for testing${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${GREEN}    ✓ NODE_ENV is not set to production${NC}"
  fi
else
  echo -e "${RED}  ✗ Environment file NOT found: apps/api/.env${NC}"
  echo -e "${YELLOW}    Copy from: apps/api/.env.example${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check 4: Node modules
echo -e "${CYAN}[4/6] Checking Dependencies...${NC}"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}  ✓ Dependencies installed in tarsit-testing${NC}"
else
  echo -e "${YELLOW}  ⚠ Dependencies NOT installed in tarsit-testing${NC}"
  echo -e "${YELLOW}    Run: pnpm install${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

if [ -d "../apps/api/node_modules" ]; then
  echo -e "${GREEN}  ✓ Dependencies installed in apps/api${NC}"
else
  echo -e "${RED}  ✗ Dependencies NOT installed in apps/api${NC}"
  echo -e "${YELLOW}    Run: cd apps/api && pnpm install${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check 5: Database connectivity (via Prisma)
echo -e "${CYAN}[5/6] Checking Database Connectivity...${NC}"
if [ -f "../apps/api/.env" ]; then
  export $(cat ../apps/api/.env | grep DATABASE_URL | xargs)
  if [ ! -z "$DATABASE_URL" ]; then
    # Try to connect via psql if available
    if command -v psql &> /dev/null; then
      if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Database is accessible${NC}"
      else
        echo -e "${YELLOW}  ⚠ Database connection failed${NC}"
        echo -e "${YELLOW}    Tests will run in API-only mode${NC}"
        WARNINGS=$((WARNINGS + 1))
      fi
    else
      echo -e "${YELLOW}  ⚠ Cannot verify database (psql not installed)${NC}"
      echo -e "${YELLOW}    Tests will attempt to connect anyway${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo -e "${YELLOW}  ⚠ DATABASE_URL not configured${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${YELLOW}  ⚠ Cannot check database (no .env file)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Test scripts
echo -e "${CYAN}[6/6] Checking Test Scripts...${NC}"
if [ -f "backend/test-backend.js" ]; then
  echo -e "${GREEN}  ✓ Backend test script exists${NC}"
else
  echo -e "${RED}  ✗ Backend test script NOT found${NC}"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/test-frontend.js" ]; then
  echo -e "${GREEN}  ✓ Frontend test script exists${NC}"
else
  echo -e "${YELLOW}  ⚠ Frontend test script NOT found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                   SUMMARY                         ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready to run tests.${NC}"
  echo ""
  echo -e "Run tests with:"
  echo -e "  ${CYAN}pnpm test:all${NC}         # All tests"
  echo -e "  ${CYAN}pnpm test:backend${NC}     # Backend only"
  echo -e "  ${CYAN}pnpm test:frontend${NC}    # Frontend only"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found.${NC}"
  echo -e "${YELLOW}Tests may run with limited functionality.${NC}"
  echo ""
  echo -e "You can still run tests:"
  echo -e "  ${CYAN}pnpm test:backend${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}✗ ${ERRORS} error(s) found.${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found.${NC}"
  fi
  echo -e "${RED}Please fix the errors above before running tests.${NC}"
  echo ""
  echo -e "Quick start guide:"
  echo -e "  1. ${CYAN}cd apps/api && cp .env.example .env${NC}  # Configure environment"
  echo -e "  2. ${CYAN}cd apps/api && pnpm install && pnpm dev${NC}  # Start backend"
  echo -e "  3. ${CYAN}cd apps/web && pnpm install && pnpm dev${NC}  # Start frontend (optional)"
  echo -e "  4. ${CYAN}cd tarsit-testing && ./check-test-readiness.sh${NC}  # Re-check"
  echo ""
  exit 1
fi
