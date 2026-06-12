import {
  sources,
  transcriptSegments,
  knowledgeCards,
  roadmapLessons,
  recipes,
  glossary,
  reaperPracticeTasks,
  learningPathUnits,
  principleDiagrams,
  interactiveLabs,
  microLearningTracks,
  microLessons,
  soundChallenges,
  materialLabs,
  techniqueTips,
  deepDiveModules,
  externalIntegrations,
  soundLabFamilies,
} from './content.js';
import {
  applyLabMacro,
  applyLabPreset,
  buildDefaultLabState,
  buildLabVisualModel,
  updateAdsrStateFromDrag,
  updateLabControl,
} from './lab-engine.js';
import {
  applyMaterialPreset,
  buildChallengeAudioPatch,
  buildDefaultMaterialState,
  buildMaterialAudioPatch,
  buildMaterialVisualModel,
  scoreChallengeAnswer,
  updateMaterialControl,
} from './challenge-model.js';
import { BASIC_WAVEFORMS, buildLabAudioPatch } from './audio-model.js';
import {
  SOUND_LAB_MACROS,
  buildSoundLabPatch,
  buildSoundLabViewModel,
  getSoundLabFamily,
} from './sound-lab-model.js';
import { createLabAudioPlayer } from './audio-player.js';
import { collectTags, filterItems, normalizeText } from './search.js';
import { buildDashboardStats, getNextLesson, groupByStage } from './view-model.js';
import {
  renderKnowledgeCard,
  renderLearningUnitCard,
  renderMaterialLab,
  renderMicroLessonCard,
  renderMicroTrackPanel,
  renderPrincipleDiagram,
  renderInteractiveLab,
  renderRecipeCard,
  renderSoundChallenge,
  renderSoundLabWorkbench,
  renderSourceCard,
  renderTechniqueTipCard,
  renderDeepDiveModuleCard,
} from './render.js';

const STORAGE_KEY = 'synthSfxLearningTool:userSources';

const app = document.querySelector('#app');
const queryInput = document.querySelector('#query');
const synthFilter = document.querySelector('#synth-filter');
const difficultyFilter = document.querySelector('#difficulty-filter');
const tagFilter = document.querySelector('#tag-filter');
const tabs = [...document.querySelectorAll('.tab')];
const audioPlayer = createLabAudioPlayer();

const state = {
  view: 'dashboard',
  query: '',
  synth: 'all',
  difficulty: 'all',
  tag: 'all',
  activeLabId: interactiveLabs[0]?.id,
  labStates: Object.fromEntries(interactiveLabs.map((lab) => [lab.id, buildDefaultLabState(lab)])),
  activeMicroTrackId: microLearningTracks[0]?.id,
  activeChallengeId: soundChallenges[0]?.id,
  challengeAnswers: {},
  activeMaterialId: materialLabs[0]?.id,
  activeDeepDiveId: deepDiveModules[0]?.id,
  activeSoundFamilyId: soundLabFamilies[0]?.id,
  soundLabMacros: { ...SOUND_LAB_MACROS },
  materialStates: Object.fromEntries(materialLabs.map((material) => [material.id, buildDefaultMaterialState(material)])),
  activeWaveform: BASIC_WAVEFORMS[0].id,
  isAuditioning: false,
  isPatchPlaying: false,
  isSoundLabPlaying: false,
  soundLabWorkletReady: false,
  audioError: '',
  draggingAdsrHandle: null,
  integrationStatus: 'idle',
  integrationMessage: '',
  midiDevices: [],
  lastMidiMessage: '',
};

let patchPlayingTimer = null;
let rangeRenderTimer = null;
let rangeChromeFrame = 0;
let activeRangeInput = null;
let midiAccess = null;
const pendingRangeInputs = new Set();

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadUserSources() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveUserSources(userSources) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userSources));
}

let userSources = loadUserSources();

function sourceIdFromTitle(title) {
  const base = normalizeText(title)
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `user-${base || Date.now()}`;
}

function currentFilters() {
  return {
    query: state.query,
    synth: state.synth,
    difficulty: state.difficulty,
    tags: state.tag === 'all' ? [] : [state.tag],
  };
}

function header(title, description, countText = '') {
  return `
    <header class="view-header">
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      ${countText ? `<p class="muted">${escapeHtml(countText)}</p>` : ''}
    </header>
  `;
}

