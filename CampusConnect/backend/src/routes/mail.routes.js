import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { applyCategoryLabels, archiveEmail, deleteEmail, getAttachment, gmailConfigured, markEmail, sendEmail, starEmail, syncEmails, trashEmail } from '../services/gmail.service.js';
import { categories } from '../mail/classifier.js';
import { publicEmail } from '../mail/privacy.js';
const router = express.Router(), prisma = new PrismaClient();
const syncQueries = new Set(['all', 'newer_than:2m', 'newer_than:30d', 'newer_than:7d', 'newer_than:1y']);
router.use(authenticate);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const handle = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
router.get('/status', handle(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { gmailConnected: true, gmailAddress: true, mailStatus: true, mailError: true, mailImported: true, mailLastSync: true, mailLease: true } });
  const counts = await prisma.email.groupBy({ by: ['category'], where: { userId: req.userId }, _count: { _all: true } });
  res.json({ ...user, running: !!user.mailLease && user.mailLease > new Date(), gmailConfigured: gmailConfigured(), aiConfigured: true, classifierReady: true, counts: Object.fromEntries(counts.map(c => [c.category, c._count._all])) });
}));
router.get('/', handle(async (req, res) => {
  const { category, search = '', unread } = req.query;
  const page = Number(req.query.page || 1);
  if (!Number.isSafeInteger(page) || page < 1 || typeof search !== 'string' || search.length > 200 || (category && ![...categories, 'FOCUS', 'ALL'].includes(category))) return res.status(400).json({ message: 'Invalid inbox filter' });
  const where = { userId: req.userId, ...(category === 'FOCUS' ? { category: { notIn: ['SPAM', 'PROMOTIONS'] } } : category && category !== 'ALL' ? { category } : {}), ...(unread === 'true' ? { isRead: false } : {}), ...(search ? { OR: ['subject','fromEmail','body'].map(key => ({ [key]: { contains: search, mode: 'insensitive' } })) } : {}) };
  const [emails, total] = await Promise.all([prisma.email.findMany({ where, orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * 30, take: 30 }), prisma.email.count({ where })]);
  res.json({ emails: emails.map(publicEmail), total, page, pages: Math.max(1, Math.ceil(total / 30)) });
}));
router.post('/sync', handle(async (req, res) => {
  if (!req.user.gmailConnected) return res.status(409).json({ message: 'Connect Gmail first' });
  const query = req.body?.query || 'newer_than:2m';
  if (!syncQueries.has(query)) return res.status(400).json({ message: 'Unsupported Gmail sync window' });
  void syncEmails(req.userId, { query }).catch(() => console.error('Could not start mail sync'));
  res.status(202).json({ message: 'Sync requested' });
}));
router.get('/:id/attachments/:attachmentId', handle(async (req, res) => {
  const attachment = await getAttachment(req.userId, req.params.id, req.params.attachmentId);
  res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.filename || 'attachment')}"`);
  res.send(attachment.data);
}));
router.post('/labels', handle(async (req, res) => {
  if (!req.user.gmailConnected) return res.status(409).json({ message: 'Connect Gmail first' });
  const result = await applyCategoryLabels(req.userId);
  res.json({ success: true, ...result });
}));
router.post('/send', handle(async (req, res) => {
  const result = await sendEmail(req.userId, req.body || {});
  res.status(201).json({ success: true, message: result.id });
}));
router.post('/:id/archive', handle(async (req, res) => {
  await archiveEmail(req.userId, req.params.id);
  await prisma.email.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  res.json({ success: true });
}));
router.post('/:id/trash', handle(async (req, res) => {
  await trashEmail(req.userId, req.params.id);
  res.json({ success: true });
}));
router.delete('/:id', handle(async (req, res) => {
  await deleteEmail(req.userId, req.params.id);
  res.json({ success: true });
}));
router.post('/:id/star', handle(async (req, res) => {
  await starEmail(req.userId, req.params.id, req.body?.starred !== false);
  res.json({ success: true });
}));
router.post('/:id/read', handle(async (req, res) => {
  await markEmail(req.userId, req.params.id, req.body?.isRead !== false);
  await prisma.email.updateMany({ where: { id: req.params.id, userId: req.userId }, data: { isRead: req.body?.isRead !== false } });
  res.json({ success: true });
}));
router.patch('/:id', handle(async (req, res) => {
  const { category, isRead } = req.body;
  if ((category !== undefined && !categories.includes(category)) || (isRead !== undefined && typeof isRead !== 'boolean') || (category === undefined && isRead === undefined)) return res.status(400).json({ message: 'Invalid update' });
  const result = await prisma.email.updateMany({ where: { id: req.params.id, userId: req.userId }, data: { ...(category !== undefined ? { category, classificationStatus: 'MANUAL', confidence: null, reason: 'Category set by you' } : {}), ...(isRead !== undefined ? { isRead } : {}) } });
  if (!result.count) return res.status(404).json({ message: 'Email not found' });
  res.json({ success: true });
}));
export default router;
