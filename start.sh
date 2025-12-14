#!/bin/bash

# Tarsit Development Server Startup Script
# This script kills any existing processes and starts both frontend and backend servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Tarsit Development Server Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Kill existing processes
echo -e "${YELLOW}[1/5] Stopping any existing servers...${NC}"

# Kill processes on port 3000 (frontend)
if lsof -i :3000 > /dev/null 2>&1; then
    echo "  → Killing process on port 3000 (frontend)..."
    kill -9 $(lsof -t -i :3000) 2>/dev/null || true
    sleep 1
fi

# Kill processes on port 4000 (backend API)
if lsof -i :4000 > /dev/null 2>&1; then
    echo "  → Killing process on port 4000 (backend)..."
    kill -9 $(lsof -t -i :4000) 2>/dev/null || true
    sleep 1
fi

# Kill any lingering nest or next processes
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

echo -e "${GREEN}  ✓ Existing processes stopped${NC}"
echo ""

# Step 2: Check if ports are free
echo -e "${YELLOW}[2/5] Verifying ports are available...${NC}"

if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${RED}  ✗ Port 3000 is still in use!${NC}"
    exit 1
fi

if lsof -i :4000 > /dev/null 2>&1; then
    echo -e "${RED}  ✗ Port 4000 is still in use!${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ Ports 3000 and 4000 are available${NC}"
echo ""

# Step 3: Create log directory
echo -e "${YELLOW}[3/5] Setting up log files...${NC}"
LOG_DIR="$PROJECT_ROOT/.logs"
mkdir -p "$LOG_DIR"
API_LOG="$LOG_DIR/api.log"
WEB_LOG="$LOG_DIR/web.log"

# Clear old logs
> "$API_LOG"
> "$WEB_LOG"

echo -e "${GREEN}  ✓ Logs will be saved to .logs/ directory${NC}"
echo ""

# Step 4: Start Backend (API)
echo -e "${YELLOW}[4/5] Starting Backend API server (port 4000)...${NC}"
cd "$PROJECT_ROOT/apps/api"
pnpm dev > "$API_LOG" 2>&1 &
API_PID=$!

# Wait for backend to be ready
echo "  → Waiting for API to start (this may take a minute on first run)..."
ATTEMPTS=0
MAX_ATTEMPTS=60
while ! curl -s http://localhost:4000/api/health > /dev/null 2>&1; do
    sleep 2
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
        echo -e "${RED}  ✗ Backend failed to start after 2 minutes${NC}"
        echo -e "${RED}  Check logs: $API_LOG${NC}"
        cat "$API_LOG" | tail -30
        exit 1
    fi
    # Show progress
    printf "."
done
echo ""
echo -e "${GREEN}  ✓ Backend API running (PID: $API_PID)${NC}"
echo ""

# Step 5: Start Frontend (Web)
echo -e "${YELLOW}[5/5] Starting Frontend server (port 3000)...${NC}"
cd "$PROJECT_ROOT/apps/web"
pnpm dev > "$WEB_LOG" 2>&1 &
WEB_PID=$!

# Wait for frontend to be ready
echo "  → Waiting for frontend to start..."
ATTEMPTS=0
MAX_ATTEMPTS=60
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 2
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
        echo -e "${RED}  ✗ Frontend failed to start after 2 minutes${NC}"
        echo -e "${RED}  Check logs: $WEB_LOG${NC}"
        cat "$WEB_LOG" | tail -30
        exit 1
    fi
    printf "."
done
echo ""
echo -e "${GREEN}  ✓ Frontend running (PID: $WEB_PID)${NC}"
echo ""

# Success message
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ✓ All servers started successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  ${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "  ${GREEN}Backend:${NC}  http://localhost:4000/api"
echo ""
echo -e "  ${YELLOW}Logs:${NC}"
echo -e "    API: $API_LOG"
echo -e "    Web: $WEB_LOG"
echo ""
echo -e "  ${YELLOW}To stop servers:${NC} ./stop.sh"
echo -e "  ${YELLOW}To view logs:${NC} tail -f .logs/api.log .logs/web.log"
echo ""

# Save PIDs for stop script
echo "$API_PID" > "$LOG_DIR/api.pid"
echo "$WEB_PID" > "$LOG_DIR/web.pid"

# Keep script running and show combined logs
echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"
echo ""

# Trap Ctrl+C to clean up
trap 'echo ""; echo -e "${YELLOW}Stopping servers...${NC}"; kill $API_PID $WEB_PID 2>/dev/null; exit 0' INT

# Tail both logs
tail -f "$API_LOG" "$WEB_LOG"
