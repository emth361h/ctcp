#!/bin/bash

echo "List Users for VPS Manager Docker Web Console"
echo "============================================="
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start the Docker service before proceeding."
    echo "   On most systems, you can use: sudo systemctl start docker"
    exit 1
fi

# Check if containers are running
if ! docker-compose ps | grep -q "vps-backend.*Up"; then
    echo "❌ Backend container is not running. Please start the application first:"
    echo "   ./start.sh"
    exit 1
fi

# Create a temporary script to list users
TMP_SCRIPT=$(mktemp)
cat > $TMP_SCRIPT << EOF
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/vps-manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({}).select('-password').lean();
    
    if (users.length === 0) {
      console.log('No users found');
      process.exit(0);
    }
    
    // Format and print user information
    console.log(JSON.stringify(users, null, 2));
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();
EOF

# Copy the script to the backend container
docker cp $TMP_SCRIPT vps-backend:/app/list-users.js

# Run the script in the backend container
echo "Listing users..."
RESULT=$(docker-compose exec -T backend node list-users.js)

# Format and display the results
if [[ $RESULT == *"No users found"* ]]; then
    echo "No users found in the system."
else
    # Extract the JSON part from the result
    USERS_JSON=$(echo "$RESULT" | sed -n '/\[/,/\]/p')
    
    # Parse and display user information in a readable format
    echo "$USERS_JSON" | jq -r '.[] | "ID: \(.id)\nUsername: \(.username)\nEmail: \(.email)\nRole: \(.role)\nActive: \(.active)\nResource Limits:\n  Containers: \(.resourceLimits.containers)\n  CPU: \(.resourceLimits.cpuLimit) cores\n  Memory: \(.resourceLimits.memoryLimit) MB\n  Storage: \(.resourceLimits.storageLimit) GB\nCreated: \(.createdAt)\nLast Login: \(.lastLogin || \"Never\")\n"'
    
    # If jq is not available, fallback to displaying the raw JSON
    if [ $? -ne 0 ]; then
        echo "Could not format user information. Raw data:"
        echo "$USERS_JSON"
    fi
fi

# Clean up
docker-compose exec -T backend rm /app/list-users.js
rm $TMP_SCRIPT

echo ""
echo "User listing operation complete!"
