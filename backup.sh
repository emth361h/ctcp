#!/bin/bash

# Get current date for backup filename
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="backups/backup_$BACKUP_DATE"

echo "Creating backup of VPS Manager Docker Web Console data..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup MongoDB data
echo "Backing up MongoDB data..."
if [ -d "data/mongo" ]; then
    # Stop containers to ensure data consistency
    echo "Stopping containers to ensure data consistency..."
    docker-compose stop mongo
    
    # Copy MongoDB data
    cp -r data/mongo "$BACKUP_DIR/mongo"
    
    # Restart containers
    echo "Restarting containers..."
    docker-compose start mongo
else
    echo "MongoDB data directory not found. Skipping MongoDB backup."
fi

# Backup Docker Compose files
echo "Backing up Docker Compose files..."
if [ -d "backend/data/compose" ]; then
    mkdir -p "$BACKUP_DIR/compose"
    cp -r backend/data/compose/* "$BACKUP_DIR/compose/"
else
    echo "Docker Compose directory not found. Skipping Docker Compose backup."
fi

# Backup Dockerfiles
echo "Backing up Dockerfiles..."
if [ -d "backend/data/dockerfiles" ]; then
    mkdir -p "$BACKUP_DIR/dockerfiles"
    cp -r backend/data/dockerfiles/* "$BACKUP_DIR/dockerfiles/"
else
    echo "Dockerfiles directory not found. Skipping Dockerfiles backup."
fi

# Backup environment files
echo "Backing up environment files..."
if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/backend.env"
fi

if [ -f "frontend/.env" ]; then
    cp frontend/.env "$BACKUP_DIR/frontend.env"
fi

# Create a compressed archive of the backup
echo "Creating compressed archive of the backup..."
tar -czf "backups/vps-manager-backup-$BACKUP_DATE.tar.gz" -C "backups" "backup_$BACKUP_DATE"

# Remove the uncompressed backup directory
rm -rf "$BACKUP_DIR"

echo "Backup complete!"
echo "Backup saved to: backups/vps-manager-backup-$BACKUP_DATE.tar.gz"
echo ""
echo "To restore this backup, use the restore.sh script:"
echo "./restore.sh backups/vps-manager-backup-$BACKUP_DATE.tar.gz"
