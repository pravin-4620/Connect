ALTER TABLE "Email"
  ADD COLUMN IF NOT EXISTS "classificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "reason" TEXT;

CREATE INDEX IF NOT EXISTS "Email_userId_classificationStatus_idx"
  ON "Email" ("userId", "classificationStatus");
