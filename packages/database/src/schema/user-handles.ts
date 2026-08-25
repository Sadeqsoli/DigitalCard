import { sql } from 'drizzle-orm';
import { check, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';

export const USER_HANDLE_MIN_LENGTH = 3;
export const USER_HANDLE_MAX_LENGTH = 32;

export const userHandles = pgTable(
  'user_handles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    handle: text('handle').notNull().unique(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
  },
  (table) => [
    check('user_handles_lowercase_check', sql`${table.handle} = lower(${table.handle})`),
    check('user_handles_format_check', sql`${table.handle} ~ '^[a-z0-9][a-z0-9_.]{1,30}[a-z0-9]$'`),
  ],
);
