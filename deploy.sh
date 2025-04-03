#!/bin/bash

# Ensure production environment variables are used
echo "Setting up production environment..."
cp .env.production .env

# Build the project
echo "Building the project..."
npm run build

# Copy the GitHub Pages index file
echo "Copying GitHub Pages index file..."
cp gh-pages-index.html dist/index.html

# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."
node deploy.js

# Cleanup
echo "Cleaning up..."
if [ -f ".env" ]; then
  rm .env
fi

echo "Done!"