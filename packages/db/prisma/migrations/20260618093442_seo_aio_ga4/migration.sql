-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "aio_faq_json" JSONB,
ADD COLUMN     "aio_summary" TEXT,
ADD COLUMN     "ga4_property_id" TEXT,
ADD COLUMN     "seo_generated_at" TIMESTAMP(3);
