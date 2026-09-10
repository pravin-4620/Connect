import { classifyWithModel } from './ml-classifier.js';

export const categoryLabels = {
  PLACEMENT: 'Placement', ACADEMIC: 'Academic',
  WORK: 'Work', FINANCE: 'Finance', SHOPPING: 'Shopping', TRAVEL: 'Travel', SOCIAL: 'Social',
  SOCIAL_MEDIA: 'Social Media', FORUM: 'Forum', PROMOTIONS: 'Promotions', NEWSLETTERS: 'Newsletters',
  RECEIPTS: 'Receipts', SECURITY: 'Security', VERIFY_CODE: 'Verify Code', UPDATES: 'Updates',
  SPAM: 'Spam', LEARNING: 'Learning', SUPPORT: 'Support', PERSONAL: 'Personal', REVIEW: 'Needs Review',
};

export const categories = Object.keys(categoryLabels);

const rules = [
  ['VERIFY_CODE', 1.18, ['verification code', 'login code', 'one-time password', 'otp', 'confirm your email', 'password reset code', 'verify your email']],
  ['SECURITY', 1.12, ['security alert', 'new sign-in', 'account recovered', 'suspicious login', 'two-factor', 'account locked', 'password changed', 'device login']],
  ['PLACEMENT', 1.08, ['placement', 'campus drive', 'recruitment', 'job opening', 'hiring', 'interview schedule', 'aptitude test', 'shortlisted', 'offer letter', 'internship', 'career fair', 'company visit', 'resume submission', 'pre-placement talk', 'ppo']],
  ['ACADEMIC', 1.1, ['academic', 'assignment', 'exam', 'semester', 'internal assessment', 'attendance', 'timetable', 'syllabus', 'course registration', 'hall ticket', 'marks', 'result', 'lab record', 'faculty', 'class schedule', 'question bank', 'google classroom', 'classroom', 'new material', 'new announcement', 'nptel', 'quiz', 'problem statement', 'campus innovation']],
  ['RECEIPTS', 1.02, ['receipt', 'order confirmation', 'payment received', 'subscription renewed', 'tax invoice', 'payment successful', 'paid successfully']],
  ['FINANCE', .98, ['bank', 'invoice', 'payment due', 'upi', 'credit card', 'debit', 'refund', 'transaction', 'loan', 'fee payment']],
  ['TRAVEL', .9, ['flight', 'hotel', 'booking', 'boarding pass', 'itinerary', 'pnr', 'airport']],
  ['SHOPPING', .88, ['shipped', 'delivered', 'your order', 'return window', 'amazon', 'flipkart', 'shopping cart']],
  ['SPAM', 1, ['claim your prize', "you\'ve won", 'lottery winner', 'risk-free', 'processing fee', 'free money', 'winner selected']],
  ['SUPPORT', .94, ['support ticket', 'case number', 'help center', 'case resolved']],
  ['WORK', .86, ['meeting', 'proposal', 'contract', 'jira', 'github', 'slack', 'deadline', 'project update', 'minutes of meeting']],
  ['LEARNING', .84, ['course', 'lesson', 'webinar', 'hackerrank', 'udemy', 'coursera', 'certificate', 'workshop', 'training']],
  ['SOCIAL_MEDIA', .86, ['liked your', 'commented on', 'new follower', 'connection request', 'tagged you', 'mentioned you']],
  ['FORUM', .84, ['forum', 'community', 'discussion', 'thread', 'replied to your post', 'stackoverflow', 'reddit']],
  ['NEWSLETTERS', .8, ['newsletter', 'weekly digest', 'roundup', 'read more', 'substack']],
  ['PROMOTIONS', .84, ['sale', 'discount', 'coupon', 'limited time', 'unsubscribe', 'shop now', 'exclusive offer', 'cashback']],
  ['UPDATES', .82, ['policy update', 'terms of service', 'maintenance', 'system update', 'important information', 'final reminder']],
  ['SOCIAL', .76, ['invited you', 'event invitation', 'birthday', 'get together']],
];

