-- AlterEnum: Update TaskStatus enum values
-- This migration converts the TaskStatus enum from (TODO, IN_PROGRESS, DONE) to (OPEN, IN_PROGRESS, FOR_REVIEW, CLOSED)

-- Step 1: Create a new enum type with the desired values
DO $$
BEGIN
    -- Drop the new enum type if it exists from a previous failed migration
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus_new') THEN
        DROP TYPE "public"."TaskStatus_new";
    END IF;
END $$;

CREATE TYPE "public"."TaskStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'FOR_REVIEW', 'CLOSED');

-- Step 2: Convert the column to text temporarily to allow data updates
ALTER TABLE "public"."Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Task" ALTER COLUMN "status" TYPE text USING ("status"::text);

-- Step 3: Update existing data
-- Convert TODO to OPEN and DONE to CLOSED
UPDATE "public"."Task" SET "status" = 'OPEN' WHERE "status" = 'TODO';
UPDATE "public"."Task" SET "status" = 'CLOSED' WHERE "status" = 'DONE';

-- Step 4: Alter the column to use the new enum type
ALTER TABLE "public"."Task" ALTER COLUMN "status" TYPE "public"."TaskStatus_new" USING ("status"::"public"."TaskStatus_new");
ALTER TABLE "public"."Task" ALTER COLUMN "status" SET DEFAULT 'OPEN'::"public"."TaskStatus_new";

-- Step 5: Drop the old enum and rename the new one
DROP TYPE "public"."TaskStatus";
ALTER TYPE "public"."TaskStatus_new" RENAME TO "TaskStatus";
