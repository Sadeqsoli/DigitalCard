import { sql } from 'drizzle-orm';
import { check, index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { connectionStatusEnum } from './enums.js';
import { profiles } from './profiles.js';

export const connections = pgTable(
  'connections',
  {
    id: uuid('id').primaryKey(),
    requesterUserId: uuid('requester_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    receiverUserId: uuid('receiver_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    requesterProfileId: uuid('requester_profile_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    receiverProfileId: uuid('receiver_profile_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    status: connectionStatusEnum('status').notNull(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    acceptedAt: timestampWithTimeZone('accepted_at'),
    rejectedAt: timestampWithTimeZone('rejected_at'),
    cancelledAt: timestampWithTimeZone('cancelled_at'),
  },
  (table) => [
    uniqueIndex('connections_unordered_users_uidx').on(
      sql`least(${table.requesterUserId}, ${table.receiverUserId})`,
      sql`greatest(${table.requesterUserId}, ${table.receiverUserId})`,
    ),
    check(
      'connections_distinct_users_check',
      sql`${table.requesterUserId} <> ${table.receiverUserId}`,
    ),
    index('connections_requester_idx').on(table.requesterUserId),
    index('connections_receiver_idx').on(table.receiverUserId),
  ],
);

export const userBlocks = pgTable(
  'user_blocks',
  {
    id: uuid('id').primaryKey(),
    blockerUserId: uuid('blocker_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    blockedUserId: uuid('blocked_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_blocks_blocker_blocked_uidx').on(table.blockerUserId, table.blockedUserId),
    check(
      'user_blocks_distinct_users_check',
      sql`${table.blockerUserId} <> ${table.blockedUserId}`,
    ),
    index('user_blocks_blocked_user_idx').on(table.blockedUserId),
  ],
);
