/*
  Warnings:

  - You are about to drop the column `officer1EndTime` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `officer1StartTime` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `officer2EndTime` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `officer2StartTime` on the `assignments` table. All the data in the column will be lost.
  - Added the required column `officer1Shift` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officer2Shift` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "officer1EndTime",
DROP COLUMN "officer1StartTime",
DROP COLUMN "officer2EndTime",
DROP COLUMN "officer2StartTime",
ADD COLUMN     "officer1Shift" TEXT NOT NULL,
ADD COLUMN     "officer2Shift" TEXT NOT NULL,
ADD COLUMN     "tl1Shift" TEXT,
ADD COLUMN     "tl2Shift" TEXT;

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "assignmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT NOT NULL,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
