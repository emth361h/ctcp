#!/bin/bash

echo "Starting VPS Manager Docker Web Console..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start the Docker service before proceeding."
    echo "   On most systems, you can use: sudo systemctl start docker"
    exit 1
fi

# Check if containers are already running
RUNNING_CONTAINERS=$(docker-compose ps --services --filter "status=running" | wc -l)
if [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    echo "Some containers are already running."
    echo "Current status:"
    docker-compose ps
    
    read -p "Do you want to restart all containers? (y/n): " restart
    if [[ "$restart" == "y" || "$restart" == "Y" ]]; then
        echo "Restarting all containers..."
        docker-compose restart
    else
        echo "Continuing with existing containers."
    fi
else
    # Start containers
    echo "Starting all containers..."
    docker-compose up -d
fi

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Check status
echo "Checking service status..."
docker-compose ps

echo ""
echo "VPS Manager Docker Web Console is now running!"
echo "You can access the application at: http://localhost"
echo "Default admin credentials: admin@example.com / adminpassword"
echo ""
echo "To monitor the application, use: ./monitor.sh"
echo "To view logs, use: ./logs.sh"
echo "To check status, use: ./status.sh"
