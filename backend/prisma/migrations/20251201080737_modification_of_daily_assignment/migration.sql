/*
  Warnings:

  - The values [ACCOUNT_OFFICER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `accountOfficerId` on the `assignments` table. All the data in the column will be lost.
  - Added the required column `accountOfficerEmployeeId` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officer1EndTime` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officer1StartTime` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officer2EndTime` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officer2StartTime` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Made the column `officer1Id` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `officer2Id` on table `assignments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_accountOfficerId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_officer1Id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_officer2Id_fkey";

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "accountOfficerId",
ADD COLUMN     "accountOfficerEmployeeId" TEXT NOT NULL,
ADD COLUMN     "officer1EndTime" TEXT NOT NULL,
ADD COLUMN     "officer1Phone" TEXT,
ADD COLUMN     "officer1StartTime" TEXT NOT NULL,
ADD COLUMN     "officer2EndTime" TEXT NOT NULL,
ADD COLUMN     "officer2Phone" TEXT,
ADD COLUMN     "officer2StartTime" TEXT NOT NULL,
ADD COLUMN     "tl1Phone" TEXT,
ADD COLUMN     "tl2Phone" TEXT,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "officer1Id" SET NOT NULL,
ALTER COLUMN "officer2Id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_officer1Id_fkey" FOREIGN KEY ("officer1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_officer2Id_fkey" FOREIGN KEY ("officer2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
