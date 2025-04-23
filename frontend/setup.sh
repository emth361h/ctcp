#!/bin/bash

# Install React and related dependencies
npm install react react-dom react-router-dom --legacy-peer-deps
npm install @types/react @types/react-dom @types/react-router-dom --legacy-peer-deps

# Install Material UI
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled --legacy-peer-deps

# Install Axios for API requests
npm install axios --legacy-peer-deps

# Install Chart.js for charts
npm install chart.js react-chartjs-2 --legacy-peer-deps

# Install TypeScript
npm install typescript @types/node --legacy-peer-deps

echo "Frontend dependencies installed successfully!"
