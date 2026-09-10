import { PrismaClient } from '@prisma/client';

const migrationName = '20260120172520_add_placement_head_role';
const prisma = new PrismaClient();

async function runRepairStep(label, sql) {
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log(`repair ok: ${label}`);
  } catch (error) {
    console.warn(`repair skipped: ${label}: ${error.message}`);
  }
}

try {
  await runRepairStep('old failed migration marker', `
    UPDATE "_prisma_migrations"
    SET "rolled_back_at" = CURRENT_TIMESTAMP,
        "finished_at" = NULL,
        "logs" = 'Marked rolled back automatically before redeploying a repaired migration.'
    WHERE "migration_name" = '${migrationName}'
      AND "finished_at" IS NULL
      AND "rolled_back_at" IS NULL
  `);

  await runRepairStep('gmail user columns', `
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "gmailAddress" TEXT,
      ADD COLUMN IF NOT EXISTS "mailCursor" TEXT,
      ADD COLUMN IF NOT EXISTS "mailLease" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "mailLeaseId" TEXT,
      ADD COLUMN IF NOT EXISTS "mailStatus" TEXT NOT NULL DEFAULT 'IDLE',
      ADD COLUMN IF NOT EXISTS "mailError" TEXT,
      ADD COLUMN IF NOT EXISTS "mailImported" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "mailLastSync" TIMESTAMP(3);
  `);

  await runRepairStep('email classification and content columns', `
    ALTER TABLE "Email"
      ADD COLUMN IF NOT EXISTS "classificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "reason" TEXT,
      ADD COLUMN IF NOT EXISTS "htmlBody" TEXT,
      ADD COLUMN IF NOT EXISTS "attachments" JSONB;
  `);

  await runRepairStep('email classification index', `
    CREATE INDEX IF NOT EXISTS "Email_userId_classificationStatus_idx"
      ON "Email" ("userId", "classificationStatus");
  `);

  await runRepairStep('gmail oauth state table', `
    CREATE TABLE IF NOT EXISTS "GmailOAuthState" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "browserHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "GmailOAuthState_pkey" PRIMARY KEY ("id")
    );
  `);
} finally {
  await prisma.$disconnect();
}
