-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" INTEGER NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ResourceType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resourceTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "maxQty" INTEGER NOT NULL DEFAULT 1,
    "priceInternal" INTEGER NOT NULL,
    "priceExternal" INTEGER NOT NULL,
    "bookingType" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    CONSTRAINT "Resource_resourceTypeId_fkey" FOREIGN KEY ("resourceTypeId") REFERENCES "ResourceType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "sentBy" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "Message_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "bookingDate" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "resourceQty" INTEGER NOT NULL,
    "BookingType" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceType_name_key" ON "ResourceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");
