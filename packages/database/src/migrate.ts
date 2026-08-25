import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';

import { createDatabase } from './db.js';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

export async function migrateDatabase(databaseUrl: string): Promise<void> {
  const { client, db } = createDatabase(databaseUrl, { max: 1 });

  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set before running migrations.');
  }

  await migrateDatabase(databaseUrl);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
