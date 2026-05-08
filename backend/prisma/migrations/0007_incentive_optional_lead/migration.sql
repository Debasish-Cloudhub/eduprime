
-- Make leadId nullable for manual incentives
ALTER TABLE "IncentiveRecord" ALTER COLUMN "leadId" DROP NOT NULL;
ALTER TABLE "IncentiveRecord" ALTER COLUMN "courseId" DROP NOT NULL;
ALTER TABLE "IncentiveRecord" ALTER COLUMN "feesAtClosure" DROP NOT NULL;
ALTER TABLE "IncentiveRecord" ALTER COLUMN "incentiveSource" DROP NOT NULL;
-- Drop unique constraint on leadId since multiple manual records can exist without lead
ALTER TABLE "IncentiveRecord" DROP CONSTRAINT IF EXISTS "IncentiveRecord_leadId_key";
-- Add new optional unique (only when leadId is not null)
CREATE UNIQUE INDEX IF NOT EXISTS "IncentiveRecord_leadId_unique" ON "IncentiveRecord"("leadId") WHERE "leadId" IS NOT NULL;

ALTER TABLE "IncentiveRecord" ADD COLUMN IF NOT EXISTS "incentiveType" TEXT;
