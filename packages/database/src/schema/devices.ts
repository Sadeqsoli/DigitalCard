import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { devicePlatformEnum } from './enums.js';

export const devices = pgTable(
  'devices',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    installationId: uuid('installation_id').notNull(),
    platform: devicePlatformEnum('platform').notNull(),
    deviceName: text('device_name'),
    appVersion: text('app_version'),
    pushToken: text('push_token'),
    lastSeenAt: timestampWithTimeZone('last_seen_at'),
    revokedAt: timestampWithTimeZone('revoked_at'),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('devices_installation_id_uidx').on(table.installationId),
    index('devices_user_idx').on(table.userId),
  ],
);
