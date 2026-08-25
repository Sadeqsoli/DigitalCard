import { and, eq, inArray, isNull } from 'drizzle-orm';
import { fileURLToPath } from 'node:url';

import { createDatabase } from './db.js';
import { createId } from './ids.js';
import {
  organizationMembers,
  organizations,
  profileItems,
  profiles,
  user,
} from './schema/index.js';

const seedUsers: Array<typeof user.$inferInsert> = [
  { email: 'sadeq@example.test', name: 'Sadeq' },
  { email: 'ali@example.test', name: 'Ali' },
  { email: 'sara@example.test', name: 'Sara' },
];

export async function seedDevelopmentDatabase(databaseUrl: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development seed data cannot be loaded in production.');
  }

  const { client, db } = createDatabase(databaseUrl, { max: 1 });

  try {
    await db.insert(user).values(seedUsers).onConflictDoNothing();

    const users = await db
      .select({ email: user.email, id: user.id })
      .from(user)
      .where(
        inArray(
          user.email,
          seedUsers.map(({ email }) => email),
        ),
      );
    const userIds = new Map(users.map(({ email, id }) => [email, id]));
    const sadeqId = requireSeedUser(userIds, 'sadeq@example.test');
    const aliId = requireSeedUser(userIds, 'ali@example.test');

    await db
      .insert(organizations)
      .values({
        id: createId(),
        name: 'Acme',
        slug: 'acme',
        createdByUserId: sadeqId,
      })
      .onConflictDoNothing();

    const [organization] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(and(eq(organizations.slug, 'acme'), isNull(organizations.deletedAt)))
      .limit(1);

    if (!organization) {
      throw new Error('Development organization could not be loaded.');
    }

    await db
      .insert(organizationMembers)
      .values({
        id: createId(),
        organizationId: organization.id,
        userId: sadeqId,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
      })
      .onConflictDoNothing();

    await insertProfileIfMissing(db, {
      ownerUserId: sadeqId,
      organizationId: null,
      type: 'personal',
      name: 'Sadeq Personal',
      slug: 'personal',
      visibility: 'private',
      isDefault: true,
    });
    const sadeqWorkId = await insertProfileIfMissing(db, {
      ownerUserId: sadeqId,
      organizationId: organization.id,
      type: 'work',
      name: 'Sadeq Work',
      slug: 'work',
      visibility: 'public',
      isDefault: false,
    });
    const aliPersonalId = await insertProfileIfMissing(db, {
      ownerUserId: aliId,
      organizationId: null,
      type: 'personal',
      name: 'Ali Personal',
      slug: 'personal',
      visibility: 'public',
      isDefault: true,
    });

    await insertProfileItemIfMissing(db, sadeqWorkId, {
      kind: 'text',
      key: 'job_title',
      label: 'Job title',
      value: 'Example Engineer',
      visibility: 'public',
      sortOrder: 0,
    });
    await insertProfileItemIfMissing(db, sadeqWorkId, {
      kind: 'email',
      key: 'work_email',
      label: 'Work email',
      value: 'sadeq@example.test',
      normalizedValue: 'sadeq@example.test',
      visibility: 'private',
      sortOrder: 1,
    });
    await insertProfileItemIfMissing(db, aliPersonalId, {
      kind: 'phone',
      key: 'mobile',
      label: 'Mobile',
      value: '+15550000001',
      normalizedValue: '+15550000001',
      visibility: 'public',
      sortOrder: 0,
    });
  } finally {
    await client.end();
  }
}

function requireSeedUser(userIds: ReadonlyMap<string, string>, email: string): string {
  const id = userIds.get(email);
  if (!id) {
    throw new Error(`Development seed user ${email} could not be loaded.`);
  }
  return id;
}

type Database = ReturnType<typeof createDatabase>['db'];
type NewProfile = Omit<typeof profiles.$inferInsert, 'id'>;
type NewProfileItem = Omit<typeof profileItems.$inferInsert, 'id' | 'profileId'>;

async function insertProfileIfMissing(db: Database, profile: NewProfile): Promise<string> {
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(
        eq(profiles.ownerUserId, profile.ownerUserId),
        eq(profiles.slug, profile.slug),
        isNull(profiles.deletedAt),
      ),
    )
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [created] = await db
    .insert(profiles)
    .values({ id: createId(), ...profile })
    .returning({ id: profiles.id });

  if (!created) {
    throw new Error(`Development profile ${profile.slug} could not be created.`);
  }
  return created.id;
}

async function insertProfileItemIfMissing(
  db: Database,
  profileId: string,
  item: NewProfileItem,
): Promise<void> {
  const [existing] = await db
    .select({ id: profileItems.id })
    .from(profileItems)
    .where(
      and(
        eq(profileItems.profileId, profileId),
        eq(profileItems.key, item.key),
        isNull(profileItems.deletedAt),
      ),
    )
    .limit(1);

  if (!existing) {
    await db.insert(profileItems).values({ id: createId(), profileId, ...item });
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set before seeding.');
  }
  await seedDevelopmentDatabase(databaseUrl);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
