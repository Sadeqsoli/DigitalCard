import { sql } from 'drizzle-orm';
import { bigint, check, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { storageProviderEnum } from './enums.js';

export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey(),
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    storageProvider: storageProviderEnum('storage_provider').notNull(),
    storageKey: text('storage_key').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'bigint' }).notNull(),
    sha256: text('sha256').notNull(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    deletedAt: timestampWithTimeZone('deleted_at'),
  },
  (table) => [
    uniqueIndex('files_storage_provider_key_uidx').on(table.storageProvider, table.storageKey),
    index('files_owner_user_idx').on(table.ownerUserId),
    check('files_size_bytes_check', sql`${table.sizeBytes} >= 0`),
    check('files_sha256_check', sql`${table.sha256} ~ '^[0-9a-f]{64}$'`),
  ],
);
