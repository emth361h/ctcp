#!/bin/bash

# Check if backup file is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    echo "Example: $0 backups/vps-manager-backup-2025-04-23_12-00-00.tar.gz"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring VPS Manager Docker Web Console from backup: $BACKUP_FILE"

# Create temporary directory for extraction
TEMP_DIR="temp_restore_$(date +%s)"
mkdir -p "$TEMP_DIR"

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory (should be the only directory in TEMP_DIR)
BACKUP_DIR=$(find "$TEMP_DIR" -type d -depth 1)

if [ -z "$BACKUP_DIR" ]; then
    echo "Error: Could not find backup directory in the archive."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Stop all containers
echo "Stopping containers..."
docker-compose down

# Restore MongoDB data
if [ -d "$BACKUP_DIR/mongo" ]; then
    echo "Restoring MongoDB data..."
    # Ensure the target directory exists
    mkdir -p data
    # Remove existing MongoDB data
    rm -rf data/mongo
    # Copy MongoDB data from backup
    cp -r "$BACKUP_DIR/mongo" data/
else
    echo "MongoDB data not found in backup. Skipping MongoDB restore."
fi

# Restore Docker Compose files
if [ -d "$BACKUP_DIR/compose" ]; then
    echo "Restoring Docker Compose files..."
    # Ensure the target directory exists
    mkdir -p backend/data/compose
    # Remove existing Docker Compose files
    rm -rf backend/data/compose/*
    # Copy Docker Compose files from backup
    cp -r "$BACKUP_DIR/compose/"* backend/data/compose/
else
    echo "Docker Compose files not found in backup. Skipping Docker Compose restore."
fi

# Restore Dockerfiles
if [ -d "$BACKUP_DIR/dockerfiles" ]; then
    echo "Restoring Dockerfiles..."
    # Ensure the target directory exists
    mkdir -p backend/data/dockerfiles
    # Remove existing Dockerfiles
    rm -rf backend/data/dockerfiles/*
    # Copy Dockerfiles from backup
    cp -r "$BACKUP_DIR/dockerfiles/"* backend/data/dockerfiles/
else
    echo "Dockerfiles not found in backup. Skipping Dockerfiles restore."
fi

# Restore environment files
if [ -f "$BACKUP_DIR/backend.env" ]; then
    echo "Restoring backend environment file..."
    cp "$BACKUP_DIR/backend.env" backend/.env
fi

if [ -f "$BACKUP_DIR/frontend.env" ]; then
    echo "Restoring frontend environment file..."
    cp "$BACKUP_DIR/frontend.env" frontend/.env
fi

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

# Start containers
echo "Starting containers..."
docker-compose up -d

echo "Restore complete!"
echo "Your application has been restored from the backup."
echo "You can access the application at: http://localhost"
