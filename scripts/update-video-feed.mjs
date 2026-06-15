import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = resolve(fileURLToPath(new URL('../', import.meta.url)));
const DATA_PATH = resolve(ROOT_DIR, 'data/daily-video-feed.json');
const MODULE_PATH = resolve(ROOT_DIR, 'src/daily-video-feed.js');

export const SEARCH_QUERIES = [
  {
    id: 'yt-serum-metallic',
    platform: 'youtube',
    query: 'Serum metallic sound design FM comb filter tutorial',
  },
  {
    id: 'yt-serum-ui-click',
    platform: 'youtube',
    query: 'Serum UI click game audio sound design tutorial',
  },
  {
    id: 'yt-phase-plant-sfx',
    platform: 'youtube',
    query: 'Phase Plant game audio SFX sound design tutorial',
  },
  {
    id: 'yt-phase-plant-whoosh',
    platform: 'youtube',
    query: 'Phase Plant whoosh riser synth sound design tutorial',
  },
  {
    id: 'yt-vital-beginner-sfx',
    platform: 'youtube',
    query: 'Vital synth beginner sound design tutorial SFX',
  },
  {
    id: 'yt-vital-metal-friction',
    platform: 'youtube',
    query: 'Vital metallic friction sound design tutorial',
  },
  {
    id: 'yt-sfx-resampling',
    platform: 'youtube',
    query: 'synth sound design resampling impact whoosh game audio tutorial',
  },
  {
    id: 'bili-serum-sfx',
    platform: 'bilibili',
    query: 'Serum 音效 合成 金属 whoosh 教程',
  },
  {
    id: 'bili-vital-sfx',
    platform: 'bilibili',
    query: 'Vital 合成器 音效 设计 教程 B站',
  },
];

const PLATFORM_LABEL = {
  youtube: 'YouTube',
  bilibili: 'Bilibili',
};

const CLASSIFIER_RULES = [
  { tag: 'Serum', pattern: /\bserum\b|serum\s*2/i, score: 8 },
  { tag: 'Phase Plant', pattern: /phase\s*plant|phaseplant/i, score: 8 },
  { tag: 'Vital', pattern: /\bvital\b/i, score: 8 },
  { tag: 'metal', pattern: /metal|metallic|industrial|friction|金属/i, score: 7 },
  { tag: 'whoosh', pattern: /whoosh|riser|sweep|downer|swish|过渡|扫频/i, score: 7 },
  { tag: 'impact', pattern: /impact|hit|boom|slam|braam|punch|爆炸|冲击/i, score: 6 },
  { tag: 'UI', pattern: /\bui\b|click|button|interface|点击/i, score: 5 },
  { tag: 'laser', pattern: /laser|zap|sci[-\s]?fi|科幻/i, score: 5 },
  { tag: 'robot', pattern: /robot|mechanical|machine|mech|机器人|机械/i, score: 5 },
  { tag: 'FM', pattern: /\bfm\b|frequency modulation|频率调制/i, score: 4 },
  { tag: 'comb filter', pattern: /comb|short delay|flanger|chorus|梳状/i, score: 4 },
  { tag: 'filter', pattern: /filter|滤波|low[-\s]?pass|high[-\s]?pass|band[-\s]?pass/i, score: 3 },
  { tag: 'distortion', pattern: /distort|saturat|drive|clip|失真|饱和/i, score: 3 },
  { tag: 'wavetable', pattern: /wavetable|wave table|波表/i, score: 3 },
  { tag: 'granular', pattern: /granular|grain|texture|颗粒|纹理/i, score: 3 },
  { tag: 'modulation', pattern: /modulat|lfo|envelope|macro|调制|包络/i, score: 3 },
  { tag: 'SFX', pattern: /\bsfx\b|sound design|game audio|cinematic|音效|声音设计/i, score: 4 },
];

