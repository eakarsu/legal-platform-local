#!/bin/bash

# ============================================
# AI Estate Planning & Digital Legacy
# Start Script - Setup, Seed, and Launch
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   AI Estate Planning & Digital Legacy        ║"
echo "║   Starting Application...                    ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment loaded${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3001}
DB_NAME=${DB_NAME:-estate_planning}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# ---- Clean up used ports ----
echo -e "\n${YELLOW}Cleaning up ports...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
  echo -e "  ${GREEN}✓ Port $port is free${NC}"
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ---- Check PostgreSQL ----
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ PostgreSQL is not installed${NC}"
  exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 3
fi

if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
  echo -e "${RED}✗ PostgreSQL is not running. Please start it manually.${NC}"
  exit 1
fi

# ---- Create Database ----
echo -e "\n${YELLOW}Setting up database...${NC}"

# Try creating db (ignore error if exists)
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true
echo -e "${GREEN}✓ Database '$DB_NAME' ready${NC}"

# ---- Install Dependencies ----
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# ---- Seed Database ----
echo -e "\n${YELLOW}Seeding database with sample data...${NC}"
cd "$PROJECT_DIR/backend"
node seeds/seed.js
echo -e "${GREEN}✓ Database seeded with 15 items per feature${NC}"

# ---- Start Backend with hot reload ----
echo -e "\n${CYAN}Starting backend on port $BACKEND_PORT (with nodemon hot reload)...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend...${NC}"
for i in {1..30}; do
  if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is ready${NC}"
    break
  fi
  sleep 1
done

# ---- Start Frontend with hot reload ----
echo -e "\n${CYAN}Starting frontend on port $FRONTEND_PORT (with React hot reload)...${NC}"
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# ---- Summary ----
echo -e "\n${PURPLE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   Application Started Successfully!          ║"
echo "╠══════════════════════════════════════════════╣"
echo -e "║   Frontend:  ${CYAN}http://localhost:$FRONTEND_PORT${PURPLE}        ║"
echo -e "║   Backend:   ${CYAN}http://localhost:$BACKEND_PORT${PURPLE}         ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Demo Login:                                ║"
echo "║   Email: admin@estateplanning.com            ║"
echo "║   Password: admin123                         ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Hot reload is enabled for both services    ║"
echo "║   Press Ctrl+C to stop all services          ║"
echo -e "╚══════════════════════════════════════════════╝${NC}"
echo ""

# ---- Handle Ctrl+C ----
trap_handler() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap trap_handler SIGINT SIGTERM

# Keep script running
wait
