import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../src/db.js';
import { createId } from '../src/ids.js';
import { migrateDatabase } from '../src/migrate.js';
import {
  connections,
  contactMatchTokens,
  organizationMembers,
  organizations,
  privacyPreferences,
  profileItems,
  profiles,
  shareGrantItems,
  shareGrants,
  shareLinkItems,
  shareLinks,
  user,
  userBlocks,
  userHandles,
  userIdentifiers,
} from '../src/schema/index.js';

type TestDatabase = ReturnType<typeof createDatabase>;

let connection: TestDatabase;
let databaseUrl: string;

beforeAll(async () => {
  databaseUrl = requireSafeTestDatabaseUrl();
  const setup = createDatabase(databaseUrl, { max: 1 });
  try {
    await setup.client.unsafe('drop schema if exists drizzle cascade');
    await setup.client.unsafe('drop schema if exists public cascade');
    await setup.client.unsafe('create schema public');
  } finally {
    await setup.client.end();
  }

  await migrateDatabase(databaseUrl);
  connection = createDatabase(databaseUrl, { max: 1 });
});

beforeEach(async () => {
  await connection.client.unsafe(`
    truncate table
      "account",
      "session",
      "verification",
      "consent_events",
      "privacy_preferences",
      "notifications",
      "devices",
      "user_blocks",
      "connections",
      "share_grant_items",
      "share_grants",
      "share_link_items",
      "share_links",
      "contact_match_tokens",
      "user_identifiers",
      "profile_items",
      "profiles",
      "organization_members",
      "organizations",
      "files",
      "user_handles",
      "user"
    restart identity cascade
  `);
});

afterAll(async () => {
  if (connection) {
    await connection.client.end();
  }
});

describe('profile constraints', () => {
  it('rejects duplicate active slugs for one owner', async () => {
    const ownerId = await createUser('profile-slug-owner');
    await createProfile(ownerId, { slug: 'work' });

    await expect(createProfile(ownerId, { slug: 'work' })).rejects.toMatchObject(
      postgresError('23505'),
    );
  });

  it('allows different owners to use the same profile slug', async () => {
    const firstOwnerId = await createUser('profile-slug-first');
    const secondOwnerId = await createUser('profile-slug-second');

    await createProfile(firstOwnerId, { slug: 'work' });
    await expect(createProfile(secondOwnerId, { slug: 'work' })).resolves.toBeDefined();
  });

  it('rejects a second active default profile for one owner', async () => {
    const ownerId = await createUser('default-profile-owner');
    await createProfile(ownerId, { isDefault: true, slug: 'personal' });

    await expect(createProfile(ownerId, { isDefault: true, slug: 'work' })).rejects.toMatchObject(
      postgresError('23505'),
    );
  });

  it('allows an active slug to be reused after soft deletion', async () => {
    const ownerId = await createUser('soft-delete-owner');
    const profileId = await createProfile(ownerId, { slug: 'work' });
    await connection.db
      .update(profiles)
      .set({ deletedAt: new Date() })
      .where(eq(profiles.id, profileId));

    await expect(createProfile(ownerId, { slug: 'work' })).resolves.toBeDefined();
  });
});

describe('handle constraints', () => {
  it('rejects a globally duplicate handle', async () => {
    const firstUserId = await createUser('handle-first');
    const secondUserId = await createUser('handle-second');
    await connection.db.insert(userHandles).values({ userId: firstUserId, handle: 'sadeq' });

    await expect(
      connection.db.insert(userHandles).values({ userId: secondUserId, handle: 'sadeq' }),
    ).rejects.toMatchObject(postgresError('23505'));
  });

  it('rejects malformed and uppercase handles', async () => {
    const malformedUserId = await createUser('handle-malformed');
    const uppercaseUserId = await createUser('handle-uppercase');

    await expect(
      connection.db.insert(userHandles).values({ userId: malformedUserId, handle: 'bad-handle' }),
    ).rejects.toMatchObject(postgresError('23514'));
    await expect(
      connection.db.insert(userHandles).values({ userId: uppercaseUserId, handle: 'Sadeq' }),
    ).rejects.toMatchObject(postgresError('23514'));
  });
});

