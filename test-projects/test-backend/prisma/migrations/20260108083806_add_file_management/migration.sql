-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "public"."FileStatus" AS ENUM ('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Bucket" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" "public"."FileType" NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "public"."FileStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedById" INTEGER NOT NULL,
    "projectId" INTEGER,
    "taskId" INTEGER,
    "metadata" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_storedName_key" ON "public"."File"("storedName");

-- CreateIndex
CREATE UNIQUE INDEX "File_s3Key_key" ON "public"."File"("s3Key");

-- CreateIndex
CREATE INDEX "File_uploadedById_idx" ON "public"."File"("uploadedById");

-- CreateIndex
CREATE INDEX "File_projectId_idx" ON "public"."File"("projectId");

-- CreateIndex
CREATE INDEX "File_taskId_idx" ON "public"."File"("taskId");

-- CreateIndex
CREATE INDEX "File_fileType_idx" ON "public"."File"("fileType");

-- CreateIndex
CREATE INDEX "File_status_idx" ON "public"."File"("status");

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
