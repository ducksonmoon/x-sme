#!/bin/bash

# Production deployment script for X-SME
# This script handles the complete deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="x-sme"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE="env.production"

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
    print_status "Docker Compose is available"
}

# Function to validate environment file
validate_env() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found. Please create it from env.example"
        exit 1
    fi
    
    # Check for required variables
    required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "DATABASE_URL")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            print_warning "Variable $var not found in $ENV_FILE"
        fi
    done
    
    print_status "Environment file validated"
}

# Function to create SSL certificates (self-signed for testing)
create_ssl_certs() {
    if [ ! -d "nginx/ssl" ]; then
        print_status "Creating SSL directory and self-signed certificates..."
        mkdir -p nginx/ssl
        
        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=IR/ST=Tehran/L=Tehran/O=X-SME/CN=localhost"
        
        print_status "SSL certificates created (self-signed)"
        print_warning "For production, replace with proper SSL certificates"
    else
        print_status "SSL certificates already exist"
    fi
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing services
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    
    # Build and start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build
    
    print_status "Services deployed successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U x_sme_user > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    print_status "Database is ready"
    
    # Wait for server
    print_status "Waiting for server..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Server failed to start within 60 seconds"
        exit 1
    fi
    
    print_status "Server is ready"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T server npx prisma migrate deploy
    print_status "Database migrations completed"
}

# Function to seed database (optional)
seed_database() {
    read -p "Do you want to seed the database with initial data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding database..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T server npm run db:seed
        print_status "Database seeded successfully"
    fi
}

# Function to show deployment status
show_status() {
    print_status "Deployment completed successfully!"
    echo
    echo "Services status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    echo
    echo "Access URLs:"
    echo "  Frontend: http://localhost"
    echo "  API: http://localhost/api"
    echo "  Health Check: http://localhost/health"
    echo
    echo "Logs:"
    echo "  docker-compose logs -f"
    echo
    echo "Stop services:"
    echo "  docker-compose down"
}

# Main deployment process
main() {
    print_status "Starting X-SME production deployment..."
    
    # Pre-deployment checks
    check_docker
    check_docker_compose
    validate_env
    create_ssl_certs
    
    # Deploy services
    deploy_services
    wait_for_services
    
    # Database setup
    run_migrations
    seed_database
    
    # Show final status
    show_status
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_status "Stopping services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        print_status "Services stopped"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart
        print_status "Services restarted"
        ;;
    "logs")
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
        ;;
    "status")
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps
        ;;
    "backup")
        print_status "Creating backup..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" run --rm backup
        print_status "Backup completed"
        ;;
    *)
        main
        ;;
esac 