function renderDashboard() {
  const allSources = [...userSources, ...sources];
  const stats = buildDashboardStats({ sources: allSources, knowledgeCards, roadmapLessons, recipes });
  const completed = new Set(JSON.parse(localStorage.getItem('synthSfxLearningTool:completedLessons') ?? '[]'));
  const nextLesson = getNextLesson(roadmapLessons, completed);
  const flowNodes = [
    {
      index: '01',
      title: '资料校准',
      description: '从英文 YouTube、官方文档和论文建立可追溯证据。',
      view: 'sources',
    },
    {
      index: '02',
      title: '微课拆解',
      description: '把零基础概念拆成一天一练的小步骤。',
      view: 'micro',
    },
    {
      index: '03',
      title: '实时试听',
      description: '拖 ADSR、滤波、FM 和分层参数，直接听变化。',
      view: 'interactive',
    },
    {
      index: '04',
      title: '技巧转译',
      description: '把教程经验变成 Serum、Phase Plant、Vital 操作。',
      view: 'techniques',
    },
    {
      index: '05',
      title: '深度解析',
      description: '用 transient / body / tail 与频谱逻辑拆复杂声音。',
      view: 'deep',
    },
    {
      index: '06',
      title: 'REAPER 交付',
      description: '落到轨道、渲染、A/B 检查和可复用模板。',
      view: 'practice',
    },
  ];

  return `
    ${header('学习总览', '从英文资料进入中文知识卡片，再落到 Serum、Phase Plant、Vital 和 REAPER 练习。')}
    <section class="dashboard-hero" aria-label="今日练习控制台">
      <div class="hero-copy">
        <div class="card-kicker">今日练习控制台</div>
        <h3>把“听得懂教程”推进到“能交付音效”</h3>
        <p>先选一个目标声音，再用可听、可看、可验证的步骤练习。这里把资料证据、实时合成实验、深度解析和 REAPER 交付放在同一条信号链里。</p>
        <div class="hero-status-strip" aria-label="当前学习状态">
          <span class="status-chip">Serum / Phase Plant / Vital</span>
          <span class="status-chip">四基础波形</span>
          <span class="status-chip">WebAudio 实时试听</span>
        </div>
        <div class="dashboard-actions">
          <button class="primary-button" type="button" data-dashboard-view="soundlab">打开 Sound Lab</button>
          <button class="primary-button" type="button" data-dashboard-view="interactive">开始互动实验</button>
          <button class="secondary-button" type="button" data-dashboard-view="deep">进入深度解析</button>
          <button class="secondary-button" type="button" data-dashboard-view="challenges">做声音挑战</button>
        </div>
      </div>
      <aside class="quality-panel" aria-label="质量守门">
        <div class="card-kicker">质量守门</div>
        <h3>每个知识点都要能听、能解释、能复现</h3>
        <div class="quality-meter" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="metric-row">
          <span>证据来源</span>
          <strong>${stats.sources}</strong>
          <p>官方、论文、教程和手动来源分层标记可信度。</p>
        </div>
        <div class="metric-row">
          <span>可练项目</span>
          <strong>${interactiveLabs.length + soundChallenges.length + materialLabs.length}</strong>
          <p>包含波形、ADSR、FM 金属、材质、A/B 听辨和反推。</p>
        </div>
        <div class="metric-row">
          <span>交付检查</span>
          <strong>${recipes.length}</strong>
          <p>每个配方都有 REAPER 步骤和验收听感。</p>
        </div>
      </aside>
    </section>
    <section class="learning-flow" aria-label="学习动线">
      <div class="flow-header">
        <div>
          <div class="card-kicker">学习动线</div>
          <h3>从资料到声音交付的完整信号路径</h3>
        </div>
        <p>点击任意节点直接进入对应模块，适合按项目目标来练，而不是被课程列表牵着走。</p>
      </div>
      <div class="flow-nodes">
        ${flowNodes.map((node) => `
          <button class="signal-node" type="button" data-dashboard-view="${escapeHtml(node.view)}">
            <span class="node-index">${escapeHtml(node.index)}</span>
            <strong>${escapeHtml(node.title)}</strong>
            <p>${escapeHtml(node.description)}</p>
          </button>
        `).join('')}
      </div>
    </section>
    <section class="grid dashboard-grid">
      <article class="card stat-card"><span class="card-kicker">资料来源</span><strong>${stats.sources}</strong><p>包含官方、论文、YouTube 搜索种子和你手动添加的来源。</p></article>
      <article class="card stat-card"><span class="card-kicker">知识卡片</span><strong>${stats.cards}</strong><p>每张卡片都保留来源、时间戳或证据说明。</p></article>
      <article class="card stat-card"><span class="card-kicker">练习配方</span><strong>${stats.recipes}</strong><p>覆盖基础 UI、whoosh、FM 金属、机械、电流和循环环境。</p></article>
      <article class="card stat-card"><span class="card-kicker">详细单元</span><strong>${learningPathUnits.length}</strong><p>从零基础到创意反推，每个单元都有步骤、练习和验收。</p></article>
      <article class="card stat-card"><span class="card-kicker">微课路线</span><strong>${microLessons.length}</strong><p>拆成可一天一练的小步骤，每节都有来源、操作和声音练习。</p></article>
      <article class="card stat-card"><span class="card-kicker">声音互动</span><strong>${soundChallenges.length + materialLabs.length}</strong><p>包含听辨挑战、参数反推和材质实验，按钮可直接试听。</p></article>
      <article class="card stat-card"><span class="card-kicker">技巧库</span><strong>${techniqueTips.length}</strong><p>把混响尾巴、金属梳状延迟、并行失真、宽度管理等技巧拆成可练习链路。</p></article>
      <article class="card stat-card"><span class="card-kicker">深度解析</span><strong>${deepDiveModules.length}</strong><p>把复杂音效拆成问题、原理、信号链、参数边界、听感测试和交付。</p></article>
      <article class="card stat-card"><span class="card-kicker">原理图</span><strong>${principleDiagrams.length}</strong><p>用可维护 SVG 展示信号流、ADSR、滤波、FM 和分层。</p></article>
    </section>
    <section class="grid two dashboard-spotlight">
      <article class="card">
        <div class="card-kicker">下一课</div>
        <h3>${escapeHtml(nextLesson.titleZh)}</h3>
        <p>${escapeHtml(nextLesson.focusZh)}</p>
        <p><strong>产出：</strong>${escapeHtml(nextLesson.outputZh)}</p>
      </article>
      <article class="card notice">
        <div class="card-kicker">资料原则</div>
        <h3>YouTube 是核心案例，官方和原理资料负责校准</h3>
        <p>工具会把英文教程翻译成中文学习卡，但经验性技巧会标注可信度，避免把某个创作者的偏好当成物理规律。</p>
      </article>
    </section>
  `;
}

function renderSourcesView() {
  const allSources = [...userSources, ...sources];
  const query = normalizeText(state.query);
  const filtered = allSources.filter((source) => {
    const text = normalizeText([source.title, source.platform, source.noteZh, ...(source.tags ?? [])].join(' '));
    return !query || text.includes(query);
  });

  return `
    ${header('资料库', '手动添加英文 YouTube 链接或保留搜索种子，后续再把字幕和翻译整理成知识卡片。', `${filtered.length} 条`)}
    <form class="card source-form" id="source-form">
      <label class="field full">
        <span>YouTube 或资料链接</span>
        <input name="url" type="url" required placeholder="https://www.youtube.com/watch?v=..." />
      </label>
      <label class="field">
        <span>标题</span>
        <input name="title" required placeholder="Serum metallic FM tutorial" />
      </label>
      <label class="field">
        <span>平台</span>
        <input name="platform" value="YouTube" required />
      </label>
      <label class="field">
        <span>标签</span>
        <input name="tags" placeholder="Serum, metal, FM" />
      </label>
      <label class="field">
        <span>可信度</span>
        <select name="credibility">
          <option value="professional-tutorial">专业教程</option>
          <option value="verifiable-experience">可验证经验</option>
          <option value="inspiration">仅供灵感</option>
        </select>
      </label>
      <label class="field full">
        <span>中文备注</span>
        <textarea name="noteZh" placeholder="这条资料适合学习什么？例如：金属 FM 侧频、UI click、Phase Plant audio-rate modulation。"></textarea>
      </label>
      <button class="primary-button" type="submit">添加来源</button>
    </form>
    <section class="grid">${filtered.map(renderSourceCard).join('') || '<div class="empty-state">没有匹配的来源。</div>'}</section>
  `;
}

