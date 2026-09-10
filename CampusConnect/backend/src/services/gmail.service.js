import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { encrypt, decrypt, hash } from '../mail/security.js';
import { parseMessage } from '../mail/mime.js';
import { categoryLabels, classifyEmail } from '../mail/classifier.js';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.modify';
const DEFAULT_SYNC_QUERY = process.env.MAIL_SYNC_QUERY || 'newer_than:2m';
const MAX_SYNC_MESSAGES = Math.min(Math.max(Number(process.env.MAIL_SYNC_MAX_MESSAGES || 10000), 1), 10000);
const ALLOWED_SYNC_QUERIES = new Set(['all', 'newer_than:2m', 'newer_than:30d', 'newer_than:7d', 'newer_than:1y']);
const FETCH_CONCURRENCY = 5;

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const isRetryableGmailError = error => [403, 429, 500, 502, 503, 504].includes(Number(error?.code || error?.response?.status));
async function withGmailRetry(operation) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableGmailError(error) || attempt >= 3) throw error;
      await wait(500 * (2 ** attempt));
    }
  }
}

export function createGmailService({ prisma = new PrismaClient(), googleApi = google, classify = classifyEmail } = {}) {
const gmailConfigured = () => ['GMAIL_CLIENT_ID','GMAIL_CLIENT_SECRET','GMAIL_REDIRECT_URI','GMAIL_TOKEN_KEY'].every(k => !!process.env[k]);
const oauth = () => new googleApi.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URI);
function normalizeSyncQuery(query = DEFAULT_SYNC_QUERY) {
  const value = String(query || DEFAULT_SYNC_QUERY).trim();
  if (!ALLOWED_SYNC_QUERIES.has(value)) throw new Error('Unsupported Gmail sync window');
  return value === 'all' ? '' : value;
}
async function getGmailAuthUrl(userId, browserNonce) {
  if (!gmailConfigured()) throw new Error('Gmail credentials are not configured');
  const state = randomBytes(32).toString('hex');
  await prisma.gmailOAuthState.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.gmailOAuthState.create({ data: { id: hash(state), userId, browserHash: hash(browserNonce), expiresAt: new Date(Date.now() + 600000) } });
  return oauth().generateAuthUrl({ access_type: 'offline', prompt: 'select_account consent', scope: [GMAIL_SCOPE], state });
}
async function handleGmailCallback(code, state, browserNonce) {
  if (typeof code !== 'string' || typeof state !== 'string') throw new Error('Invalid OAuth callback');
  const saved = await prisma.gmailOAuthState.findUnique({ where: { id: hash(state) } });
  if (!saved || saved.expiresAt < new Date() || (browserNonce && saved.browserHash !== hash(browserNonce))) throw new Error('Expired or invalid OAuth state');
  const consumed = await prisma.gmailOAuthState.deleteMany({ where: { id: saved.id } });
  if (!consumed.count) throw new Error('OAuth state already used');
  const client = oauth();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const { data: profile } = await googleApi.gmail({ version: 'v1', auth: client }).users.getProfile({ userId: 'me' });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: saved.userId } });
  if (user.isBlocked) throw new Error('Account blocked');
  if (user.mailLease && user.mailLease > new Date()) throw new Error('Wait for the current import to finish');
  const switchingAccounts = user.gmailAddress && user.gmailAddress !== profile.emailAddress;
  if (!tokens.refresh_token && (switchingAccounts || !user.gmailRefreshToken)) throw new Error('Google did not provide offline access; reconnect Gmail');
  if (switchingAccounts) {
    await prisma.email.deleteMany({ where: { userId: user.id } });
  }
  await prisma.user.update({ where: { id: user.id }, data: { gmailConnected: true, gmailAddress: profile.emailAddress, gmailAccessToken: encrypt(tokens.access_token), ...(tokens.refresh_token ? { gmailRefreshToken: encrypt(tokens.refresh_token) } : {}), mailCursor: null, mailStatus: 'IDLE', mailError: null, mailImported: 0, mailLastSync: null } });
  return user.id;
}

// Database lease prevents overlapping imports across HTTP requests and scheduled jobs.
// Page checkpoints survive restarts; per-user unique IDs make repeated pages safe.
async function hydrateInlineBodies(gmail, messageId, part) {
  if (!part || part.filename) return;
  if (['text/plain','text/html'].includes(part.mimeType) && part.body?.attachmentId && !part.body.data) {
    const attachment = await withGmailRetry(() => gmail.users.messages.attachments.get({ userId: 'me', messageId, id: part.body.attachmentId }, { timeout: 30000 }));
    part.body.data = attachment.data.data;
  }
  for (const child of part.parts || []) await hydrateInlineBodies(gmail, messageId, child);
}

