/*
  Warnings:

  - You are about to drop the column `accountOfficerEmployeeId` on the `assignments` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "accountOfficerEmployeeId",
ADD COLUMN     "branchId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountOfficerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branches_accountOfficerId_key" ON "branches"("accountOfficerId");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
