-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "key" TEXT,
    "tempo" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfSets" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetlistSong" (
    "id" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,
    "comments" TEXT,
    "backgroundColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetlistSong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Song_createdBy_idx" ON "Song"("createdBy");

-- CreateIndex
CREATE INDEX "Setlist_createdBy_idx" ON "Setlist"("createdBy");

-- CreateIndex
CREATE INDEX "SetlistSong_setlistId_idx" ON "SetlistSong"("setlistId");

-- CreateIndex
CREATE INDEX "SetlistSong_songId_idx" ON "SetlistSong"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "SetlistSong_setlistId_songId_key" ON "SetlistSong"("setlistId", "songId");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setlist" ADD CONSTRAINT "Setlist_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetlistSong" ADD CONSTRAINT "SetlistSong_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetlistSong" ADD CONSTRAINT "SetlistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
