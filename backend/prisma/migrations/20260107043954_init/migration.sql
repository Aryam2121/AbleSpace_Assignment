-- CreateTable
CREATE TABLE "navigation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "last_scraped_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "navigation_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "product_count" INTEGER NOT NULL DEFAULT 0,
    "last_scraped_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "category_navigation_id_fkey" FOREIGN KEY ("navigation_id") REFERENCES "navigation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_id" TEXT NOT NULL,
    "category_id" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "image_url" TEXT,
    "source_url" TEXT NOT NULL,
    "last_scraped_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_detail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "description" TEXT,
    "specs" TEXT,
    "ratings_avg" REAL,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "recommendations" TEXT DEFAULT '[]',
    "publisher" TEXT,
    "publication_date" TEXT,
    "isbn" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "product_detail_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scrape_job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_url" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" DATETIME,
    "finished_at" DATETIME,
    "error_log" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "view_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    "path_json" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "navigation_slug_key" ON "navigation"("slug");

-- CreateIndex
CREATE INDEX "navigation_slug_idx" ON "navigation"("slug");

-- CreateIndex
CREATE INDEX "navigation_last_scraped_at_idx" ON "navigation"("last_scraped_at");

-- CreateIndex
CREATE INDEX "category_slug_idx" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_navigation_id_idx" ON "category"("navigation_id");

-- CreateIndex
CREATE INDEX "category_parent_id_idx" ON "category"("parent_id");

-- CreateIndex
CREATE INDEX "category_last_scraped_at_idx" ON "category"("last_scraped_at");

-- CreateIndex
CREATE UNIQUE INDEX "category_navigation_id_slug_key" ON "category"("navigation_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_source_id_key" ON "product"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_source_url_key" ON "product"("source_url");

-- CreateIndex
CREATE INDEX "product_source_id_idx" ON "product"("source_id");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product"("category_id");

-- CreateIndex
CREATE INDEX "product_last_scraped_at_idx" ON "product"("last_scraped_at");

-- CreateIndex
CREATE INDEX "product_price_idx" ON "product"("price");

-- CreateIndex
CREATE UNIQUE INDEX "product_detail_product_id_key" ON "product_detail"("product_id");

-- CreateIndex
CREATE INDEX "product_detail_product_id_idx" ON "product_detail"("product_id");

-- CreateIndex
CREATE INDEX "review_product_id_idx" ON "review"("product_id");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- CreateIndex
CREATE INDEX "scrape_job_status_idx" ON "scrape_job"("status");

-- CreateIndex
CREATE INDEX "scrape_job_target_type_idx" ON "scrape_job"("target_type");

-- CreateIndex
CREATE INDEX "scrape_job_created_at_idx" ON "scrape_job"("created_at");

-- CreateIndex
CREATE INDEX "view_history_session_id_idx" ON "view_history"("session_id");

-- CreateIndex
CREATE INDEX "view_history_user_id_idx" ON "view_history"("user_id");

-- CreateIndex
CREATE INDEX "view_history_created_at_idx" ON "view_history"("created_at");
