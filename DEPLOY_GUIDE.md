# DecentraFund GitHub Pages Deployment Guide

This guide walks you through deploying DecentraFund to GitHub Pages.

## Prerequisites

1. You have already installed all project dependencies with `npm install`
2. The `gh-pages` package is installed (it should be in your package.json)
3. You have write access to the GitHub repository: `https://github.com/investorVOU/Decent-fund.git`

## Deployment Steps

### Option 1: Using the Deployment Script (Recommended)

1. Make sure you're on the main branch with your latest changes:
   ```
   git checkout main
   ```

2. Run the deployment script:
   ```
   ./deploy.sh
   ```

3. Wait for the script to finish. It will:
   - Build the application 
   - Copy the GitHub Pages index file
   - Deploy to the gh-pages branch

4. Check your live site at: https://investorVOU.github.io/Decent-fund/

### Option 2: Manual Deployment

If you need more control over the deployment process:

1. Build the application:
   ```
   npm run build
   ```

2. Copy the GitHub Pages index file:
   ```
   cp gh-pages-index.html dist/index.html
   ```

3. Deploy to GitHub Pages:
   ```
   node deploy.js
   ```

## Troubleshooting

If deployment fails:

1. Check your Git authentication - make sure you have access to push to the repository
2. Verify that the gh-pages branch exists on GitHub after running the script
3. If you get 404 errors, it may take a few minutes for GitHub Pages to update
4. Check that your paths in the built files are correct (relative vs. absolute)

## Updating the Deployment

To change how the site is deployed:

1. Edit `deploy.js` to change repository settings
2. Edit `gh-pages-index.html` to change the landing page
3. Edit `deploy.sh` to modify the build and deploy process

The current setup is configured for: https://investorVOU.github.io/Decent-fund/