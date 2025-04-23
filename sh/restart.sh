#!/bin/bash

echo "Restarting VPS Manager Docker Web Console..."

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
        echo "Restarting all services..."
        docker-compose restart
    else
        echo "Restarting $SERVICE service..."
        docker-compose restart $SERVICE
    fi
else
    # No service specified, restart all
    echo "Restarting all services..."
    docker-compose restart
fi

echo "Checking service status..."
docker-compose ps

echo "Restart complete!"
echo "You can access the application at: http://localhost"
