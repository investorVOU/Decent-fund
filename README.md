# DecentraFund

A decentralized crowdfunding platform leveraging blockchain technology to enable transparent, community-driven funding and proposal voting.

## Features

- **Blockchain Integration**: Built on Ethereum (Sepolia testnet) for secure, transparent transactions
- **Smart Voting System**: Stake ETH to vote on proposals with tokens returned once funding goals are met
- **Impact Score**: Evaluate proposals based on energy efficiency, community benefit, and innovation
- **Admin Dashboard**: Secure approval workflow for proposals
- **Responsive Design**: Clean, modern UI that works on desktop and mobile

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **Blockchain**: ThirdWeb SDK with Sepolia testnet
- **Styling**: TailwindCSS
- **Database**: PostgreSQL with Drizzle ORM

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `INFURA_PROJECT_ID`: Your Infura project ID for Ethereum connection
4. Run the development server with `npm run dev`

## Deployment

### GitHub Pages

The application can be deployed to GitHub Pages:

1. Make sure you have the `gh-pages` package installed
2. Update the repository URL in `deploy.js` if needed
3. Modify the base URL in `.env.production` if your repository name is different
4. Run the deployment script:
   ```
   ./deploy.sh
   ```
5. Your application will be available at `https://[username].github.io/[repository]/`

> **Note:** GitHub Pages deployment only includes the frontend. You'll need a separate backend deployment.

### Vercel Deployment

We've configured the project for a full-stack deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the following build settings:
   - Build Command: `./vercel-build.sh` 
   - Output Directory: `client/dist`
4. Set up required environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `INFURA_PROJECT_ID`
   - `SESSION_SECRET`
   - `ADMIN_PASS`
5. Deploy and access your application at the Vercel-provided URL

For detailed instructions, see the `VERCEL_DEPLOY_GUIDE.md` file.

#### Understanding Base URL Handling

We've implemented robust base URL handling to ensure the application works correctly across different deployment environments:

- The `client/src/lib/baseUrl.ts` utility provides functions to manage paths:
  - `getBaseUrl()` - Gets the configured base URL, handling GitHub Pages and Vercel deployments
  - `withBaseUrl(path)` - Prepends the base URL to any path

- This handling is integrated with:
  - API requests via `queryClient.ts`
  - Application routing in `App.tsx`
  - Static asset references

### Production Deployment

For other production deployments:
1. Adjust the `VITE_BASE_URL` in `.env.production` if needed
2. Build the application: `npm run build`
3. The production-ready files will be in the `dist` directory
4. Deploy the contents to your hosting provider

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
