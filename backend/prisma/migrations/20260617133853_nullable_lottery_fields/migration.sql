-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "HouseStatus" AS ENUM ('NONE', 'PROVIDED');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('NONE', 'WINNER', 'WAITLIST');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('WINNER', 'WAITLIST');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "houses" (
    "id" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "status" "HouseStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lottery_results" (
    "id" TEXT NOT NULL,
    "lotteryRunId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "floor" INTEGER,
    "houseNumber" TEXT,
    "status" "ResultStatus" NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "houseId" TEXT,
    "applicantId" TEXT NOT NULL,

    CONSTRAINT "lottery_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "houses_houseNumber_key" ON "houses"("houseNumber");

-- CreateIndex
CREATE INDEX "houses_site_area_idx" ON "houses"("site", "area");

-- CreateIndex
CREATE INDEX "applicants_site_area_idx" ON "applicants"("site", "area");

-- CreateIndex
CREATE INDEX "lottery_results_lotteryRunId_idx" ON "lottery_results"("lotteryRunId");

-- CreateIndex
CREATE INDEX "lottery_results_site_area_idx" ON "lottery_results"("site", "area");

-- AddForeignKey
ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
