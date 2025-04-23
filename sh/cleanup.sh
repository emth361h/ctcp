#!/bin/bash

echo "Cleaning up Docker resources for VPS Manager Web Console..."

# Confirm cleanup
read -p "This will remove unused Docker resources (volumes, networks, images). Continue? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start the Docker service before proceeding."
    echo "   On most systems, you can use: sudo systemctl start docker"
    exit 1
fi

# Display current disk usage
echo "Current disk usage:"
df -h | grep -v "tmpfs" | grep -v "udev"
echo ""

# Display Docker disk usage
echo "Docker disk usage before cleanup:"
docker system df
echo ""

# Remove unused containers
echo "Removing unused containers..."
docker container prune -f

# Remove unused networks
echo "Removing unused networks..."
docker network prune -f

# Remove unused volumes (be careful with this one)
echo "Checking for unused volumes..."
UNUSED_VOLUMES=$(docker volume ls -qf dangling=true | wc -l)
if [ "$UNUSED_VOLUMES" -gt 0 ]; then
    echo "Found $UNUSED_VOLUMES unused volumes."
    read -p "Do you want to remove unused volumes? This will permanently delete data. (y/n): " remove_volumes
    if [[ "$remove_volumes" == "y" || "$remove_volumes" == "Y" ]]; then
        docker volume prune -f
        echo "Unused volumes removed."
    else
        echo "Skipping volume cleanup."
    fi
else
    echo "No unused volumes found."
fi

# Remove unused images
echo "Checking for unused images..."
UNUSED_IMAGES=$(docker images -qf dangling=true | wc -l)
if [ "$UNUSED_IMAGES" -gt 0 ]; then
    echo "Found $UNUSED_IMAGES unused images."
    read -p "Do you want to remove unused images? (y/n): " remove_images
    if [[ "$remove_images" == "y" || "$remove_images" == "Y" ]]; then
        docker image prune -f
        echo "Unused images removed."
    else
        echo "Skipping image cleanup."
    fi
else
    echo "No unused images found."
fi

# Display Docker disk usage after cleanup
echo ""
echo "Docker disk usage after cleanup:"
docker system df
echo ""

# Display current disk usage after cleanup
echo "Current disk usage after cleanup:"
df -h | grep -v "tmpfs" | grep -v "udev"
echo ""

echo "Cleanup complete!"
