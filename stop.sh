#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Stopping RnD Application Stack        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Stop Frontend
echo -e "${YELLOW}[1/3]${NC} ${GREEN}Stopping Next.js frontend server...${NC}"
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}! Frontend process not running${NC}"
    fi
    rm frontend.pid
else
    echo -e "${YELLOW}! No frontend PID file found${NC}"
fi

# Also kill any process on port 3001
if command -v lsof > /dev/null 2>&1; then
    PORT_3001_PID=$(lsof -ti:3001)
    if [ ! -z "$PORT_3001_PID" ]; then
        kill $PORT_3001_PID 2>/dev/null
        echo -e "${GREEN}✓ Killed process on port 3001${NC}"
    fi
fi
echo ""

# Step 2: Stop Backend
echo -e "${YELLOW}[2/3]${NC} ${GREEN}Stopping NestJS backend server...${NC}"
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}! Backend process not running${NC}"
    fi
    rm backend.pid
else
    echo -e "${YELLOW}! No backend PID file found${NC}"
fi

# Also kill any process on port 3000
if command -v lsof > /dev/null 2>&1; then
    PORT_3000_PID=$(lsof -ti:3000)
    if [ ! -z "$PORT_3000_PID" ]; then
        kill $PORT_3000_PID 2>/dev/null
        echo -e "${GREEN}✓ Killed process on port 3000${NC}"
    fi
fi
echo ""

# Step 3: Stop Docker (Database)
echo -e "${YELLOW}[3/3]${NC} ${GREEN}Stopping PostgreSQL database...${NC}"
cd test-projects/test-backend
docker compose down
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database stopped successfully${NC}"
else
    echo -e "${RED}✗ Failed to stop database${NC}"
fi
cd ..
echo ""

# Clean up log files (optional)
if [ -f "backend.log" ]; then
    rm backend.log
    echo -e "${GREEN}✓ Removed backend.log${NC}"
fi

if [ -f "frontend.log" ]; then
    rm frontend.log
    echo -e "${GREEN}✓ Removed frontend.log${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   All Services Stopped Successfully!    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}To start all services again, run:${NC} ${BLUE}./start.sh${NC}"
echo ""
