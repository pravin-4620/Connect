-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "certificateUploadedAt" TIMESTAMP(3),
ADD COLUMN     "certificateUrl" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "about" TEXT,
ADD COLUMN     "certificates" JSONB,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "leetcodeUrl" TEXT,
ADD COLUMN     "linkedInUrl" TEXT;
