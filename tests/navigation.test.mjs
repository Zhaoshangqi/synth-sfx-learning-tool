import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('main navigation exposes the learning and practice views', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /data-view="interactive"/);
  assert.match(html, /data-view="micro"/);
  assert.match(html, /data-view="challenges"/);
  assert.match(html, /data-view="techniques"/);
  assert.match(html, /data-view="deep"/);
  assert.match(html, /data-view="integrations"/);
});
