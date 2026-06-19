/*
  Warnings:

  - A unique constraint covering the columns `[idCode]` on the table `applicants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "applicants" ADD COLUMN     "idCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "applicants_idCode_key" ON "applicants"("idCode");