function renderCardsView() {
  const filtered = filterItems(knowledgeCards, currentFilters());
  return `
    ${header('知识卡片', '每张卡片都把英文资料翻成中文知识点，并保留来源证据、合成器操作和可练习目标。', `${filtered.length} 张`)}
    <section class="grid two">${filtered.map((card) => renderKnowledgeCard(card, [...userSources, ...sources])).join('') || '<div class="empty-state">没有匹配的知识卡片。</div>'}</section>
  `;
}

function renderRoadmapView() {
  const groups = groupByStage(learningPathUnits);
  let index = 0;
  return `
    ${header('学习路线', '从零基础开始，每个单元都包含概念、为什么学、学习步骤、REAPER 练习、验收标准和原理图。', `${learningPathUnits.length} 个单元`)}
    <section class="stack">
      ${groups.map((group) => `
        <div class="stack">
          <h3>${escapeHtml(group.stage)}</h3>
          ${group.items.map((unit) => renderLearningUnitCard(unit, principleDiagrams, index++)).join('')}
        </div>
      `).join('')}
    </section>
  `;
}

function renderDiagramsView() {
  return `
    ${header('原理图', '这些图是可追溯课程里的“视觉地基”：先看懂声源、时间、频谱、FM 和分层，再进入具体插件操作。', `${principleDiagrams.length} 张`)}
    <section class="grid two">${principleDiagrams.map(renderPrincipleDiagram).join('')}</section>
  `;
}

function renderInteractiveView() {
  const activeLab = interactiveLabs.find((lab) => lab.id === state.activeLabId) ?? interactiveLabs[0];
  const activeState = state.labStates[activeLab.id] ?? buildDefaultLabState(activeLab);
  const visualModel = buildLabVisualModel(activeLab, activeState);
  const linkedUnits = learningPathUnits.filter((unit) => activeLab.linkedUnitIds.includes(unit.id));

  return `
    ${header('互动课程', '参考 Ableton Learning Synths 的“拖动参数，立即看到结果”模式，但这里专门训练音效制作：ADSR、滤波、FM 金属、分层和目标反推。', `${interactiveLabs.length} 个实验`)}
    <section class="lab-course-shell">
      <div class="lab-selector" role="list" aria-label="互动实验选择">
        ${interactiveLabs.map((lab, index) => `
          <button
            class="lab-select-button ${lab.id === activeLab.id ? 'is-active' : ''}"
            type="button"
            data-lab-id="${escapeHtml(lab.id)}"
          >
            <span>${String(index + 1).padStart(2, '0')}</span>
            ${escapeHtml(lab.titleZh.split('：')[0])}
          </button>
        `).join('')}
      </div>
      ${renderInteractiveLab(activeLab, visualModel, linkedUnits, activeState, {
        waveforms: BASIC_WAVEFORMS,
        activeWaveform: state.activeWaveform,
        isAuditioning: state.isAuditioning,
      })}
    </section>
  `;
}

function getActiveSoundFamily() {
  return getSoundLabFamily(soundLabFamilies, state.activeSoundFamilyId);
}

function getSoundLabModel(overrides = {}) {
  return buildSoundLabViewModel(getActiveSoundFamily(), { ...state.soundLabMacros, ...overrides });
}

function renderSoundLabView() {
  const family = getActiveSoundFamily();
  const model = getSoundLabModel();
  return `
    ${header('Sound Lab 工作台', '把网页从“看课程”推进到“能听、能调、能 A/B、能导出记录”。AudioWorklet 可用时使用自定义 DSP；不可用时自动回退 WebAudio。', `${soundLabFamilies.length} 个声音族`)}
    <section class="sound-lab-shell">
      <div class="sound-family-rail" role="list" aria-label="声音族选择">
        ${soundLabFamilies.map((item, index) => `
          <button
            class="material-select-button ${item.id === family.id ? 'is-active' : ''}"
            type="button"
            data-sound-family-id="${escapeHtml(item.id)}"
          >
            <span>${String(index + 1).padStart(2, '0')}</span>
            ${escapeHtml(item.titleZh.split('：')[0])}
          </button>
        `).join('')}
      </div>
      ${renderSoundLabWorkbench(family, model, {
        selectedFamilyId: family.id,
        workletReady: state.soundLabWorkletReady,
        isPlaying: state.isSoundLabPlaying,
      })}
      <section class="grid two sound-lab-preset-grid">
        ${family.presets.map((preset) => `
          <button class="card sound-preset-card" type="button" data-sound-lab-preset="${escapeHtml(preset.id)}">
            <span class="card-kicker">Preset</span>
            <strong>${escapeHtml(preset.labelZh)}</strong>
            <small>${Object.entries(preset.values).map(([key, value]) => `${key} ${value}`).join(' / ')}</small>
          </button>
        `).join('')}
      </section>
    </section>
  `;
}

