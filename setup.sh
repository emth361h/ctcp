#!/bin/bash

echo "Setting up VPS Manager Docker Web Console..."

# Make scripts executable
chmod +x check-prerequisites.sh
chmod +x backend/setup.sh
chmod +x frontend/setup.sh

# Check prerequisites
echo "Checking prerequisites..."
./check-prerequisites.sh
if [ $? -ne 0 ]; then
    echo "Prerequisites check failed. Please fix the issues and try again."
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backend/data/compose
mkdir -p backend/data/dockerfiles
mkdir -p data/mongo

echo "Setting up backend..."
cd backend/src
./setup.sh
cd ..

echo "Setting up frontend..."
cd frontend/src
./setup.sh
cd ..

echo "Setup complete!"
echo "You can now start the application with: docker-compose up -d"
echo "Once started, you can access the application at: http://localhost"
echo "Default admin credentials: admin@example.com / adminpassword"