async function fetchAndStoreMessage({ gmail, prisma, userId, message, heartbeat, update, onNewEmail }) {
  await heartbeat();
  const existing = await prisma.email.findUnique({ where: { userId_gmailMessageId: { userId, gmailMessageId: message.id } }, select: { id: true, htmlBody: true, attachments: true } });
  if (existing && existing.htmlBody !== null && existing.attachments !== null) return false;
  let full;
  try { full = await withGmailRetry(() => gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' }, { timeout: 30000 })); }
  catch (err) { if (err.code === 404) return false; throw err; }
  await hydrateInlineBodies(gmail, message.id, full.data.payload);
  const parsed = parseMessage(full.data);
  if (existing) {
    await prisma.email.updateMany({ where: { id: existing.id, userId }, data: { htmlBody: parsed.htmlBody, attachments: parsed.attachments, body: parsed.body, isRead: parsed.isRead } });
    return false;
  }
  const stored = await prisma.email.upsert({ where: { userId_gmailMessageId: { userId, gmailMessageId: message.id } }, create: { userId, gmailMessageId: message.id, ...parsed, category: 'REVIEW', reason: 'Waiting for local filtering' }, update: {} });
  await update({ mailImported: { increment: 1 } });
  if (typeof onNewEmail === 'function') await onNewEmail(stored);
  return true;
}

async function classifyPendingEmails({ prisma, userId, heartbeat, classify, statuses = ['PENDING'] }) {
  let classifiedCount = 0;
  const drainUntilEmpty = statuses.length === 1 && statuses[0] === 'PENDING';
  let skip = 0;
  while (true) {
    const pending = await prisma.email.findMany({ where: { userId, classificationStatus: { in: statuses } }, take: 50, skip, orderBy: { receivedAt: 'desc' } });
    if (!pending.length) break;
    for (const email of pending) {
      await heartbeat();
      const result = await classify(email);
      await prisma.email.updateMany({ where: { id: email.id, userId, classificationStatus: email.classificationStatus }, data: result });
      classifiedCount += 1;
    }
    if (!drainUntilEmpty) {
      skip += pending.length;
      if (pending.length < 50) break;
    }
  }
  return classifiedCount;
}

async function syncEmails(userId, { query = DEFAULT_SYNC_QUERY, maxMessages = MAX_SYNC_MESSAGES, onNewEmail } = {}) {
  const syncQuery = normalizeSyncQuery(query);
  const syncLimit = Math.min(Math.max(Number(maxMessages || MAX_SYNC_MESSAGES), 1), MAX_SYNC_MESSAGES);
  const leaseId = randomUUID();
  const acquired = await prisma.user.updateMany({ where: { id: userId, gmailConnected: true, OR: [{ mailLease: null }, { mailLease: { lt: new Date() } }] }, data: { mailLease: new Date(Date.now() + 300000), mailLeaseId: leaseId, mailStatus: 'IMPORTING', mailError: null } });
  if (!acquired.count) return;
  const update = async data => {
    const result = await prisma.user.updateMany({ where: { id: userId, mailLeaseId: leaseId }, data });
    if (!result.count) throw new Error('Import lease lost');
  };
  const heartbeat = () => update({ mailLease: new Date(Date.now() + 300000) });
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const client = oauth();
    client.setCredentials({ access_token: decrypt(user.gmailAccessToken), refresh_token: decrypt(user.gmailRefreshToken) });
    const gmail = googleApi.gmail({ version: 'v1', auth: client });
    let pageToken = user.mailCursor || undefined;
    let importedRefs = 0;
    do {
      await heartbeat();
      let data;
      try {
        ({ data } = await withGmailRetry(() => gmail.users.messages.list({ userId: 'me', ...(syncQuery ? { q: syncQuery } : {}), maxResults: Math.min(100, syncLimit - importedRefs), includeSpamTrash: true, pageToken }, { timeout: 30000 })));
      } catch (err) {
        // Expired Gmail page tokens cannot be reused; restart safely on retry.
        if (pageToken && Number(err.code) === 400) await update({ mailCursor: null });
        throw err;
      }
      const messages = data.messages || [];
      importedRefs += messages.length;
      for (let index = 0; index < messages.length; index += FETCH_CONCURRENCY) {
        const batch = messages.slice(index, index + FETCH_CONCURRENCY);
        await Promise.all(batch.map(message => fetchAndStoreMessage({ gmail, prisma, userId, message, heartbeat, update, onNewEmail })));
      }
      pageToken = data.nextPageToken;
      await update({ mailCursor: pageToken || null });
    } while (pageToken && importedRefs < syncLimit);
    await update({ mailLastSync: new Date(), mailStatus: 'FILTERING' });
    await classifyPendingEmails({ prisma, userId, heartbeat, classify, statuses: ['PENDING', 'DONE'] });
    await update({ mailStatus: 'COMPLETE', mailError: null });
  } catch (err) {
    const authError = err.code === 401 || err.response?.data?.error === 'invalid_grant';
    const gmailError = err.response?.data?.error;
    const accessError = Number(err.code || err.response?.status) === 403;
    const windowError = err.message === 'Unsupported Gmail sync window';
    const detail = gmailError?.message || gmailError?.errors?.[0]?.reason;
    const mailError = authError
      ? 'Gmail access expired. Reconnect your account.'
      : windowError
        ? err.message
        : accessError
          ? `Gmail denied access${detail ? `: ${detail}` : '. Check that the Gmail API is enabled and this account is allowed.'}`
          : 'Import or filtering paused. Check Gmail credentials, quota, and connectivity, then retry Sync.';
    let finalStatus = 'ERROR';
    try {
      if (accessError) {
      await update({ mailStatus: 'FILTERING' });
      const classifiedCount = await classifyPendingEmails({ prisma, userId, heartbeat, classify });
      if (classifiedCount > 0) finalStatus = 'PARTIAL';
      }
    } catch (classificationError) {
      console.error('Pending mail classification failed:', classificationError.message);
    }
    await update({ mailStatus: finalStatus, mailError, ...(authError ? { gmailConnected: false } : {}) }).catch(() => {});
    console.error('Mail sync failed:', err.code || err.status || err.name, detail || err.message);
  } finally {
    await prisma.user.updateMany({ where: { id: userId, mailLeaseId: leaseId }, data: { mailLease: null, mailLeaseId: null } });
  }
}
const markEmailAsRead = (emailId, userId) => prisma.email.updateMany({ where: { id: emailId, userId }, data: { isRead: true } });
const getCategorizedEmails = (userId, category = null, limit = 50) => prisma.email.findMany({ where: { userId, ...(category ? { category } : {}) }, orderBy: { receivedAt: 'desc' }, take: Math.min(Math.max(limit || 50, 1), 100) });

async function getAttachment(userId, emailId, attachmentId) {
  const email = await prisma.email.findFirst({ where: { id: emailId, userId }, select: { gmailMessageId: true, attachments: true } });
  if (!email) throw new Error('Email not found');
  const attachment = (Array.isArray(email.attachments) ? email.attachments : []).find(item => item.attachmentId === attachmentId);
  if (!attachment) throw new Error('Attachment not found');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.gmailConnected) throw new Error('Connect Gmail first');
  const client = oauth();
  client.setCredentials({ access_token: decrypt(user.gmailAccessToken), refresh_token: decrypt(user.gmailRefreshToken) });
  const gmail = googleApi.gmail({ version: 'v1', auth: client });
  const { data } = await withGmailRetry(() => gmail.users.messages.attachments.get({ userId: 'me', messageId: email.gmailMessageId, id: attachmentId }, { timeout: 30000 }));
  return { ...attachment, data: Buffer.from(data.data || '', 'base64url') };
}

