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

export function decodeHtmlBody(payload) {
  const html = [];
  function visit(part) {
    if (!part || part.filename) return;
    if (part.body?.data && part.mimeType === 'text/html') {
      html.push(Buffer.from(part.body.data, 'base64url').toString('utf8'));
    }
    for (const child of part.parts || []) visit(child);
  }
  visit(payload);
  return html.join('\n') || null;
}

export function collectAttachments(payload) {
  const attachments = [];
  function visit(part) {
    if (!part) return;
    const filename = String(part.filename || '').trim();
    const attachmentId = part.body?.attachmentId;
    if (filename && attachmentId) {
      const contentIdHeader = (part.headers || []).find(header => header.name?.toLowerCase() === 'content-id')?.value || '';
      attachments.push({
        attachmentId,
        filename,
        mimeType: part.mimeType || 'application/octet-stream',
        size: part.body?.size || 0,
        contentId: contentIdHeader.replace(/[<>]/g, '') || null,
        inline: (part.headers || []).some(header => header.name?.toLowerCase() === 'content-disposition' && /inline/i.test(header.value || '')),
      });
    }
    for (const child of part.parts || []) visit(child);
  }
  visit(payload);
  return attachments;
}

export function parseMessage(message) {
  const headers = message.payload?.headers || [];
  const header = name => headers.find(h => h.name.toLowerCase() === name)?.value || '';
  const timestamp = Number(message.internalDate);
  return {
    subject: header('subject') || '(No subject)',
    fromEmail: header('from'),
    toEmail: header('to'),
    body: decodeBody(message.payload) || message.snippet || '',
    htmlBody: decodeHtmlBody(message.payload),
    attachments: collectAttachments(message.payload),
    receivedAt: new Date(Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now()),
    isRead: !(message.labelIds || []).includes('UNREAD'),
  };
}
