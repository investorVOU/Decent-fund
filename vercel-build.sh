#!/bin/bash

# This script is used by Vercel to build both client and server

# Install dependencies
npm install

# Build server (using TypeScript compiler)
npx tsc --project tsconfig.json

# Build client
cd client
npm install
npm run build

# Return to root directory
cd ..

# Create a production package.json for Vercel
cat > dist/package.json << EOL
{
  "name": "decentrafund",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18"
  }
}
EOL

echo "Build completed successfully!"