const NEGATIVE_SCORE_RULES = [
  /full song/i,
  /visualizer/i,
  /playlist/i,
  /reaction/i,
  /cover song/i,
  /\btype beat\b/i,
];

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function stableSlug(value) {
  const text = String(value ?? '');
  const asciiSlug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  if (asciiSlug) return asciiSlug;
  return createHash('sha1').update(text).digest('hex').slice(0, 12);
}

function stableId(platform, rawId, url, title) {
  if (String(rawId ?? '').startsWith('daily-')) return String(rawId);
  const basis = rawId || canonicalVideoKey(url) || title || `${platform}-${Date.now()}`;
  return `daily-${stableSlug(`${platform}-${basis}`)}`;
}

function secondsToDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  if (!total) return '';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseDuration(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const text = String(value).trim();
  if (/^\d+$/.test(text)) return Number(text);
  const parts = text.split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function parseDateOnly(value) {
  if (!value) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  if (/^\d{10}$/.test(text)) return new Date(Number(text) * 1000).toISOString().slice(0, 10);
  const parsed = new Date(text);
  return Number.isNaN(parsed.valueOf()) ? '' : parsed.toISOString().slice(0, 10);
}

export function canonicalVideoKey(url = '') {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `youtube:${videoId}`;
    }
    if (host === 'youtu.be') return `youtube:${parsed.pathname.replace('/', '')}`;
    const biliMatch = parsed.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/);
    if (host.includes('bilibili') && biliMatch) return `bilibili:${biliMatch[1]}`;
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return String(url).trim();
  }
}

export function classifyVideo(input = '') {
  const text = typeof input === 'string'
    ? input
    : [input.title, input.query, ...(input.tags ?? [])].join(' ');
  const tags = [];
  let score = 0;
  for (const rule of CLASSIFIER_RULES) {
    if (rule.pattern.test(text)) {
      tags.push(rule.tag);
      score += rule.score;
    }
  }
  if (!tags.includes('SFX') && /sound|audio|音|synth|合成/i.test(text)) tags.push('SFX');

  const lower = text.toLowerCase();
  let difficulty = 'intermediate';
  if (/beginner|basic|starter|intro|from scratch|入门|基础/.test(lower)) difficulty = 'beginner';
  if (/advanced|resampling|complex|cinematic|professional|深度|复杂/.test(lower)) difficulty = 'advanced';
  if (/creative|experimental|signature|one note|transform/.test(lower)) difficulty = 'creative';

  return {
    tags: unique(tags.length ? tags : ['SFX']),
    difficulty,
    score,
  };
}

export function buildChineseLearningNote(item = {}) {
  const tags = new Set(item.tags ?? classifyVideo(item).tags);
  if (tags.has('metal') || tags.has('FM') || tags.has('comb filter')) {
    return '适合拆金属质感：重点观察 FM 侧频、梳状/短延迟共振、频移或 chorus 如何把泛音拉成硬质材料。';
  }
  if (tags.has('whoosh')) {
    return '适合练运动型音效：重点听噪声源、滤波扫频、音高包络和空间尾巴如何制造方向与速度。';
  }
  if (tags.has('impact')) {
    return '适合练冲击层次：把 transient、body、texture、tail 分开听，再在 REAPER 做 dry/full/tail-only 对照。';
  }
  if (tags.has('UI')) {
    return '适合练短音效：关注 attack、短 decay、亮度和尾巴长度，避免按钮声拖泥带水。';
  }
  if (tags.has('robot')) {
    return '适合练机械语言：重点拆 pitch gate、短延迟、共振峰和随机调制如何形成机器动作。';
  }
  if (tags.has('granular')) {
    return '适合练纹理设计：听颗粒密度、随机度、窗长和滤波如何从素材变成可控质感。';
  }
  return '适合加入资料库复盘：先摘出目标声音、核心合成方法、可复刻参数范围，再转成 Sound Lab 或 REAPER 练习。';
}