describe('connection and block constraints', () => {
  it('rejects self-connections and duplicate unordered user pairs', async () => {
    const firstUserId = await createUser('connection-first');
    const secondUserId = await createUser('connection-second');

    await expect(
      connection.db.insert(connections).values({
        id: createId(),
        requesterUserId: firstUserId,
        receiverUserId: firstUserId,
        status: 'pending',
      }),
    ).rejects.toMatchObject(postgresError('23514'));

    await connection.db.insert(connections).values({
      id: createId(),
      requesterUserId: firstUserId,
      receiverUserId: secondUserId,
      status: 'pending',
    });
    await expect(
      connection.db.insert(connections).values({
        id: createId(),
        requesterUserId: secondUserId,
        receiverUserId: firstUserId,
        status: 'pending',
      }),
    ).rejects.toMatchObject(postgresError('23505'));
  });

  it('rejects self-blocks and duplicate directional blocks', async () => {
    const firstUserId = await createUser('block-first');
    const secondUserId = await createUser('block-second');

    await expect(
      connection.db.insert(userBlocks).values({
        id: createId(),
        blockerUserId: firstUserId,
        blockedUserId: firstUserId,
      }),
    ).rejects.toMatchObject(postgresError('23514'));

    await connection.db.insert(userBlocks).values({
      id: createId(),
      blockerUserId: firstUserId,
      blockedUserId: secondUserId,
    });
    await expect(
      connection.db.insert(userBlocks).values({
        id: createId(),
        blockerUserId: firstUserId,
        blockedUserId: secondUserId,
      }),
    ).rejects.toMatchObject(postgresError('23505'));
  });
});

describe('organization membership constraints', () => {
  it('rejects duplicate organization membership', async () => {
    const userId = await createUser('organization-member');
    const organizationId = createId();
    await connection.db
      .insert(organizations)
      .values({ id: organizationId, name: 'Acme', slug: 'acme' });
    await connection.db.insert(organizationMembers).values({
      id: createId(),
      organizationId,
      userId,
      role: 'member',
      status: 'active',
    });

    await expect(
      connection.db.insert(organizationMembers).values({
        id: createId(),
        organizationId,
        userId,
        role: 'admin',
        status: 'active',
      }),
    ).rejects.toMatchObject(postgresError('23505'));
  });
});

describe('sharing constraints', () => {
  it('rejects duplicate token hashes and invalid use limits', async () => {
    const ownerId = await createUser('share-link-owner');
    const profileId = await createProfile(ownerId);
    const tokenHash = 'a'.repeat(64);
    await connection.db.insert(shareLinks).values({
      id: createId(),
      profileId,
      tokenHash,
      scope: 'public_items',
    });

    await expect(
      connection.db.insert(shareLinks).values({
        id: createId(),
        profileId,
        tokenHash,
        scope: 'public_items',
      }),
    ).rejects.toMatchObject(postgresError('23505'));
    await expect(
      connection.db.insert(shareLinks).values({
        id: createId(),
        profileId,
        tokenHash: 'b'.repeat(64),
        scope: 'public_items',
        useCount: -1,
      }),
    ).rejects.toMatchObject(postgresError('23514'));
    await expect(
      connection.db.insert(shareLinks).values({
        id: createId(),
        profileId,
        tokenHash: 'c'.repeat(64),
        scope: 'public_items',
        maxUses: 0,
      }),
    ).rejects.toMatchObject(postgresError('23514'));
    await expect(
      connection.db.insert(shareLinks).values({
        id: createId(),
        profileId,
        tokenHash: 'd'.repeat(64),
        scope: 'public_items',
        maxUses: 1,
        useCount: 2,
      }),
    ).rejects.toMatchObject(postgresError('23514'));
  });

  it('rejects duplicate selected-item joins', async () => {
    const ownerId = await createUser('share-item-owner');
    const profileId = await createProfile(ownerId);
    const profileItemId = await createProfileItem(profileId);
    const shareLinkId = createId();
    await connection.db.insert(shareLinks).values({
      id: shareLinkId,
      profileId,
      tokenHash: 'e'.repeat(64),
      scope: 'selected_items',
    });
    await connection.db.insert(shareLinkItems).values({ shareLinkId, profileItemId });

    await expect(
      connection.db.insert(shareLinkItems).values({ shareLinkId, profileItemId }),
    ).rejects.toMatchObject(postgresError('23505'));
  });

  it('rejects duplicate active grants and grant-item joins', async () => {
    const ownerId = await createUser('share-grant-owner');
    const granteeId = await createUser('share-grant-grantee');
    const profileId = await createProfile(ownerId);
    const profileItemId = await createProfileItem(profileId);
    const shareGrantId = createId();
    await connection.db.insert(shareGrants).values({
      id: shareGrantId,
      profileId,
      granteeUserId: granteeId,
      scope: 'selected_items',
    });

    await expect(
      connection.db.insert(shareGrants).values({
        id: createId(),
        profileId,
        granteeUserId: granteeId,
        scope: 'all_items',
      }),
    ).rejects.toMatchObject(postgresError('23505'));

    await connection.db.insert(shareGrantItems).values({ shareGrantId, profileItemId });
    await expect(
      connection.db.insert(shareGrantItems).values({ shareGrantId, profileItemId }),
    ).rejects.toMatchObject(postgresError('23505'));
  });
});

