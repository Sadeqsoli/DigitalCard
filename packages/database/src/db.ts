import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

export interface DatabaseOptions {
  readonly max?: number;
}

export function createDatabase(databaseUrl: string, options: DatabaseOptions = {}) {
  const client = postgres(databaseUrl, {
    max: options.max ?? 10,
  });

  return {
    client,
    db: drizzle(client, { schema }),
  };
}
