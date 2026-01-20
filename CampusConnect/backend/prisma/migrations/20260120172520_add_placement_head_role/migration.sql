-- AlterEnum
ALTER TYPE "ApprovalStatus" ADD VALUE 'MENTOR_APPROVED';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PLACEMENT_HEAD';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "chiefMentorId" TEXT;

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_chiefMentorId_fkey" FOREIGN KEY ("chiefMentorId") REFERENCES "Mentor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
