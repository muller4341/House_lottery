/*
  Warnings:

  - Made the column `bedroom` on table `applicants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "applicants" ALTER COLUMN "bedroom" SET NOT NULL,
ALTER COLUMN "bedroom" SET DEFAULT 0;
