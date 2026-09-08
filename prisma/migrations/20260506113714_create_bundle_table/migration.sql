-- CreateTable
CREATE TABLE "Bundle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bundleName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "selectionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "productType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
