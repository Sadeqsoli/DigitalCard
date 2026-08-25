import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { consentActionEnum } from './enums.js';
import { devices } from './devices.js';

export const privacyPreferences = pgTable('privacy_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  contactDiscoveryEnabled: boolean('contact_discovery_enabled').default(false).notNull(),
  discoverableByPhone: boolean('discoverable_by_phone').default(false).notNull(),
  discoverableByEmail: boolean('discoverable_by_email').default(false).notNull(),
  notifyWhenContactJoins: boolean('notify_when_contact_joins').default(false).notNull(),
  updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
});

export const consentEvents = pgTable(
  'consent_events',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'set null' }),
    consentType: text('consent_type').notNull(),
    action: consentActionEnum('action').notNull(),
    policyVersion: text('policy_version'),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('consent_events_user_created_idx').on(table.userId, table.createdAt),
    index('consent_events_device_idx').on(table.deviceId),
  ],
);
