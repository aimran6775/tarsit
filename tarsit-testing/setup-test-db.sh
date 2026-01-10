#!/bin/bash

# Setup Test Database Script
# Creates and migrates the test database

set -e

echo "📦 Setting up Tarsit Test Database"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load environment variables
if [ -f "../../apps/api/.env" ]; then
  export $(cat ../../apps/api/.env | grep -v '^#' | xargs)
fi

TEST_DB_NAME="tarsit_test"
TEST_DATABASE_URL="${DATABASE_URL%/*}/$TEST_DB_NAME"

echo -e "${CYAN}Test Database URL:${NC} ${TEST_DATABASE_URL//:[^:@]*@/:****@}"
echo ""

# Extract connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${CYAN}Creating test database...${NC}"

# Create test database using psql
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d postgres -c "CREATE DATABASE $TEST_DB_NAME;" 2>/dev/null || {
  echo -e "${YELLOW}Database may already exist, continuing...${NC}"
}

echo -e "${GREEN}✓ Test database created${NC}"
echo ""

# Run migrations
echo -e "${CYAN}Running migrations...${NC}"
cd ../../apps/api
export DATABASE_URL="$TEST_DATABASE_URL"
npx prisma migrate deploy
npx prisma generate

echo ""
echo -e "${GREEN}✓ Test database setup complete!${NC}"
echo ""
echo "You can now run tests with:"
echo "  pnpm test:tarsit:backend"
echo "  pnpm test:tarsit:frontend"
echo "  pnpm test:tarsit"
