import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { sharingScopeEnum } from './enums.js';
import { profileItems, profiles } from './profiles.js';

export const shareLinks = pgTable(
  'share_links',
  {
    id: uuid('id').primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    scope: sharingScopeEnum('scope').notNull(),
    expiresAt: timestampWithTimeZone('expires_at'),
    maxUses: integer('max_uses'),
    useCount: integer('use_count').default(0).notNull(),
    revokedAt: timestampWithTimeZone('revoked_at'),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
  },
  (table) => [
    check('share_links_token_hash_check', sql`${table.tokenHash} ~ '^[0-9a-f]{64}$'`),
    check('share_links_max_uses_check', sql`${table.maxUses} is null or ${table.maxUses} > 0`),
    check('share_links_use_count_check', sql`${table.useCount} >= 0`),
    check(
      'share_links_use_limit_check',
      sql`${table.maxUses} is null or ${table.useCount} <= ${table.maxUses}`,
    ),
    index('share_links_profile_idx').on(table.profileId),
  ],
);

export const shareLinkItems = pgTable(
  'share_link_items',
  {
    shareLinkId: uuid('share_link_id')
      .notNull()
      .references(() => shareLinks.id, { onDelete: 'cascade' }),
    profileItemId: uuid('profile_item_id')
      .notNull()
      .references(() => profileItems.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({
      name: 'share_link_items_pk',
      columns: [table.shareLinkId, table.profileItemId],
    }),
  ],
);

export const shareGrants = pgTable(
  'share_grants',
  {
    id: uuid('id').primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    granteeUserId: uuid('grantee_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    scope: sharingScopeEnum('scope').notNull(),
    expiresAt: timestampWithTimeZone('expires_at'),
    revokedAt: timestampWithTimeZone('revoked_at'),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('share_grants_active_profile_grantee_uidx')
      .on(table.profileId, table.granteeUserId)
      .where(sql`${table.revokedAt} is null`),
    index('share_grants_grantee_idx').on(table.granteeUserId),
  ],
);

export const shareGrantItems = pgTable(
  'share_grant_items',
  {
    shareGrantId: uuid('share_grant_id')
      .notNull()
      .references(() => shareGrants.id, { onDelete: 'cascade' }),
    profileItemId: uuid('profile_item_id')
      .notNull()
      .references(() => profileItems.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({
      name: 'share_grant_items_pk',
      columns: [table.shareGrantId, table.profileItemId],
    }),
  ],
);
