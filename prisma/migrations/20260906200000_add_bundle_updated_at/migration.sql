-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN "updatedAt" DATETIME;
UPDATE "Bundle" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
