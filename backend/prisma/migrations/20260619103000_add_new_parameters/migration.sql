-- DropIndex
DROP INDEX "applicants_site_area_idx";

-- DropIndex
DROP INDEX "houses_site_area_idx";

-- CreateIndex
CREATE INDEX "applicants_site_area_bedroom_idx" ON "applicants"("site", "area", "bedroom");

-- CreateIndex
CREATE INDEX "houses_site_area_bedroom_idx" ON "houses"("site", "area", "bedroom");
