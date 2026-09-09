import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tokenizeEmailText } from '../src/mail/ml-classifier.js';

const datasetPath = process.argv[2];
const outputPath = process.argv[3] || path.join(process.cwd(), 'models', 'email-classifier.json');

if (!datasetPath) {
  console.error('Usage: node scripts/train-classifier.js /path/to/train.json [output-path]');
  process.exit(1);
}

const rows = JSON.parse(await readFile(datasetPath, 'utf8'));
if (!Array.isArray(rows)) throw new Error('Expected train.json to contain an array of labeled emails.');

const labelModels = {};
const globalTokenCounts = {};
let documentCount = 0;

for (const row of rows) {
  const label = row.category;
  const text = [row.subject, row.body, row.text].filter(Boolean).join(' ');
  const tokens = tokenizeEmailText(text);
  if (!label || !tokens.length) continue;
  documentCount += 1;
  labelModels[label] ||= { documentCount: 0, totalTokens: 0, tokenCounts: {} };
  labelModels[label].documentCount += 1;
  for (const token of tokens) {
    labelModels[label].tokenCounts[token] = (labelModels[label].tokenCounts[token] || 0) + 1;
    labelModels[label].totalTokens += 1;
    globalTokenCounts[token] = (globalTokenCounts[token] || 0) + 1;
  }
}

const maxVocabulary = Number(process.env.MODEL_MAX_VOCABULARY || 8000);
const vocabularyEntries = Object.entries(globalTokenCounts).filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]).slice(0, maxVocabulary);
const vocabulary = Object.fromEntries(vocabularyEntries.map(([token]) => [token, true]));

for (const labelModel of Object.values(labelModels)) {
  labelModel.tokenCounts = Object.fromEntries(Object.entries(labelModel.tokenCounts).filter(([token]) => vocabulary[token]));
  labelModel.totalTokens = Object.values(labelModel.tokenCounts).reduce((sum, count) => sum + count, 0);
}

const model = {
  type: 'multinomial-naive-bayes',
  trainedAt: new Date().toISOString(),
  source: path.basename(datasetPath),
  documentCount,
  labels: Object.keys(labelModels).sort(),
  vocabularySize: Object.keys(vocabulary).length,
  vocabulary,
  labelModels,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(model, null, 2));
console.log(JSON.stringify({ outputPath, documentCount, labels: model.labels, vocabularySize: model.vocabularySize }, null, 2));
