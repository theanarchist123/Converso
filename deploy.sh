#!/bin/bash

# Docker Build and Deploy Script for SaaS App
# This script builds and deploys the application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="saas-app"
CONTAINER_NAME="saas-app-container"
PORT="3000"

echo -e "${BLUE}🚀 Starting Docker deployment for SaaS App${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Make sure to create it with your environment variables."
    echo "Required variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "- CLERK_SECRET_KEY"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop and remove existing container
print_info "Stopping existing container if running..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Remove existing image
print_info "Removing existing image if exists..."
docker rmi $IMAGE_NAME 2>/dev/null || true

# Build the Docker image
print_info "Building Docker image..."

# Load env vars from .env.local for build args
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Build with build arguments for Next.js public env vars
docker build -t $IMAGE_NAME \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
  .

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Run the container
print_info "Starting container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  --env-file .env.local \
  --restart unless-stopped \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
    print_status "Container started successfully"
    print_info "Application is running at http://localhost:$PORT"
    
    # Wait a moment for the container to start
    sleep 5
    
    # Check container status
    if docker ps | grep -q $CONTAINER_NAME; then
        print_status "Container is running"
        
        # Check health endpoint
        print_info "Checking application health..."
        if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
            print_status "Application is healthy and responding"
        else
            print_warning "Application may still be starting up. Check logs if needed."
        fi
    else
        print_error "Container failed to start"
        exit 1
    fi
else
    print_error "Failed to start container"
    exit 1
fi

echo ""
print_status "Deployment completed successfully! 🎉"
echo ""
print_info "Useful commands:"
echo "  View logs: docker logs $CONTAINER_NAME"
echo "  Stop container: docker stop $CONTAINER_NAME"
echo "  Restart container: docker restart $CONTAINER_NAME"
echo "  Remove container: docker rm $CONTAINER_NAME"
echo "  View running containers: docker ps"
echo ""
print_info "Access your application:"
echo "  Local: http://localhost:$PORT"
echo "  Health check: http://localhost:$PORT/api/health"