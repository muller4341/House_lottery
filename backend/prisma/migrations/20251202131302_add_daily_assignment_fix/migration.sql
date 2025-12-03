/*
  Warnings:

  - Added the required column `accountOfficerEmployeeId` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "accountOfficerEmployeeId" TEXT NOT NULL;
