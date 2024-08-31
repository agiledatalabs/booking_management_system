-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sentTo_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "sentTo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentTo_fkey" FOREIGN KEY ("sentTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
