import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMessage, decodeBody } from '../src/mail/mime.js';
import { validateClassification, classifyEmail } from '../src/mail/classifier.js';
import { encrypt, decrypt, hash } from '../src/mail/security.js';
import { createGmailService } from '../src/services/gmail.service.js';
process.env.GMAIL_TOKEN_KEY = '11'.repeat(32);
const encoded = text => Buffer.from(text).toString('base64url');
const message = id => ({ id, internalDate: '1700000000000', labelIds: ['UNREAD'], payload: { headers: [{ name: 'sUbJeCt', value: `Subject ${id}` }], mimeType: 'text/plain', body: { data: encoded('Welcome') } } });
function harness({ failure = false, classifierFailure = false } = {}) {
 const emails = new Map(), user = { id: 'alice', gmailConnected: true, gmailAccessToken: encrypt('access'), gmailRefreshToken: encrypt('refresh'), mailCursor: null }, states = new Map(), calls = [];
 const labels = new Map([['INBOX', { id: 'INBOX', name: 'INBOX' }]]), modified = [];
 let fetchFailure = failure;
 const applyData = (target, data) => {
  for (const [key, value] of Object.entries(data)) {
   if (value && typeof value === 'object' && Number.isFinite(value.increment)) target[key] = (target[key] || 0) + value.increment;
   else target[key] = value;
  }
  return target;
 };
 const prisma = {
  user: {
   updateMany: async ({where, data}) => { if (where.OR && user.mailLease && user.mailLease > new Date()) return { count: 0 }; if (where.mailLeaseId && user.mailLeaseId !== where.mailLeaseId) return { count: 0 }; applyData(user, data); return { count: 1 }; },
   findUniqueOrThrow: async () => ({...user}), update: async ({data}) => applyData(user, data)
  },
  email: {
   findUnique: async ({where}) => emails.get(`${where.userId_gmailMessageId.userId}:${where.userId_gmailMessageId.gmailMessageId}`),
   upsert: async ({create}) => { emails.set(`${create.userId}:${create.gmailMessageId}`, {...create, id: create.gmailMessageId, classificationStatus: 'PENDING'}); },
   findMany: async ({where}) => [...emails.values()].filter(e => e.userId === where.userId && (!where.classificationStatus || e.classificationStatus === where.classificationStatus || where.classificationStatus.in?.includes(e.classificationStatus)) && (!where.category || (where.category.not ? e.category !== where.category.not : e.category === where.category))),
   updateMany: async ({where, data}) => { const e = emails.get(`${where.userId}:${where.id}`); if (!e || (where.classificationStatus && where.classificationStatus !== e.classificationStatus)) return {count:0}; Object.assign(e,data); return {count:1}; }
  },
  gmailOAuthState: { create: async ({data}) => states.set(data.id,data), findUnique: async ({where}) => states.get(where.id), deleteMany: async ({where}) => ({count:where.id ? Number(states.delete(where.id)) : 0}) }
 };
 class OAuth2 { setCredentials() {} generateAuthUrl(data) { return data.state; } async getToken() { return { tokens: { access_token: 'access', refresh_token: 'refresh' } }; } }
 const googleApi = { auth: {OAuth2}, gmail: () => ({ users: { getProfile: async () => ({data:{emailAddress:'alice@example.com'}}), messages: {
  list: async options => { calls.push(options); return {data: options.pageToken ? {messages:[{id:'2'}]} : {messages:[{id:'1'}],nextPageToken:'next'}}; },
  get: async ({id}) => { if (fetchFailure && id === '2') { fetchFailure = false; throw new Error('network'); } return { data: message(id) }; },
  modify: async ({id, requestBody}) => { modified.push({ id, requestBody }); return { data: { id } }; }
 }, labels: {
  list: async () => ({ data: { labels: [...labels.values()] } }),
  create: async ({ requestBody }) => { const label = { id: `label-${labels.size}`, name: requestBody.name }; labels.set(label.name, label); return { data: label }; }
 } } }) };
 const service = createGmailService({prisma, googleApi, classify: async () => { if (classifierFailure) throw new Error('model unavailable'); return {category:'WORK',classificationStatus:'DONE',reason:'Course information',confidence:.95}; }});
 return {service,emails,user,calls,states,modified,labels};
}
test('nested MIME selects Unicode plain text and excludes attachments', () => {
 assert.equal(decodeBody({ parts: [{mimeType:'multipart/alternative',parts:[{mimeType:'text/html',body:{data:encoded('<b>HTML</b>')}},{mimeType:'text/plain',body:{data:encoded('नमस्ते world')}}]},{mimeType:'text/plain',filename:'attachment.txt',body:{data:encoded('not message')}}]}), 'नमस्ते world');
});
test('HTML becomes inert text; Gmail timestamp and unread state are retained', () => {
 assert.equal(decodeBody({mimeType:'text/html',body:{data:encoded('<script>alert(1)</script><p>Hello &amp; welcome</p>')}}).trim(),'Hello & welcome');
 const parsed = parseMessage(message('1')); assert.equal(parsed.subject,'Subject 1'); assert.equal(parsed.isRead,false); assert.equal(parsed.receivedAt.getTime(),1700000000000);
});
test('invalid and low-confidence classifications never hide messages as spam', () => {
 assert.throws(() => validateClassification({category:'UNKNOWN',confidence:.9,reason:'x'}));
 assert.throws(() => validateClassification({category:'SPAM',confidence:5,reason:'x'}));
 assert.equal(validateClassification({category:'SPAM',confidence:.6,reason:'Uncertain'}).category,'REVIEW');
});
test('local classifier works without an OpenAI key', async () => { delete process.env.OPENAI_API_KEY; const result = await classifyEmail({subject:'Security alert',body:'new sign-in detected'}); assert.equal(result.category,'SECURITY'); assert.equal(result.classificationStatus,'DONE'); });
test('tokens are encrypted and tampering is rejected', () => {
 const ciphertext = encrypt('private-token'); assert.ok(!ciphertext.includes('private-token')); assert.equal(decrypt(ciphertext),'private-token');
 const parts = ciphertext.split(':'); parts[2] = '00'.repeat(16); assert.throws(() => decrypt(parts.join(':'))); assert.throws(() => decrypt('legacy-token'), /Reconnect/);
});
test('imports every page including spam/trash and deduplicates repeat syncs', async () => {
  delete process.env.OPENAI_API_KEY; const h = harness(); await h.service.syncEmails('alice'); await h.service.syncEmails('alice');
 assert.equal(h.emails.size,2); assert.equal(h.calls[1].pageToken,'next'); assert.ok(h.calls.every(c => c.includeSpamTrash && c.q === 'newer_than:2m')); assert.equal(h.user.mailStatus,'COMPLETE'); assert.equal(h.user.mailLease,null);
 assert.ok([...h.emails.values()].every(e=>e.category==='WORK')); await h.service.markEmailAsRead('1','bob'); assert.equal(h.emails.get('alice:1').isRead,false);
});
test('failed import checkpoints recover without skipping mail', async () => {
 const h = harness({failure:true}); await h.service.syncEmails('alice'); assert.equal(h.user.mailStatus,'ERROR'); assert.equal(h.user.mailCursor,'next'); assert.equal(h.emails.size,1);
 await h.service.syncEmails('alice'); assert.equal(h.emails.size,2); assert.equal(h.user.mailCursor,null); assert.equal(h.user.mailStatus,'COMPLETE');
});
test('active lease prevents overlapping workers', async () => { const h = harness(); h.user.mailLease = new Date(Date.now()+60000); await h.service.syncEmails('alice'); assert.equal(h.calls.length,0); });
test('classifier failure preserves pending mail and releases lease', async () => {
 const h = harness({classifierFailure:true}); await h.service.syncEmails('alice');
 assert.equal(h.emails.size,2); assert.equal(h.user.mailStatus,'ERROR'); assert.equal(h.user.mailLease,null); assert.equal(h.emails.get('alice:1').classificationStatus,'PENDING');
});
test('retry filters pending mail while preserving manual categories', async () => {
 const h = harness(); await h.service.syncEmails('alice'); h.emails.get('alice:1').classificationStatus = 'MANUAL'; h.emails.get('alice:1').category = 'PERSONAL';
 await h.service.syncEmails('alice'); assert.equal(h.emails.get('alice:1').category,'PERSONAL'); assert.equal(h.emails.get('alice:2').category,'WORK');
});
test('label application is explicit and only labels categorized mail', async () => {
 const h = harness(); await h.service.syncEmails('alice'); h.emails.get('alice:2').category = 'REVIEW';
 const result = await h.service.applyCategoryLabels('alice');
 assert.equal(result.updated,1); assert.deepEqual(h.modified.map(item => item.id), ['1']); assert.deepEqual(result.labels, ['ML Organizer/Work']);
});
test('OAuth state is random, browser-bound, expiring, and single-use', async () => {
 Object.assign(process.env,{GMAIL_CLIENT_ID:'test',GMAIL_CLIENT_SECRET:'test',GMAIL_REDIRECT_URI:'http://localhost/callback'});
 const h = harness(), nonce = 'browser-secret', state = await h.service.getGmailAuthUrl('alice',nonce);
 assert.equal(state.length,64); assert.notEqual(state,'alice'); await assert.rejects(h.service.handleGmailCallback('code',state,'other-browser'));
 assert.equal(await h.service.handleGmailCallback('code',state,nonce),'alice'); await assert.rejects(h.service.handleGmailCallback('code',state,nonce));
 const expired = await h.service.getGmailAuthUrl('alice',nonce); h.states.get(hash(expired)).expiresAt = new Date(0); await assert.rejects(h.service.handleGmailCallback('code',expired,nonce));
});
