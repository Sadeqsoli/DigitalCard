CREATE TYPE "public"."connection_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."consent_action" AS ENUM('granted', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android', 'web');--> statement-breakpoint
CREATE TYPE "public"."identifier_kind" AS ENUM('phone', 'email');--> statement-breakpoint
CREATE TYPE "public"."organization_member_status" AS ENUM('invited', 'active', 'removed');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."profile_item_kind" AS ENUM('name', 'text', 'email', 'phone', 'url', 'social', 'address', 'date', 'custom');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('personal', 'work', 'business', 'custom');--> statement-breakpoint
CREATE TYPE "public"."sharing_scope" AS ENUM('public_items', 'all_items', 'selected_items');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('local', 's3');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"requester_user_id" uuid NOT NULL,
	"receiver_user_id" uuid NOT NULL,
	"requester_profile_id" uuid,
	"receiver_profile_id" uuid,
	"status" "connection_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	CONSTRAINT "connections_distinct_users_check" CHECK ("connections"."requester_user_id" <> "connections"."receiver_user_id")
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"blocker_user_id" uuid NOT NULL,
	"blocked_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_blocks_distinct_users_check" CHECK ("user_blocks"."blocker_user_id" <> "user_blocks"."blocked_user_id")
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"installation_id" uuid NOT NULL,
	"platform" "device_platform" NOT NULL,
	"device_name" text,
	"app_version" text,
	"push_token" text,
	"last_seen_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"storage_provider" "storage_provider" NOT NULL,
	"storage_key" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"sha256" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "files_size_bytes_check" CHECK ("files"."size_bytes" >= 0),
	CONSTRAINT "files_sha256_check" CHECK ("files"."sha256" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "contact_match_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"contact_ref" uuid NOT NULL,
	"identifier_kind" "identifier_kind" NOT NULL,
	"match_token" text NOT NULL,
	"key_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "contact_match_tokens_key_version_check" CHECK ("contact_match_tokens"."key_version" > 0),
	CONSTRAINT "contact_match_tokens_match_token_check" CHECK ("contact_match_tokens"."match_token" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "user_identifiers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "identifier_kind" NOT NULL,
	"match_token" text NOT NULL,
	"key_version" integer NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_identifiers_key_version_check" CHECK ("user_identifiers"."key_version" > 0),
	CONSTRAINT "user_identifiers_match_token_check" CHECK ("user_identifiers"."match_token" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"actor_user_id" uuid,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "organization_role" NOT NULL,
	"status" "organization_member_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"joined_at" timestamp with time zone,
	"removed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_file_id" uuid,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "organizations_slug_format_check" CHECK ("organizations"."slug" ~ '^[a-z0-9]+([.-][a-z0-9]+)*$' and length("organizations"."slug") between 2 and 64)
);
--> statement-breakpoint
CREATE TABLE "consent_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" uuid,
	"consent_type" text NOT NULL,
	"action" "consent_action" NOT NULL,
	"policy_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privacy_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"contact_discovery_enabled" boolean DEFAULT false NOT NULL,
	"discoverable_by_phone" boolean DEFAULT false NOT NULL,
	"discoverable_by_email" boolean DEFAULT false NOT NULL,
	"notify_when_contact_joins" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"kind" "profile_item_kind" NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"normalized_value" text,
	"visibility" "visibility" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "profile_items_sort_order_check" CHECK ("profile_items"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"organization_id" uuid,
	"type" "profile_type" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"bio" text,
	"visibility" "visibility" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"avatar_file_id" uuid,
	"theme" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "profiles_slug_format_check" CHECK ("profiles"."slug" ~ '^[a-z0-9]+([._-][a-z0-9]+)*$' and length("profiles"."slug") between 1 and 64)
);
--> statement-breakpoint
CREATE TABLE "share_grant_items" (
	"share_grant_id" uuid NOT NULL,
	"profile_item_id" uuid NOT NULL,
	CONSTRAINT "share_grant_items_pk" PRIMARY KEY("share_grant_id","profile_item_id")
);
--> statement-breakpoint
CREATE TABLE "share_grants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"grantee_user_id" uuid NOT NULL,
	"scope" "sharing_scope" NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_link_items" (
	"share_link_id" uuid NOT NULL,
	"profile_item_id" uuid NOT NULL,
	CONSTRAINT "share_link_items_pk" PRIMARY KEY("share_link_id","profile_item_id")
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"scope" "sharing_scope" NOT NULL,
	"expires_at" timestamp with time zone,
	"max_uses" integer,
	"use_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_links_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "share_links_token_hash_check" CHECK ("share_links"."token_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "share_links_max_uses_check" CHECK ("share_links"."max_uses" is null or "share_links"."max_uses" > 0),
	CONSTRAINT "share_links_use_count_check" CHECK ("share_links"."use_count" >= 0),
	CONSTRAINT "share_links_use_limit_check" CHECK ("share_links"."max_uses" is null or "share_links"."use_count" <= "share_links"."max_uses")
);
--> statement-breakpoint
CREATE TABLE "user_handles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_handles_handle_unique" UNIQUE("handle"),
	CONSTRAINT "user_handles_lowercase_check" CHECK ("user_handles"."handle" = lower("user_handles"."handle")),
	CONSTRAINT "user_handles_format_check" CHECK ("user_handles"."handle" ~ '^[a-z0-9][a-z0-9_.]{1,30}[a-z0-9]$')
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_user_id_user_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiver_user_id_user_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_profile_id_profiles_id_fk" FOREIGN KEY ("requester_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiver_profile_id_profiles_id_fk" FOREIGN KEY ("receiver_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_user_id_user_id_fk" FOREIGN KEY ("blocker_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_user_id_user_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_match_tokens" ADD CONSTRAINT "contact_match_tokens_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_identifiers" ADD CONSTRAINT "user_identifiers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_file_id_files_id_fk" FOREIGN KEY ("logo_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privacy_preferences" ADD CONSTRAINT "privacy_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_items" ADD CONSTRAINT "profile_items_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_file_id_files_id_fk" FOREIGN KEY ("avatar_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_grant_items" ADD CONSTRAINT "share_grant_items_share_grant_id_share_grants_id_fk" FOREIGN KEY ("share_grant_id") REFERENCES "public"."share_grants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_grant_items" ADD CONSTRAINT "share_grant_items_profile_item_id_profile_items_id_fk" FOREIGN KEY ("profile_item_id") REFERENCES "public"."profile_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_grants" ADD CONSTRAINT "share_grants_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_grants" ADD CONSTRAINT "share_grants_grantee_user_id_user_id_fk" FOREIGN KEY ("grantee_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_items" ADD CONSTRAINT "share_link_items_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_items" ADD CONSTRAINT "share_link_items_profile_item_id_profile_items_id_fk" FOREIGN KEY ("profile_item_id") REFERENCES "public"."profile_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_handles" ADD CONSTRAINT "user_handles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" USING btree ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "connections_unordered_users_uidx" ON "connections" USING btree (least("requester_user_id", "receiver_user_id"),greatest("requester_user_id", "receiver_user_id"));--> statement-breakpoint
CREATE INDEX "connections_requester_idx" ON "connections" USING btree ("requester_user_id");--> statement-breakpoint
CREATE INDEX "connections_receiver_idx" ON "connections" USING btree ("receiver_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_blocks_blocker_blocked_uidx" ON "user_blocks" USING btree ("blocker_user_id","blocked_user_id");--> statement-breakpoint
CREATE INDEX "user_blocks_blocked_user_idx" ON "user_blocks" USING btree ("blocked_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_installation_id_uidx" ON "devices" USING btree ("installation_id");--> statement-breakpoint
CREATE INDEX "devices_user_idx" ON "devices" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "files_storage_provider_key_uidx" ON "files" USING btree ("storage_provider","storage_key");--> statement-breakpoint
CREATE INDEX "files_owner_user_idx" ON "files" USING btree ("owner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_match_tokens_owner_contact_token_uidx" ON "contact_match_tokens" USING btree ("owner_user_id","contact_ref","identifier_kind","key_version","match_token");--> statement-breakpoint
CREATE INDEX "contact_match_tokens_match_idx" ON "contact_match_tokens" USING btree ("identifier_kind","key_version","match_token");--> statement-breakpoint
CREATE INDEX "contact_match_tokens_owner_contact_idx" ON "contact_match_tokens" USING btree ("owner_user_id","contact_ref");--> statement-breakpoint
CREATE INDEX "contact_match_tokens_expiry_idx" ON "contact_match_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_identifiers_active_token_uidx" ON "user_identifiers" USING btree ("kind","key_version","match_token") WHERE "user_identifiers"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "user_identifiers_user_idx" ON "user_identifiers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_created_idx" ON "notifications" USING btree ("user_id","read_at","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_organization_user_uidx" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_active_slug_uidx" ON "organizations" USING btree ("slug") WHERE "organizations"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "organizations_created_by_user_idx" ON "organizations" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "consent_events_user_created_idx" ON "consent_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "consent_events_device_idx" ON "consent_events" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "profile_items_profile_idx" ON "profile_items" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_owner_active_slug_uidx" ON "profiles" USING btree ("owner_user_id","slug") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_owner_active_default_uidx" ON "profiles" USING btree ("owner_user_id") WHERE "profiles"."is_default" = true and "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "profiles_organization_idx" ON "profiles" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "share_grants_active_profile_grantee_uidx" ON "share_grants" USING btree ("profile_id","grantee_user_id") WHERE "share_grants"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "share_grants_grantee_idx" ON "share_grants" USING btree ("grantee_user_id");--> statement-breakpoint
CREATE INDEX "share_links_profile_idx" ON "share_links" USING btree ("profile_id");