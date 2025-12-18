#!/bin/bash

# Tarsit Stop Script
# Stops all running development servers

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.logs"

echo -e "${YELLOW}Stopping Tarsit servers...${NC}"
echo ""

# Kill by saved PIDs
if [ -f "$LOG_DIR/api.pid" ]; then
    API_PID=$(cat "$LOG_DIR/api.pid")
    if kill -0 $API_PID 2>/dev/null; then
        kill $API_PID 2>/dev/null
        echo -e "  ${GREEN}✓${NC} Stopped API server (PID: $API_PID)"
    fi
    rm -f "$LOG_DIR/api.pid"
fi

if [ -f "$LOG_DIR/web.pid" ]; then
    WEB_PID=$(cat "$LOG_DIR/web.pid")
    if kill -0 $WEB_PID 2>/dev/null; then
        kill $WEB_PID 2>/dev/null
        echo -e "  ${GREEN}✓${NC} Stopped Web server (PID: $WEB_PID)"
    fi
    rm -f "$LOG_DIR/web.pid"
fi

# Kill by port as backup
if lsof -i :3000 > /dev/null 2>&1; then
    kill -9 $(lsof -t -i :3000) 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Killed process on port 3000"
fi

if lsof -i :4000 > /dev/null 2>&1; then
    kill -9 $(lsof -t -i :4000) 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Killed process on port 4000"
fi

# Kill any lingering processes
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

echo ""
echo -e "${GREEN}All servers stopped.${NC}"
