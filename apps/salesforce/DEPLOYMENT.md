# GetFirmFlow Deployment Guide

## Docker Deployment

### 1. Build the Docker Image

```bash
docker build -t getfirmflow:latest .
```

### 2. Run the Container

```bash
docker run -d \
  --name getfirmflow \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/getfirmflow" \
  -e NEXTAUTH_SECRET="your-secret-key-here" \
  -e NEXTAUTH_URL="https://getfirmflow.com" \
  -e OPENAI_API_KEY="your-openai-key" \
  -v getfirmflow-uploads:/app/uploads \
  --restart unless-stopped \
  getfirmflow:latest
```

### 3. Environment Variables

Required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions |
| `NEXTAUTH_URL` | Public URL of the application |
| `OPENAI_API_KEY` | OpenAI API key for AI features |

Optional:

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server for emails |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `STRIPE_SECRET_KEY` | Stripe API key for payments |

---

## Nginx Configuration

### 1. Install Certbot and obtain SSL certificate

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d getfirmflow.com -d www.getfirmflow.com
```

### 2. Copy nginx configuration

```bash
sudo cp nginx/getfirmflow.conf /etc/nginx/sites-available/getfirmflow
sudo ln -s /etc/nginx/sites-available/getfirmflow /etc/nginx/sites-enabled/
```

### 3. Test and reload nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Database Setup

### 1. Create PostgreSQL database

```bash
sudo -u postgres psql
CREATE DATABASE getfirmflow;
CREATE USER getfirmflow_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE getfirmflow TO getfirmflow_user;
\q
```

### 2. Run migrations (inside container)

```bash
docker exec getfirmflow npx prisma migrate deploy
```

### 3. Seed database (optional, for demo data)

```bash
docker exec getfirmflow npx prisma db seed
```

---

## Quick Start Commands

```bash
# Build
docker build -t getfirmflow:latest .

# Run (development)
docker run -d --name getfirmflow -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/getfirmflow" \
  -e NEXTAUTH_SECRET="dev-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  getfirmflow:latest

# View logs
docker logs -f getfirmflow

# Stop
docker stop getfirmflow

# Remove
docker rm getfirmflow

# Shell access
docker exec -it getfirmflow /bin/sh
```

---

## Health Check

The application exposes a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Troubleshooting

### Container won't start
- Check logs: `docker logs getfirmflow`
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is accessible from container

### Database connection failed
- Check if PostgreSQL is running
- Verify network connectivity
- Check firewall rules

### Nginx 502 Bad Gateway
- Verify container is running: `docker ps`
- Check if port 3000 is exposed
- Check container logs for errors
