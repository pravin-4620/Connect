import { classifyWithModel } from './ml-classifier.js';

export const categoryLabels = {
  WORK: 'Work', FINANCE: 'Finance', SHOPPING: 'Shopping', TRAVEL: 'Travel', SOCIAL: 'Social',
  SOCIAL_MEDIA: 'Social Media', FORUM: 'Forum', PROMOTIONS: 'Promotions', NEWSLETTERS: 'Newsletters',
  RECEIPTS: 'Receipts', SECURITY: 'Security', VERIFY_CODE: 'Verify Code', UPDATES: 'Updates',
  SPAM: 'Spam', LEARNING: 'Learning', SUPPORT: 'Support', PERSONAL: 'Personal', REVIEW: 'Needs Review',
};

export const categories = Object.keys(categoryLabels);

const rules = [
  ['VERIFY_CODE', 1.05, ['verification code', 'login code', 'one-time password', 'otp', 'confirm your email', 'password reset code']],
  ['SECURITY', 1.02, ['security alert', 'new sign-in', 'account recovered', 'suspicious login', 'two-factor', 'account locked']],
  ['RECEIPTS', .94, ['receipt', 'order confirmation', 'payment received', 'subscription renewed', 'tax invoice']],
  ['FINANCE', .92, ['bank', 'invoice', 'payment due', 'upi', 'credit card', 'debit', 'refund', 'transaction']],
  ['TRAVEL', .9, ['flight', 'hotel', 'booking', 'boarding pass', 'itinerary', 'pnr', 'airport']],
  ['SHOPPING', .88, ['shipped', 'delivered', 'your order', 'return window', 'amazon', 'flipkart', 'shopping cart']],
  ['SPAM', 1, ['claim your prize', "you\'ve won", 'lottery winner', 'risk-free', 'urgent action required', 'processing fee']],
  ['SUPPORT', .94, ['support ticket', 'case number', 'help center', 'case resolved']],
  ['WORK', .86, ['meeting', 'proposal', 'contract', 'jira', 'github', 'slack', 'deadline', 'project update']],
  ['LEARNING', .84, ['course', 'lesson', 'students', 'hackerrank', 'udemy', 'coursera', 'assignment']],
  ['SOCIAL_MEDIA', .86, ['liked your', 'commented on', 'new follower', 'connection request', 'tagged you', 'mentioned you']],
  ['FORUM', .84, ['forum', 'community', 'discussion', 'thread', 'replied to your post', 'stackoverflow', 'reddit']],
  ['NEWSLETTERS', .8, ['newsletter', 'weekly digest', 'roundup', 'read more', 'substack']],
  ['PROMOTIONS', .84, ['sale', 'discount', 'coupon', 'limited time', 'unsubscribe', 'shop now', 'exclusive offer', 'cashback']],
  ['UPDATES', .82, ['policy update', 'terms of service', 'maintenance', 'system update', 'important information', 'final reminder']],
  ['SOCIAL', .76, ['invited you', 'event invitation', 'birthday', 'get together']],
];

function ruleClassification(email) {
  const text = [email.fromEmail, email.subject, email.body].filter(Boolean).join(' ').toLowerCase();
  const matches = rules.map(([category, weight, terms]) => {
    const found = terms.filter(term => text.includes(term));
    return { category, found, score: found.length * weight };
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