const senderHints = [
  ['PLACEMENT', .97, [/placement/i, /career/i, /recruit/i, /tpo/i]],
  ['FINANCE', .97, [/accounts?@/i, /finance/i, /fees?/i, /bank/i]],
  ['ACADEMIC', .96, [/classroom\.google\.com/i, /library@/i, /principal@/i, /studentsection@/i, /faculty/i, /ignitrron@/i]],
  ['SOCIAL_MEDIA', .95, [/pinterest/i, /instagram/i, /linkedin/i, /facebook/i, /x\.com/i, /twitter/i]],
  ['LEARNING', .94, [/nptel/i, /coursera/i, /udemy/i, /hackerrank/i, /ieee/i]],
];

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasTerm(text, term) {
  const escaped = escapeRegExp(term);
  if (/^[a-z0-9 ]+$/i.test(term)) {
    return new RegExp(`(^|[^a-z0-9])${escaped.replace(/\s+/g, '\\s+')}([^a-z0-9]|$)`, 'i').test(text);
  }
  return text.includes(term.toLowerCase());
}

function senderClassification(email) {
  const sender = String(email.fromEmail || '');
  const subject = String(email.subject || '').toLowerCase();
  const body = String(email.body || '').toLowerCase();

  if (/accounts?@/i.test(sender) && hasTerm(`${subject} ${body}`, 'bank')) {
    return { category: 'FINANCE', confidence: .98, reason: 'Trusted finance sender and finance terms', classificationStatus: 'DONE' };
  }
  if (/studentsection@/i.test(sender) && /(loan|fee|payment|scholarship)/i.test(`${subject} ${body}`)) {
    return { category: 'FINANCE', confidence: .95, reason: 'Student section finance notice', classificationStatus: 'DONE' };
  }
  const hint = senderHints.find(([, , patterns]) => patterns.some(pattern => pattern.test(sender)));
  if (hint) {
    return { category: hint[0], confidence: hint[1], reason: `Sender matched ${hint[0].replace('_', ' ').toLowerCase()}`, classificationStatus: 'DONE' };
  }
  return null;
}

function ruleClassification(email) {
  const sender = senderClassification(email);
  if (sender) return sender;
  const text = [email.fromEmail, email.subject, email.body, (email.attachments || []).map(item => item.filename).join(' ')].filter(Boolean).join(' ').toLowerCase();
  const matches = rules.map(([category, weight, terms]) => {
    const found = terms.filter(term => {
      if (category === 'FINANCE' && term === 'bank' && hasTerm(text, 'question bank')) return false;
      return hasTerm(text, term);
    });
    const subjectBoost = found.filter(term => hasTerm(String(email.subject || '').toLowerCase(), term)).length * .35;
    const senderBoost = found.filter(term => hasTerm(String(email.fromEmail || '').toLowerCase(), term)).length * .2;
    return { category, found, score: found.length * weight + subjectBoost + senderBoost };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  if (!matches.length) {
    const personal = email.fromEmail && !/no-?reply|noreply/i.test(email.fromEmail);
    return { category: personal ? 'PERSONAL' : 'REVIEW', confidence: personal ? .58 : .42, reason: 'No strong rule match', classificationStatus: 'DONE' };
  }
  const winner = matches[0];
  return { category: winner.category, confidence: Math.min(.98, .62 + winner.score / 4), reason: `Matched: ${winner.found.join(', ')}`.slice(0, 500), classificationStatus: 'DONE' };
}

export function validateClassification(value) {
  if (!value || !categories.includes(value.category) || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1 || typeof value.reason !== 'string') throw new Error('Invalid classifier result');
  return { ...value, category: value.confidence < .7 && value.category === 'SPAM' ? 'REVIEW' : value.category, reason: value.reason.slice(0, 500), classificationStatus: 'DONE' };
}

export async function classifyEmail(email) {
  const rule = ruleClassification(email);
  if (rule.confidence >= .92) return validateClassification(rule);
  const model = await classifyWithModel(email);
  return validateClassification(model && model.confidence >= .72 ? model : rule);
}
