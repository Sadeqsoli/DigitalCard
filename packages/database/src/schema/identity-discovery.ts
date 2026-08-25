import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, uniqueIndex, uuid, integer } from 'drizzle-orm/pg-core';

import { user } from './auth/generated.js';
import { timestampWithTimeZone } from './columns.js';
import { identifierKindEnum } from './enums.js';

export const userIdentifiers = pgTable(
  'user_identifiers',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    kind: identifierKindEnum('kind').notNull(),
    matchToken: text('match_token').notNull(),
    keyVersion: integer('key_version').notNull(),
    verifiedAt: timestampWithTimeZone('verified_at').notNull(),
    revokedAt: timestampWithTimeZone('revoked_at'),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_identifiers_active_token_uidx')
      .on(table.kind, table.keyVersion, table.matchToken)
      .where(sql`${table.revokedAt} is null`),
    index('user_identifiers_user_idx').on(table.userId),
    check('user_identifiers_key_version_check', sql`${table.keyVersion} > 0`),
    check('user_identifiers_match_token_check', sql`${table.matchToken} ~ '^[0-9a-f]{64}$'`),
  ],
);

export const contactMatchTokens = pgTable(
  'contact_match_tokens',
  {
    id: uuid('id').primaryKey(),
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    contactRef: uuid('contact_ref').notNull(),
    identifierKind: identifierKindEnum('identifier_kind').notNull(),
    matchToken: text('match_token').notNull(),
    keyVersion: integer('key_version').notNull(),
    createdAt: timestampWithTimeZone('created_at').defaultNow().notNull(),
    lastSeenAt: timestampWithTimeZone('last_seen_at').notNull(),
    expiresAt: timestampWithTimeZone('expires_at'),
  },
  (table) => [
    uniqueIndex('contact_match_tokens_owner_contact_token_uidx').on(
      table.ownerUserId,
      table.contactRef,
      table.identifierKind,
      table.keyVersion,
      table.matchToken,
    ),
    index('contact_match_tokens_match_idx').on(
      table.identifierKind,
      table.keyVersion,
      table.matchToken,
    ),
    index('contact_match_tokens_owner_contact_idx').on(table.ownerUserId, table.contactRef),
    index('contact_match_tokens_expiry_idx').on(table.expiresAt),
    check('contact_match_tokens_key_version_check', sql`${table.keyVersion} > 0`),
    check('contact_match_tokens_match_token_check', sql`${table.matchToken} ~ '^[0-9a-f]{64}$'`),
  ],
);
