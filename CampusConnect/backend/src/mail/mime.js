export function decodeBody(payload) {
  const plain = [], html = [];
  function visit(part) {
    if (!part || part.filename) return;
    if (part.body?.data) {
      const value = Buffer.from(part.body.data, 'base64url').toString('utf8');
      if (part.mimeType === 'text/plain') plain.push(value);
      else if (part.mimeType === 'text/html') html.push(value);
    }
    for (const child of part.parts || []) visit(child);
  }
  visit(payload);
  return plain.length ? plain.join('\n') : html.join('\n').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<br\s*\/?>|<\/p>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
export function parseMessage(message) {
  const headers = message.payload?.headers || [];
  const header = name => headers.find(h => h.name.toLowerCase() === name)?.value || '';
  const timestamp = Number(message.internalDate);
  return { subject: header('subject') || '(No subject)', fromEmail: header('from'), toEmail: header('to'), body: decodeBody(message.payload) || message.snippet || '', receivedAt: new Date(Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now()), isRead: !(message.labelIds || []).includes('UNREAD') };
}
