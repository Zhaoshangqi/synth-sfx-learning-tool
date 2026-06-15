import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SEARCH_QUERIES,
  buildChineseLearningNote,
  classifyVideo,
  mergeVideoFeed,
  normalizeVideoItem,
  scoreVideoCandidate,
  serializeFeedModule,
} from '../scripts/update-video-feed.mjs';
import { dailyVideoFeed } from '../src/daily-video-feed.js';

test('daily video updater classifies synth SFX tutorials into practical Chinese study metadata', () => {
  const item = normalizeVideoItem({
    id: 'metal-001',
    title: 'How to Make Metallic UI Hits in Serum with FM and Comb Filters',
    webpage_url: 'https://www.youtube.com/watch?v=metal001',
    uploader: 'Creator Lab',
    duration: 505,
    upload_date: '20260614',
  }, 'youtube', {
    query: 'Serum metallic sound design FM comb filter tutorial',
    now: '2026-06-15T00:00:00.000Z',
  });

  assert.equal(item.platform, 'YouTube');
  assert.equal(item.creator, 'Creator Lab');
  assert.equal(item.durationLabel, '8:25');
  assert.ok(item.tags.includes('Serum'));
  assert.ok(item.tags.includes('metal'));
  assert.ok(item.tags.includes('FM'));
  assert.ok(item.tags.includes('comb filter'));
  assert.equal(item.difficulty, 'intermediate');
  assert.equal(item.statusZh, '待整理');
  assert.match(item.learningNoteZh, /金属|FM|梳状/);
  assert.match(item.practicePromptZh, /Serum|Phase Plant|Vital|REAPER/);
  assert.equal(item.sync.query, 'Serum metallic sound design FM comb filter tutorial');
});

test('daily video updater scores relevant sound-design tutorials above noisy results', () => {
  const focused = scoreVideoCandidate({
    title: 'Phase Plant Game Audio SFX Tutorial - Whoosh and Laser Sound Design',
    tags: ['Phase Plant', 'whoosh', 'laser', 'SFX'],
  });
  const unrelated = scoreVideoCandidate({
    title: 'Full song mix and visualizer',
    tags: ['music'],
  });

  assert.ok(focused > unrelated);
  assert.ok(classifyVideo('Vital beginner sound design tutorial').tags.includes('Vital'));
  assert.match(buildChineseLearningNote({ tags: ['whoosh', 'filter', 'noise'], title: 'whoosh' }), /扫频|噪声|运动/);
});

test('daily video merge dedupes repeated URLs, refreshes last seen time, and caps archive size', () => {
  const existing = [
    normalizeVideoItem({
      id: 'old',
      title: 'Serum Metallic Hit Tutorial',
      webpage_url: 'https://www.youtube.com/watch?v=metal001',
      uploader: 'Old Name',
      upload_date: '20260612',
    }, 'youtube', { query: 'Serum metal', now: '2026-06-12T00:00:00.000Z' }),
    ...Array.from({ length: 6 }, (_, index) => normalizeVideoItem({
      id: `extra-${index}`,
      title: `Vital SFX Tutorial ${index}`,
      webpage_url: `https://www.youtube.com/watch?v=vital${index}`,
      uploader: 'Archive',
      upload_date: `2026060${index + 1}`,
    }, 'youtube', { query: 'Vital SFX', now: '2026-06-13T00:00:00.000Z' })),
  ];
  const incoming = [
    normalizeVideoItem({
      id: 'new-name',
      title: 'How to Make Metallic UI Hits in Serum with FM and Comb Filters',
      webpage_url: 'https://www.youtube.com/watch?v=metal001',
      uploader: 'Creator Lab',
      upload_date: '20260614',
    }, 'youtube', { query: 'Serum metallic', now: '2026-06-15T00:00:00.000Z' }),
  ];

  const merged = mergeVideoFeed(existing, incoming, {
    now: '2026-06-15T00:00:00.000Z',
    maxItems: 4,
  });

  assert.equal(merged.length, 4);
  assert.equal(merged.filter((item) => item.url.includes('metal001')).length, 1);
  const refreshed = merged.find((item) => item.url.includes('metal001'));
  assert.equal(refreshed.creator, 'Creator Lab');
  assert.equal(refreshed.lastSeenAt, '2026-06-15T00:00:00.000Z');
  assert.ok(refreshed.sync.seenCount >= 2);
});

test('generated daily feed module exports safe static data for the browser app', () => {
  assert.ok(dailyVideoFeed.length >= 4, 'expected seed videos before the first scheduled sync');
  for (const item of dailyVideoFeed) {
    assert.match(item.id, /^daily-[a-z0-9-]+$/);
    assert.ok(['YouTube', 'Bilibili'].includes(item.platform));
    assert.ok(item.url.startsWith('https://'));
    assert.ok(item.title);
    assert.ok(item.learningNoteZh);
    assert.ok(Array.isArray(item.tags));
    assert.ok(item.tags.some((tag) => ['Serum', 'Phase Plant', 'Vital', 'SFX', 'metal', 'whoosh', 'impact'].includes(tag)));
  }

  const moduleText = serializeFeedModule(dailyVideoFeed, '2026-06-15T00:00:00.000Z');
  assert.match(moduleText, /export const dailyVideoFeed/);
  assert.match(moduleText, /DAILY_VIDEO_FEED_UPDATED_AT/);
  assert.doesNotMatch(moduleText, /<\/script>/i);
});

test('daily sync searches across target synths and major SFX families', () => {
  const queryText = SEARCH_QUERIES.map((entry) => `${entry.platform} ${entry.query}`).join(' ');
  assert.match(queryText, /Serum/);
  assert.match(queryText, /Phase Plant/);
  assert.match(queryText, /Vital/);
  assert.match(queryText, /metallic/);
  assert.match(queryText, /whoosh/);
  assert.match(queryText, /bilibili|B站|音效/i);
});
