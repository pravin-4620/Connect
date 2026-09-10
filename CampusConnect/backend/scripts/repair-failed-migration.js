import { PrismaClient } from '@prisma/client';

const migrationName = '20260120172520_add_placement_head_role';
const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(`
    UPDATE "_prisma_migrations"
    SET "rolled_back_at" = CURRENT_TIMESTAMP,
        "finished_at" = NULL,
        "logs" = 'Marked rolled back automatically before redeploying a repaired migration.'
    WHERE "migration_name" = '${migrationName}'
      AND "finished_at" IS NULL
      AND "rolled_back_at" IS NULL
  `);
} finally {
  await prisma.$disconnect();
}