#!/bin/bash

# This script deploys the DecentraFund application to GitHub Pages

# Exit immediately if a command exits with a non-zero status
set -e

# Print commands before executing them
set -x

# Build the application
echo "Building application for production..."
npm run build

# Create a gh-pages-index.html file for GitHub Pages
echo "Creating GitHub Pages index file..."
cp gh-pages-index.html dist/index.html

# Run the deploy script to push the built files to GitHub Pages
echo "Deploying to GitHub Pages..."
node deploy.js

echo "✅ Deployment complete! Your application should be available at:"
echo "https://investorVOU.github.io/Decent-fund/"
echo ""
echo "Note: It may take a few minutes for the changes to propagate."