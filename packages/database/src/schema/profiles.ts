import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { profileItemKindEnum, profileTypeEnum, visibilityEnum } from './enums.js';
import { files } from './files.js';
import { organizations } from './organizations.js';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),
    type: profileTypeEnum('type').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    bio: text('bio'),
    visibility: visibilityEnum('visibility').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    avatarFileId: uuid('avatar_file_id').references(() => files.id, { onDelete: 'set null' }),
    theme: jsonb('theme')
      .default(sql`'{}'::jsonb`)
      .notNull(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
    deletedAt: timestampWithTimeZone('deleted_at'),
  },
  (table) => [
    uniqueIndex('profiles_owner_active_slug_uidx')
      .on(table.ownerUserId, table.slug)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex('profiles_owner_active_default_uidx')
      .on(table.ownerUserId)
      .where(sql`${table.isDefault} = true and ${table.deletedAt} is null`),
    index('profiles_organization_idx').on(table.organizationId),
    check(
      'profiles_slug_format_check',
      sql`${table.slug} ~ '^[a-z0-9]+([._-][a-z0-9]+)*$' and length(${table.slug}) between 1 and 64`,
    ),
  ],
);

export const profileItems = pgTable(
  'profile_items',
  {
    id: uuid('id').primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    kind: profileItemKindEnum('kind').notNull(),
    key: text('key').notNull(),
    label: text('label').notNull(),
    value: text('value').notNull(),
    normalizedValue: text('normalized_value'),
    visibility: visibilityEnum('visibility').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    metadata: jsonb('metadata')
      .default(sql`'{}'::jsonb`)
      .notNull(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
    deletedAt: timestampWithTimeZone('deleted_at'),
  },
  (table) => [
    index('profile_items_profile_idx').on(table.profileId),
    check('profile_items_sort_order_check', sql`${table.sortOrder} >= 0`),
  ],
);
