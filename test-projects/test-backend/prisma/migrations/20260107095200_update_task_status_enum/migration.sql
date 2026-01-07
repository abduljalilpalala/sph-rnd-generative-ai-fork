-- AlterEnum: Update TaskStatus enum values
-- Step 1: Add new enum values
ALTER TYPE "public"."TaskStatus" ADD VALUE IF NOT EXISTS 'OPEN';
ALTER TYPE "public"."TaskStatus" ADD VALUE IF NOT EXISTS 'FOR_REVIEW';
ALTER TYPE "public"."TaskStatus" ADD VALUE IF NOT EXISTS 'CLOSED';

-- Step 2: Update existing data
-- Convert TODO to OPEN
UPDATE "public"."Task" SET "status" = 'OPEN' WHERE "status" = 'TODO';
-- Convert DONE to CLOSED
UPDATE "public"."Task" SET "status" = 'CLOSED' WHERE "status" = 'DONE';

-- Step 3: Create a temporary enum with only the new values
CREATE TYPE "public"."TaskStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'FOR_REVIEW', 'CLOSED');

-- Step 4: Alter the column to use the new enum
ALTER TABLE "public"."Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Task" ALTER COLUMN "status" TYPE "public"."TaskStatus_new" USING ("status"::text::"public"."TaskStatus_new");
ALTER TABLE "public"."Task" ALTER COLUMN "status" SET DEFAULT 'OPEN'::"public"."TaskStatus_new";

-- Step 5: Drop the old enum and rename the new one
DROP TYPE "public"."TaskStatus";
ALTER TYPE "public"."TaskStatus_new" RENAME TO "TaskStatus";
