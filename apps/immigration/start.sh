#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           AI Immigration Case Manager                       ║"
echo "║           Starting Application...                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

# Function to kill process on a port
kill_port() {
  local port=$1
  local pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo -e "${YELLOW}  Killing process on port $port (PID: $pid)${NC}"
    kill -9 $pid 2>/dev/null
    sleep 1
  fi
}

# Clean up used ports
echo -e "\n${BLUE}[1/5] Cleaning up ports...${NC}"
kill_port ${BACKEND_PORT:-3001}
kill_port ${FRONTEND_PORT:-3000}
echo -e "${GREEN}✓ Ports cleaned${NC}"

# Check if PostgreSQL is running
echo -e "\n${BLUE}[2/5] Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -q; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
    else
      sudo systemctl start postgresql 2>/dev/null
    fi
    sleep 2
  fi
else
  echo -e "${YELLOW}  pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# Setup database
echo -e "\n${BLUE}[3/5] Setting up database...${NC}"
DB_NAME=${DB_NAME:-immigration_case_manager}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Create database if not exists
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database '$DB_NAME' created${NC}"
else
  echo -e "${YELLOW}  Database '$DB_NAME' already exists${NC}"
fi

# Run seed script
echo -e "  Seeding database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed.sql -q 2>/dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
  echo -e "${RED}✗ Database seeding failed - trying without password${NC}"
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed.sql -q 2>/dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
  else
    echo -e "${RED}✗ Database seeding failed. Check PostgreSQL connection.${NC}"
  fi
fi

# Install dependencies
echo -e "\n${BLUE}[4/5] Installing dependencies...${NC}"

echo -e "  Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  npm install --silent 2>&1 | tail -1
  echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Backend dependencies already up to date${NC}"
fi

echo -e "  Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  npm install --silent 2>&1 | tail -1
  echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Frontend dependencies already up to date${NC}"
fi

cd "$SCRIPT_DIR"

# Start the application
echo -e "\n${BLUE}[5/5] Starting application with hot reload...${NC}"

# Start backend with nodemon for hot reload
echo -e "  Starting backend on port ${BACKEND_PORT:-3001}..."
cd "$SCRIPT_DIR/backend"
npx nodemon src/server.js &
BACKEND_PID=$!

# Start frontend with React's built-in hot reload
echo -e "  Starting frontend on port ${FRONTEND_PORT:-3000}..."
cd "$SCRIPT_DIR/frontend"
PORT=${FRONTEND_PORT:-3000} BROWSER=none npm start &
FRONTEND_PID=$!

cd "$SCRIPT_DIR"

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Application Started Successfully!                          ║"
echo "║                                                              ║"
echo "║  Frontend:  http://localhost:${FRONTEND_PORT:-3000}                         ║"
echo "║  Backend:   http://localhost:${BACKEND_PORT:-3001}                         ║"
echo "║                                                              ║"
echo "║  Login Credentials:                                          ║"
echo "║  Email:    admin@immigrationlaw.com                          ║"
echo "║  Password: password123                                       ║"
echo "║                                                              ║"
echo "║  Hot reload enabled - changes auto-refresh                   ║"
echo "║  Press Ctrl+C to stop all services                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Handle shutdown
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  kill_port ${BACKEND_PORT:-3001}
  kill_port ${FRONTEND_PORT:-3000}
  echo -e "${GREEN}✓ Application stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
