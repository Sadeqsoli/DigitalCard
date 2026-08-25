import { relations } from 'drizzle-orm';

import { user } from './auth/generated.js';
import { connections, userBlocks } from './connections.js';
import { consentEvents, privacyPreferences } from './privacy.js';
import { devices } from './devices.js';
import { files } from './files.js';
import { contactMatchTokens, userIdentifiers } from './identity-discovery.js';
import { notifications } from './notifications.js';
import { organizationMembers, organizations } from './organizations.js';
import { profileItems, profiles } from './profiles.js';
import { shareGrantItems, shareGrants, shareLinkItems, shareLinks } from './sharing.js';
import { userHandles } from './user-handles.js';

export const digitalCardUserRelations = relations(user, ({ many, one }) => ({
  handle: one(userHandles),
  files: many(files, { relationName: 'files_owner' }),
  createdOrganizations: many(organizations, { relationName: 'organizations_creator' }),
  organizationMemberships: many(organizationMembers, { relationName: 'organization_members_user' }),
  profiles: many(profiles, { relationName: 'profiles_owner' }),
  identifiers: many(userIdentifiers, { relationName: 'user_identifiers_user' }),
  contactMatchTokens: many(contactMatchTokens, { relationName: 'contact_match_tokens_owner' }),
  receivedShareGrants: many(shareGrants, { relationName: 'share_grants_grantee' }),
  requestedConnections: many(connections, { relationName: 'connections_requester' }),
  receivedConnections: many(connections, { relationName: 'connections_receiver' }),
  blocksCreated: many(userBlocks, { relationName: 'user_blocks_blocker' }),
  blocksReceived: many(userBlocks, { relationName: 'user_blocks_blocked' }),
  devices: many(devices, { relationName: 'devices_user' }),
  notifications: many(notifications, { relationName: 'notifications_recipient' }),
  actedNotifications: many(notifications, { relationName: 'notifications_actor' }),
  privacyPreferences: one(privacyPreferences),
  consentEvents: many(consentEvents, { relationName: 'consent_events_user' }),
}));

export const userHandlesRelations = relations(userHandles, ({ one }) => ({
  user: one(user, {
    fields: [userHandles.userId],
    references: [user.id],
  }),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  owner: one(user, {
    fields: [files.ownerUserId],
    references: [user.id],
    relationName: 'files_owner',
  }),
  organizationLogos: many(organizations),
  profileAvatars: many(profiles),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  logo: one(files, {
    fields: [organizations.logoFileId],
    references: [files.id],
  }),
  createdBy: one(user, {
    fields: [organizations.createdByUserId],
    references: [user.id],
    relationName: 'organizations_creator',
  }),
  members: many(organizationMembers),
  profiles: many(profiles),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [organizationMembers.userId],
    references: [user.id],
    relationName: 'organization_members_user',
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  owner: one(user, {
    fields: [profiles.ownerUserId],
    references: [user.id],
    relationName: 'profiles_owner',
  }),
  organization: one(organizations, {
    fields: [profiles.organizationId],
    references: [organizations.id],
  }),
  avatar: one(files, {
    fields: [profiles.avatarFileId],
    references: [files.id],
  }),
  items: many(profileItems),
  shareLinks: many(shareLinks),
  shareGrants: many(shareGrants),
  requestedConnectionContexts: many(connections, { relationName: 'connections_requester_profile' }),
  receivedConnectionContexts: many(connections, { relationName: 'connections_receiver_profile' }),
}));

export const profileItemsRelations = relations(profileItems, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [profileItems.profileId],
    references: [profiles.id],
  }),
  shareLinkItems: many(shareLinkItems),
  shareGrantItems: many(shareGrantItems),
}));

export const userIdentifiersRelations = relations(userIdentifiers, ({ one }) => ({
  user: one(user, {
    fields: [userIdentifiers.userId],
    references: [user.id],
    relationName: 'user_identifiers_user',
  }),
}));

export const contactMatchTokensRelations = relations(contactMatchTokens, ({ one }) => ({
  owner: one(user, {
    fields: [contactMatchTokens.ownerUserId],
    references: [user.id],
    relationName: 'contact_match_tokens_owner',
  }),
}));

export const shareLinksRelations = relations(shareLinks, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [shareLinks.profileId],
    references: [profiles.id],
  }),
  selectedItems: many(shareLinkItems),
}));

export const shareLinkItemsRelations = relations(shareLinkItems, ({ one }) => ({
  shareLink: one(shareLinks, {
    fields: [shareLinkItems.shareLinkId],
    references: [shareLinks.id],
  }),
  profileItem: one(profileItems, {
    fields: [shareLinkItems.profileItemId],
    references: [profileItems.id],
  }),
}));

export const shareGrantsRelations = relations(shareGrants, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [shareGrants.profileId],
    references: [profiles.id],
  }),
  grantee: one(user, {
    fields: [shareGrants.granteeUserId],
    references: [user.id],
    relationName: 'share_grants_grantee',
  }),
  selectedItems: many(shareGrantItems),
}));

export const shareGrantItemsRelations = relations(shareGrantItems, ({ one }) => ({
  shareGrant: one(shareGrants, {
    fields: [shareGrantItems.shareGrantId],
    references: [shareGrants.id],
  }),
  profileItem: one(profileItems, {
    fields: [shareGrantItems.profileItemId],
    references: [profileItems.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(user, {
    fields: [connections.requesterUserId],
    references: [user.id],
    relationName: 'connections_requester',
  }),
  receiver: one(user, {
    fields: [connections.receiverUserId],
    references: [user.id],
    relationName: 'connections_receiver',
  }),
  requesterProfile: one(profiles, {
    fields: [connections.requesterProfileId],
    references: [profiles.id],
    relationName: 'connections_requester_profile',
  }),
  receiverProfile: one(profiles, {
    fields: [connections.receiverProfileId],
    references: [profiles.id],
    relationName: 'connections_receiver_profile',
  }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(user, {
    fields: [userBlocks.blockerUserId],
    references: [user.id],
    relationName: 'user_blocks_blocker',
  }),
  blocked: one(user, {
    fields: [userBlocks.blockedUserId],
    references: [user.id],
    relationName: 'user_blocks_blocked',
  }),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  user: one(user, {
    fields: [devices.userId],
    references: [user.id],
    relationName: 'devices_user',
  }),
  consentEvents: many(consentEvents),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(user, {
    fields: [notifications.userId],
    references: [user.id],
    relationName: 'notifications_recipient',
  }),
  actor: one(user, {
    fields: [notifications.actorUserId],
    references: [user.id],
    relationName: 'notifications_actor',
  }),
}));

export const privacyPreferencesRelations = relations(privacyPreferences, ({ one }) => ({
  user: one(user, {
    fields: [privacyPreferences.userId],
    references: [user.id],
  }),
}));

export const consentEventsRelations = relations(consentEvents, ({ one }) => ({
  user: one(user, {
    fields: [consentEvents.userId],
    references: [user.id],
    relationName: 'consent_events_user',
  }),
  device: one(devices, {
    fields: [consentEvents.deviceId],
    references: [devices.id],
  }),
}));
