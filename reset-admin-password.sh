#!/bin/bash

echo "Reset Admin Password for VPS Manager Docker Web Console"
echo "======================================================"
echo ""
echo "This script will reset the admin user's password."
echo "Use this if you've forgotten the admin password."
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

# Confirm reset
read -p "Are you sure you want to reset the admin password? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Password reset cancelled."
    exit 0
fi

# Get new password
read -s -p "Enter new admin password: " password
echo ""
read -s -p "Confirm new admin password: " password_confirm
echo ""

if [ "$password" != "$password_confirm" ]; then
    echo "❌ Passwords do not match. Please try again."
    exit 1
fi

if [ ${#password} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters long. Please try again."
    exit 1
fi

# Create a temporary script to reset the password
TMP_SCRIPT=$(mktemp)
cat > $TMP_SCRIPT << EOF
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/vps-manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('$PASSWORD', salt);
    
    // Update admin password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('Admin password reset successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
EOF

# Replace $PASSWORD with the actual password
sed -i "s/\$PASSWORD/$password/g" $TMP_SCRIPT

# Copy the script to the backend container
docker cp $TMP_SCRIPT vps-backend:/app/reset-password.js

# Run the script in the backend container
echo "Resetting admin password..."
RESULT=$(docker-compose exec -T backend node reset-password.js)

# Check if the password reset was successful
if [[ $RESULT == *"Admin password reset successfully"* ]]; then
    echo "✅ Admin password reset successfully!"
    echo "You can now log in with:"
    echo "Email: admin@example.com"
    echo "Password: [your new password]"
else
    echo "❌ Failed to reset admin password. Error:"
    echo "$RESULT"
fi

# Clean up
docker-compose exec -T backend rm /app/reset-password.js
rm $TMP_SCRIPT

echo ""
echo "Reset operation complete!"
