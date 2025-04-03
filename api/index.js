// Vercel Serverless Entry Point
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { storage } from '../server/storage';
import { registerRoutes } from '../server/routes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Setup routes (from our existing routes.ts file)
const server = await registerRoutes(app);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error: ' + (err.message || 'Unknown error'));
});

// Export for Vercel
export default app;