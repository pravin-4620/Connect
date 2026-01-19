-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "chiefMentorId" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_chiefMentorId_fkey" FOREIGN KEY ("chiefMentorId") REFERENCES "Mentor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
