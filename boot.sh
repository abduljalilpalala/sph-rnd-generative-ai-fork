#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Starting RnD Application Stack        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Start Docker (Database)
echo -e "${YELLOW}[1/4]${NC} ${GREEN}Starting PostgreSQL database...${NC}"
cd test-projects/test-backend
docker compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start database${NC}"
    exit 1
fi
echo ""

# Wait for database to be ready
echo -e "${YELLOW}[2/4]${NC} ${GREEN}Waiting for database to be ready...${NC}"
sleep 3
echo -e "${GREEN}✓ Database is ready${NC}"
echo ""

# Step 2: Start Backend
echo -e "${YELLOW}[3/4]${NC} ${GREEN}Starting NestJS backend server...${NC}"
# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    yarn install
fi

# Run migrations if needed
echo -e "${BLUE}Running database migrations...${NC}"
yarn prisma migrate deploy

# Start backend in background
echo -e "${BLUE}Starting backend on http://localhost:3000${NC}"
yarn start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

# Wait for backend to be ready
sleep 5
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start backend${NC}"
    exit 1
fi
echo ""

# Step 3: Start Frontend
echo -e "${YELLOW}[4/4]${NC} ${GREEN}Starting Next.js frontend server...${NC}"
cd ../test-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    yarn install
fi

# Start frontend in background
echo -e "${BLUE}Starting frontend on http://localhost:3001${NC}"
yarn dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

# Wait for frontend to be ready
sleep 5
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start frontend${NC}"
    exit 1
fi
echo ""

# Summary
cd ..
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   All Services Started Successfully!    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services running:${NC}"
echo -e "  📦 Database:  ${BLUE}PostgreSQL on localhost:5433${NC}"
echo -e "  🚀 Backend:   ${BLUE}http://localhost:3000${NC} (PID: $BACKEND_PID)"
echo -e "  🌐 Frontend:  ${BLUE}http://localhost:3001${NC} (PID: $FRONTEND_PID)"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  ${BLUE}tail -f backend.log${NC}"
echo -e "  Frontend: ${BLUE}tail -f frontend.log${NC}"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC} ${BLUE}./stop.sh${NC}"
echo ""
