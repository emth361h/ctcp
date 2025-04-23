#!/bin/bash

# Install Express and related dependencies
npm install express cors morgan
npm install bcryptjs jsonwebtoken
npm install mongoose
npm install express-validator
npm install dotenv

# Install Docker-related dependencies
npm install dockerode
npm install yaml

# Install development dependencies
npm install --save-dev nodemon

echo "Backend dependencies installed successfully!"
