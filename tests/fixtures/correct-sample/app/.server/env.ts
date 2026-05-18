import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SESSION_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url().default("postgres://localhost/app"),
});

export const env = EnvSchema.parse(process.env);
