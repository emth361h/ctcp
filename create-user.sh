#!/bin/bash

echo "Create User for VPS Manager Docker Web Console"
echo "=============================================="
echo ""
echo "This script will create a new user account."
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

# Get user details
read -p "Enter username: " username
read -p "Enter email: " email
read -s -p "Enter password: " password
echo ""
read -s -p "Confirm password: " password_confirm
echo ""

if [ "$password" != "$password_confirm" ]; then
    echo "❌ Passwords do not match. Please try again."
    exit 1
fi

if [ ${#password} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters long. Please try again."
    exit 1
fi

# Get user role
echo "Select user role:"
echo "1) User"
echo "2) Admin"
read -p "Enter choice (1-2): " role_choice

case $role_choice in
    1)
        role="user"
        ;;
    2)
        role="admin"
        ;;
    *)
        echo "❌ Invalid choice. Please enter 1 for User or 2 for Admin."
        exit 1
        ;;
esac

# Get resource limits
read -p "Enter container limit (default: 5): " container_limit
container_limit=${container_limit:-5}

read -p "Enter CPU limit in cores (default: 2): " cpu_limit
cpu_limit=${cpu_limit:-2}

read -p "Enter memory limit in MB (default: 2048): " memory_limit
memory_limit=${memory_limit:-2048}

read -p "Enter storage limit in GB (default: 10): " storage_limit
storage_limit=${storage_limit:-10}

# Create a temporary script to create the user
TMP_SCRIPT=$(mktemp)
cat > $TMP_SCRIPT << EOF
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/vps-manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: '$USERNAME' },
        { email: '$EMAIL' }
      ]
    });
    
    if (existingUser) {
      console.error('User with this username or email already exists');
      process.exit(1);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('$PASSWORD', salt);
    
    // Create user
    const user = new User({
      username: '$USERNAME',
      email: '$EMAIL',
      password: hashedPassword,
      role: '$ROLE',
      active: true,
      resourceLimits: {
        containers: $CONTAINER_LIMIT,
        cpuLimit: $CPU_LIMIT,
        memoryLimit: $MEMORY_LIMIT,
        storageLimit: $STORAGE_LIMIT
      },
      createdAt: new Date()
    });
    
    await user.save();
    
    console.log('User created successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

createUser();
EOF

# Replace placeholders with actual values
sed -i "s/\$USERNAME/$username/g" $TMP_SCRIPT
sed -i "s/\$EMAIL/$email/g" $TMP_SCRIPT
sed -i "s/\$PASSWORD/$password/g" $TMP_SCRIPT
sed -i "s/\$ROLE/$role/g" $TMP_SCRIPT
sed -i "s/\$CONTAINER_LIMIT/$container_limit/g" $TMP_SCRIPT
sed -i "s/\$CPU_LIMIT/$cpu_limit/g" $TMP_SCRIPT
sed -i "s/\$MEMORY_LIMIT/$memory_limit/g" $TMP_SCRIPT
sed -i "s/\$STORAGE_LIMIT/$storage_limit/g" $TMP_SCRIPT

# Copy the script to the backend container
docker cp $TMP_SCRIPT vps-backend:/app/create-user.js

# Run the script in the backend container
echo "Creating user..."
RESULT=$(docker-compose exec -T backend node create-user.js)

# Check if the user creation was successful
if [[ $RESULT == *"User created successfully"* ]]; then
    echo "✅ User created successfully!"
    echo "Username: $username"
    echo "Email: $email"
    echo "Role: $role"
    echo "Resource Limits:"
    echo "  Containers: $container_limit"
    echo "  CPU: $cpu_limit cores"
    echo "  Memory: $memory_limit MB"
    echo "  Storage: $storage_limit GB"
else
    echo "❌ Failed to create user. Error:"
    echo "$RESULT"
fi

# Clean up
docker-compose exec -T backend rm /app/create-user.js
rm $TMP_SCRIPT

echo ""
echo "User creation operation complete!"
