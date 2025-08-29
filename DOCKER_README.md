# BookAIMark Docker Deployment Guide

This guide provides comprehensive instructions for deploying BookAIMark using Docker containers.

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- 4GB+ RAM available for containers
- 10GB+ disk space

### 1. Setup Environment

```bash
# Clone the repository
git clone https://github.com/baller70/bookaimark.git
cd bookaimark

# Run the setup script
./docker-setup.sh setup
```

### 2. Configure Environment Variables

Edit the `.env` file created by the setup script:

```bash
# Edit environment variables
nano .env

# Required: Add your API keys
OPENAI_API_KEY=sk-your-actual-openai-key
STRIPE_SECRET_KEY=sk_your-actual-stripe-key
RESEND_API_KEY=re_your-actual-resend-key
```

### 3. Start Services

```bash
# Start production services
./docker-setup.sh start prod

# Or start development services
./docker-setup.sh start dev
```

### 4. Access Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Nginx Proxy**: http://localhost (redirects to HTTPS)

## 📋 Available Services

### Production Stack (`docker-compose.yml`)

| Service | Port | Description |
|---------|------|-------------|
| `bookaimark-web` | 3000 | Main Next.js application |
| `postgres` | 5432 | PostgreSQL database |
| `redis` | 6379 | Redis cache |
| `nginx` | 80/443 | Reverse proxy with SSL |

### Development Stack (`docker-compose.dev.yml`)

| Service | Port | Description |
|---------|------|-------------|
| `bookaimark-dev` | 3000 | Development app with hot reload |
| `postgres-dev` | 5432 | Development PostgreSQL |
| `redis-dev` | 6379 | Development Redis |
| `mailhog` | 8025 | Email testing UI |

## 🔧 Docker Setup Script Usage

The `docker-setup.sh` script provides convenient commands for managing the Docker environment:

```bash
# Setup the environment
./docker-setup.sh setup

# Start services
./docker-setup.sh start [dev|prod]

# Stop services
./docker-setup.sh stop [dev|prod]

# View logs
./docker-setup.sh logs [service] [env]

# Health check
./docker-setup.sh health

# Cleanup resources
./docker-setup.sh cleanup

# Show help
./docker-setup.sh help
```

### Examples

```bash
# Start development environment
./docker-setup.sh start dev

# View application logs
./docker-setup.sh logs bookaimark-web prod

# Check service health
./docker-setup.sh health

# Stop all services
./docker-setup.sh stop prod
```

## 🏗️ Docker Architecture

### Multi-Stage Build

The production Dockerfile uses a multi-stage build for optimization:

1. **Dependencies Stage**: Installs pnpm and project dependencies
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates minimal runtime image

### Key Features

- ✅ **Optimized Image Size**: Multi-stage build reduces final image size
- ✅ **Security**: Non-root user execution
- ✅ **Health Checks**: Built-in health monitoring
- ✅ **Performance**: Standalone Next.js output
- ✅ **Caching**: Efficient Docker layer caching

## 🔒 Security Configuration

### SSL/TLS Setup

Development SSL certificates are auto-generated. For production:

```bash
# Generate production certificates
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes

# Or use Let's Encrypt
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

### Security Headers

Nginx is configured with security headers:

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: Configured for BookAIMark
- Referrer-Policy: strict-origin-when-cross-origin

## 📊 Monitoring & Health Checks

### Health Check Endpoint

The application provides comprehensive health checks:

```bash
# Check application health
curl http://localhost:3000/api/health

# Simple health check (for Docker)
curl -I http://localhost:3000/api/health
```

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected",
    "filesystem": "accessible",
    "ai": "available"
  },
  "memory": {
    "used": 128,
    "total": 512,
    "percentage": 25
  }
}
```

### Docker Health Checks

Services include built-in health checks:

- **Application**: HTTP health check every 30s
- **Database**: Connection check
- **Redis**: Ping check

## 🔄 Data Persistence

### Volume Mounts

```yaml
volumes:
  - ./data:/app/data          # Application data
  - ./logs:/app/logs          # Application logs
  - postgres_data:/var/lib/postgresql/data  # Database data
  - redis_data:/data          # Redis data
```

### Backup Strategy

```bash
# Backup database
docker-compose exec postgres pg_dump -U bookaimark bookaimark > backup.sql

# Backup application data
tar -czf data-backup.tar.gz ./data

# Backup Redis data
docker-compose exec redis redis-cli BGSAVE
```

## 🚀 Production Deployment

### Environment Variables

Required production environment variables:

```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-secret

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
OPENAI_API_KEY=sk-your-production-openai-key

# Payment
STRIPE_SECRET_KEY=sk_your-production-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_your-production-stripe-key

# Email
RESEND_API_KEY=re_your-production-resend-key

# Monitoring
SENTRY_DSN=https://your-production-sentry-dsn
```

### Scaling

```bash
# Scale web service
docker-compose up --scale bookaimark-web=3

# Use external load balancer
# Configure nginx upstream with multiple backends
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 docker-compose up
```

#### 2. Permission Denied

```bash
# Fix file permissions
chmod +x docker-setup.sh

# Fix data directory permissions
sudo chown -R $(id -u):$(id -g) data/
```

#### 3. Out of Memory

```bash
# Check container memory usage
docker stats

# Increase memory limit
docker-compose up --memory=2g
```

#### 4. Build Failures

```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Debugging

```bash
# View container logs
docker-compose logs -f bookaimark-web

# Execute shell in container
docker-compose exec bookaimark-web sh

# Check container processes
docker-compose exec bookaimark-web ps aux

# Monitor resource usage
docker stats bookaimark-web
```

## 📝 Development

### Hot Reload Development

```bash
# Start development with hot reload
./docker-setup.sh start dev

# View development logs
./docker-setup.sh logs bookaimark-dev dev
```

### Database Access

```bash
# Connect to development database
docker-compose exec postgres-dev psql -U bookaimark -d bookaimark

# Connect to production database
docker-compose exec postgres psql -U bookaimark -d bookaimark
```

### Redis Access

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# View Redis info
docker-compose exec redis redis-cli INFO
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Or use the script
./docker-setup.sh stop prod
./docker-setup.sh start prod
```

### Maintenance Tasks

```bash
# Clean up unused Docker resources
./docker-setup.sh cleanup

# Update dependencies
docker-compose exec bookaimark-web pnpm update

# Database maintenance
docker-compose exec postgres vacuumdb -U bookaimark bookaimark
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [BookAIMark Documentation](./docs/)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review logs: `./docker-setup.sh logs bookaimark-web`
3. Check health: `./docker-setup.sh health`
4. Open an issue on GitHub

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 