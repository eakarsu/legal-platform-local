# Multi-stage Dockerfile for GetFirmFlow
# Includes PostgreSQL and Node.js (nginx handled by host)

FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg2 \
    lsb-release \
    ca-certificates \
    sudo \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install PostgreSQL 15
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get update \
    && apt-get install -y postgresql-15 postgresql-contrib-15 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production=false

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Configure PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "ALTER USER postgres WITH PASSWORD 'password';" && \
    createdb -O postgres getfirmflow && \
    /etc/init.d/postgresql stop

USER root

# Update PostgreSQL configuration for local connections
RUN echo "host all all 127.0.0.1/32 md5" >> /etc/postgresql/15/main/pg_hba.conf && \
    echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/15/main/pg_hba.conf && \
    echo "local all all md5" >> /etc/postgresql/15/main/pg_hba.conf && \
    echo "listen_addresses='*'" >> /etc/postgresql/15/main/postgresql.conf

# Default DATABASE_URL using TCP connection
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/getfirmflow
ENV NEXTAUTH_URL=http://localhost:3000

# Create supervisor configuration
RUN mkdir -p /var/log/supervisor
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:postgresql]
command=/usr/lib/postgresql/15/bin/postgres -D /var/lib/postgresql/15/main -c config_file=/etc/postgresql/15/main/postgresql.conf
user=postgres
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/postgresql.log
stderr_logfile=/var/log/supervisor/postgresql_err.log
priority=1

[program:nextjs]
command=/app/start-nextjs.sh
directory=/app
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/nextjs.log
stderr_logfile=/var/log/supervisor/nextjs_err.log
priority=2
EOF

# Create Next.js startup script with proper DB wait and seeding
COPY <<EOF /app/start-nextjs.sh
#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if pg_isready -h 127.0.0.1 -p 5432 -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting for PostgreSQL... attempt \$i/30"
    sleep 2
done

# Check if PostgreSQL is actually ready
if ! pg_isready -h 127.0.0.1 -p 5432 -U postgres > /dev/null 2>&1; then
    echo "ERROR: PostgreSQL did not start in time"
    exit 1
fi

echo "Running database migrations..."
npx prisma db push --skip-generate

# Wait a moment for tables to be ready
sleep 2

# Check if demo admin user exists
echo "Checking if demo users need to be seeded..."
ADMIN_EXISTS=\$(PGPASSWORD=password psql -h 127.0.0.1 -U postgres -d getfirmflow -t -c "SELECT COUNT(*) FROM \"User\" WHERE email='john.smith@smithlaw.com';" 2>/dev/null || echo "0")
ADMIN_EXISTS=\$(echo \$ADMIN_EXISTS | tr -d ' \n\r\t')

# If empty or contains error text, set to 0
if [ -z "\$ADMIN_EXISTS" ] || echo "\$ADMIN_EXISTS" | grep -qi "error\|does not exist"; then
    ADMIN_EXISTS="0"
fi

echo "Admin user count: \$ADMIN_EXISTS"

if [ "\$ADMIN_EXISTS" = "0" ]; then
    echo "Demo users not found. Running seed..."
    npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts || echo "Seed failed but continuing..."
    echo "Seed process completed."
else
    echo "Demo admin user already exists. Skipping seed."
fi

echo "Starting Next.js..."
exec npm start
EOF

RUN chmod +x /app/start-nextjs.sh

# Install pg_isready tool
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Create main startup script
COPY <<EOF /start.sh
#!/bin/bash
set -e

# Ensure PostgreSQL data directory has correct permissions
chown -R postgres:postgres /var/lib/postgresql/15/main
chmod 700 /var/lib/postgresql/15/main

# Export DATABASE_URL for all processes
export DATABASE_URL=\${DATABASE_URL:-postgresql://postgres:password@127.0.0.1:5432/getfirmflow}

# Start supervisor (manages PostgreSQL and Next.js)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

RUN chmod +x /start.sh

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose ports
EXPOSE 3000 5432

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start all services
CMD ["/start.sh"]
