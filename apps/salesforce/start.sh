#!/bin/bash

echo "Starting Small Law Firm AI..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env with your database credentials"
    exit 1
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "Creating uploads directory..."
    mkdir -p uploads
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init

# Check if database needs seeding by checking User table
echo "Checking if database needs seeding..."
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"User\";" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "Seeding database..."
    npx prisma db seed
fi

# Clear ports 3000 and 4000 if in use
echo "Clearing ports 3000 and 4000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Start the development server
echo "Starting Next.js development server..."
echo "Application will be available at http://localhost:3000"
npm run dev
