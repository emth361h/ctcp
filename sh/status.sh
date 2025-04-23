#!/bin/bash

echo "Checking status of VPS Manager Docker Web Console..."
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start the Docker service before proceeding."
    echo "   On most systems, you can use: sudo systemctl start docker"
    exit 1
fi

# Check if containers are running
echo "Container Status:"
echo "----------------"
docker-compose ps
echo ""

# Check resource usage
echo "Resource Usage:"
echo "--------------"
docker stats --no-stream
echo ""

# Check network status
echo "Network Status:"
echo "--------------"
docker network ls | grep vps-network
echo ""

# Check if services are accessible
echo "Service Accessibility:"
echo "--------------------"

# Check if Nginx is accessible
if curl -s -o /dev/null -w "%{http_code}" http://localhost &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
        echo "✅ Web interface is accessible at http://localhost"
    else
        echo "⚠️  Web interface returned HTTP code $HTTP_CODE"
    fi
else
    echo "❌ Web interface is not accessible"
fi

# Check if backend API is accessible
if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/stats/version &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/stats/version)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        echo "✅ Backend API is accessible"
    else
        echo "⚠️  Backend API returned HTTP code $HTTP_CODE"
    fi
else
    echo "❌ Backend API is not accessible"
fi

# Check MongoDB connection
MONGO_STATUS=$(docker-compose exec -T mongo mongo --eval "db.stats()" 2>&1)
if [[ $MONGO_STATUS == *"ok"* ]]; then
    echo "✅ MongoDB is running and accessible"
else
    echo "❌ MongoDB is not accessible"
fi

echo ""
echo "Status check complete!"
