/*
  Warnings:

  - Added the required column `accountOfficerEmployeeIds` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchIds` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchNames` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Made the column `tl1Id` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tl2Id` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `officer1Phone` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `officer2Phone` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tl1Phone` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tl2Phone` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tl1Shift` on table `assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tl2Shift` on table `assignments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_tl1Id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_tl2Id_fkey";

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "accountOfficerEmployeeIds" TEXT NOT NULL,
ADD COLUMN     "branchIds" TEXT NOT NULL,
ADD COLUMN     "branchNames" TEXT NOT NULL,
ALTER COLUMN "tl1Id" SET NOT NULL,
ALTER COLUMN "tl2Id" SET NOT NULL,
ALTER COLUMN "officer1Phone" SET NOT NULL,
ALTER COLUMN "officer2Phone" SET NOT NULL,
ALTER COLUMN "tl1Phone" SET NOT NULL,
ALTER COLUMN "tl2Phone" SET NOT NULL,
ALTER COLUMN "tl1Shift" SET NOT NULL,
ALTER COLUMN "tl2Shift" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tl1Id_fkey" FOREIGN KEY ("tl1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tl2Id_fkey" FOREIGN KEY ("tl2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