function renderMicroView() {
  const allSources = [...userSources, ...sources];
  const activeTrack = microLearningTracks.find((track) => track.id === state.activeMicroTrackId) ?? microLearningTracks[0];
  const lessonsForTrack = microLessons.filter((lesson) => lesson.trackId === activeTrack.id);
  const filteredLessons = filterItems(lessonsForTrack, currentFilters());

  return `
    ${header('微课路线', '把网上英文教程、官方文档和论文依据拆成 8 条学习线、80+ 个小练习。每节都落到声音、合成器和 REAPER 渲染。', `${microLessons.length} 节微课`)}
    <section class="micro-route-shell">
      <aside class="micro-track-rail" aria-label="微课学习线">
        ${microLearningTracks.map((track, index) => renderMicroTrackPanel(track, track.id === activeTrack.id, index)).join('')}
      </aside>
      <div class="micro-lesson-feed">
        <article class="card micro-track-summary">
          <div class="card-kicker">${escapeHtml(activeTrack.difficulty)} · ${escapeHtml(activeTrack.interactionType)}</div>
          <h3>${escapeHtml(activeTrack.titleZh)}</h3>
          <p>${escapeHtml(activeTrack.summaryZh)}</p>
        </article>
        ${filteredLessons.map((lesson, index) => renderMicroLessonCard(lesson, allSources, index)).join('') || '<div class="empty-state">没有匹配的微课。</div>'}
      </div>
    </section>
  `;
}

function getActiveChallenge() {
  return soundChallenges.find((item) => item.id === state.activeChallengeId) ?? soundChallenges[0];
}

function getActiveMaterial() {
  return materialLabs.find((item) => item.id === state.activeMaterialId) ?? materialLabs[0];
}

function getActiveMaterialState(material = getActiveMaterial()) {
  return state.materialStates[material.id] ?? buildDefaultMaterialState(material);
}

function renderChallengesView() {
  const activeChallenge = getActiveChallenge();
  const activeMaterial = getActiveMaterial();
  const materialState = getActiveMaterialState(activeMaterial);
  const materialVisualModel = buildMaterialVisualModel(activeMaterial, materialState);

  return `
    ${header('声音挑战', '先听，再判断；再用材质实验把金属、玻璃、电流、机械、魔法、whoosh 等声音直接捏出来。', `${soundChallenges.length} 个挑战 · ${materialLabs.length} 个材质`)}
    <section class="challenge-shell">
      <div class="challenge-selector" role="list" aria-label="声音挑战选择">
        ${soundChallenges.map((challenge, index) => `
          <button
            class="challenge-select-button ${challenge.id === activeChallenge.id ? 'is-active' : ''}"
            type="button"
            data-challenge-id="${escapeHtml(challenge.id)}"
          >
            <span>${String(index + 1).padStart(2, '0')}</span>
            ${escapeHtml(challenge.titleZh)}
          </button>
        `).join('')}
      </div>
      ${renderSoundChallenge(activeChallenge, state.challengeAnswers[activeChallenge.id])}
      <div class="material-selector" role="list" aria-label="材质实验选择">
        ${materialLabs.map((material) => `
          <button
            class="material-select-button ${material.id === activeMaterial.id ? 'is-active' : ''}"
            type="button"
            data-material-id="${escapeHtml(material.id)}"
          >
            ${escapeHtml(material.titleZh.split('：')[0])}
          </button>
        `).join('')}
      </div>
      ${renderMaterialLab(activeMaterial, materialVisualModel, materialState, { isPlaying: state.isPatchPlaying })}
    </section>
  `;
}

function renderTechniquesView() {
  const allSources = [...userSources, ...sources];
  const filtered = filterItems(techniqueTips, currentFilters());
  return `
    ${header('技巧库', '把英文教程里常见的实战招法拆成“适用场景、声音原理、处理顺序、三款合成器复刻、REAPER 练习和误区检查”。', `${filtered.length} 个技巧`)}
    <section class="grid two technique-grid">
      ${filtered.map((tip) => renderTechniqueTipCard(tip, allSources)).join('') || '<div class="empty-state">没有匹配的技巧。</div>'}
    </section>
  `;
}

function renderDeepDiveView() {
  const allSources = [...userSources, ...sources];
  const filtered = filterItems(deepDiveModules, currentFilters());
  const activeModule = filtered.find((module) => module.id === state.activeDeepDiveId) ?? filtered[0] ?? deepDiveModules[0];

  return `
    ${header('深度解析', '把复杂音效制作拆成可执行的分析问题：先看信号链和听感边界，再进入 Serum、Phase Plant、Vital 与 REAPER 交付练习。', `${filtered.length} 个模块`)}
    <section class="deep-dive-shell">
      <div class="deep-module-rail" role="list" aria-label="深度解析模块选择">
        ${filtered.map((module, index) => `
          <button
            class="deep-module-button ${module.id === activeModule.id ? 'is-active' : ''}"
            type="button"
            data-deep-id="${escapeHtml(module.id)}"
          >
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(module.titleZh)}</strong>
            <small>${escapeHtml(module.categoryZh)} · ${escapeHtml(module.difficulty)}</small>
          </button>
        `).join('') || '<div class="empty-state">没有匹配的深度解析模块。</div>'}
      </div>
      ${activeModule ? renderDeepDiveModuleCard(activeModule, allSources, { isActive: true }) : ''}
    </section>
  `;
}

function renderRecipesView() {
  const filtered = filterItems(recipes, currentFilters());
  return `
    ${header('音效配方', '先用 20 个配方建立手感：简单 UI、whoosh、laser、FM 金属、机械、电流、循环 hum。', `${filtered.length} 个`)}
    <section class="grid two">${filtered.map(renderRecipeCard).join('') || '<div class="empty-state">没有匹配的配方。</div>'}</section>
  `;
}

