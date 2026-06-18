-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('member', 'owner', 'camp_staff', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned');

-- CreateEnum
CREATE TYPE "CampsiteStatus" AS ENUM ('draft', 'published', 'hidden');

-- CreateEnum
CREATE TYPE "LocationAccuracy" AS ENUM ('unverified', 'google_verified', 'owner_confirmed', 'admin_verified');

-- CreateEnum
CREATE TYPE "PhotoSource" AS ENUM ('admin', 'owner', 'member', 'google');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('solo', 'couple', 'family', 'friends');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('campsite', 'review');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('success', 'failed');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('draft', 'pending_review', 'published', 'suspended');

-- CreateEnum
CREATE TYPE "CampMemberRole" AS ENUM ('owner', 'staff');

-- CreateEnum
CREATE TYPE "CampMemberStatus" AS ENUM ('active', 'invited', 'removed');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('open', 'closed', 'fully_booked', 'maintenance', 'private_event', 'special_event', 'holiday_notice', 'weather_notice');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('interested', 'planning', 'contacted', 'owner_replied', 'confirmed_by_user', 'cancelled', 'visited');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('draft', 'sent', 'owner_seen', 'owner_replied', 'user_confirmed', 'cancelled', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'member',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campsites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "province" TEXT NOT NULL,
    "district" TEXT,
    "subdistrict" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "price_min" INTEGER,
    "price_max" INTEGER,
    "phone" TEXT,
    "website_url" TEXT,
    "facebook_url" TEXT,
    "line_id" TEXT,
    "google_place_id" TEXT,
    "google_rating" DOUBLE PRECISION,
    "google_user_rating_count" INTEGER,
    "member_rating" DOUBLE PRECISION,
    "member_review_count" INTEGER NOT NULL DEFAULT 0,
    "status" "CampsiteStatus" NOT NULL DEFAULT 'draft',
    "owner_user_id" TEXT,
    "location_accuracy_status" "LocationAccuracy" NOT NULL DEFAULT 'unverified',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campsites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campsite_photos" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "source" "PhotoSource" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campsite_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campsite_amenities" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "campsite_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating_overall" INTEGER NOT NULL,
    "rating_cleanliness" INTEGER,
    "rating_facility" INTEGER,
    "rating_view" INTEGER,
    "rating_accessibility" INTEGER,
    "rating_safety" INTEGER,
    "rating_value" INTEGER,
    "trip_type" "TripType",
    "visit_date" TIMESTAMP(3),
    "comment" TEXT,
    "owner_reply" TEXT,
    "owner_reply_at" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_photos" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_review_snapshots" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "google_review_id" TEXT NOT NULL,
    "author_name" TEXT,
    "author_photo_url" TEXT,
    "author_url" TEXT,
    "rating" INTEGER,
    "text" TEXT,
    "relative_time_description" TEXT,
    "publish_time" TIMESTAMP(3),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_review_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_campsites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_campsites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_claims" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "evidence_text" TEXT,
    "evidence_file_url" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_user_id" TEXT,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_sync_logs" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "message" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_profiles" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "display_name" TEXT,
    "bio" TEXT,
    "contact_phone" TEXT,
    "contact_line" TEXT,
    "contact_facebook" TEXT,
    "contact_website" TEXT,
    "profile_status" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "completeness_score" INTEGER NOT NULL DEFAULT 0,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camp_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_owner_members" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "CampMemberRole" NOT NULL DEFAULT 'staff',
    "status" "CampMemberStatus" NOT NULL DEFAULT 'active',
    "invited_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camp_owner_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_calendar_events" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "title" TEXT,
    "event_type" "CalendarEventType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "note" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_rule" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camp_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "home_province" TEXT,
    "camping_style" TEXT[],
    "notification_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_camping_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'interested',
    "note" TEXT,
    "party_size" INTEGER,
    "checklist_json" JSONB,
    "calendar_sync_status" TEXT,
    "external_calendar_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_camping_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_inquiries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "camping_plan_id" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "party_size" INTEGER,
    "tent_count" INTEGER,
    "car_count" INTEGER,
    "has_pet" BOOLEAN NOT NULL DEFAULT false,
    "contact_phone" TEXT,
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'sent',
    "owner_reply" TEXT,
    "owner_note" TEXT,
    "replied_by" TEXT,
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "target_type" TEXT,
    "target_id" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camp_profile_activity_logs" (
    "id" TEXT NOT NULL,
    "campsite_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "old_value_json" JSONB,
    "new_value_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "camp_profile_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_merge_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guest_session_id" TEXT,
    "merged_count" INTEGER NOT NULL,
    "duplicate_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_merge_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "campsites_slug_key" ON "campsites"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "campsites_google_place_id_key" ON "campsites"("google_place_id");

-- CreateIndex
CREATE INDEX "campsites_province_idx" ON "campsites"("province");

-- CreateIndex
CREATE INDEX "campsites_region_idx" ON "campsites"("region");

-- CreateIndex
CREATE INDEX "campsites_status_idx" ON "campsites"("status");

-- CreateIndex
CREATE INDEX "campsites_latitude_longitude_idx" ON "campsites"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "campsite_photos_campsite_id_idx" ON "campsite_photos"("campsite_id");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_key_key" ON "amenities"("key");

-- CreateIndex
CREATE INDEX "campsite_amenities_amenity_id_idx" ON "campsite_amenities"("amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "campsite_amenities_campsite_id_amenity_id_key" ON "campsite_amenities"("campsite_id", "amenity_id");

-- CreateIndex
CREATE INDEX "reviews_campsite_id_idx" ON "reviews"("campsite_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "review_photos_review_id_idx" ON "review_photos"("review_id");

-- CreateIndex
CREATE INDEX "google_review_snapshots_campsite_id_idx" ON "google_review_snapshots"("campsite_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_review_snapshots_campsite_id_google_review_id_key" ON "google_review_snapshots"("campsite_id", "google_review_id");

-- CreateIndex
CREATE INDEX "favorite_campsites_user_id_idx" ON "favorite_campsites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_campsites_user_id_campsite_id_key" ON "favorite_campsites"("user_id", "campsite_id");

-- CreateIndex
CREATE INDEX "owner_claims_campsite_id_idx" ON "owner_claims"("campsite_id");

-- CreateIndex
CREATE INDEX "owner_claims_user_id_idx" ON "owner_claims"("user_id");

-- CreateIndex
CREATE INDEX "owner_claims_status_idx" ON "owner_claims"("status");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "google_sync_logs_campsite_id_idx" ON "google_sync_logs"("campsite_id");

-- CreateIndex
CREATE UNIQUE INDEX "camp_profiles_campsite_id_key" ON "camp_profiles"("campsite_id");

-- CreateIndex
CREATE INDEX "camp_owner_members_user_id_idx" ON "camp_owner_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "camp_owner_members_campsite_id_user_id_key" ON "camp_owner_members"("campsite_id", "user_id");

-- CreateIndex
CREATE INDEX "camp_calendar_events_campsite_id_start_date_end_date_idx" ON "camp_calendar_events"("campsite_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_camping_plans_user_id_idx" ON "user_camping_plans"("user_id");

-- CreateIndex
CREATE INDEX "booking_inquiries_campsite_id_status_idx" ON "booking_inquiries"("campsite_id", "status");

-- CreateIndex
CREATE INDEX "booking_inquiries_user_id_idx" ON "booking_inquiries"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "camp_profile_activity_logs_campsite_id_idx" ON "camp_profile_activity_logs"("campsite_id");

-- CreateIndex
CREATE INDEX "favorite_merge_logs_user_id_idx" ON "favorite_merge_logs"("user_id");

-- AddForeignKey
ALTER TABLE "campsites" ADD CONSTRAINT "campsites_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campsites" ADD CONSTRAINT "campsites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campsite_photos" ADD CONSTRAINT "campsite_photos_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campsite_amenities" ADD CONSTRAINT "campsite_amenities_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campsite_amenities" ADD CONSTRAINT "campsite_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_photos" ADD CONSTRAINT "review_photos_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_review_snapshots" ADD CONSTRAINT "google_review_snapshots_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_campsites" ADD CONSTRAINT "favorite_campsites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_campsites" ADD CONSTRAINT "favorite_campsites_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_claims" ADD CONSTRAINT "owner_claims_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_claims" ADD CONSTRAINT "owner_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_claims" ADD CONSTRAINT "owner_claims_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_sync_logs" ADD CONSTRAINT "google_sync_logs_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_profiles" ADD CONSTRAINT "camp_profiles_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_owner_members" ADD CONSTRAINT "camp_owner_members_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_owner_members" ADD CONSTRAINT "camp_owner_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_calendar_events" ADD CONSTRAINT "camp_calendar_events_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_camping_plans" ADD CONSTRAINT "user_camping_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_camping_plans" ADD CONSTRAINT "user_camping_plans_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_inquiries" ADD CONSTRAINT "booking_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_inquiries" ADD CONSTRAINT "booking_inquiries_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_inquiries" ADD CONSTRAINT "booking_inquiries_camping_plan_id_fkey" FOREIGN KEY ("camping_plan_id") REFERENCES "user_camping_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camp_profile_activity_logs" ADD CONSTRAINT "camp_profile_activity_logs_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campsites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
