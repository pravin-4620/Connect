import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(value).digest('hex');
function key() {
  const value = Buffer.from(process.env.GMAIL_TOKEN_KEY || '', 'hex');
  if (value.length !== 32) throw new Error('GMAIL_TOKEN_KEY must be 64 hex characters');
  return value;
}
export function encrypt(value) {
  if (!value) return null;
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('hex'), cipher.getAuthTag().toString('hex'), encrypted.toString('hex')].join(':');
}
export function decrypt(value) {
  if (!value) return undefined;
  if (!value.startsWith('v1:')) throw new Error('Reconnect Gmail to securely store credentials');
  const [,iv,tag,data] = value.split(':');
  const cipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'hex'));
  cipher.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([cipher.update(Buffer.from(data, 'hex')), cipher.final()]).toString('utf8');
}
