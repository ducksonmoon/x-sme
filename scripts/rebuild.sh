#!/bin/bash

# Rebuild script for X-SME with Node.js 20
# This script cleans up and rebuilds with the updated dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Cleaning up Docker build cache..."

# Stop all containers
docker-compose down

# Clean up Docker cache
docker system prune -f
docker builder prune -f

# Remove any existing images
docker rmi $(docker images -q x-sme_client x-sme_server 2>/dev/null) 2>/dev/null || true

print_status "Rebuilding with Node.js 20..."

# Rebuild all services
docker-compose up -d --build

print_status "Rebuild completed successfully!"
print_status "Check status with: docker-compose ps"
print_status "View logs with: docker-compose logs -f" 