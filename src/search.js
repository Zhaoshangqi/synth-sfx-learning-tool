export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function collectTags(items) {
  const tags = new Set();
  for (const item of items) {
    for (const tag of [...(item.tags ?? []), ...(item.methodTags ?? [])]) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function itemText(item) {
  const synthText = Object.entries(item.synthMappings ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key} ${Array.isArray(value) ? value.join(' ') : value}`)
    .join(' ');

  return normalizeText([
    item.titleZh,
    item.titleEn,
    item.goalZh,
    item.principleZh,
    item.evidence?.summaryZh,
    ...(item.tags ?? []),
    ...(item.methodTags ?? []),
    synthText,
  ].filter(Boolean).join(' '));
}

function hasSynth(item, synth) {
  if (synth === 'all') return true;
  const key = { Serum: 'serum', 'Phase Plant': 'phasePlant', Vital: 'vital' }[synth];
  return Boolean(key && item.synthMappings?.[key]);
}

export function filterItems(items, filters) {
  const query = normalizeText(filters.query);
  const tags = filters.tags ?? [];
  const difficulty = filters.difficulty ?? 'all';
  const synth = filters.synth ?? 'all';

  return items.filter((item) => {
    const text = itemText(item);
    const itemTags = [...(item.tags ?? []), ...(item.methodTags ?? [])];
    const matchesQuery = !query || text.includes(query);
    const matchesTags = tags.length === 0 || tags.every((tag) => itemTags.includes(tag));
    const matchesDifficulty = difficulty === 'all' || item.difficulty === difficulty;
    return matchesQuery && matchesTags && matchesDifficulty && hasSynth(item, synth);
  });
}