async function getUserGmail(userId) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.gmailConnected) throw new Error('Connect Gmail first');
  const client = oauth();
  client.setCredentials({ access_token: decrypt(user.gmailAccessToken), refresh_token: decrypt(user.gmailRefreshToken) });
  return { user, gmail: googleApi.gmail({ version: 'v1', auth: client }) };
}

async function modifyMessage(userId, emailId, requestBody) {
  const email = await prisma.email.findFirst({ where: { id: emailId, userId }, select: { gmailMessageId: true } });
  if (!email) throw new Error('Email not found');
  const { gmail } = await getUserGmail(userId);
  await withGmailRetry(() => gmail.users.messages.modify({ userId: 'me', id: email.gmailMessageId, requestBody }, { timeout: 30000 }));
  return email.gmailMessageId;
}

async function getStoredGmailMessageId(userId, emailId) {
  const email = await prisma.email.findFirst({ where: { id: emailId, userId }, select: { gmailMessageId: true } });
  if (!email) throw new Error('Email not found');
  return email.gmailMessageId;
}

const archiveEmail = async (userId, emailId) => modifyMessage(userId, emailId, { removeLabelIds: ['INBOX'] });
const trashEmail = async (userId, emailId) => {
  await modifyMessage(userId, emailId, { addLabelIds: ['TRASH'] });
  await prisma.email.deleteMany({ where: { id: emailId, userId } });
};
const deleteEmail = async (userId, emailId) => {
  const gmailMessageId = await getStoredGmailMessageId(userId, emailId);
  const { gmail } = await getUserGmail(userId);
  await withGmailRetry(() => gmail.users.messages.delete({ userId: 'me', id: gmailMessageId }, { timeout: 30000 }));
  await prisma.email.deleteMany({ where: { id: emailId, userId } });
};
const starEmail = (userId, emailId, starred) => modifyMessage(userId, emailId, starred ? { addLabelIds: ['STARRED'] } : { removeLabelIds: ['STARRED'] });
const markEmail = (userId, emailId, isRead) => modifyMessage(userId, emailId, isRead ? { removeLabelIds: ['UNREAD'] } : { addLabelIds: ['UNREAD'] });

