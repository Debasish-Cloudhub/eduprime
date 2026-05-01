-- CreateEnum: CurrencyType
DO $$ BEGIN
  CREATE TYPE "CurrencyType" AS ENUM ('INR', 'USD', 'EUR', 'AUD', 'CNY', 'SGD');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Course — add currencyType and country
ALTER TABLE "Course"
  ADD COLUMN IF NOT EXISTS "currencyType" "CurrencyType" NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS "country"      TEXT;

-- AlterTable: College — add currencyType
ALTER TABLE "College"
  ADD COLUMN IF NOT EXISTS "currencyType" "CurrencyType" NOT NULL DEFAULT 'INR';
