# DecentraFund Deployment Guide

This guide provides instructions for deploying the DecentraFund application to GitHub Pages.

## Prerequisites

Before deploying, ensure you have the following:

1. Git access to the target repository
2. Node.js installed (v16 or newer recommended)
3. The `gh-pages` npm package installed (`npm install -g gh-pages`)

## Environment Setup

The application uses environment variables for configuration:

1. For development, these are stored in `.env`
2. For production, these are stored in `.env.production`

The key variable for deployment is:

- `VITE_BASE_URL`: Set to `/Decent-fund/` for GitHub Pages

## Deployment Process

### Automatic Deployment

The easiest way to deploy is using the provided script:

```bash
./deploy.sh
```

This script will:
1. Build the application for production
2. Replace the default index.html with gh-pages-index.html
3. Deploy to GitHub Pages

### Manual Deployment

If you prefer to deploy manually:

1. Build the application: `npm run build`
2. Copy `gh-pages-index.html` to `dist/index.html`
3. Create a `.nojekyll` file in `dist/`
4. Run `node deploy.js`

## Understanding the Base URL

For GitHub Pages deployment, we handle the base URL (`/Decent-fund/`) in several ways:

1. `.env.production` contains the `VITE_BASE_URL` variable which is used during production builds
2. The `baseUrl.ts` utility provides helper functions to ensure all links work correctly:
   - `getBaseUrl()` - returns the current base URL 
   - `withBaseUrl(path)` - prepends the base URL to a given path

When making API requests or creating links, you may need to use these functions to ensure
proper path resolution on GitHub Pages.

## Troubleshooting

If deployment fails:

1. Check your Git authentication - make sure you have access to push to the repository
2. Verify that the gh-pages branch exists on GitHub after running the script
3. If you get 404 errors, it may take a few minutes for GitHub Pages to update
4. If assets or links aren't working, check that the base URL is handled correctly:
   - Images and other static assets need the base URL
   - API requests should be absolute paths

## Updating the Deployment

To change how the site is deployed:

1. Edit `deploy.js` to change repository settings
2. Edit `gh-pages-index.html` to change the landing page
3. Edit `deploy.sh` to modify the build and deploy process
4. Edit `.env.production` to change the base URL if needed

The current setup is configured for: https://investorVOU.github.io/Decent-fund/