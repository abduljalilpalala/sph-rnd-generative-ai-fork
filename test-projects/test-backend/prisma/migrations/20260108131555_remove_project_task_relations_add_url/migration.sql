/*
  Warnings:

  - You are about to drop the column `projectId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_taskId_fkey";

-- DropIndex
DROP INDEX "public"."File_projectId_idx";

-- DropIndex
DROP INDEX "public"."File_taskId_idx";

-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "projectId",
DROP COLUMN "taskId",
ADD COLUMN     "url" TEXT;
