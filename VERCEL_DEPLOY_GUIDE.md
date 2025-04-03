# Vercel Deployment Guide for DecentraFund

This guide explains how to deploy the DecentraFund application to Vercel, ensuring both frontend and backend components work properly.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The DecentraFund repository in your GitHub account
3. Access to necessary environment variables (DATABASE_URL, INFURA_PROJECT_ID, etc.)

## Deployment Steps

### 1. Connect your GitHub Repository to Vercel

1. Log in to Vercel Dashboard
2. Click "Add New..." → "Project" 
3. Select your DecentraFund repository
4. Use these settings:
   - Root Directory: `.` (default)
   - Build Command: `./vercel-build.sh` (this will build both frontend and backend)
   - Output Directory: `client/dist`
   - Install Command: `npm install`

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

- `DATABASE_URL`: Your PostgreSQL database URL
- `INFURA_PROJECT_ID`: Your Infura project ID for Sepolia testnet access
- `SESSION_SECRET`: A secure random string for session encryption
- `ADMIN_PASS`: The admin password
- `NODE_ENV`: Set to `production`

### 3. Deploy Settings

1. Click "Deploy" to start the initial deployment
2. Vercel will automatically build and deploy your application
3. After deployment, Vercel provides a URL for your application (e.g., `your-project.vercel.app`)

## After Deployment

1. Test the frontend by visiting your Vercel URL
2. Test API endpoints by visiting `https://your-project.vercel.app/api/proposals`
3. If everything works, your full-stack application is successfully deployed!

## Troubleshooting

### API Connection Issues

If your frontend can't connect to your backend API:

1. Check the Vercel logs in the dashboard to see if there are any backend errors
2. Ensure all environment variables are correctly set
3. Verify your database is accessible from Vercel's serverless functions
4. If needed, redeploy the application after making changes

### Database Connection Problems

If you're experiencing database errors:

1. Make sure your `DATABASE_URL` environment variable is correctly set
2. Check if your database allows connections from Vercel's IP addresses
3. Consider using Vercel Postgres or a database service that's compatible with serverless deployments
4. Try connecting to your database from a serverless function to confirm connectivity

### CORS Issues

If you're facing CORS errors:

1. The application is configured to allow cross-origin requests from the frontend
2. If you're still facing issues, you may need to add specific origins to the CORS configuration

## Monitoring and Maintenance

1. Vercel provides detailed logs for each deployment and function execution
2. Monitor your application's performance and errors in the Vercel dashboard
3. For high-traffic applications, consider upgrading to a paid Vercel plan for better performance

## Important Notes

- Vercel operates on a serverless model, which means functions (like your API endpoints) have cold starts and timeouts
- For production use, consider optimizing your API calls for serverless environments
- The configured setup uses Vercel's Functions feature to run your Express backend