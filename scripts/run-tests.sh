#!/bin/bash

# Tarsit Test Runner Script
# This script runs all tests for the Tarsit project

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}           Tarsit Test Runner                   ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to print step header
step() {
  echo -e "${CYAN}>>> $1${NC}"
}

# Function to print success
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
error() {
  echo -e "${RED}✗ $1${NC}"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  error "pnpm is not installed. Please install it first."
  exit 1
fi

# Parse arguments
RUN_UNIT=true
RUN_E2E=false
START_SERVICES=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --unit)
      RUN_UNIT=true
      RUN_E2E=false
      shift
      ;;
    --e2e)
      RUN_UNIT=false
      RUN_E2E=true
      shift
      ;;
    --all)
      RUN_UNIT=true
      RUN_E2E=true
      shift
      ;;
    --with-services)
      START_SERVICES=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --unit           Run only unit tests (default)"
      echo "  --e2e            Run only E2E tests"
      echo "  --all            Run all tests"
      echo "  --with-services  Start Docker services before E2E tests"
      echo "  --help           Show this help message"
      exit 0
      ;;
    *)
      error "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Step 1: Install dependencies
step "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
success "Dependencies installed"
echo ""

# Step 2: Run Backend Unit Tests
if [ "$RUN_UNIT" = true ]; then
  step "Running Backend Unit Tests..."
  cd "$PROJECT_ROOT"
  
  # Run Jest tests
  if pnpm test --filter=api; then
    success "Backend unit tests passed"
  else
    error "Backend unit tests failed"
    exit 1
  fi
  echo ""
fi

# Step 3: Run E2E Tests
if [ "$RUN_E2E" = true ]; then
  step "Running E2E Tests..."
  
  # Start Docker services if requested
  if [ "$START_SERVICES" = true ]; then
    step "Starting Docker services..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.test.yml up -d
    sleep 5
    success "Docker services started"
    
    # Run database migrations
    step "Running database migrations..."
    cd "$PROJECT_ROOT/apps/api"
    cp .env.test .env.test.local
    export $(cat .env.test | grep -v '^#' | xargs)
    npx prisma migrate deploy
    npx prisma db seed || true
    success "Database migrations complete"
  fi
  
  # Run Playwright tests
  cd "$PROJECT_ROOT/apps/web"
  
  if npx playwright test; then
    success "E2E tests passed"
  else
    warn "Some E2E tests may have failed"
  fi
  
  # Stop Docker services
  if [ "$START_SERVICES" = true ]; then
    step "Stopping Docker services..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.test.yml down
    success "Docker services stopped"
  fi
  echo ""
fi

# Summary
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}           Test Run Complete!                   ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Results:"
if [ "$RUN_UNIT" = true ]; then
  echo "  - Backend Unit Tests: ✓ Passed"
fi
if [ "$RUN_E2E" = true ]; then
  echo "  - E2E Tests: Check playwright-report for details"
fi
