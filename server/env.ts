import { z } from "zod";

// Define environment variable schema
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);