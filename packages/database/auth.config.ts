import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set before generating the Better Auth schema.');
}

// Keep generation independent of the generated schema file itself so a clean
// checkout can regenerate it without an import cycle.
const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

/**
 * Schema-generation-only configuration. Authentication routes and methods are
 * intentionally not configured in this database foundation task.
 */
export const auth = betterAuth({
  appName: 'DigitalCard',
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
});
