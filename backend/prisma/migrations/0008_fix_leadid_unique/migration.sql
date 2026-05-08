
-- Restore the standard unique index on leadId (Prisma requires this for the relation)
-- Drop our partial index first
DROP INDEX IF EXISTS "IncentiveRecord_leadId_unique";
-- Add standard unique constraint back (NULL values don't violate uniqueness in Postgres)
ALTER TABLE "IncentiveRecord" ADD CONSTRAINT "IncentiveRecord_leadId_key" UNIQUE ("leadId");
