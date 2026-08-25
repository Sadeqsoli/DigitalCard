import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { organizationMemberStatusEnum, organizationRoleEnum } from './enums.js';
import { files } from './files.js';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logoFileId: uuid('logo_file_id').references(() => files.id, { onDelete: 'set null' }),
    createdByUserId: uuid('created_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimeZone('updated_at').defaultNow().notNull(),
    deletedAt: timestampWithTimeZone('deleted_at'),
  },
  (table) => [
    uniqueIndex('organizations_active_slug_uidx')
      .on(table.slug)
      .where(sql`${table.deletedAt} is null`),
    index('organizations_created_by_user_idx').on(table.createdByUserId),
    check(
      'organizations_slug_format_check',
      sql`${table.slug} ~ '^[a-z0-9]+([.-][a-z0-9]+)*$' and length(${table.slug}) between 2 and 64`,
    ),
  ],
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: organizationRoleEnum('role').notNull(),
    status: organizationMemberStatusEnum('status').notNull(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    joinedAt: timestampWithTimeZone('joined_at'),
    removedAt: timestampWithTimeZone('removed_at'),
  },
  (table) => [
    uniqueIndex('organization_members_organization_user_uidx').on(
      table.organizationId,
      table.userId,
    ),
    index('organization_members_user_idx').on(table.userId),
  ],
);