function buildPracticePrompt(item = {}) {
  const tags = new Set(item.tags ?? []);
  const synths = ['Serum', 'Phase Plant', 'Vital'].filter((name) => tags.has(name));
  const synthText = synths.length ? synths.join(' / ') : 'Serum / Phase Plant / Vital';
  if (tags.has('metal')) {
    return `在 ${synthText} 中先用短包络做主体，再加 FM 或 comb filter；最后到 REAPER 导出 dry/full/tail-only 做 A/B。`;
  }
  if (tags.has('whoosh')) {
    return `在 ${synthText} 中用噪声、滤波扫频和 pitch envelope 做 3 个速度版本，再用 REAPER 对齐 transient。`;
  }
  if (tags.has('impact')) {
    return `把教程拆成 transient/body/tail 三层，在 ${synthText} 里各做一层，再用 REAPER 做响度匹配。`;
  }
  return `先在 ${synthText} 里复刻 1 个核心听感轴，再把参数、听感检查和 REAPER 渲染备注写进资料卡。`;
}

export function scoreVideoCandidate(item = {}) {
  const title = String(item.title ?? '');
  const tagText = (item.tags ?? []).join(' ');
  const text = `${title} ${tagText}`;
  const classified = classifyVideo(text);
  let score = classified.score;
  if (/tutorial|how to|walkthrough|sound design|sfx|game audio|教程|制作/.test(text.toLowerCase())) score += 10;
  if (/(serum|phase plant|vital)/i.test(text)) score += 8;
  if (/(preset|patch|from scratch|step by step)/i.test(text)) score += 4;
  for (const rule of NEGATIVE_SCORE_RULES) {
    if (rule.test(text)) score -= 12;
  }
  return score;
}

export function normalizeVideoItem(raw = {}, platform = raw.platform ?? 'youtube', context = {}) {
  const platformKey = String(platform).toLowerCase();
  const platformLabel = PLATFORM_LABEL[platformKey] ?? raw.platform ?? platform;
  const title = String(raw.title ?? '').trim();
  const url = String(raw.url ?? raw.webpage_url ?? raw.original_url ?? raw.link ?? '').trim();
  if (!title || !url) return null;

  const query = raw.query ?? context.query ?? '';
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const classified = classifyVideo({ title, query, tags: rawTags });
  const durationSeconds = Number(raw.durationSeconds ?? raw.duration ?? parseDuration(raw.duration_string ?? raw.durationLabel));
  const now = context.now ?? new Date().toISOString();
  const canonicalKey = canonicalVideoKey(url);
  const inferredVideoId = canonicalKey.includes(':') ? canonicalKey.split(':').slice(1).join(':') : '';
  const rawVideoId = raw.videoId ?? raw.bvid ?? (String(raw.id ?? '').startsWith('daily-') ? '' : raw.id) ?? '';
  const item = {
    id: stableId(platformKey, raw.id ?? raw.videoId ?? raw.bvid, url, title),
    platform: platformLabel,
    videoId: String(rawVideoId).startsWith('daily-') ? inferredVideoId : (rawVideoId || inferredVideoId),
    title,
    creator: raw.creator ?? raw.channel ?? raw.uploader ?? raw.author ?? raw.owner?.name ?? 'Unknown creator',
    url,
    publishedAt: parseDateOnly(raw.publishedAt ?? raw.upload_date ?? raw.timestamp ?? raw.pubdate),
    discoveredAt: raw.discoveredAt ?? now,
    lastSeenAt: raw.lastSeenAt ?? now,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    durationLabel: raw.durationLabel ?? raw.duration_string ?? secondsToDuration(durationSeconds),
    difficulty: raw.difficulty ?? classified.difficulty,
    tags: unique([...classified.tags, ...rawTags]),
    statusZh: raw.statusZh ?? '待整理',
    translationStatusZh: raw.translationStatusZh ?? '待翻译',
    learningNoteZh: raw.learningNoteZh ?? '',
    practicePromptZh: raw.practicePromptZh ?? '',
    sync: {
      query,
      source: raw.sync?.source ?? context.source ?? context.queryId ?? 'manual-seed',
      seenCount: Number(raw.sync?.seenCount ?? 1),
    },
  };
  item.learningNoteZh ||= buildChineseLearningNote(item);
  item.practicePromptZh ||= buildPracticePrompt(item);
  item.score = scoreVideoCandidate(item);
  return item;
}

