import { index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    actorUserId: uuid('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata')
      .default(sql`'{}'::jsonb`)
      .notNull(),
    readAt: timestampWithTimeZone('read_at'),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_read_created_idx').on(table.userId, table.readAt, table.createdAt),
  ],
);
