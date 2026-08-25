import { pgEnum } from 'drizzle-orm/pg-core';

export const storageProviderEnum = pgEnum('storage_provider', ['local', 's3']);
export const organizationRoleEnum = pgEnum('organization_role', ['owner', 'admin', 'member']);
export const organizationMemberStatusEnum = pgEnum('organization_member_status', [
  'invited',
  'active',
  'removed',
]);
export const profileTypeEnum = pgEnum('profile_type', ['personal', 'work', 'business', 'custom']);
export const visibilityEnum = pgEnum('visibility', ['public', 'private']);
export const profileItemKindEnum = pgEnum('profile_item_kind', [
  'name',
  'text',
  'email',
  'phone',
  'url',
  'social',
  'address',
  'date',
  'custom',
]);
export const identifierKindEnum = pgEnum('identifier_kind', ['phone', 'email']);
export const sharingScopeEnum = pgEnum('sharing_scope', [
  'public_items',
  'all_items',
  'selected_items',
]);
export const connectionStatusEnum = pgEnum('connection_status', [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
]);
export const devicePlatformEnum = pgEnum('device_platform', ['ios', 'android', 'web']);
export const consentActionEnum = pgEnum('consent_action', ['granted', 'revoked']);
