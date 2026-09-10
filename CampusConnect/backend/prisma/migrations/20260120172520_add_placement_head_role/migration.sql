-- AlterEnum
ALTER TYPE "ApprovalStatus" ADD VALUE IF NOT EXISTS 'MENTOR_APPROVED';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PLACEMENT_HEAD';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "url" TEXT;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN IF NOT EXISTS "chiefMentorId" TEXT;

-- AddForeignKey
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'Mentor_chiefMentorId_fkey'
	) THEN
		ALTER TABLE "Mentor"
			ADD CONSTRAINT "Mentor_chiefMentorId_fkey"
			FOREIGN KEY ("chiefMentorId") REFERENCES "Mentor"("id")
			ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;
END $$;
