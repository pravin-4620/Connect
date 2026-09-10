import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { classifyEmail } from '../src/mail/classifier.js';

const prisma = new PrismaClient();

try {
  const emails = await prisma.email.findMany({
    where: { classificationStatus: 'DONE' },
    select: {
      id: true,
      category: true,
      fromEmail: true,
      subject: true,
      body: true,
      attachments: true,
    },
  });
  const changes = {};
  let changed = 0;

  for (const email of emails) {
    const result = await classifyEmail(email);
    if (email.category !== result.category) {
      changed += 1;
      const key = `${email.category}->${result.category}`;
      changes[key] = (changes[key] || 0) + 1;
    }
    await prisma.email.update({ where: { id: email.id }, data: result });
  }

  console.log(JSON.stringify({ processed: emails.length, changed, changes }, null, 2));
} finally {
  await prisma.$disconnect();
}
