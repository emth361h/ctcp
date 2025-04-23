#!/bin/bash

echo "Checking prerequisites for Docker VPS Manager Web Console..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker is installed: $DOCKER_VERSION"
else
    echo "❌ Docker is not installed. Please install Docker before proceeding."
    echo "   Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose is installed: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose is not installed. Please install Docker Compose before proceeding."
    echo "   Visit https://docs.docker.com/compose/install/ for installation instructions."
    exit 1
fi

# Check if Docker daemon is running
if docker info &> /dev/null; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon is not running. Please start the Docker service before proceeding."
    echo "   On most systems, you can use: sudo systemctl start docker"
    exit 1
fi

# Check if current user can run Docker without sudo
if docker ps &> /dev/null; then
    echo "✅ Current user can run Docker commands without sudo"
else
    echo "⚠️  Current user may not have permission to run Docker commands without sudo."
    echo "   You might need to add your user to the docker group:"
    echo "   sudo usermod -aG docker $USER"
    echo "   Then log out and log back in to apply the changes."
fi

# Check if port 80 is available
if ! lsof -i:80 &> /dev/null; then
    echo "✅ Port 80 is available"
else
    echo "⚠️  Port 80 is already in use. The application uses this port by default."
    echo "   You may need to stop other services using port 80 or modify the docker-compose.yml file."
fi

echo ""
echo "Prerequisite check completed. You can now run ./setup.sh to set up the application."
