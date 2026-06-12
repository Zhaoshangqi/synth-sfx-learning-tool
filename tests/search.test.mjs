import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeCards, recipes } from '../src/content.js';
import { normalizeText, collectTags, filterItems } from '../src/search.js';

test('normalizeText handles case, spacing, and Chinese text safely', () => {
  assert.equal(normalizeText('  Serum  FM 金属  '), 'serum fm 金属');
  assert.equal(normalizeText(undefined), '');
});

test('collectTags returns sorted unique tags from cards and recipes', () => {
  const tags = collectTags([...knowledgeCards, ...recipes]);
  assert.ok(tags.includes('metal'));
  assert.ok(tags.includes('Serum'));
  assert.deepEqual(tags, [...tags].sort((a, b) => a.localeCompare(b)));
});

test('filterItems matches query against Chinese title, English title, tags, and synth mappings', () => {
  const metal = filterItems(knowledgeCards, { query: '金属', tags: [], difficulty: 'all', synth: 'all' });
  assert.ok(metal.some((item) => item.id.includes('metal')));

  const serum = filterItems(knowledgeCards, { query: 'warp', tags: [], difficulty: 'all', synth: 'Serum' });
  assert.ok(serum.every((item) => item.synthMappings.serum));
});

test('filterItems combines tag, difficulty, and synth filters', () => {
  const result = filterItems(recipes, {
    query: '',
    tags: ['FM'],
    difficulty: 'intermediate',
    synth: 'Phase Plant',
  });
  assert.ok(result.length >= 1);
  assert.ok(result.every((item) => item.difficulty === 'intermediate'));
  assert.ok(result.every((item) => item.methodTags.includes('FM') || item.tags?.includes('FM')));
  assert.ok(result.every((item) => item.synthMappings.phasePlant));
});
