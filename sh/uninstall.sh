#!/bin/bash

echo "Uninstalling VPS Manager Docker Web Console..."

# Confirm uninstallation
read -p "Are you sure you want to uninstall VPS Manager Docker Web Console? This will remove all containers, images, and data. (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Uninstallation cancelled."
    exit 0
fi

# Offer to create a backup before uninstalling
read -p "Would you like to create a backup before uninstalling? (y/n): " backup
if [[ "$backup" == "y" || "$backup" == "Y" ]]; then
    echo "Creating backup..."
    ./backup.sh
    echo "Backup created."
fi

# Stop and remove containers
echo "Stopping and removing containers..."
docker-compose down -v

# Remove Docker images
echo "Removing Docker images..."
docker rmi vps-backend vps-frontend vps-nginx mongo:latest

# Remove data directories
echo "Removing data directories..."
read -p "Do you want to remove all data directories? This will permanently delete all your data. (y/n): " remove_data
if [[ "$remove_data" == "y" || "$remove_data" == "Y" ]]; then
    rm -rf data
    rm -rf backend/data
    echo "Data directories removed."
else
    echo "Data directories preserved."
fi

echo "Uninstallation complete!"
echo "The VPS Manager Docker Web Console has been uninstalled from your system."
echo "If you want to completely remove the application files, you can delete this directory."
