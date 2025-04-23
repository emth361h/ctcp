#!/bin/bash

echo "Stopping VPS Manager Docker Web Console..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start the Docker service before proceeding."
    echo "   On most systems, you can use: sudo systemctl start docker"
    exit 1
fi

# Check if specific service was specified
if [ $# -eq 1 ]; then
    SERVICE=$1
    
    # Validate service
    if [[ "$SERVICE" != "backend" && "$SERVICE" != "frontend" && "$SERVICE" != "nginx" && "$SERVICE" != "mongo" && "$SERVICE" != "all" ]]; then
        echo "Invalid service: $SERVICE"
        echo "Valid services are: backend, frontend, nginx, mongo, all"
        exit 1
    fi
    
    if [ "$SERVICE" == "all" ]; then
        echo "Stopping all services..."
        docker-compose stop
    else
        echo "Stopping $SERVICE service..."
        docker-compose stop $SERVICE
    fi
else
    # No service specified, stop all
    echo "Stopping all services..."
    docker-compose stop
fi

# Check status
echo "Checking service status..."
docker-compose ps

echo ""
echo "Stop operation complete!"
echo "To start the application again, use: ./start.sh"
