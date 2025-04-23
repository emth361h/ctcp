#!/bin/bash

echo "Updating VPS Manager Docker Web Console..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git to update the application."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "This doesn't appear to be a Git repository. Updates can only be applied to installations that were cloned from Git."
    echo "If you downloaded the application as a ZIP file, you'll need to download the new version and migrate your data manually."
    exit 1
fi

# Backup environment files
echo "Backing up environment files..."
cp backend/.env backend/.env.backup
cp frontend/.env frontend/.env.backup

# Backup user data
echo "Backing up user data..."
mkdir -p backup
cp -r backend/data backup/
cp -r data/mongo backup/

# Pull latest changes
echo "Pulling latest changes from repository..."
git pull

# Restore environment files
echo "Restoring environment files..."
cp backend/.env.backup backend/.env
cp frontend/.env.backup frontend/.env

# Run setup script to install any new dependencies
echo "Running setup script to install new dependencies..."
chmod +x setup.sh
./setup.sh

# Rebuild and restart containers
echo "Rebuilding and restarting containers..."
docker-compose down
docker-compose build
docker-compose up -d

echo "Update complete!"
echo "Your application has been updated to the latest version."
echo "If you encounter any issues, you can restore your data from the backup directory."
