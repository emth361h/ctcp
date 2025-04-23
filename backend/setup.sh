#!/bin/bash

# Install Express and related dependencies
npm install express cors morgan  --legacy-peer-deps
npm install bcryptjs jsonwebtoken --legacy-peer-deps
npm install mongoose --legacy-peer-deps
npm install express-validator --legacy-peer-deps
npm install dotenv --legacy-peer-deps

# Install Docker-related dependencies
npm install dockerode --legacy-peer-deps
npm install yaml --legacy-peer-deps

# Install development dependencies
npm install --save-dev --legacy-peer-deps nodemon

echo "Backend dependencies installed successfully!"