function renderPracticeView() {
  return `
    ${header('REAPER 练习', '把合成器学习变成可渲染、可 A/B、可复盘的音效训练。')}
    <section class="grid two">
      ${reaperPracticeTasks.map((task) => `
        <article class="card">
          <div class="card-kicker">Practice</div>
          <h3>${escapeHtml(task.titleZh)}</h3>
          <ol>${task.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
          <p><strong>检查：</strong>${escapeHtml(task.checkZh)}</p>
        </article>
      `).join('')}
    </section>
    <section class="card" style="margin-top:16px">
      <div class="card-kicker">术语表</div>
      <h3>英文教程常见词</h3>
      <div class="grid">
        ${glossary.map((item) => `
          <div>
            <strong>${escapeHtml(item.term)}</strong>
            <p>${escapeHtml(item.zh)}：${escapeHtml(item.noteZh)}</p>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="card" style="margin-top:16px">
      <div class="card-kicker">字幕样例</div>
      <h3>英文原文和中文提炼</h3>
      ${transcriptSegments.map((segment) => `
        <div class="mapping-row">
          <strong>${escapeHtml(segment.timecode)}</strong>
          <p>${escapeHtml(segment.english)}</p>
          <p>${escapeHtml(segment.chinese)}</p>
          <p class="muted">提炼：${escapeHtml(segment.extractedZh)}</p>
        </div>
      `).join('')}
    </section>
  `;
}

function buildPatchExport() {
  const lab = getActiveLab();
  const labState = getActiveLabState(lab);
  const material = getActiveMaterial();
  const materialState = getActiveMaterialState(material);

  return {
    version: '0.2.0',
    app: 'synth-sfx-learning-tool',
    activeLab: {
      id: lab.id,
      titleZh: lab.titleZh,
      waveform: state.activeWaveform,
      controls: labState,
      playablePatch: buildLabAudioPatch(lab, labState, state.activeWaveform),
    },
    activeMaterial: {
      id: material.id,
      titleZh: material.titleZh,
      controls: materialState,
      playablePatch: buildMaterialAudioPatch(material, materialState),
    },
    practiceNotes: [
      '在 REAPER 中先导 dry/full 两版，再做响度匹配 A/B。',
      '在 Serum / Phase Plant / Vital 里复刻时先匹配 transient、body、tail，再追细节。',
      '网页导出的 patch 是教学参数记录，不是 VST preset 文件。',
    ],
  };
}

function buildPatchExportJson() {
  return JSON.stringify(buildPatchExport(), null, 2);
}

function buildReaperExportText() {
  const patch = buildPatchExport();
  return [
    `Synth SFX Practice: ${patch.activeLab.titleZh}`,
    `Waveform: ${patch.activeLab.waveform}`,
    `Lab controls: ${JSON.stringify(patch.activeLab.controls)}`,
    `Material: ${patch.activeMaterial.titleZh}`,
    `Material controls: ${JSON.stringify(patch.activeMaterial.controls)}`,
    'Render checklist: dry / full / tail-only, loudness matched, note transient-body-tail changes.',
    'Synth recreation: Serum / Phase Plant / Vital 参数先按听感轴复刻，不要逐项照抄网页数值。',
  ].join('\n');
}

async function copyText(text) {
  if (!globalThis.navigator?.clipboard?.writeText) return false;
  await globalThis.navigator.clipboard.writeText(text);
  return true;
}

function renderIntegrationCard(integration) {
  return `
    <article class="card integration-card">
      <div class="card-kicker">${escapeHtml(integration.categoryZh)} · ${escapeHtml(integration.statusZh)}</div>
      <h3>${escapeHtml(integration.titleZh)}</h3>
      <p>${escapeHtml(integration.valueZh)}</p>
      <section>
        <h4>可执行动作</h4>
        <ul>${integration.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join('')}</ul>
      </section>
      <section>
        <h4>边界</h4>
        <ul>${integration.constraintsZh.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
      <a class="source-link" href="${escapeHtml(integration.sourceUrl)}" target="_blank" rel="noreferrer">打开依据</a>
    </article>
  `;
}

function renderIntegrationsView() {
  const midiSupported = Boolean(globalThis.navigator?.requestMIDIAccess);
  const deviceText = state.midiDevices.length
    ? state.midiDevices.map((device) => `${device.name} (${device.manufacturer || 'unknown'})`).join(' / ')
    : '尚未连接 MIDI 输入设备';
  const statusText = {
    idle: '待连接',
    connected: '已连接',
    unsupported: '当前浏览器不支持',
    denied: '权限被拒绝',
    copied: '已复制',
    error: '操作失败',
  }[state.integrationStatus] ?? '待连接';

  return `
    ${header('外部集成', '把网页练习和真实控制、REAPER 复盘、后续 DSP 扩展连接起来。这里优先选择浏览器能可靠落地的能力。', `${externalIntegrations.length} 个方向`)}
    <section class="integration-console card">
      <div>
        <div class="card-kicker">控制 / 导出</div>
        <h3>把当前练习从“看网页”推进到“能复刻、能记录、能控制”</h3>
        <p>Web MIDI 用于外部控制器；Patch JSON 和 REAPER 备注用于复盘。Serum、Phase Plant、Vital 的 VST 仍在 DAW 中运行，网页负责教学、可视化和参数记录。</p>
      </div>
      <div class="integration-actions">
        <button class="primary-button" type="button" data-integration-action="midi">
          ${midiSupported ? '连接 MIDI' : 'MIDI 不可用'}
        </button>
        <button class="secondary-button" type="button" data-integration-action="copy-patch">复制 Patch JSON</button>
        <button class="secondary-button" type="button" data-integration-action="copy-reaper">复制 REAPER 备注</button>
      </div>
      <div class="integration-status-grid">
        <div>
          <span>状态</span>
          <strong>${escapeHtml(statusText)}</strong>
        </div>
        <div>
          <span>MIDI 输入</span>
          <strong>${escapeHtml(String(state.midiDevices.length))}</strong>
        </div>
        <div class="wide">
          <span>设备 / 消息</span>
          <p>${escapeHtml(state.lastMidiMessage || deviceText)}</p>
        </div>
        ${state.integrationMessage ? `<div class="wide"><span>提示</span><p>${escapeHtml(state.integrationMessage)}</p></div>` : ''}
      </div>
    </section>
    <section class="grid two integration-grid">
      ${externalIntegrations.map(renderIntegrationCard).join('')}
    </section>
  `;
}

function render() {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.view === state.view;
    tab.classList.toggle('is-active', isActive);
    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });
  const views = {
    dashboard: renderDashboard,
    sources: renderSourcesView,
    cards: renderCardsView,
    interactive: renderInteractiveView,
    soundlab: renderSoundLabView,
    micro: renderMicroView,
    challenges: renderChallengesView,
    techniques: renderTechniquesView,
    deep: renderDeepDiveView,
    roadmap: renderRoadmapView,
    diagrams: renderDiagramsView,
    recipes: renderRecipesView,
    practice: renderPracticeView,
    integrations: renderIntegrationsView,
  };
  app.innerHTML = views[state.view]();
  bindDynamicForms();
}

function switchView(nextView) {
  if (!nextView || state.view === nextView) return;
  const previousView = state.view;
  if (state.isAuditioning && nextView !== 'interactive') {
    stopAudition({ rerender: false });
  }
  if (nextView !== 'challenges') {
    state.isPatchPlaying = false;
    globalThis.clearTimeout(patchPlayingTimer);
  }
  document.dispatchEvent(new CustomEvent('synth:view-transition', {
    detail: { from: previousView, to: nextView },
  }));
  app.classList.add('is-view-switching');
  globalThis.setTimeout(() => app.classList.remove('is-view-switching'), 460);
  state.view = nextView;
  render();
  globalThis.requestAnimationFrame(() => {
    const top = Math.max(0, app.getBoundingClientRect().top + globalThis.scrollY - 12);
    globalThis.scrollTo({ top, behavior: 'auto' });
  });
}

function rangePercentFromInput(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || 0);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function updateRangeChrome(input) {
  if (!input?.isConnected) return;
  const shell = input.closest('.range-shell');
  const control = input.closest('.lab-control');
  const output = control?.querySelector('output');
  shell?.style.setProperty('--range-value', `${rangePercentFromInput(input).toFixed(2)}%`);
  if (output) output.textContent = `${input.value}${input.dataset.controlUnit ?? ''}`;
}

function scheduleRangeChromeUpdate(input) {
  pendingRangeInputs.add(input);
  if (rangeChromeFrame) return;
  rangeChromeFrame = globalThis.requestAnimationFrame(() => {
    pendingRangeInputs.forEach(updateRangeChrome);
    pendingRangeInputs.clear();
    rangeChromeFrame = 0;
  });
}

function setRangeDragging(input, isDragging) {
  const shell = input?.closest?.('.range-shell');
  if (!shell) return;
  shell.classList.toggle('is-dragging', isDragging);
}

function scheduleRangeCommitRender() {
  globalThis.clearTimeout(rangeRenderTimer);
  rangeRenderTimer = globalThis.setTimeout(() => {
    rangeRenderTimer = null;
    render();
  }, 90);
}

function finishSmoothRangeInput(input = activeRangeInput) {
  if (!input) return;
  setRangeDragging(input, false);
  activeRangeInput = null;
  globalThis.clearTimeout(rangeRenderTimer);
  rangeRenderTimer = null;
  render();
}

function bindSmoothRangeInput(input, onValue) {
  input.addEventListener('pointerdown', () => {
    activeRangeInput = input;
    setRangeDragging(input, true);
  });

  input.addEventListener('input', () => {
    scheduleRangeChromeUpdate(input);
    onValue(input);
    if (!activeRangeInput) scheduleRangeCommitRender();
  });

  input.addEventListener('change', () => {
    finishSmoothRangeInput(input);
  });

  input.addEventListener('focus', () => {
    input.closest('.range-shell')?.classList.add('is-focused');
  });

  input.addEventListener('blur', () => {
    input.closest('.range-shell')?.classList.remove('is-focused');
    if (input === activeRangeInput) finishSmoothRangeInput(input);
  });
}

function getActiveLab() {
  return interactiveLabs.find((item) => item.id === state.activeLabId) ?? interactiveLabs[0];
}

function getActiveLabState(lab = getActiveLab()) {
  return state.labStates[lab.id] ?? buildDefaultLabState(lab);
}

function updateLiveMeter(level) {
  updateSurfaceMeter('.interactive-lab-card', level);
}

function updateSurfaceMeter(selector, level) {
  const safeLevel = Math.max(0, Math.min(1, level));
  const card = document.querySelector(selector);
  if (!card) return;

  card.style.setProperty('--audio-level', safeLevel.toFixed(3));
  card.style.setProperty('--audio-glow', (0.06 + safeLevel * 0.2).toFixed(3));
  card.querySelectorAll('.live-scope span').forEach((bar, index) => {
    const offset = Math.sin(index * 0.72 + safeLevel * 4.2) * 0.22;
    bar.style.setProperty('--bar-level', Math.max(0.08, safeLevel + offset).toFixed(3));
  });
}

function refreshAuditionPatch() {
  if (!state.isAuditioning) return;
  const lab = getActiveLab();
  audioPlayer.update(lab, getActiveLabState(lab), state.activeWaveform);
}

function svgPointFromPointer(event) {
  const svg = document.querySelector('.lab-svg-adsr');
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: ((event.clientX - rect.left) / rect.width) * 412,
    y: ((event.clientY - rect.top) / rect.height) * 260,
  };
}

function updateAdsrFromPointer(event) {
  if (!state.draggingAdsrHandle) return;
  const lab = getActiveLab();
  if (lab.visualType !== 'adsr') return;
  const point = svgPointFromPointer(event);
  if (!point) return;

  state.labStates = {
    ...state.labStates,
    [lab.id]: updateAdsrStateFromDrag(lab, getActiveLabState(lab), state.draggingAdsrHandle, point.x, point.y),
  };
  refreshAuditionPatch();
  render();
}

async function startAudition() {
  const lab = getActiveLab();
  try {
    await audioPlayer.start(lab, getActiveLabState(lab), state.activeWaveform, { onLevel: updateLiveMeter });
    state.isAuditioning = true;
    state.audioError = '';
  } catch (error) {
    state.isAuditioning = false;
    state.audioError = error instanceof Error ? error.message : 'Audio could not start.';
  }
  render();
}

function stopAudition({ rerender = true } = {}) {
  audioPlayer.stop();
  state.isAuditioning = false;
  updateLiveMeter(0);
  if (rerender) render();
}

function bindDynamicForms() {
  bindDashboardControls();
  bindSourceForm();
  bindInteractiveLabControls();
  bindSoundLabControls();
  bindMicroRouteControls();
  bindChallengeControls();
  bindMaterialControls();
  bindDeepDiveControls();
  bindIntegrationControls();
}

function bindDashboardControls() {
  document.querySelectorAll('[data-dashboard-view]').forEach((button) => {
    button.addEventListener('click', () => {
      switchView(button.dataset.dashboardView);
    });
  });
}

function bindSourceForm() {
  const sourceForm = document.querySelector('#source-form');
  if (!sourceForm) return;
  sourceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(sourceForm);
    const title = String(data.get('title') ?? '').trim();
    const url = String(data.get('url') ?? '').trim();
    const platform = String(data.get('platform') ?? 'YouTube').trim();
    const tags = String(data.get('tags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const credibility = String(data.get('credibility') ?? 'professional-tutorial');
    const noteZh = String(data.get('noteZh') ?? '').trim() || '手动添加的英文资料，等待整理字幕、翻译和知识卡片。';

    userSources = [
      {
        id: sourceIdFromTitle(`${title}-${Date.now()}`),
        title,
        platform,
        type: platform.toLowerCase().includes('youtube') ? 'youtube-search' : 'community',
        credibility,
        language: 'English',
        url,
        tags,
        noteZh,
      },
      ...userSources,
    ];
    saveUserSources(userSources);
    sourceForm.reset();
    render();
  });
}

function bindInteractiveLabControls() {
  document.querySelectorAll('[data-lab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeLabId = button.dataset.labId;
      refreshAuditionPatch();
      render();
    });
  });

  document.querySelectorAll('[data-waveform]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeWaveform = button.dataset.waveform;
      refreshAuditionPatch();
      render();
    });
  });

  document.querySelectorAll('[data-audition-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.isAuditioning) {
        stopAudition();
        return;
      }
      startAudition();
    });
  });

  document.querySelectorAll('[data-adsr-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      state.draggingAdsrHandle = handle.dataset.adsrHandle;
      handle.classList.add('is-dragging');
      handle.setPointerCapture?.(event.pointerId);
      updateAdsrFromPointer(event);
    });
  });

  document.querySelectorAll('[data-lab-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      const lab = interactiveLabs.find((item) => item.id === state.activeLabId);
      if (!lab) return;
      const currentState = state.labStates[lab.id] ?? buildDefaultLabState(lab);
      state.labStates = {
        ...state.labStates,
        [lab.id]: updateLabControl(lab, currentState, rangeInput.dataset.labControl, rangeInput.value),
      };
      refreshAuditionPatch();
    });
  });

  document.querySelectorAll('[data-lab-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const lab = interactiveLabs.find((item) => item.id === state.activeLabId);
      if (!lab) return;
      state.labStates = {
        ...state.labStates,
        [lab.id]: applyLabPreset(lab, button.dataset.labPreset),
      };
      refreshAuditionPatch();
      render();
    });
  });

  document.querySelectorAll('[data-lab-macro]').forEach((button) => {
    button.addEventListener('click', () => {
      const lab = interactiveLabs.find((item) => item.id === state.activeLabId);
      if (!lab) return;
      const currentState = state.labStates[lab.id] ?? buildDefaultLabState(lab);
      state.labStates = {
        ...state.labStates,
        [lab.id]: applyLabMacro(lab, currentState, button.dataset.labMacro),
      };
      refreshAuditionPatch();
      render();
    });
  });
}

function updateSoundLabControl(controlId, value) {
  if (!(controlId in state.soundLabMacros)) return;
  state.soundLabMacros = {
    ...state.soundLabMacros,
    [controlId]: Math.max(0, Math.min(100, Number(value))),
  };
}

async function playSoundLabPatch(overrides = {}) {
  const family = getActiveSoundFamily();
  const model = getSoundLabModel(overrides);
  const patch = buildSoundLabPatch(family, model.patch.macros);
  state.isSoundLabPlaying = true;
  state.isAuditioning = false;
  render();

  try {
    const result = await audioPlayer.playSoundLabPatch(patch, {
      onLevel: (level) => updateSurfaceMeter('.sound-lab-workbench', level),
    });
    state.soundLabWorkletReady = Boolean(result?.workletReady);
    state.audioError = '';
  } catch (error) {
    state.audioError = error instanceof Error ? error.message : 'Audio could not start.';
  }

  globalThis.clearTimeout(patchPlayingTimer);
  patchPlayingTimer = globalThis.setTimeout(() => {
    state.isSoundLabPlaying = false;
    render();
  }, Math.max(520, patch.durationSeconds * 1000 + 520));
}

function bindSoundLabControls() {
  document.querySelectorAll('[data-sound-family-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSoundFamilyId = button.dataset.soundFamilyId;
      const family = getActiveSoundFamily();
      state.soundLabMacros = { ...SOUND_LAB_MACROS, ...(family.presets[0]?.values ?? {}) };
      render();
    });
  });

  document.querySelectorAll('[data-sound-lab-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      updateSoundLabControl(rangeInput.dataset.soundLabControl, rangeInput.value);
    });
  });

  document.querySelectorAll('[data-sound-lab-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const family = getActiveSoundFamily();
      const preset = family.presets.find((item) => item.id === button.dataset.soundLabPreset);
      if (!preset) return;
      state.soundLabMacros = { ...state.soundLabMacros, ...preset.values };
      render();
    });
  });

  document.querySelectorAll('[data-sound-lab-play]').forEach((button) => {
    button.addEventListener('click', () => playSoundLabPatch());
  });

  document.querySelectorAll('[data-sound-lab-ab]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.soundLabAb;
      playSoundLabPatch(mode === 'a' ? { space: 0, variation: 0 } : {});
    });
  });
}

function bindMicroRouteControls() {
  document.querySelectorAll('[data-micro-track-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeMicroTrackId = button.dataset.microTrackId;
      render();
    });
  });
}

function bindChallengeControls() {
  document.querySelectorAll('[data-challenge-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeChallengeId = button.dataset.challengeId;
      render();
    });
  });

  document.querySelectorAll('[data-challenge-play]').forEach((button) => {
    button.addEventListener('click', async () => {
      const challenge = getActiveChallenge();
      const patch = buildChallengeAudioPatch(challenge, button.dataset.challengePlay, interactiveLabs);
      state.isAuditioning = false;
      try {
        await audioPlayer.playPatch(patch, { onLevel: (level) => updateSurfaceMeter('.sound-challenge-card', level) });
        state.audioError = '';
      } catch (error) {
        state.audioError = error instanceof Error ? error.message : 'Audio could not start.';
      }
    });
  });

  document.querySelectorAll('[data-challenge-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const challenge = getActiveChallenge();
      const result = scoreChallengeAnswer(challenge, button.dataset.challengeAnswer);
      state.challengeAnswers = {
        ...state.challengeAnswers,
        [challenge.id]: {
          selectedAnswerId: button.dataset.challengeAnswer,
          result,
        },
      };
      render();
    });
  });
}

function markPatchPlaying(patch) {
  state.isPatchPlaying = true;
  globalThis.clearTimeout(patchPlayingTimer);
  patchPlayingTimer = globalThis.setTimeout(() => {
    state.isPatchPlaying = false;
    render();
  }, Math.max(480, patch.durationSeconds * 1000 + 460));
}

function bindMaterialControls() {
  document.querySelectorAll('[data-material-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeMaterialId = button.dataset.materialId;
      render();
    });
  });

  document.querySelectorAll('[data-material-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      const material = getActiveMaterial();
      const currentState = getActiveMaterialState(material);
      state.materialStates = {
        ...state.materialStates,
        [material.id]: updateMaterialControl(material, currentState, rangeInput.dataset.materialControl, rangeInput.value),
      };
    });
  });

  document.querySelectorAll('[data-material-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const material = getActiveMaterial();
      state.materialStates = {
        ...state.materialStates,
        [material.id]: applyMaterialPreset(material, button.dataset.materialPreset),
      };
      render();
    });
  });

  document.querySelectorAll('[data-material-play]').forEach((button) => {
    button.addEventListener('click', async () => {
      const material = getActiveMaterial();
      const patch = buildMaterialAudioPatch(material, getActiveMaterialState(material));
      markPatchPlaying(patch);
      render();
      try {
        await audioPlayer.playPatch(patch, { onLevel: (level) => updateSurfaceMeter('.material-lab-card', level) });
        state.audioError = '';
      } catch (error) {
        state.isPatchPlaying = false;
        state.audioError = error instanceof Error ? error.message : 'Audio could not start.';
        render();
      }
    });
  });
}

function bindDeepDiveControls() {
  document.querySelectorAll('[data-deep-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeDeepDiveId = button.dataset.deepId;
      render();
    });
  });
}

async function connectMidi() {
  if (!globalThis.navigator?.requestMIDIAccess) {
    state.integrationStatus = 'unsupported';
    state.integrationMessage = '当前浏览器没有开放 Web MIDI。建议在 Chrome 系浏览器和 localhost/https 环境中测试。';
    render();
    return;
  }

  try {
    midiAccess = await globalThis.navigator.requestMIDIAccess();
    const inputs = [...midiAccess.inputs.values()];
    state.midiDevices = inputs.map((input) => ({
      id: input.id,
      name: input.name || 'MIDI Input',
      manufacturer: input.manufacturer || '',
    }));
    state.integrationStatus = 'connected';
    state.integrationMessage = inputs.length
      ? '已连接 MIDI。移动旋钮时会在这里显示最近一条消息。'
      : 'MIDI 权限已开启，但还没有发现输入设备。';

    inputs.forEach((input) => {
      input.onmidimessage = (message) => {
        const [status, data1, data2] = [...message.data];
        state.lastMidiMessage = `status ${status}, data ${data1}, value ${data2}`;
        if (state.view === 'integrations') render();
      };
    });
  } catch {
    state.integrationStatus = 'denied';
    state.integrationMessage = '浏览器拒绝了 MIDI 权限，或当前环境不允许访问 MIDI。';
  }
  render();
}

async function bindIntegrationCopy(action) {
  const text = action === 'copy-patch' ? buildPatchExportJson() : buildReaperExportText();
  try {
    const copied = await copyText(text);
    state.integrationStatus = copied ? 'copied' : 'error';
    state.integrationMessage = copied
      ? (action === 'copy-patch' ? '已复制 Patch JSON。' : '已复制 REAPER 备注。')
      : '当前浏览器不允许剪贴板写入，可以在控制台手动复制导出文本。';
  } catch {
    state.integrationStatus = 'error';
    state.integrationMessage = '复制失败。浏览器可能要求页面处于焦点中或使用 https/localhost。';
  }
  render();
}

function bindIntegrationControls() {
  document.querySelectorAll('[data-integration-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.integrationAction;
      if (action === 'midi') {
        connectMidi();
        return;
      }
      if (action === 'copy-patch' || action === 'copy-reaper') {
        bindIntegrationCopy(action);
      }
    });
  });
}

function populateTagFilter() {
  for (const tag of collectTags([...knowledgeCards, ...recipes, ...microLessons, ...techniqueTips, ...deepDiveModules, ...soundLabFamilies])) {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.append(option);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    switchView(tab.dataset.view);
  });
});

document.addEventListener('pointermove', (event) => {
  if (!state.draggingAdsrHandle) return;
  updateAdsrFromPointer(event);
});

document.addEventListener('pointerup', () => {
  state.draggingAdsrHandle = null;
  if (activeRangeInput) finishSmoothRangeInput(activeRangeInput);
});

document.addEventListener('pointercancel', () => {
  state.draggingAdsrHandle = null;
  if (activeRangeInput) finishSmoothRangeInput(activeRangeInput);
});

queryInput.addEventListener('input', () => {
  state.query = queryInput.value;
  render();
});

synthFilter.addEventListener('change', () => {
  state.synth = synthFilter.value;
  render();
});

difficultyFilter.addEventListener('change', () => {
  state.difficulty = difficultyFilter.value;
  render();
});

tagFilter.addEventListener('change', () => {
  state.tag = tagFilter.value;
  render();
});

populateTagFilter();
render();
