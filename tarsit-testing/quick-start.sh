#!/bin/bash

# Quick Start Script for Tarsit Test Agent
# This script helps you quickly run the test agent

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        🤖 Tarsit Test Agent Quick Start          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if services are running
echo -e "${CYAN}Checking if services are running...${NC}"

# Check backend
if curl -s -f "http://localhost:4000/api/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend is running${NC}"
  BACKEND_OK=1
else
  echo -e "${RED}✗ Backend is NOT running${NC}"
  echo -e "${YELLOW}  Start with: cd apps/api && pnpm dev${NC}"
  BACKEND_OK=0
fi

# Check frontend
if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend is running${NC}"
  FRONTEND_OK=1
else
  echo -e "${YELLOW}⚠ Frontend is NOT running${NC}"
  echo -e "${YELLOW}  Start with: cd apps/web && pnpm dev${NC}"
  FRONTEND_OK=0
fi

echo ""

# Determine what to run
if [ $BACKEND_OK -eq 0 ]; then
  echo -e "${RED}Cannot run tests: Backend is not running${NC}"
  echo -e "${YELLOW}Please start the backend first and try again${NC}"
  exit 1
fi

# Show menu
echo -e "${CYAN}What would you like to test?${NC}"
echo ""
echo "  1) Full test suite (backend + frontend)"
echo "  2) Backend only"
echo "  3) Frontend only (if running)"
echo "  4) Verbose mode (detailed output)"
echo "  5) Custom options"
echo "  6) Help & Documentation"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
  1)
    echo -e "${CYAN}Running full test suite...${NC}"
    node test-agent.js
    ;;
  2)
    echo -e "${CYAN}Running backend tests only...${NC}"
    node test-agent.js --backend-only
    ;;
  3)
    if [ $FRONTEND_OK -eq 1 ]; then
      echo -e "${CYAN}Running frontend tests only...${NC}"
      node test-agent.js --frontend-only
    else
      echo -e "${RED}Frontend is not running!${NC}"
      exit 1
    fi
    ;;
  4)
    echo -e "${CYAN}Running tests in verbose mode...${NC}"
    node test-agent.js --verbose
    ;;
  5)
    echo ""
    echo -e "${CYAN}Available options:${NC}"
    echo "  --backend-only      Run only backend tests"
    echo "  --frontend-only     Run only frontend tests"
    echo "  --verbose           Show detailed output"
    echo "  --no-report         Skip HTML report"
    echo "  --max-retries N     Set retry count"
    echo ""
    read -p "Enter options: " options
    echo -e "${CYAN}Running with custom options...${NC}"
    node test-agent.js $options
    ;;
  6)
    echo ""
    cat << 'EOF'
📖 Tarsit Test Agent Help

USAGE:
  ./quick-start.sh              # Interactive menu
  node test-agent.js            # Run all tests
  pnpm test:agent               # Run all tests (via pnpm)
  pnpm test:agent:backend       # Backend only
  pnpm test:agent:verbose       # Verbose mode

OPTIONS:
  --backend-only     Run backend tests only
  --frontend-only    Run frontend tests only
  --verbose          Show detailed test output
  --no-report        Skip HTML report generation
  --max-retries N    Set maximum retry attempts

EXAMPLES:
  node test-agent.js --backend-only
  node test-agent.js --verbose --max-retries 5
  pnpm test:agent

DOCUMENTATION:
  See TEST_AGENT.md for full documentation

REPORTS:
  HTML report generated at: test-report.html
EOF
    ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

# Check exit code and provide feedback
EXIT_CODE=$?
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║          🎉 All Tests Passed Successfully!        ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${CYAN}📊 HTML Report: test-report.html${NC}"
else
  echo -e "${RED}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║              ⚠️  Some Tests Failed                ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Check the output above for details${NC}"
  echo -e "${CYAN}📊 HTML Report: test-report.html${NC}"
fi

echo ""
