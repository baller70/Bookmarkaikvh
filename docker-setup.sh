#!/bin/bash

# BookAIMark Docker Setup Script
# This script helps set up and manage the BookAIMark Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data
    mkdir -p logs
    mkdir -p ssl
    mkdir -p backend/database
    
    print_status "Directories created successfully"
}

# Generate SSL certificates for development
generate_ssl_certs() {
    print_status "Generating SSL certificates for development..."
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_status "SSL certificates generated"
    else
        print_status "SSL certificates already exist"
    fi
}

# Create environment file
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating environment file..."
        cat > .env << EOF
# BookAIMark Docker Environment Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://bookaimark:bookaimark_dev_password@postgres:5432/bookaimark
REDIS_URL=redis://redis:6379

# Authentication (Replace with your actual values)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-replace-this

# AI Services (Replace with your actual API key)
OPENAI_API_KEY=sk-your-openai-api-key-replace-this

# Payment Processing (Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-replace-this
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-replace-this

# Email Services (Replace with your actual key)
RESEND_API_KEY=re_your-resend-api-key-replace-this

# Monitoring (Replace with your actual DSN)
SENTRY_DSN=https://your-sentry-dsn-replace-this
EOF
        print_warning "Environment file created. Please update with your actual API keys!"
    else
        print_status "Environment file already exists"
    fi
}

# Create database initialization script
create_db_init() {
    print_status "Creating database initialization script..."
    
    cat > backend/database/init.sql << EOF
-- BookAIMark Database Initialization
-- This script creates the basic tables for development

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    notes TEXT,
    ai_summary TEXT,
    ai_tags TEXT[],
    ai_category VARCHAR(100),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Processing Jobs table
CREATE TABLE IF NOT EXISTS ai_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_user_id ON ai_processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_status ON ai_processing_jobs(status);

-- Insert sample data for development
INSERT INTO users (id, email, name) VALUES 
    ('dev-user-123', 'dev@example.com', 'Dev User')
ON CONFLICT (email) DO NOTHING;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bookaimark;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bookaimark;
EOF
    
    print_status "Database initialization script created"
}

# Build and start services
start_services() {
    local env_type=${1:-production}
    
    print_header "Starting BookAIMark Services ($env_type)"
    
    if [ "$env_type" = "development" ]; then
        docker-compose -f docker-compose.dev.yml up --build -d
    else
        docker-compose up --build -d
    fi
    
    print_status "Services started successfully"
    print_status "Application will be available at: http://localhost:3000"
    print_status "Nginx proxy will be available at: http://localhost (redirects to HTTPS)"
    
    if [ "$env_type" = "development" ]; then
        print_status "Mailhog UI available at: http://localhost:8025"
    fi
}

# Stop services
stop_services() {
    local env_type=${1:-production}
    
    print_header "Stopping BookAIMark Services"
    
    if [ "$env_type" = "development" ]; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    
    print_status "Services stopped successfully"
}

# Show logs
show_logs() {
    local service=${1:-bookaimark-web}
    local env_type=${2:-production}
    
    print_header "Showing logs for $service"
    
    if [ "$env_type" = "development" ]; then
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    else
        docker-compose logs -f "$service"
    fi
}

# Health check
health_check() {
    print_header "Health Check"
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Docker containers are running"
    else
        print_error "Docker containers are not running"
        return 1
    fi
    
    # Check application health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Application is healthy"
    else
        print_warning "Application health check failed"
    fi
    
    # Check database connection
    if docker-compose exec postgres pg_isready -U bookaimark > /dev/null 2>&1; then
        print_status "Database is ready"
    else
        print_warning "Database connection failed"
    fi
    
    # Check Redis connection
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is ready"
    else
        print_warning "Redis connection failed"
    fi
}

# Clean up
cleanup() {
    print_header "Cleaning up Docker resources"
    
    docker-compose down -v
    docker system prune -f
    
    print_status "Cleanup completed"
}

# Show usage
show_usage() {
    echo "BookAIMark Docker Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup                 Set up the Docker environment"
    echo "  start [dev|prod]      Start services (default: prod)"
    echo "  stop [dev|prod]       Stop services (default: prod)"
    echo "  logs [service] [env]  Show logs for a service"
    echo "  health                Check service health"
    echo "  cleanup               Clean up Docker resources"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup              # Set up environment"
    echo "  $0 start dev          # Start development services"
    echo "  $0 start prod         # Start production services"
    echo "  $0 logs bookaimark-web dev  # Show logs for web service"
    echo "  $0 health             # Check service health"
    echo "  $0 cleanup            # Clean up resources"
}

# Main script logic
main() {
    case "${1:-help}" in
        setup)
            print_header "Setting up BookAIMark Docker Environment"
            check_docker
            create_directories
            generate_ssl_certs
            create_env_file
            create_db_init
            print_status "Setup completed successfully!"
            print_warning "Please update the .env file with your actual API keys before starting services."
            ;;
        start)
            start_services "${2:-production}"
            ;;
        stop)
            stop_services "${2:-production}"
            ;;
        logs)
            show_logs "${2:-bookaimark-web}" "${3:-production}"
            ;;
        health)
            health_check
            ;;
        cleanup)
            cleanup
            ;;
        help|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@" 