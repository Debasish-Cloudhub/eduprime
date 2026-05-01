-- Safe migration: Add CurrencyType enum and new columns to Course and College
-- Uses IF NOT EXISTS pattern to be idempotent

-- Step 1: Create the enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "CurrencyType" AS ENUM ('INR', 'USD', 'EUR', 'AUD', 'CNY', 'SGD');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add currencyType to Course table
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "currencyType" "CurrencyType" NOT NULL DEFAULT 'INR';

-- Step 3: Add country to Course table  
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "country" TEXT;

-- Step 4: Add currencyType to College table
ALTER TABLE "College" ADD COLUMN IF NOT EXISTS "currencyType" "CurrencyType" NOT NULL DEFAULT 'INR';