function mergeTwoItems(current, incoming, now) {
  const incomingScore = scoreVideoCandidate(incoming);
  const currentScore = scoreVideoCandidate(current);
  const preferred = incomingScore >= currentScore ? incoming : current;
  const discoveredAt = [current.discoveredAt, incoming.discoveredAt].filter(Boolean).sort()[0] ?? now;
  return {
    ...current,
    ...preferred,
    id: current.id || incoming.id,
    tags: unique([...(current.tags ?? []), ...(incoming.tags ?? [])]),
    discoveredAt,
    lastSeenAt: now,
    sync: {
      ...(current.sync ?? {}),
      ...(incoming.sync ?? {}),
      seenCount: Number(current.sync?.seenCount ?? 1) + Number(incoming.sync?.seenCount ?? 1),
    },
    score: Math.max(currentScore, incomingScore),
  };
}

function sortFeed(a, b) {
  const dateA = a.publishedAt || a.discoveredAt || '';
  const dateB = b.publishedAt || b.discoveredAt || '';
  if (dateA !== dateB) return dateA < dateB ? 1 : -1;
  return scoreVideoCandidate(b) - scoreVideoCandidate(a);
}

export function mergeVideoFeed(existing = [], incoming = [], options = {}) {
  const now = options.now ?? new Date().toISOString();
  const maxItems = Number(options.maxItems ?? 72);
  const byKey = new Map();

  for (const item of [...existing, ...incoming]) {
    if (!item) continue;
    const normalized = normalizeVideoItem(item, item.platform ?? 'youtube', {
      now,
      query: item.sync?.query,
      source: item.sync?.source,
    });
    if (!normalized) continue;
    const key = canonicalVideoKey(normalized.url) || normalized.id;
    const previous = byKey.get(key);
    byKey.set(key, previous ? mergeTwoItems(previous, normalized, now) : normalized);
  }

  return [...byKey.values()].sort(sortFeed).slice(0, maxItems);
}

function readExistingFeed() {
  if (!existsSync(DATA_PATH)) return [];
  try {
    const parsed = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : parsed.items ?? [];
  } catch (error) {
    console.warn(`Could not read ${DATA_PATH}: ${error.message}`);
    return [];
  }
}

function safeJson(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, '<\\/script');
}

export function serializeFeedModule(feed = [], updatedAt = new Date().toISOString()) {
  return `export const DAILY_VIDEO_FEED_UPDATED_AT = ${JSON.stringify(updatedAt)};\n\nexport const dailyVideoFeed = ${safeJson(feed)};\n`;
}

function writeFeed(feed, updatedAt) {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  mkdirSync(dirname(MODULE_PATH), { recursive: true });
  writeFileSync(DATA_PATH, `${safeJson({ updatedAt, items: feed })}\n`, 'utf8');
  writeFileSync(MODULE_PATH, serializeFeedModule(feed, updatedAt), 'utf8');
}

async function fetchYouTubeApi(query, limit, now, sourceId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];
  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    type: 'video',
    order: 'date',
    maxResults: String(Math.min(limit, 10)),
    q: query,
    safeSearch: 'none',
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!response.ok) throw new Error(`YouTube API ${response.status}`);
  const json = await response.json();
  return (json.items ?? []).map((entry) => normalizeVideoItem({
    id: entry.id?.videoId,
    title: entry.snippet?.title,
    url: `https://www.youtube.com/watch?v=${entry.id?.videoId}`,
    channel: entry.snippet?.channelTitle,
    publishedAt: entry.snippet?.publishedAt,
  }, 'youtube', { query, now, source: 'youtube-api', queryId: sourceId })).filter(Boolean);
}