describe('identity discovery constraints and shape', () => {
  it('rejects one active verified identifier token across different users', async () => {
    const firstUserId = await createUser('identifier-first');
    const secondUserId = await createUser('identifier-second');
    const matchToken = 'f'.repeat(64);
    await connection.db.insert(userIdentifiers).values({
      id: createId(),
      userId: firstUserId,
      kind: 'email',
      matchToken,
      keyVersion: 1,
      verifiedAt: new Date(),
    });

    await expect(
      connection.db.insert(userIdentifiers).values({
        id: createId(),
        userId: secondUserId,
        kind: 'email',
        matchToken,
        keyVersion: 1,
        verifiedAt: new Date(),
      }),
    ).rejects.toMatchObject(postgresError('23505'));
  });

  it('contains matching indexes and no raw contact identifier columns', async () => {
    const indexes = await connection.client<{ indexdef: string }[]>`
      select indexdef
      from pg_indexes
      where schemaname = 'public'
        and tablename in ('contact_match_tokens', 'user_identifiers')
    `;
    const indexDefinitions = indexes.map(({ indexdef }) => indexdef).join('\n');
    expect(indexDefinitions).toContain('(identifier_kind, key_version, match_token)');
    expect(indexDefinitions).toContain('(kind, key_version, match_token)');

    const forbiddenColumns = await connection.client<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'contact_match_tokens'
        and column_name in ('display_name', 'phone', 'email', 'raw_phone', 'raw_email')
    `;
    expect(forbiddenColumns).toHaveLength(0);

    expect(Object.keys(contactMatchTokens)).not.toContain('phone');
    expect(Object.keys(contactMatchTokens)).not.toContain('email');
  });
});

describe('privacy defaults', () => {
  it('keeps contact discovery and discoverability disabled by default', async () => {
    const userId = await createUser('privacy-defaults');
    const [preferences] = await connection.db
      .insert(privacyPreferences)
      .values({ userId })
      .returning();

    expect(preferences).toMatchObject({
      contactDiscoveryEnabled: false,
      discoverableByEmail: false,
      discoverableByPhone: false,
      notifyWhenContactJoins: false,
    });
  });
});

function requireSafeTestDatabaseUrl(): string {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) {
    throw new Error(
      'TEST_DATABASE_URL is required. Start the dedicated test service with `docker compose --profile test -f infra/compose.yaml up -d postgres-test`.',
    );
  }

  const url = new URL(value);
  const databaseName = url.pathname.slice(1);
  if (!/(^|_)test($|_)/i.test(databaseName) || value === process.env.DATABASE_URL) {
    throw new Error(
      `Refusing to run destructive integration tests against ${databaseName || 'an unnamed database'}.`,
    );
  }
  return value;
}

function postgresError(code: string): { cause: { code: string } } {
  return { cause: { code } };
}

async function createUser(label: string): Promise<string> {
  const [created] = await connection.db
    .insert(user)
    .values({ email: `${label}-${createId()}@example.test`, name: label })
    .returning({ id: user.id });

  if (!created) {
    throw new Error(`Test user ${label} could not be created.`);
  }
  return created.id;
}

async function createProfile(
  ownerUserId: string,
  overrides: Partial<typeof profiles.$inferInsert> = {},
): Promise<string> {
  const [created] = await connection.db
    .insert(profiles)
    .values({
      id: createId(),
      ownerUserId,
      type: 'personal',
      name: 'Test profile',
      slug: 'personal',
      visibility: 'private',
      ...overrides,
    })
    .returning({ id: profiles.id });

  if (!created) {
    throw new Error('Test profile could not be created.');
  }
  return created.id;
}

async function createProfileItem(profileId: string): Promise<string> {
  const [created] = await connection.db
    .insert(profileItems)
    .values({
      id: createId(),
      profileId,
      kind: 'text',
      key: 'company',
      label: 'Company',
      value: 'Example Company',
      visibility: 'private',
    })
    .returning({ id: profileItems.id });

  if (!created) {
    throw new Error('Test profile item could not be created.');
  }
  return created.id;
}
