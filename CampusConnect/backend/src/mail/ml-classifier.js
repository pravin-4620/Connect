import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const modelPath = fileURLToPath(new URL('../../models/email-classifier.json', import.meta.url));
const labels = { forum: 'FORUM', promotions: 'PROMOTIONS', social_media: 'SOCIAL_MEDIA', spam: 'SPAM', updates: 'UPDATES', verify_code: 'VERIFY_CODE' };
const stopWords = new Set(['the','and','for','you','your','with','this','that','from','have','are','was','were','will','our','can','all','has','not','but','get','into','click','here','http','https','www','com']);
let modelPromise;

export function tokenizeEmailText(value) {
  return String(value || '').toLowerCase().replace(/https?:\/\/\S+/g, ' urltoken ').replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g, ' emailtoken ').replace(/\b\d{4,8}\b/g, ' codetoken ').match(/[a-z][a-z0-9_]{2,}/g)?.filter(token => !stopWords.has(token) && token.length <= 32) || [];
}

const loadModel = () => modelPromise ||= readFile(modelPath, 'utf8').then(JSON.parse);

export async function classifyWithModel(email) {
  const model = await loadModel();
  const tokens = tokenizeEmailText([email.fromEmail, email.subject, email.body].filter(Boolean).join(' '));
  if (!tokens.length) return null;
  const vocabularySize = model.vocabularySize || 1;
  const scores = model.labels.map(label => {
    const data = model.labelModels[label];
    let score = Math.log((data.documentCount + 1) / (model.documentCount + model.labels.length));
    for (const token of tokens) if (model.vocabulary[token]) score += Math.log(((data.tokenCounts[token] || 0) + 1) / (data.totalTokens + vocabularySize));
    return { label, score };
  }).sort((a, b) => b.score - a.score);
  const margin = scores[0].score - (scores[1]?.score || scores[0].score);
  return { category: labels[scores[0].label], confidence: Math.max(.5, Math.min(.99, 1 / (1 + Math.exp(-margin / 4)))), reason: `Local ML model matched ${scores[0].label.replace('_', ' ')}` };
}
