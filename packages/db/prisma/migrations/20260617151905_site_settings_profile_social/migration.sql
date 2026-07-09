-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "social_facebook" TEXT,
ADD COLUMN     "social_instagram" TEXT,
ADD COLUMN     "social_line" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "site_name" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT[],
    "og_image" TEXT,
    "ga4_id" TEXT,
    "gtm_id" TEXT,
    "organization_name" TEXT,
    "twitter_handle" TEXT,
    "robots_extra" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