function encodeMime(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

async function sendEmail(userId, { to, cc = '', bcc = '', subject, body, threadId, replyTo }) {
  if (!to || !subject || !body) throw new Error('To, subject, and message are required');
  const { gmail } = await getUserGmail(userId);
  const headers = [`To: ${to}`, cc && `Cc: ${cc}`, bcc && `Bcc: ${bcc}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset=UTF-8', 'MIME-Version: 1.0', replyTo && `In-Reply-To: ${replyTo}`, replyTo && `References: ${replyTo}`].filter(Boolean).join('\r\n');
  const sent = await withGmailRetry(() => gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodeMime(`${headers}\r\n\r\n${body}`), ...(threadId ? { threadId } : {}) } }, { timeout: 30000 }));
  return sent.data;
}

async function ensureCategoryLabel(gmail, labelName) {
  const { data } = await gmail.users.labels.list({ userId: 'me' }, { timeout: 30000 });
  const found = (data.labels || []).find(label => label.name === labelName);
  if (found) return found.id;
  const created = await gmail.users.labels.create({ userId: 'me', requestBody: { name: labelName, labelListVisibility: 'labelShow', messageListVisibility: 'show' } }, { timeout: 30000 });
  return created.data.id;
}

async function applyCategoryLabels(userId) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.gmailConnected) throw new Error('Connect Gmail first');
  const client = oauth();
  client.setCredentials({ access_token: decrypt(user.gmailAccessToken), refresh_token: decrypt(user.gmailRefreshToken) });
  const gmail = googleApi.gmail({ version: 'v1', auth: client });
  const emails = await prisma.email.findMany({ where: { userId, classificationStatus: { in: ['DONE', 'MANUAL'] }, category: { not: 'REVIEW' } }, select: { id: true, gmailMessageId: true, category: true }, take: 10000 });
  const categoryToLabel = new Map();
  let updated = 0;
  for (const email of emails) {
    const displayName = categoryLabels[email.category] || email.category;
    const labelName = `ML Organizer/${displayName}`;
    if (!categoryToLabel.has(labelName)) categoryToLabel.set(labelName, await ensureCategoryLabel(gmail, labelName));
    await gmail.users.messages.modify({ userId: 'me', id: email.gmailMessageId, requestBody: { addLabelIds: [categoryToLabel.get(labelName)] } }, { timeout: 30000 });
    updated += 1;
  }
  return { updated, labels: [...categoryToLabel.keys()] };
}

return { gmailConfigured, getGmailAuthUrl, handleGmailCallback, syncEmails, markEmailAsRead, getCategorizedEmails, applyCategoryLabels, normalizeSyncQuery, getAttachment, archiveEmail, trashEmail, deleteEmail, starEmail, markEmail, sendEmail };
}
export const { gmailConfigured, getGmailAuthUrl, handleGmailCallback, syncEmails, markEmailAsRead, getCategorizedEmails, applyCategoryLabels, getAttachment, archiveEmail, trashEmail, deleteEmail, starEmail, markEmail, sendEmail } = createGmailService();