function fetchYouTubeYtDlp(query, limit, now, sourceId) {
  const searchUrl = `ytsearchdate${limit}:${query}`;
  const result = spawnSync('yt-dlp', [
    '--dump-json',
    '--flat-playlist',
    '--no-warnings',
    '--playlist-end',
    String(limit),
    searchUrl,
  ], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
  if (result.error || result.status !== 0) {
    const reason = result.error?.message || result.stderr?.trim() || `exit ${result.status}`;
    console.warn(`yt-dlp skipped "${query}": ${reason}`);
    return [];
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        const raw = JSON.parse(line);
        return normalizeVideoItem(raw, 'youtube', { query, now, source: 'yt-dlp', queryId: sourceId });
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function fetchBilibiliSearch(query, limit, now, sourceId) {
  const url = `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(query)}&page=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 synth-sfx-learning-tool',
      Referer: 'https://www.bilibili.com/',
    },
  });
  if (!response.ok) throw new Error(`Bilibili ${response.status}`);
  const json = await response.json();
  const results = json?.data?.result ?? [];
  return results.slice(0, limit).map((entry) => normalizeVideoItem({
    id: entry.bvid,
    bvid: entry.bvid,
    title: String(entry.title ?? '').replace(/<[^>]+>/g, ''),
    url: `https://www.bilibili.com/video/${entry.bvid}`,
    author: entry.author,
    durationLabel: entry.duration,
    pubdate: entry.pubdate,
  }, 'bilibili', { query, now, source: 'bilibili-search', queryId: sourceId })).filter(Boolean);
}

async function fetchCandidates(options = {}) {
  const limit = Number(options.limit ?? 4);
  const now = options.now ?? new Date().toISOString();
  const selectedSource = options.source ?? 'all';
  const candidates = [];

  for (const entry of SEARCH_QUERIES) {
    if (selectedSource !== 'all' && selectedSource !== entry.platform) continue;
    try {
      if (entry.platform === 'youtube') {
        const apiItems = await fetchYouTubeApi(entry.query, limit, now, entry.id);
        candidates.push(...(apiItems.length ? apiItems : fetchYouTubeYtDlp(entry.query, limit, now, entry.id)));
      } else if (entry.platform === 'bilibili') {
        candidates.push(...await fetchBilibiliSearch(entry.query, limit, now, entry.id));
      }
    } catch (error) {
      console.warn(`Search skipped "${entry.id}": ${error.message}`);
    }
  }

  return candidates;
}

function parseCliArgs(argv = process.argv.slice(2)) {
  const options = {
    offline: false,
    dryRun: false,
    limit: 4,
    maxItems: 72,
    source: 'all',
  };
  for (const arg of argv) {
    if (arg === '--offline') options.offline = true;
    if (arg === '--dry-run') options.dryRun = true;
    if (arg.startsWith('--limit=')) options.limit = Number(arg.split('=')[1]);
    if (arg.startsWith('--max-items=')) options.maxItems = Number(arg.split('=')[1]);
    if (arg.startsWith('--source=')) options.source = arg.split('=')[1];
  }
  return options;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCliArgs(argv);
  const now = new Date().toISOString();
  const existing = readExistingFeed();
  const incoming = options.offline ? [] : await fetchCandidates({ ...options, now });
  const feed = mergeVideoFeed(existing, incoming, { now, maxItems: options.maxItems });
  if (!options.dryRun) writeFeed(feed, now);
  console.log(JSON.stringify({
    existing: existing.length,
    incoming: incoming.length,
    output: feed.length,
    dataPath: DATA_PATH,
    modulePath: MODULE_PATH,
  }, null, 2));
  return feed;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
