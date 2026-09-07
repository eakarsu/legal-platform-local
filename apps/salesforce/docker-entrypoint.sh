#!/bin/bash
set -e

echo "Starting GetFirmFlow..."

# Wait for database to be ready (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database to be ready..."

    # Extract host and port from DATABASE_URL
    # Supports both postgresql:// and postgres:// formats
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:/]*\).*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

    if [ -z "$DB_PORT" ]; then
        DB_PORT=5432
    fi

    # Wait for database connection
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            echo "Database is ready!"
            break
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo "Warning: Could not connect to database, proceeding anyway..."
    fi

    # Run database migrations
    echo "Running database migrations..."
    npx prisma migrate deploy || echo "Migration failed or no migrations to run"
fi

# Execute the main command
echo "Starting application server..."
exec "$@"
