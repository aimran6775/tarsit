#!/bin/bash

# Tarsit Comprehensive Testing Suite Runner
# Tests both backend and frontend

set -e

echo "🧪 Tarsit Comprehensive Testing Suite"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${CYAN}Checking backend availability...${NC}"
if curl -s -f "${API_URL:-http://localhost:4000/api}/health" > /dev/null; then
  echo -e "${GREEN}✓ Backend is running${NC}"
else
  echo -e "${RED}✗ Backend is not running at ${API_URL:-http://localhost:4000/api}${NC}"
  echo -e "${YELLOW}Please start the backend first: cd apps/api && pnpm dev${NC}"
  exit 1
fi

# Check if frontend is running
echo -e "${CYAN}Checking frontend availability...${NC}"
if curl -s -f "${FRONTEND_URL:-http://localhost:3000}" > /dev/null; then
  echo -e "${GREEN}✓ Frontend is running${NC}"
else
  echo -e "${RED}✗ Frontend is not running at ${FRONTEND_URL:-http://localhost:3000}${NC}"
  echo -e "${YELLOW}Please start the frontend first: cd apps/web && pnpm dev${NC}"
  exit 1
fi

echo ""
echo -e "${CYAN}Running backend tests...${NC}"
echo ""

# Run backend tests
cd "$(dirname "$0")/backend"
node test-backend.js
BACKEND_EXIT=$?

echo ""
echo -e "${CYAN}Running frontend tests...${NC}"
echo ""

# Run frontend tests
cd ../frontend
node test-frontend.js
FRONTEND_EXIT=$?

echo ""
echo "======================================"
if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed${NC}"
  exit 1
fi
