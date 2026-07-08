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
  communityTechniqueLabs,
  deepDiveModules,
  externalIntegrations,
  synthModulationGuides,
  soundLabFamilies,
} from './content.js';
import { DAILY_VIDEO_FEED_UPDATED_AT, dailyVideoFeed } from './daily-video-feed.js';
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
  SOUND_LAB_LAYER_MIX,
  SOUND_LAB_FX_ORDER,
  SOUND_LAB_MACROS,
  SOUND_LAB_PARAMETER_COACH,
  SOUND_LAB_PERFORMANCE_DEFAULTS,
  buildSoundLabViewModel,
  getSoundLabFamily,
} from './sound-lab-model.js';
import { getPresetDnaById, getPresetDnaForFamily } from './preset-library.js';
import { createLabAudioPlayer } from './audio-player.js';
import { collectTags, filterItems, normalizeText } from './search.js';
import { buildDashboardStats, buildPracticePrescription, getNextLesson, groupByStage } from './view-model.js';
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
  renderDailyVideoCard,
  renderTechniqueTipCard,
  renderCommunityTechniqueLab,
  renderDeepDiveModuleCard,
} from './render.js';

const STORAGE_KEY = 'synthSfxLearningTool:userSources';
const SOUND_LAB_LIBRARY_KEY = 'synthSfxLearningTool:soundLabLibrary';

const app = document.querySelector('#app');
const queryInput = document.querySelector('#query');
const synthFilter = document.querySelector('#synth-filter');
const difficultyFilter = document.querySelector('#difficulty-filter');
const tagFilter = document.querySelector('#tag-filter');
const tabs = [...document.querySelectorAll('.tab')];
const audioPlayer = createLabAudioPlayer();
const WORKBENCH_SYNTH_TO_COACH_SYNTH = {
  serum: 'serum',
  'phase-plant': 'phasePlant',
  vital: 'vital',
};
const WORKBENCH_ACTION_VIEW_TARGETS = {
  'open-reaper-template': 'practice',
  'open-library': 'integrations',
  'import-serum': 'integrations',
  'start-ab': 'challenges',
  'start-parameter': 'interactive',
  'start-signal': 'deep',
};
const WORKBENCH_ACTION_MESSAGES = {
  'save-patch': 'Patch JSON 已复制，下一步可粘到预设备注或版本记录。',
  'export-preset': 'REAPER Notes 已复制，按 dry / full / tail-only 导出即可。',
  'compare-view': '已切到 A/B 对照：先匹配响度，再判断质感。',
  'toggle-more': '更多工具已切换。',
  'randomize-patch': '已生成一个轻微变化版本：宏参数只做小幅偏移，方便继续 A/B。',
  'focus-source': '已聚焦声源和频谱：先确认目标声音是否成立。',
  'focus-waveform': '已聚焦波形拆解：先判断基础波形成分，再回到频谱验证。',
  'focus-controls': '已聚焦参数塑形：一次只改一个听感问题。',
  'focus-practice-loop': '已聚焦听辨闭环：先做 A/B，再只改一个参数验证。',
  'focus-coach': '已聚焦合成器教练：按 Serum / Phase Plant / Vital 路由复刻。',
  'focus-export': '已聚焦交付区：复制 Patch 并检查 REAPER 导出。',
  'open-reaper-template': '正在打开 REAPER 练习区。',
  'open-library': '正在打开外部集成与预设库。',
  'import-serum': '正在打开导入 Serum 预设入口。',
  'start-ab': '正在进入 A/B 听辨挑战。',
  'start-parameter': '正在进入参数互动实验。',
  'start-signal': '正在进入深度信号流解析。',
  'analyze-patch': '已切到频谱/调制分析视角。',
  'new-experiment': '已准备新实验：先选材质，再播放试听。',
};
let workbenchConfirmTimer = null;
const VIEW_IDS = new Set([
  'dashboard',
  'sources',
  'daily',
  'cards',
  'interactive',
  'soundlab',
  'micro',
  'challenges',
  'techniques',
  'community',
  'deep',
  'roadmap',
  'diagrams',
  'recipes',
  'practice',
  'integrations',
]);

const DASHBOARD_LEARNING_PATH = [
  {
    id: 'listen-source',
    index: '01',
    title: '先听目标声',
    level: '零基础',
    view: 'soundlab',
    familyId: 'metal-impact',
    workflowStep: 'source',
    atlasNode: 'source',
    moduleMapId: 'source',
    workbenchModule: 'generator',
    advancedModule: 'advanced',
    focusZh: '先判断 transient、body、tail 有没有分清，而不是急着加效果。',
    listenZh: '听第一个 80ms 是否有点击，主体是否有金属短共振，尾巴是否干净。',
    synthZh: 'Serum / Phase Plant / Vital 里先只开一个 osc 或 noise 源，确认基础波形和音高范围。',
    reaperZh: '在 REAPER 放一个短 MIDI note，导出 dry 版本作为后续 A/B 基准。',
    proofZh: '能说出“声音由哪三段组成”，再进入下一步。',
    soundTargetZh: '做一个 0.5 秒以内的金属 click：前 80ms 有清楚瞬态，后面只留短共振。',
    oneKnobZh: '只动 Material 或 Brightness：听金属边缘变硬时，主体有没有变薄。',
    mistakeZh: '一开始就叠 reverb、distortion 或很多层，会掩盖你真正听不懂的基础结构。',
    checkpointZh: '关掉所有效果后，dry 版本仍然像一个完整的小音效。',
    nextStepZh: '下一步进入包络塑形，把声音长度和功能感定下来。',
  },
  {
    id: 'shape-envelope',
    index: '02',
    title: '包络塑形',
    level: '基础',
    view: 'interactive',
    labId: 'adsr-envelope',
    focusZh: 'Attack/Decay/Sustain/Release 决定声音功能：click、pluck、pad、tail。',
    listenZh: '把 Attack 拉长会软，Decay 变短会脆，Release 过长会拖尾。',
    synthZh: '把同一套 ADSR 复制到 Serum Amp Env、Phase Plant output envelope、Vital Env 1。',
    reaperZh: '渲染 click / pluck / swell 三版，文件名只改包络参数，方便回听。',
    proofZh: '不用看屏幕也能听出 Attack 和 Release 的变化。',
    soundTargetZh: '把同一个声音做成 click、pluck、reverse swell 三个功能版本。',
    oneKnobZh: '只动 Decay：从 80ms 到 600ms，记录声音从“点”变成“短尾”的边界。',
    mistakeZh: '把 Sustain 当成音量用，容易让瞬态和尾巴粘成一团。',
    checkpointZh: '闭眼回听时，能立刻分辨 Attack 变慢还是 Release 变长。',
    nextStepZh: '下一步进入频谱运动，用滤波决定声音明暗和运动感。',
  },
  {
    id: 'spectrum-motion',
    index: '03',
    title: '频谱运动',
    level: '初级',
    view: 'interactive',
    labId: 'filter-spectrum',
    focusZh: '滤波不是“变暗”，而是在频谱里选择哪些部分留下来。',
    listenZh: '听 cutoff 的明暗边界、resonance 的尖峰、运动速度是否太抢。',
    synthZh: '用 filter envelope 或 LFO 推 cutoff，先小范围调制，再加 resonance。',
    reaperZh: '用频谱仪看能量是否随参数移动，不要只靠更响判断“更好”。',
    proofZh: '能解释为什么同一个 saw 经过低通会更像 whoosh/body。',
    soundTargetZh: '做一个从暗到亮的 whoosh/body 变化，保持响度基本一致。',
    oneKnobZh: '只动 Cutoff 或 Motion：听明暗边界移动，不要同时改音量。',
    mistakeZh: '把 resonance 拉太高会让声音尖，但不一定更清楚。',
    checkpointZh: '频谱上能看到能量重心移动，听感上也能说出“变亮的位置”。',
    nextStepZh: '下一步进入 FM 金属，把频谱运动推进到非谐波材质。',
  },
  {
    id: 'fm-metal',
    index: '04',
    title: 'FM 金属',
    level: '中级',
    view: 'soundlab',
    familyId: 'metal-impact',
    workflowStep: 'shape',
    atlasNode: 'modulation',
    moduleMapId: 'modulation',
    workbenchModule: 'modulation',
    advancedModule: 'mod-matrix',
    focusZh: '金属感来自非谐波侧频、短 decay 和受控共振，不是单纯 EQ 提亮。',
    listenZh: '听侧频是否变硬但不刺耳，金属短响是否清楚，body 是否还稳。',
    synthZh: 'Serum 用 FM from B / warp，Phase Plant 用 audio-rate mod，Vital 用 FM/phase 或 spectral warp。',
    reaperZh: '导出 dry 和 changed 两版，响度匹配后判断是不是“更金属”而不是“更大声”。',
    proofZh: '能指出 carrier / modulator 比例改变后哪一段听感变了。',
    soundTargetZh: '做一个短金属 hit：有非谐波边缘，但 3-8kHz 不刺。',
    oneKnobZh: '只动 FM Amount：从轻微侧频到明显金属，找到刚好成立的位置。',
    mistakeZh: 'FM 太深会变成噪声团；如果听不出主体音高，先退回一半。',
    checkpointZh: 'A/B 响度匹配后，changed 版本更有金属材质而不是单纯更亮。',
    nextStepZh: '下一步进入分层材质，把 transient、body、texture 和 tail 拆开。',
  },
  {
    id: 'layer-material',
    index: '05',
    title: '分层材质',
    level: '进阶',
    view: 'soundlab',
    familyId: 'electric-crackle',
    workflowStep: 'material',
    atlasNode: 'material',
    moduleMapId: 'material',
    workbenchModule: 'effects',
    advancedModule: 'fx-chain',
    focusZh: '一个复杂音效通常由 transient、body、texture、tail 组合，不是一层完成。',
    listenZh: '关掉每一层，确认它到底负责点击、主体、摩擦、电流还是空间尾巴。',
    synthZh: '用 noise / random / short delay 做 texture，再用 macro 控制层间比例。',
    reaperZh: '分轨渲染 dry / full / tail-only，检查每一层是否能独立说明用途。',
    proofZh: '能删除一层并准确说出声音少了什么。',
    soundTargetZh: '做一个带电或机械质感：主体可辨认，细节层只补材质。',
    oneKnobZh: '只动 Texture 或 Layer Mix：每次关一层，听它负责哪种信息。',
    mistakeZh: '层数越多越容易糊；没有角色的层应该删掉，而不是再 EQ。',
    checkpointZh: '每一层都能用一句话说明用途：点击、主体、摩擦、电流或尾巴。',
    nextStepZh: '下一步进入 A/B 交付，把声音变成可复现、可验收的版本。',
  },
  {
    id: 'ab-deliver',
    index: '06',
    title: 'A/B 交付',
    level: '交付',
    view: 'practice',
    focusZh: '交付不是“做完声音”，而是能复现、能解释、能通过响度匹配验收。',
    listenZh: '听 dry 与 full 差别、tail 是否遮挡、瞬态是否过硬、响度是否骗判断。',
    synthZh: '把最终 Patch 写成 macro 名称、核心参数和可复现步骤，而不是只存预设名。',
    reaperZh: '按 -14 LUFS 参考、峰值不超过 -1 dBTP、24bit/48kHz 或项目规格导出。',
    proofZh: '能把 Patch JSON、REAPER notes 和 A/B 文件一起交付。',
    soundTargetZh: '交付 dry、full、tail-only 三版，并能解释每版用途。',
    oneKnobZh: '只动 Output Mode 或 Comfort：响度匹配后判断质感是否真的变好。',
    mistakeZh: '用更大声冒充更好听，是交付阶段最常见的误判。',
    checkpointZh: '文件名、响度、峰值、采样率、Patch Notes 和 A/B 说明都能对上。',
    nextStepZh: '回到每日新教程，选一个真实案例重新走完整路线。',
  },
];

function getViewFromHash() {
  const rawHash = decodeURIComponent(globalThis.location?.hash?.replace(/^#/, '') ?? '').trim();
  return VIEW_IDS.has(rawHash) ? rawHash : 'dashboard';
}

const state = {
  view: getViewFromHash(),
  query: '',
  synth: 'all',
  difficulty: 'all',
  tag: 'all',
  dailyVideoFilter: 'all',
  dailyVideoActionMessage: '每天自动搜索英文 YouTube 和 B 站教程；先收集，再转成中文练习卡。',
  activeDashboardPathStep: DASHBOARD_LEARNING_PATH[0]?.id,
  activeLabId: interactiveLabs[0]?.id,
  labStates: Object.fromEntries(interactiveLabs.map((lab) => [lab.id, buildDefaultLabState(lab)])),
  activeMicroTrackId: microLearningTracks[0]?.id,
  activeChallengeId: soundChallenges[0]?.id,
  challengeAnswers: {},
  activeMaterialId: materialLabs[0]?.id,
  activeCommunityTechniqueId: communityTechniqueLabs[0]?.id,
  activeCommunitySynthRoute: 'serum',
  communityControlStates: Object.fromEntries(communityTechniqueLabs.map((lab) => [
    lab.id,
    Object.fromEntries(lab.controls.map((control) => [control.id, control.default])),
  ])),
  activeDeepDiveId: deepDiveModules[0]?.id,
  activeSoundFamilyId: soundLabFamilies[0]?.id,
  activeSoundPresetDnaId: getPresetDnaForFamily(soundLabFamilies[0]?.id)[0]?.id,
  soundLabQualityMode: 'balanced',
  soundLabOutputMode: 'comfort',
  soundLabLayerMix: { ...SOUND_LAB_LAYER_MIX },
  soundLabSampleMix: 0.58,
  soundLabEngineMode: 'hq',
  activeWorkbenchModule: 'envelope',
  activeWorkbenchSynth: 'serum',
  soundLabPerformance: { ...SOUND_LAB_PERFORMANCE_DEFAULTS },
  soundLabEnvelope: {},
  soundLabFxOrder: [...SOUND_LAB_FX_ORDER],
  soundLabModMatrix: [],
  soundLabXyPad: { x: 50, y: 50 },
  soundLabMacroMorph: 0,
  soundLabAbSlot: 'a',
  soundLabAuditionMode: 'full',
  soundLabWorkflowStep: 'source',
  activeAtlasNode: 'source',
  activeWorkbenchModuleMapId: 'source',
  soundLabAnalyzerMode: 'live',
  soundLabMoreOpen: false,
  activeAdvancedModule: 'advanced',
  activeSynthModGuideId: synthModulationGuides[0]?.id,
  activeCoachSynth: 'serum',
  workbenchActionFeedback: '先选材质或点击播放；每次只解决一个听感问题。',
  confirmedWorkbenchAction: '',
  soundLabFavorites: [],
  soundLabProjects: [],
  soundLabGitSync: {
    owner: 'Zhaoshangqi',
    repo: 'synth-sfx-learning-tool',
    branch: 'main',
    basePath: 'data/user-presets/zsq',
  },
  soundLabMidiMappings: [],
  soundLabToneReady: false,
  soundLabEngineUsed: 'worklet',
  soundLabMacros: { ...SOUND_LAB_MACROS, ...(getPresetDnaForFamily(soundLabFamilies[0]?.id)[0]?.macroHints ?? {}) },
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

const savedSoundLabLibrary = loadSoundLabLibrary();
state.soundLabFavorites = Array.isArray(savedSoundLabLibrary.favorites) ? savedSoundLabLibrary.favorites : state.soundLabFavorites;
state.soundLabProjects = Array.isArray(savedSoundLabLibrary.projects) ? savedSoundLabLibrary.projects : state.soundLabProjects;
state.soundLabGitSync = { ...state.soundLabGitSync, ...(savedSoundLabLibrary.gitSync ?? {}) };
state.soundLabMidiMappings = Array.isArray(savedSoundLabLibrary.midiMappings) ? savedSoundLabLibrary.midiMappings : state.soundLabMidiMappings;

let patchPlayingTimer = null;
let rangeChromeFrame = 0;
let soundLabPatchFrame = 0;
let quietRenderFrame = 0;
let activeRangeInput = null;
let directManipulationTimer = 0;
let midiAccess = null;
const pendingRangeInputs = new Set();
const sameViewScrollLock = { x: 0, y: 0, allowProgrammaticScroll: false };

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

function loadSoundLabLibrary() {
  try {
    return JSON.parse(localStorage.getItem(SOUND_LAB_LIBRARY_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveSoundLabLibrary() {
  localStorage.setItem(SOUND_LAB_LIBRARY_KEY, JSON.stringify({
    favorites: state.soundLabFavorites,
    projects: state.soundLabProjects,
    gitSync: state.soundLabGitSync,
    midiMappings: state.soundLabMidiMappings,
  }));
}

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

function getActiveDashboardPathStep() {
  return DASHBOARD_LEARNING_PATH.find((step) => step.id === state.activeDashboardPathStep) ?? DASHBOARD_LEARNING_PATH[0];
}

function renderDashboard() {
  const allSources = [...userSources, ...sources];
  const stats = buildDashboardStats({ sources: allSources, knowledgeCards, roadmapLessons, recipes });
  const completed = new Set(JSON.parse(localStorage.getItem('synthSfxLearningTool:completedLessons') ?? '[]'));
  const nextLesson = getNextLesson(roadmapLessons, completed);
  const activePathStep = getActiveDashboardPathStep();
  const practicePrescription = buildPracticePrescription({ activePathStep, nextLesson, stats });
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
  const moduleGroups = [
    {
      label: '主工作流',
      note: '每天最常用，先从这里进入',
      priority: 'primary',
      modules: [
        { view: 'soundlab', index: '01', title: 'Sound Lab', body: '像 Ableton 一样先听、拖、改，再把声音落到目标材质。', meta: '实时试听' },
        { view: 'daily', index: '02', title: '每日教程', body: '自动同步新教程，直接跳视频并转成中文练习提示。', meta: '外部资料' },
        { view: 'sources', index: '03', title: '资料检索', body: '按主题、合成器、可信度查证据，适合先找参考。', meta: '查询中心' },
      ],
    },
    {
      label: '学习线路',
      note: '把零基础知识拆成短任务',
      priority: 'secondary',
      modules: [
        { view: 'micro', index: '04', title: '微课路线', body: '按天推进，从波形、ADSR、滤波到 FM 和分层。', meta: '路线' },
        { view: 'interactive', index: '05', title: '互动课程', body: '每页只练一个概念，拖参数就能听到结果。', meta: '练手感' },
        { view: 'cards', index: '06', title: '知识卡片', body: '把英文资料翻成中文知识点，保留来源。', meta: '记忆' },
        { view: 'diagrams', index: '07', title: '原理图', body: '用信号图解释波形、包络、滤波、FM、分层。', meta: '理解' },
      ],
    },
    {
      label: '制作与交付',
      note: '从技巧、挑战到 REAPER 输出',
      priority: 'secondary',
      modules: [
        { view: 'challenges', index: '08', title: '声音挑战', body: 'A/B 听辨、参数反推、材质实验。', meta: '训练' },
        { view: 'techniques', index: '09', title: '技巧库', body: '金属、whoosh、空间、失真等技法拆解。', meta: '方法' },
        { view: 'community', index: '10', title: '博主技巧', body: '把 YouTube/B 站创作者技巧转成可操作步骤。', meta: '案例' },
        { view: 'deep', index: '11', title: '深度解析', body: '按 transient / body / tail 拆复杂声音。', meta: '分析' },
        { view: 'recipes', index: '12', title: '音效配方', body: '可复用制作链和验收清单。', meta: '配方' },
        { view: 'practice', index: '13', title: 'REAPER 练习', body: '渲染、响度、A/B、交付模板。', meta: '交付' },
        { view: 'integrations', index: '14', title: '外部集成', body: 'MIDI、导出命名、浏览器音质路线。', meta: '扩展' },
      ],
    },
  ];

  return `
    ${header('学习总览', '从英文资料进入中文知识卡片，再落到 Serum、Phase Plant、Vital 和 REAPER 练习。')}
    <section class="dashboard-hero" aria-label="今日练习控制台">
      <div class="hero-copy">
        <div class="card-kicker">今日练习控制台</div>
        <h3>把“听得懂教程”推进到“能交付音效”</h3>
        <p>先选一个目标声音，再用可听、可看、可验证的步骤练习。这里把资料证据、实时合成实验、深度解析和 REAPER 交付放在同一条信号链里。</p>
        <div class="dashboard-starter-strip" aria-label="新手今日路径">
          <button type="button" data-dashboard-primary-view="soundlab">
            <span>01</span>
            <strong>先听目标</strong>
            <small>打开 Sound Lab</small>
          </button>
          <button type="button" data-dashboard-primary-view="interactive">
            <span>02</span>
            <strong>拖一个参数</strong>
            <small>波形 / ADSR / FM</small>
          </button>
          <button type="button" data-dashboard-primary-view="daily">
            <span>03</span>
            <strong>看教程复刻</strong>
            <small>YouTube 转中文练习</small>
          </button>
        </div>
        <div class="hero-status-strip" aria-label="当前学习状态">
          <span class="status-chip">Serum / Phase Plant / Vital</span>
          <span class="status-chip">四基础波形</span>
          <span class="status-chip">WebAudio 实时试听</span>
        </div>
        <div class="dashboard-launchpad" aria-label="从这里开始">
          <div class="dashboard-action-label">
            <span>从这里开始</span>
            <small>先从可试听工作台或互动实验开始，再进入解析和挑战。</small>
          </div>
          <div class="dashboard-actions" aria-label="主入口">
            <button class="primary-button launchpad-button hero-capsule-cta is-primary" type="button" data-dashboard-primary-view="soundlab">
              <em>01</em>
              <span>打开 Sound Lab</span>
              <small>进入可试听工作台</small>
            </button>
            <button class="primary-button launchpad-button is-primary" type="button" data-dashboard-primary-view="interactive">
              <em>02</em>
              <span>开始互动实验</span>
              <small>先练波形 / ADSR / FM</small>
            </button>
            <button class="secondary-button launchpad-button is-secondary" type="button" data-dashboard-primary-view="deep">
              <em>03</em>
              <span>进入深度解析</span>
              <small>拆 transient / body / tail</small>
            </button>
            <button class="secondary-button launchpad-button is-secondary" type="button" data-dashboard-primary-view="challenges">
              <em>04</em>
              <span>做声音挑战</span>
              <small>A/B 听辨和参数反推</small>
            </button>
          </div>
        </div>
      </div>
      <div class="hero-sound-visual" aria-hidden="true">
        <div class="hero-reveal-layer"></div>
        <div class="hero-signal-mesh">
          <span></span><span></span><span></span><span></span>
        </div>
        <div class="hero-creator-word">Sound</div>
        <div class="hero-sonic-core">
          <span class="core-ring ring-a"></span>
          <span class="core-ring ring-b"></span>
          <span class="core-dot dot-a"></span>
          <span class="core-dot dot-b"></span>
          <div class="hero-wave-strip">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
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
    <section class="dashboard-practice-prescription" aria-label="今日练习处方" data-practice-prescription="${escapeHtml(practicePrescription.routeId)}">
      <div class="prescription-copy">
        <span class="card-kicker">${escapeHtml(practicePrescription.routeLabel)}</span>
        <h3>${escapeHtml(practicePrescription.titleZh)}</h3>
        <p>${escapeHtml(practicePrescription.subtitleZh)}</p>
      </div>
      <div class="prescription-main">
        <div class="prescription-objective">
          <span>声音目标</span>
          <strong>${escapeHtml(practicePrescription.objectiveZh)}</strong>
        </div>
        <div class="prescription-listen">
          <span>先听什么</span>
          <p>${escapeHtml(practicePrescription.listenQuestionZh)}</p>
        </div>
        <div class="prescription-one-change">
          <span>一次只改</span>
          <p>${escapeHtml(practicePrescription.oneChange.labelZh)}</p>
          <small>${escapeHtml(practicePrescription.oneChange.guardrailZh)}</small>
        </div>
      </div>
      <div class="prescription-step-grid">
        ${practicePrescription.steps.map((step) => `
          <button type="button" data-dashboard-prescription-action="${escapeHtml(step.action)}">
            <span>${escapeHtml(step.labelZh)}</span>
            <strong>${escapeHtml(step.proofZh)}</strong>
          </button>
        `).join('')}
      </div>
      <div class="prescription-verify">
        <div>
          <span>A/B</span>
          <p>${escapeHtml(practicePrescription.verification.zh)}</p>
          <small>${escapeHtml(practicePrescription.verification.methodZh)}</small>
        </div>
        <div>
          <span>REAPER</span>
          <p>${escapeHtml(practicePrescription.deliveryZh)}</p>
          <small>${escapeHtml(practicePrescription.nextZh)}</small>
        </div>
      </div>
      <div class="prescription-action-row">
        <button class="primary-button" type="button" data-dashboard-prescription-action="launch">${escapeHtml(practicePrescription.launchLabelZh)}</button>
        <button class="secondary-button" type="button" data-dashboard-prescription-action="ab">去做 A/B 验证</button>
      </div>
    </section>
    <section class="dashboard-learning-console" aria-label="从零到交付路线">
      <div class="learning-console-head">
        <div>
          <div class="card-kicker">从零到交付路线</div>
          <h3>先听，再拆，再合成，最后交付</h3>
        </div>
        <p>每一步都绑定一个真实模块：点进去会直接打开对应实验或 Sound Lab 状态，不再靠猜下一步。</p>
      </div>
      <div class="learning-path-grid" role="list">
        ${DASHBOARD_LEARNING_PATH.map((step) => `
          <button class="learning-path-step ${step.id === activePathStep.id ? 'is-active' : ''}" type="button" data-dashboard-path-step="${escapeHtml(step.id)}">
            <span>${escapeHtml(step.index)}</span>
            <strong>${escapeHtml(step.title)}</strong>
            <small>${escapeHtml(step.level)}</small>
          </button>
        `).join('')}
      </div>
      <article class="learning-path-detail">
        <div class="learning-path-detail-main">
          <span>${escapeHtml(activePathStep.level)} · Step ${escapeHtml(activePathStep.index)}</span>
          <h4>${escapeHtml(activePathStep.title)}</h4>
          <p>${escapeHtml(activePathStep.focusZh)}</p>
        </div>
        <div class="learning-path-checks">
          <div><strong>听什么</strong><p>${escapeHtml(activePathStep.listenZh)}</p></div>
          <div><strong>合成器怎么做</strong><p>${escapeHtml(activePathStep.synthZh)}</p></div>
          <div><strong>REAPER 怎么验</strong><p>${escapeHtml(activePathStep.reaperZh)}</p></div>
          <div><strong>过关标准</strong><p>${escapeHtml(activePathStep.proofZh)}</p></div>
        </div>
        <div class="learning-coach-grid" aria-label="本步教练任务">
          <div class="learning-coach-card">
            <span>声音目标</span>
            <p>${escapeHtml(activePathStep.soundTargetZh)}</p>
          </div>
          <div class="learning-coach-card">
            <span>一个旋钮</span>
            <p>${escapeHtml(activePathStep.oneKnobZh)}</p>
          </div>
          <div class="learning-coach-card">
            <span>常见误区</span>
            <p>${escapeHtml(activePathStep.mistakeZh)}</p>
          </div>
          <div class="learning-coach-card">
            <span>验收动作</span>
            <p>${escapeHtml(activePathStep.checkpointZh)}</p>
          </div>
        </div>
        <div class="learning-path-cta">
          <button class="primary-button" type="button" data-dashboard-path-launch="${escapeHtml(activePathStep.id)}">
            <span>开始这一步</span>
            <small>${escapeHtml(activePathStep.view === 'soundlab' ? '加载 Sound Lab 状态' : '进入对应练习模块')}</small>
          </button>
          <p>${escapeHtml(activePathStep.nextStepZh)}</p>
        </div>
      </article>
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
          <button class="signal-node" type="button" data-dashboard-flow-view="${escapeHtml(node.view)}">
            <span class="node-index">${escapeHtml(node.index)}</span>
            <strong>${escapeHtml(node.title)}</strong>
            <p>${escapeHtml(node.description)}</p>
          </button>
        `).join('')}
      </div>
    </section>
    <section class="dashboard-module-directory" aria-label="模块地图">
      <div class="module-section-head">
        <div>
          <div class="module-priority-badge">Module Map</div>
          <h3>主次清楚的学习工作台</h3>
        </div>
        <p>Ableton Learning Synths 的核心是“一页一个概念，一个可听控件”。这里也把入口拆成主工作流、学习线路和制作交付，避免所有模块同时抢注意力。</p>
      </div>
      ${moduleGroups.map((group) => `
        <section class="module-directory-group" data-module-priority="${escapeHtml(group.priority)}">
          <div class="module-directory-group-head">
            <strong>${escapeHtml(group.label)}</strong>
            <span>${escapeHtml(group.note)}</span>
          </div>
          <div class="module-directory-grid">
            ${group.modules.map((module) => `
              <button class="module-directory-card ${group.priority === 'primary' ? 'is-primary' : 'is-secondary'}" type="button" data-module-directory-view="${escapeHtml(module.view)}">
                <span>${escapeHtml(module.index)}</span>
                <strong>${escapeHtml(module.title)}</strong>
                <p>${escapeHtml(module.body)}</p>
                <small>${escapeHtml(module.meta)}</small>
              </button>
            `).join('')}
          </div>
        </section>
      `).join('')}
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
  const youtubeCount = allSources.filter((source) => normalizeText(source.platform).includes('youtube')).length;
  const manualCount = userSources.length;
  const evidenceCount = allSources.filter((source) => ['official', 'paper', 'professional-tutorial', 'verifiable-experience'].includes(source.credibility)).length;

  return `
    ${header('资料检索', '像 Ableton 的章节一样先聚焦一个声音问题：搜资料、看证据等级，再把来源推进到 Sound Lab 或知识卡片。', `${filtered.length} / ${allSources.length} 条`)}
    <section class="research-hub-shell">
      <aside class="research-command-panel card" aria-label="资料查询控制台">
        <div class="module-priority-badge">Research Hub</div>
        <h3>先找可验证资料，再练声音</h3>
        <p>顶部搜索会同时过滤标题、平台、备注和标签。建议先搜目标声音，例如 metal、whoosh、impact、FM，再看可信度和可练方向。</p>
        <div class="research-metrics" aria-label="资料统计">
          <div><span>全部来源</span><strong>${allSources.length}</strong></div>
          <div><span>YouTube</span><strong>${youtubeCount}</strong></div>
          <div><span>高可信</span><strong>${evidenceCount}</strong></div>
          <div><span>手动添加</span><strong>${manualCount}</strong></div>
        </div>
        <div class="research-query-hints" aria-label="推荐查询">
          ${['metal FM', 'Serum whoosh', 'Phase Plant impact', 'comb filter', 'Vital wavetable'].map((hint) => `<span>${escapeHtml(hint)}</span>`).join('')}
        </div>
      </aside>
      <div class="research-workspace">
        <div class="source-result-toolbar">
          <div>
            <div class="module-priority-badge">Results</div>
            <strong>当前结果 ${filtered.length} 条</strong>
            <p>优先打开有视频链接或明确来源的卡片，再把关键参数记录成中文练习。</p>
          </div>
          <span>${escapeHtml(state.query || '未输入关键词')}</span>
        </div>
        <section class="grid source-result-grid">${filtered.map(renderSourceCard).join('') || '<div class="empty-state">没有匹配的来源。</div>'}</section>
        <form class="card source-form source-form-compact" id="source-form">
          <div class="module-priority-badge">Add Source</div>
          <h3>补充一个教程或资料</h3>
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
      </div>
    </section>
  `;
}

const DAILY_VIDEO_FILTERS = [
  ['all', '全部'],
  ['Serum', 'Serum'],
  ['Phase Plant', 'Phase Plant'],
  ['Vital', 'Vital'],
  ['metal', '金属'],
  ['whoosh', 'Whoosh'],
  ['impact', 'Impact'],
  ['Bilibili', 'B 站'],
];

function dailyVideoMatchesLocalFilter(video, filter) {
  if (filter === 'all') return true;
  const text = normalizeText([video.platform, video.title, video.creator, ...(video.tags ?? [])].join(' '));
  return text.includes(normalizeText(filter));
}

function dailyVideoMatchesGlobalFilters(video) {
  const text = normalizeText([video.platform, video.title, video.creator, video.learningNoteZh, video.practicePromptZh, ...(video.tags ?? [])].join(' '));
  const query = normalizeText(state.query);
  const synth = normalizeText(state.synth);
  const difficulty = state.difficulty;
  const tag = normalizeText(state.tag);
  if (query && !text.includes(query)) return false;
  if (state.synth !== 'all' && !text.includes(synth)) return false;
  if (difficulty !== 'all' && video.difficulty !== difficulty) return false;
  if (state.tag !== 'all' && !text.includes(tag)) return false;
  return dailyVideoMatchesLocalFilter(video, state.dailyVideoFilter);
}

function renderDailyVideosView() {
  const filtered = dailyVideoFeed.filter(dailyVideoMatchesGlobalFilters);
  const updatedDate = DAILY_VIDEO_FEED_UPDATED_AT.slice(0, 10);
  const youtubeCount = dailyVideoFeed.filter((video) => video.platform === 'YouTube').length;
  const biliCount = dailyVideoFeed.filter((video) => video.platform === 'Bilibili').length;
  const pendingCount = dailyVideoFeed.filter((video) => video.statusZh === '待精读').length;

  return `
    ${header('每日新教程', '每天自动搜索合成器音效制作教程，先抓取 YouTube/B 站候选，再转成中文学习提炼和可实践提示。', `${filtered.length} / ${dailyVideoFeed.length} 条`)}
    <section class="daily-video-shell">
      <aside class="card daily-sync-panel">
        <div class="card-kicker">Daily Sync</div>
        <h3>自动资料入口</h3>
        <p>GitHub Actions 每天会运行搜索脚本：优先英文 YouTube，补充 B 站中文资料；去重后写入 data/daily-video-feed.json 和前端模块。</p>
        <div class="daily-sync-stats">
          <div><span>更新时间</span><strong>${escapeHtml(updatedDate)}</strong></div>
          <div><span>YouTube</span><strong>${youtubeCount}</strong></div>
          <div><span>B 站</span><strong>${biliCount}</strong></div>
          <div><span>待精读</span><strong>${pendingCount}</strong></div>
        </div>
        <div class="daily-filter-row" aria-label="每日教程筛选">
          ${DAILY_VIDEO_FILTERS.map(([id, label]) => `
            <button
              class="${state.dailyVideoFilter === id ? 'is-active' : ''}"
              type="button"
              data-daily-filter="${escapeHtml(id)}"
            >${escapeHtml(label)}</button>
          `).join('')}
        </div>
        <p class="daily-sync-message" role="status">${escapeHtml(state.dailyVideoActionMessage)}</p>
      </aside>
      <section class="daily-video-grid">
        ${filtered.map(renderDailyVideoCard).join('') || '<div class="empty-state">没有匹配的每日教程。</div>'}
      </section>
    </section>
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

function selectSoundLabFamily(familyId, shouldRender = true) {
  const family = getSoundLabFamily(soundLabFamilies, familyId);
  const presetDna = getPresetDnaForFamily(family.id)[0];
  state.activeSoundFamilyId = family.id;
  state.activeSoundPresetDnaId = presetDna?.id;
  state.soundLabMacros = { ...SOUND_LAB_MACROS, ...(family.presets[0]?.values ?? {}), ...(presetDna?.macroHints ?? {}) };
  state.soundLabOutputMode = 'comfort';
  state.soundLabPerformance = { ...SOUND_LAB_PERFORMANCE_DEFAULTS };
  state.soundLabEnvelope = {};
  state.soundLabFxOrder = [...SOUND_LAB_FX_ORDER];
  state.soundLabModMatrix = [];
  state.soundLabXyPad = { x: 50, y: 50 };
  state.soundLabMacroMorph = 0;
  state.soundLabAbSlot = 'a';
  state.soundLabAuditionMode = 'full';
  state.soundLabWorkflowStep = 'source';
  state.activeAtlasNode = 'source';
  state.activeWorkbenchModuleMapId = 'source';
  state.activeAdvancedModule = 'advanced';
  state.activeWorkbenchModule = 'generator';
  state.workbenchActionFeedback = `已切换到 ${family.titleZh.split('：')[0]}：先听 dry 主体，再进入参数塑形。`;
  syncSoundLabPatchSoon();
  if (shouldRender) renderSameView();
}

function getSoundLabOptions(optionOverrides = {}) {
  return {
    presetId: state.activeSoundPresetDnaId,
    qualityMode: state.soundLabQualityMode,
    outputMode: state.soundLabOutputMode,
    sampleMix: state.soundLabSampleMix,
    layerMix: state.soundLabLayerMix,
    engineMode: state.soundLabEngineMode,
    performance: state.soundLabPerformance,
    envelope: state.soundLabEnvelope,
    fxOrder: state.soundLabFxOrder,
    modMatrix: state.soundLabModMatrix,
    xyPad: state.soundLabXyPad,
    macroMorph: state.soundLabMacroMorph,
    abSlot: state.soundLabAbSlot,
    auditionMode: state.soundLabAuditionMode,
    activeLayerAudition: state.soundLabAuditionMode,
    favoriteIds: state.soundLabFavorites,
    projects: state.soundLabProjects,
    gitSync: state.soundLabGitSync,
    midiMappings: state.soundLabMidiMappings,
    activeWorkflowStep: state.soundLabWorkflowStep,
    activeAtlasNode: state.activeAtlasNode,
    activeModuleMapId: state.activeWorkbenchModuleMapId,
    analyzerMode: state.soundLabAnalyzerMode,
    moreOpen: state.soundLabMoreOpen,
    activeAdvancedModule: state.activeAdvancedModule,
    activeWorkbenchSynth: state.activeWorkbenchSynth,
    modulationGuides: synthModulationGuides,
    activeModulationGuideId: state.activeSynthModGuideId,
    activeCoachSynth: state.activeCoachSynth,
    workbenchActionFeedback: state.workbenchActionFeedback,
    confirmedWorkbenchAction: state.confirmedWorkbenchAction,
    ...optionOverrides,
  };
}

function getSoundLabModel(macroOverrides = {}, optionOverrides = {}) {
  return buildSoundLabViewModel(
    getActiveSoundFamily(),
    { ...state.soundLabMacros, ...macroOverrides },
    getSoundLabOptions(optionOverrides),
  );
}

function buildOutputCompareOverrides(mode = 'comfort') {
  if (mode === 'raw') {
    return {
      outputMode: 'raw',
      engineMode: 'webaudio',
      qualityMode: 'draft',
      layerMix: { ...state.soundLabLayerMix, texture: 0, tail: Math.min(state.soundLabLayerMix.tail ?? 0, 18) },
    };
  }

  if (mode === 'studio') {
    return {
      outputMode: 'studio',
      engineMode: 'hq',
      qualityMode: 'studio',
    };
  }

  return {
    outputMode: 'comfort',
    engineMode: state.soundLabEngineMode,
    qualityMode: state.soundLabQualityMode,
  };
}

function buildLayerAuditionOverrides(modeId = 'full') {
  const model = getSoundLabModel();
  const audition = model.layerAudition?.modes?.find((mode) => mode.id === modeId)
    ?? model.layerAudition?.modes?.[0]
    ?? {
      id: 'full',
      layerMix: state.soundLabLayerMix,
      playOptions: {},
    };

  return {
    ...audition.playOptions,
    layerMix: audition.layerMix,
  };
}

function playLayerAudition(modeId = 'full') {
  const model = getSoundLabModel();
  const audition = model.layerAudition?.modes?.find((mode) => mode.id === modeId)
    ?? model.layerAudition?.modes?.[0];
  if (!audition) return;

  state.soundLabAuditionMode = audition.id;
  state.soundLabWorkflowStep = 'compare';
  state.activeAtlasNode = audition.id === 'full' ? 'source' : 'material';
  state.activeWorkbenchModuleMapId = audition.id === 'full' ? 'source' : 'compare';
  state.workbenchActionFeedback = `分层试听：${audition.titleZh}。${audition.listenZh}`;
  playSoundLabPatch({}, buildLayerAuditionOverrides(audition.id));
}

function renderSoundLabView() {
  const family = getActiveSoundFamily();
  const model = getSoundLabModel();
  return `
    ${header('Sound Lab', '可试听合成器工作台：先选材质和目标声音，再用频谱、宏控制、合成器教练和 REAPER 清单完成一次音效交付。')}
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
        engineMode: state.soundLabEngineMode,
        engineUsed: state.soundLabEngineUsed,
        toneReady: state.soundLabToneReady,
        workletReady: state.soundLabWorkletReady,
        isPlaying: state.isSoundLabPlaying,
        activeWorkbenchModule: state.activeWorkbenchModule,
        activeWorkflowStep: state.soundLabWorkflowStep,
        activeAtlasNode: state.activeAtlasNode,
        activeModuleMapId: state.activeWorkbenchModuleMapId,
        activeLayerAudition: state.soundLabAuditionMode,
        analyzerMode: state.soundLabAnalyzerMode,
        moreOpen: state.soundLabMoreOpen,
        activeAdvancedModule: state.activeAdvancedModule,
        activeWorkbenchSynth: state.activeWorkbenchSynth,
        modulationGuides: synthModulationGuides,
        activeModulationGuideId: state.activeSynthModGuideId,
        activeCoachSynth: state.activeCoachSynth,
        workbenchActionFeedback: state.workbenchActionFeedback,
        confirmedWorkbenchAction: state.confirmedWorkbenchAction,
      })}
      <section class="sound-lab-secondary-section" aria-label="次级预设与变化">
        <div class="module-section-head">
          <div>
            <div class="module-priority-badge">Secondary</div>
            <h3>预设变化库</h3>
          </div>
          <p>主流程先听当前声音；需要变化时再从这里切换 preset，避免工作台首屏被辅助模块淹没。</p>
        </div>
        <div class="grid two sound-lab-preset-grid">
          ${family.presets.map((preset) => `
            <button class="card sound-preset-card" type="button" data-sound-lab-preset="${escapeHtml(preset.id)}">
              <span class="card-kicker">Preset</span>
              <strong>${escapeHtml(preset.labelZh)}</strong>
              <small>${Object.entries(preset.values).map(([key, value]) => `${key} ${value}`).join(' / ')}</small>
            </button>
          `).join('')}
        </div>
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

function getActiveCommunityTechnique(filtered = communityTechniqueLabs) {
  return filtered.find((lab) => lab.id === state.activeCommunityTechniqueId)
    ?? filtered[0]
    ?? communityTechniqueLabs[0];
}

function getCommunityControlValues(lab) {
  return state.communityControlStates[lab.id]
    ?? Object.fromEntries(lab.controls.map((control) => [control.id, control.default]));
}

function renderCommunityTechniquesView() {
  const allSources = [...userSources, ...sources];
  const filtered = filterItems(communityTechniqueLabs, currentFilters());
  const activeLab = getActiveCommunityTechnique(filtered);

  return `
    ${header('博主技巧实验室', '把 YouTube 和 B 站非官方博主的合成技巧拆成中文方法、参数边界、REAPER 练习，并可一键加载到 Sound Lab 试听。', `${filtered.length} 个技巧实验`)}
    <section class="community-lab-shell">
      <div class="community-lab-rail" role="list" aria-label="社区技巧选择">
        ${filtered.map((lab, index) => `
          <button
            class="community-lab-button ${lab.id === activeLab.id ? 'is-active' : ''}"
            type="button"
            data-community-technique="${escapeHtml(lab.id)}"
          >
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(lab.titleZh)}</strong>
            <small>${escapeHtml(lab.creatorZh)} · ${escapeHtml(lab.difficulty)}</small>
          </button>
        `).join('') || '<div class="empty-state">没有匹配的博主技巧。</div>'}
      </div>
      ${activeLab ? renderCommunityTechniqueLab(activeLab, allSources, {
        isActive: true,
        controlValues: getCommunityControlValues(activeLab),
        activeCommunitySynthRoute: state.activeCommunitySynthRoute,
      }) : ''}
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
    <section class="card practice-reference-card">
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
    <section class="card practice-reference-card">
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

function stabilizeSameViewRender() {
  if (quietRenderFrame) {
    globalThis.cancelAnimationFrame(quietRenderFrame);
    quietRenderFrame = 0;
  }

  sameViewScrollLock.x = globalThis.scrollX ?? 0;
  sameViewScrollLock.y = globalThis.scrollY ?? 0;
  const currentHeight = app.getBoundingClientRect?.().height ?? 0;
  app.classList.add('is-same-view-rendering');
  if (currentHeight > 0) app.style.minHeight = `${Math.ceil(currentHeight)}px`;
}

function restoreSameViewScroll() {
  const x = Number.isFinite(sameViewScrollLock.x) ? sameViewScrollLock.x : 0;
  const y = Number.isFinite(sameViewScrollLock.y) ? sameViewScrollLock.y : 0;
  if (Math.abs((globalThis.scrollX ?? 0) - x) < 1 && Math.abs((globalThis.scrollY ?? 0) - y) < 1) return;
  globalThis.scrollTo({ left: x, top: y, behavior: 'auto' });
}

function releaseSameViewRender() {
  restoreSameViewScroll();
  quietRenderFrame = globalThis.requestAnimationFrame(() => {
    quietRenderFrame = globalThis.requestAnimationFrame(() => {
      if (!sameViewScrollLock.allowProgrammaticScroll) restoreSameViewScroll();
      app.classList.remove('is-same-view-rendering');
      app.style.minHeight = '';
      sameViewScrollLock.allowProgrammaticScroll = false;
      quietRenderFrame = 0;
    });
  });
}

function render(options = {}) {
  const quiet = options.quiet === true;
  if (quiet) stabilizeSameViewRender();

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
    daily: renderDailyVideosView,
    cards: renderCardsView,
    interactive: renderInteractiveView,
    soundlab: renderSoundLabView,
    micro: renderMicroView,
    challenges: renderChallengesView,
    techniques: renderTechniquesView,
    community: renderCommunityTechniquesView,
    deep: renderDeepDiveView,
    roadmap: renderRoadmapView,
    diagrams: renderDiagramsView,
    recipes: renderRecipesView,
    practice: renderPracticeView,
    integrations: renderIntegrationsView,
  };
  app.innerHTML = views[state.view]();
  bindDynamicForms();
  if (quiet) releaseSameViewRender();
}

function renderSameView() {
  render({ quiet: true });
}

function switchView(nextView, options = {}) {
  if (!VIEW_IDS.has(nextView) || state.view === nextView) return;
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
  if (options.updateHash !== false) {
    const nextHash = nextView === 'dashboard' ? '' : `#${nextView}`;
    if (globalThis.location.hash !== nextHash) {
      globalThis.history.replaceState(null, '', `${globalThis.location.pathname}${globalThis.location.search}${nextHash}`);
    }
  }
  render();
  globalThis.requestAnimationFrame(() => {
    globalThis.scrollTo({ top: 0, behavior: 'auto' });
  });
}

function rangePercentFromInput(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || 0);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function steppedRangeValue(rawValue, min, max, step) {
  const stepped = Number.isFinite(step) && step > 0
    ? min + Math.round((rawValue - min) / step) * step
    : rawValue;
  return Math.max(min, Math.min(max, stepped));
}

function writeRangeValue(input, nextValue) {
  const serializedValue = Number.isInteger(nextValue) ? String(nextValue) : nextValue.toFixed(3);
  if (input.value === serializedValue) return false;
  input.value = serializedValue;
  input.style.setProperty('--range-value', `${rangePercentFromInput(input).toFixed(2)}%`);
  return true;
}

function setDirectManipulation(isActive) {
  globalThis.clearTimeout(directManipulationTimer);
  globalThis.__synthDirectManipulating = Boolean(isActive);
  if (isActive) {
    return;
  }
  directManipulationTimer = globalThis.setTimeout(() => {
    globalThis.__synthDirectManipulating = false;
  }, 80);
}

function updateVerticalRangeFromPointer(input, event) {
  if (!input?.closest('.vertical-slider')) return false;
  const rect = input.getBoundingClientRect();
  if (!rect.height) return false;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const step = Number(input.step || 1);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return false;

  const ratio = Math.max(0, Math.min(1, (rect.bottom - event.clientY) / rect.height));
  const rawValue = min + ratio * (max - min);
  return writeRangeValue(input, steppedRangeValue(rawValue, min, max, step));
}

function updateHorizontalRangeFromPointer(input, event) {
  if (input?.closest('.vertical-slider')) return false;
  const rect = input.getBoundingClientRect();
  if (!rect.width) return false;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const step = Number(input.step || 1);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return false;

  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const rawValue = min + ratio * (max - min);
  return writeRangeValue(input, steppedRangeValue(rawValue, min, max, step));
}

function updateRangeChrome(input) {
  if (!input?.isConnected) return;
  const shell = input.closest('.range-shell');
  const control = input.closest('.lab-control, .macro-knob, .mod-matrix-row, .macro-morph-card, .performance-control, .layer-control, label');
  const output = control?.querySelector('output') ?? input.closest('label')?.querySelector('output');
  const percent = `${rangePercentFromInput(input).toFixed(2)}%`;
  shell?.style.setProperty('--range-value', percent);
  if (control?.classList?.contains('macro-knob')) {
    control.style.setProperty('--knob-value', percent);
  }
  if (output) output.textContent = `${input.value}${input.dataset.controlUnit ?? ''}`;
}

function coachTopicForInput(input) {
  if (!input) return null;
  if (input.dataset.soundLabControl) {
    return {
      categoryZh: 'Macro',
      ...(SOUND_LAB_PARAMETER_COACH.macros[input.dataset.soundLabControl] ?? {}),
    };
  }
  if (input.dataset.performanceControl) {
    return {
      categoryZh: 'Performance',
      ...(SOUND_LAB_PARAMETER_COACH.performance[input.dataset.performanceControl] ?? {}),
    };
  }
  if (input.dataset.soundLabLayer) {
    return {
      categoryZh: 'Layer Mix',
      ...(SOUND_LAB_PARAMETER_COACH.layers[input.dataset.soundLabLayer] ?? {}),
    };
  }
  if (input.dataset.envelopeControl) {
    return {
      categoryZh: 'Envelope',
      ...(SOUND_LAB_PARAMETER_COACH.envelope[input.dataset.envelopeControl] ?? {}),
    };
  }
  if (input.dataset.macroMorph !== undefined) {
    return { categoryZh: 'Morph', ...SOUND_LAB_PARAMETER_COACH.special.macroMorph };
  }
  if (input.dataset.modRouteAmount) {
    return { categoryZh: 'Mod Matrix', ...SOUND_LAB_PARAMETER_COACH.special.modRoute };
  }
  return null;
}

function updateParameterCoach(topic, valueLabel = '') {
  if (!topic?.titleZh) return;
  document.querySelectorAll('[data-live-parameter-coach]').forEach((panel) => {
    panel.style.setProperty('--coach-level', `${rangePercentFromInput({ min: 0, max: 100, value: Number.parseFloat(valueLabel) || 0 }).toFixed(2)}%`);
    panel.querySelector('[data-live-coach-category]')?.replaceChildren(document.createTextNode(topic.categoryZh ?? 'Parameter'));
    panel.querySelector('[data-live-coach-title]')?.replaceChildren(document.createTextNode(topic.titleZh));
    panel.querySelector('[data-live-coach-value]')?.replaceChildren(document.createTextNode(valueLabel));
    panel.querySelector('[data-live-coach-listen]')?.replaceChildren(document.createTextNode(topic.listenZh ?? ''));
    panel.querySelector('[data-live-coach-synth]')?.replaceChildren(document.createTextNode(topic.synthZh ?? ''));
    panel.querySelector('[data-live-coach-reaper]')?.replaceChildren(document.createTextNode(topic.reaperZh ?? ''));
    panel.querySelector('[data-live-coach-target]')?.replaceChildren(document.createTextNode(topic.targetZh ?? ''));
  });
}

function applyImmediateControlFeedback(input) {
  if (!input?.isConnected) return;
  updateRangeChrome(input);
  const unit = input.dataset.controlUnit ?? '';
  const control = input.closest('.lab-control, .macro-knob, .mod-matrix-row, .macro-morph-card, .performance-control, .layer-control, label');
  control?.setAttribute('data-live-value', `${input.value}${unit}`);
  updateParameterCoach(coachTopicForInput(input), `${input.value}${unit}`);
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

function finishSmoothRangeInput(input = activeRangeInput) {
  if (!input) return;
  setRangeDragging(input, false);
  updateRangeChrome(input);
  activeRangeInput = null;
  setDirectManipulation(false);
}

function bindSmoothRangeInput(input, onValue) {
  const isVerticalRange = Boolean(input.closest('.vertical-slider'));
  const commitPointerRangeValue = (event) => {
    event.preventDefault();
    const changed = isVerticalRange
      ? updateVerticalRangeFromPointer(input, event)
      : updateHorizontalRangeFromPointer(input, event);
    if (!changed) return false;
    applyImmediateControlFeedback(input);
    scheduleRangeChromeUpdate(input);
    onValue(input);
    return true;
  };
  const commitKeyboardRangeValue = (event) => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = Number(input.step || 1);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return;
    const increment = Number.isFinite(step) && step > 0 ? step : (max - min) / 100;
    const current = Number(input.value || min);
    const nextByKey = {
      ArrowRight: current + increment,
      ArrowUp: current + increment,
      ArrowLeft: current - increment,
      ArrowDown: current - increment,
      PageUp: current + increment * 10,
      PageDown: current - increment * 10,
      Home: min,
      End: max,
    };
    if (!(event.key in nextByKey)) return;
    event.preventDefault();
    const changed = writeRangeValue(input, steppedRangeValue(nextByKey[event.key], min, max, step));
    if (!changed) return;
    applyImmediateControlFeedback(input);
    scheduleRangeChromeUpdate(input);
    onValue(input);
  };

  input.addEventListener('pointerdown', (event) => {
    activeRangeInput = input;
    input.setPointerCapture?.(event.pointerId);
    setRangeDragging(input, true);
    setDirectManipulation(true);
    applyImmediateControlFeedback(input);
    commitPointerRangeValue(event);
  });

  input.addEventListener('pointermove', (event) => {
    if (input !== activeRangeInput) return;
    commitPointerRangeValue(event);
  });

  input.addEventListener('input', () => {
    applyImmediateControlFeedback(input);
    scheduleRangeChromeUpdate(input);
    onValue(input);
  });

  input.addEventListener('pointerup', (event) => {
    input.releasePointerCapture?.(event.pointerId);
    finishSmoothRangeInput(input);
  });

  input.addEventListener('pointercancel', (event) => {
    input.releasePointerCapture?.(event.pointerId);
    finishSmoothRangeInput(input);
  });

  input.addEventListener('change', () => {
    finishSmoothRangeInput(input);
  });

  input.addEventListener('focus', () => {
    input.closest('.range-shell')?.classList.add('is-focused');
  });

  input.addEventListener('keydown', commitKeyboardRangeValue);

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

function drawCanvasWaveform(canvas, timeDomain) {
  if (!canvas || !timeDomain?.length) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.lineWidth = 3;
  context.strokeStyle = 'rgba(23, 167, 163, 0.92)';
  context.shadowColor = 'rgba(23, 167, 163, 0.28)';
  context.shadowBlur = 14;
  context.beginPath();
  for (let index = 0; index < timeDomain.length; index += 1) {
    const x = (index / (timeDomain.length - 1)) * width;
    const y = ((timeDomain[index] ?? 128) / 255) * height;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
}

function drawCanvasSpectrum(canvas, frequency) {
  if (!canvas || !frequency?.length) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  const bars = 72;
  const gap = 2;
  const barWidth = width / bars - gap;
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(116, 103, 214, 0.9)');
  gradient.addColorStop(0.45, 'rgba(23, 167, 163, 0.78)');
  gradient.addColorStop(1, 'rgba(98, 197, 143, 0.32)');
  context.fillStyle = gradient;
  context.shadowColor = 'rgba(116, 103, 214, 0.18)';
  context.shadowBlur = 12;
  for (let index = 0; index < bars; index += 1) {
    const sourceIndex = Math.floor((index / bars) ** 1.65 * (frequency.length - 1));
    const value = (frequency[sourceIndex] ?? 0) / 255;
    const barHeight = Math.max(3, value * height * 0.94);
    const x = index * (barWidth + gap);
    context.fillRect(x, height - barHeight, barWidth, barHeight);
  }
}

function drawSoundLabAnalyserFrame(frame) {
  if (state.soundLabAnalyzerMode === 'freeze') return;
  const level = Math.max(0, Math.min(1, frame?.level ?? 0));
  const workbench = document.querySelector('.sound-lab-workbench');
  if (!workbench) return;
  drawCanvasWaveform(workbench.querySelector('[data-analyzer-waveform]'), frame?.timeDomain);
  drawCanvasSpectrum(workbench.querySelector('[data-analyzer-spectrum]'), frame?.frequency);
  workbench.querySelectorAll('[data-analyzer-meter] i').forEach((bar, index) => {
    const offset = Math.sin(index * 1.3 + level * 5) * 0.16;
    bar.style.setProperty('--meter', `${Math.round(Math.max(0.08, level + offset) * 100)}%`);
  });
}

function refreshSoundLabRuntimeUi(model = getSoundLabModel()) {
  if (state.view !== 'soundlab') return;
  const isPlaying = Boolean(state.isSoundLabPlaying);
  document.querySelectorAll('.sound-lab-workbench').forEach((workbench) => {
    workbench.classList.toggle('is-playing', isPlaying);
  });
  document.querySelectorAll('[data-sound-lab-play]').forEach((button) => {
    button.classList.toggle('is-playing', isPlaying);
    if (button.hasAttribute('aria-label')) {
      button.setAttribute('aria-label', isPlaying ? '播放中' : '试听');
    }
    button.querySelectorAll('strong').forEach((label) => {
      label.textContent = isPlaying ? '播放中' : '试听';
    });
  });
  document.querySelectorAll('[data-output-compare]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.outputCompare === state.soundLabOutputMode);
  });
  document.querySelectorAll('[data-layer-audition]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.layerAudition === state.soundLabAuditionMode);
  });
  const outputHint = model.outputCompare?.practiceZh ?? '';
  document.querySelectorAll('.output-compare-hint').forEach((hint) => {
    hint.textContent = outputHint;
  });
  document.querySelectorAll('.workbench-feedback, .atlas-dock-status small').forEach((status) => {
    status.textContent = state.workbenchActionFeedback;
  });
}

function syncActiveSoundLabPatch() {
  if (!state.isSoundLabPlaying) return;
  const patch = getSoundLabModel().patch;
  audioPlayer.updateSoundLabPatch?.(patch);
}

function syncSoundLabPatchSoon() {
  if (!state.isSoundLabPlaying) return;
  if (soundLabPatchFrame) return;
  soundLabPatchFrame = globalThis.requestAnimationFrame(() => {
    soundLabPatchFrame = 0;
    syncActiveSoundLabPatch();
  });
}

function scrollSoundLabIntoView(selector) {
  sameViewScrollLock.allowProgrammaticScroll = true;
  globalThis.requestAnimationFrame?.(() => {
    document.querySelector(selector)?.scrollIntoView({ block: 'center', inline: 'nearest' });
  });
}

function selectAdvancedModule(moduleId, shouldRender = true) {
  const workflowByModule = {
    advanced: 'source',
    'mod-matrix': 'shape',
    'envelope-editor': 'shape',
    'fx-chain': 'shape',
    'xy-pad': 'shape',
    'macro-morph': 'shape',
    'ab-compare': 'compare',
    favorites: 'deliver',
    'project-library': 'deliver',
    'cloud-sync': 'deliver',
    'midi-input': 'deliver',
    'batch-export': 'deliver',
  };
  const moduleMapByAdvancedModule = {
    advanced: 'source',
    'envelope-editor': 'envelope',
    'mod-matrix': 'mod-matrix',
    'fx-chain': 'fx-chain',
    'xy-pad': 'mod-matrix',
    'macro-morph': 'mod-matrix',
    'ab-compare': 'compare',
    favorites: 'coach',
    'project-library': 'coach',
    'cloud-sync': 'coach',
    'midi-input': 'coach',
    'batch-export': 'compare',
  };
  state.activeAdvancedModule = moduleId;
  state.soundLabWorkflowStep = workflowByModule[moduleId] ?? state.soundLabWorkflowStep;
  state.activeWorkbenchModuleMapId = moduleMapByAdvancedModule[moduleId] ?? state.activeWorkbenchModuleMapId;
  state.activeAtlasNode = {
    advanced: 'source',
    'envelope-editor': 'envelope',
    'mod-matrix': 'modulation',
    'fx-chain': 'fx-chain',
    'ab-compare': 'material',
    favorites: 'export',
    'project-library': 'export',
    'cloud-sync': 'export',
    'midi-input': 'export',
    'batch-export': 'export',
  }[moduleId] ?? state.activeAtlasNode;
  if (moduleId === 'advanced') state.activeWorkbenchModule = 'generator';
  if (moduleId === 'ab-compare') state.activeWorkbenchModule = 'macro';
  if (moduleId === 'fx-chain') state.activeWorkbenchModule = 'effects';
  if (moduleId === 'mod-matrix') state.activeWorkbenchModule = 'modulation';
  if (moduleId === 'envelope-editor') state.activeWorkbenchModule = 'envelope';
  if (shouldRender) renderSameView();
}

function handleWorkbenchStep(step, atlasNode = '') {
  const targetByAtlasNode = {
    source: {
      step: 'source',
      workbenchModule: 'generator',
      advancedModule: 'advanced',
      moduleMap: 'source',
      selector: '.analyzer-row',
    },
    envelope: {
      step: 'shape',
      workbenchModule: 'envelope',
      advancedModule: 'envelope-editor',
      moduleMap: 'envelope',
      selector: '.envelope-panel',
    },
    modulation: {
      step: 'shape',
      workbenchModule: 'modulation',
      advancedModule: 'mod-matrix',
      moduleMap: 'mod-matrix',
      selector: '.advanced-module-dock',
    },
    'fx-chain': {
      step: 'shape',
      workbenchModule: 'effects',
      advancedModule: 'fx-chain',
      moduleMap: 'fx-chain',
      selector: '.fx-chain-editor',
    },
    material: {
      step: 'compare',
      workbenchModule: 'macro',
      advancedModule: 'ab-compare',
      moduleMap: 'compare',
      selector: '.advanced-module-dock',
    },
    export: {
      step: 'deliver',
      workbenchModule: 'effects',
      advancedModule: 'batch-export',
      moduleMap: 'compare',
      selector: '.sound-lab-export',
    },
  };
  if (atlasNode && targetByAtlasNode[atlasNode]) {
    const target = targetByAtlasNode[atlasNode];
    state.soundLabWorkflowStep = target.step;
    state.activeAtlasNode = atlasNode;
    state.activeWorkbenchModule = target.workbenchModule;
    state.activeAdvancedModule = target.advancedModule;
    state.activeWorkbenchModuleMapId = target.moduleMap;
    renderSameView();
    scrollSoundLabIntoView(target.selector);
    return;
  }
  const moduleByStep = {
    source: 'generator',
    shape: 'envelope',
    compare: 'macro',
    deliver: 'effects',
  };
  const advancedByStep = {
    source: 'advanced',
    shape: 'envelope-editor',
    compare: 'ab-compare',
    deliver: 'batch-export',
  };
  const mapByStep = {
    source: 'source',
    shape: 'envelope',
    compare: 'compare',
    deliver: 'compare',
  };
  const scrollByStep = {
    source: '.sound-family-rail',
    shape: '.workbench-module-tabs',
    compare: '.advanced-module-dock',
    deliver: '.sound-lab-export',
  };
  const atlasNodeByStep = {
    source: 'source',
    shape: 'envelope',
    compare: 'material',
    deliver: 'export',
  };
  state.soundLabWorkflowStep = step;
  state.activeAtlasNode = atlasNodeByStep[step] ?? state.activeAtlasNode;
  state.activeWorkbenchModule = moduleByStep[step] ?? state.activeWorkbenchModule;
  state.activeAdvancedModule = advancedByStep[step] ?? state.activeAdvancedModule;
  state.activeWorkbenchModuleMapId = mapByStep[step] ?? state.activeWorkbenchModuleMapId;
  renderSameView();
  scrollSoundLabIntoView(scrollByStep[step] ?? '.sound-lab-workbench');
}

function handleWorkbenchModuleJump(moduleId) {
  const targetByModule = {
    source: {
      step: 'source',
      workbenchModule: 'generator',
      advancedModule: 'advanced',
      selector: '.analyzer-row',
    },
    envelope: {
      step: 'shape',
      workbenchModule: 'envelope',
      advancedModule: 'envelope-editor',
      selector: '.envelope-panel',
    },
    'mod-matrix': {
      step: 'shape',
      workbenchModule: 'modulation',
      advancedModule: 'mod-matrix',
      selector: '.advanced-module-dock',
    },
    'fx-chain': {
      step: 'shape',
      workbenchModule: 'effects',
      advancedModule: 'fx-chain',
      selector: '.fx-chain-editor',
    },
    compare: {
      step: 'compare',
      workbenchModule: 'macro',
      advancedModule: 'ab-compare',
      selector: '.advanced-module-dock',
    },
    coach: {
      step: 'shape',
      workbenchModule: 'modulation',
      advancedModule: 'mod-matrix',
      selector: '.workbench-coach-panel',
    },
  };
  const target = targetByModule[moduleId] ?? targetByModule.source;
  state.soundLabWorkflowStep = target.step;
  state.activeAtlasNode = {
    source: 'source',
    envelope: 'envelope',
    'mod-matrix': 'modulation',
    'fx-chain': 'fx-chain',
    compare: 'material',
    coach: 'modulation',
  }[moduleId] ?? state.activeAtlasNode;
  state.activeWorkbenchModule = target.workbenchModule;
  state.activeAdvancedModule = target.advancedModule;
  state.activeWorkbenchModuleMapId = moduleId;
  renderSameView();
  scrollSoundLabIntoView(target.selector);
}

function handleSessionJump(target) {
  const route = {
    playback: {
      step: 'compare',
      atlasNode: 'material',
      workbenchModule: 'macro',
      advancedModule: 'ab-compare',
      moduleMap: 'compare',
      selector: '.playback-card',
      feedback: '已跳到输出对照：先听 Raw，再听 Comfort / Studio，确认变化不是音量错觉。',
    },
    controls: {
      step: 'shape',
      atlasNode: 'envelope',
      workbenchModule: 'envelope',
      advancedModule: 'envelope-editor',
      moduleMap: 'envelope',
      selector: '.atlas-control-column, .envelope-panel',
      feedback: '已跳到参数区：一次只动一个参数，听 Attack、Decay、材质或空间的变化。',
    },
    coach: {
      step: 'shape',
      atlasNode: 'modulation',
      workbenchModule: 'modulation',
      advancedModule: 'mod-matrix',
      moduleMap: 'coach',
      selector: '.workbench-coach-panel',
      feedback: '已跳到合成器复刻：按 Serum / Phase Plant / Vital 的路由一步步对应。',
    },
  }[target] ?? null;
  if (!route) return;
  state.soundLabWorkflowStep = route.step;
  state.activeAtlasNode = route.atlasNode;
  state.activeWorkbenchModule = route.workbenchModule;
  state.activeAdvancedModule = route.advancedModule;
  state.activeWorkbenchModuleMapId = route.moduleMap;
  state.workbenchActionFeedback = route.feedback;
  renderSameView();
  scrollSoundLabIntoView(route.selector);
}

function showWorkbenchActionFeedback(message, button) {
  state.workbenchActionFeedback = message || '未识别的工作台按钮：这次点击没有可执行目标。';
  const action = button?.dataset?.workbenchAction ?? '';
  if (action) {
    state.confirmedWorkbenchAction = action;
    if (workbenchConfirmTimer) globalThis.clearTimeout(workbenchConfirmTimer);
    workbenchConfirmTimer = globalThis.setTimeout(() => {
      if (state.confirmedWorkbenchAction === action) {
        state.confirmedWorkbenchAction = '';
        document.querySelectorAll('[data-workbench-action]').forEach((candidate) => {
          if (candidate.dataset.workbenchAction === action) candidate.classList.remove('is-confirmed');
        });
      }
    }, 650);
  }
  if (button) {
    button.classList.add('is-confirmed');
    globalThis.setTimeout(() => button.classList.remove('is-confirmed'), 900);
  }
  refreshSoundLabRuntimeUi();
}

async function handleWorkbenchAction(action, button) {
  showWorkbenchActionFeedback(WORKBENCH_ACTION_MESSAGES[action] ?? '未识别的工作台按钮：这次点击没有可执行目标。', button);

  if (action === 'save-patch' || action === 'export-preset') {
    const text = action === 'save-patch' ? buildPatchExportJson() : buildReaperExportText();
    const copied = await copyText(text).catch(() => false);
    state.workbenchActionFeedback = copied
      ? WORKBENCH_ACTION_MESSAGES[action]
      : '复制受限：浏览器没有开放剪贴板权限，可以从下方 Patch JSON / REAPER Notes 手动复制。';
    refreshSoundLabRuntimeUi();
    return;
  }

  if (action === 'compare-view') {
    handleWorkbenchStep('compare');
    return;
  }

  if (action === 'toggle-more') {
    state.soundLabMoreOpen = !state.soundLabMoreOpen;
    renderSameView();
    return;
  }

  if (action === 'randomize-patch') {
    randomizeSoundLabMacros();
    renderSameView();
    return;
  }

  if (action === 'focus-source') {
    handleWorkbenchStep('source');
    return;
  }

  if (action === 'focus-waveform') {
    state.soundLabWorkflowStep = 'source';
    state.activeAtlasNode = 'source';
    state.activeWorkbenchModuleMapId = 'source';
    state.activeAdvancedModule = 'advanced';
    state.activeWorkbenchModule = 'generator';
    renderSameView();
    scrollSoundLabIntoView('.waveform-detective-panel');
    return;
  }

  if (action === 'focus-controls') {
    handleWorkbenchStep('shape');
    return;
  }

  if (action === 'focus-practice-loop') {
    state.soundLabWorkflowStep = 'compare';
    state.activeAtlasNode = 'material';
    state.activeWorkbenchModuleMapId = 'compare';
    state.activeAdvancedModule = 'ab-compare';
    state.activeWorkbenchModule = 'macro';
    renderSameView();
    scrollSoundLabIntoView('.practice-loop-panel');
    return;
  }

  if (action === 'focus-coach') {
    state.soundLabWorkflowStep = 'shape';
    state.activeAtlasNode = 'modulation';
    state.activeWorkbenchModuleMapId = 'coach';
    state.activeAdvancedModule = 'mod-matrix';
    state.activeWorkbenchModule = 'modulation';
    renderSameView();
    scrollSoundLabIntoView('.workbench-coach-panel');
    return;
  }

  if (action === 'focus-export') {
    handleWorkbenchStep('deliver');
    return;
  }

  if (action === 'analyze-patch') {
    state.soundLabAnalyzerMode = 'log';
    state.soundLabWorkflowStep = 'shape';
    state.activeAtlasNode = 'modulation';
    state.activeWorkbenchModuleMapId = 'mod-matrix';
    state.activeAdvancedModule = 'mod-matrix';
    state.activeWorkbenchModule = 'modulation';
    renderSameView();
    scrollSoundLabIntoView('.modulation-panel');
    return;
  }

  if (action === 'new-experiment') {
    state.soundLabWorkflowStep = 'source';
    state.activeAtlasNode = 'source';
    state.activeWorkbenchModuleMapId = 'source';
    state.activeAdvancedModule = 'advanced';
    state.activeWorkbenchModule = 'generator';
    renderSameView();
    scrollSoundLabIntoView('.sound-family-rail');
    return;
  }

  const targetView = WORKBENCH_ACTION_VIEW_TARGETS[action];
  if (targetView) {
    switchView(targetView);
    return;
  }

  state.workbenchActionFeedback = '未识别的工作台按钮：这次点击没有可执行目标。';
  renderSameView();
}

function applySynthModGuide(guideId, { loadPatch = false, play = false } = {}) {
  const guide = synthModulationGuides.find((item) => item.id === guideId) ?? synthModulationGuides[0];
  if (!guide) return;
  state.activeSynthModGuideId = guide.id;
  state.soundLabWorkflowStep = guide.workflowStep ?? state.soundLabWorkflowStep;
  state.activeWorkbenchModuleMapId = 'coach';
  state.activeWorkbenchModule = guide.moduleId ?? state.activeWorkbenchModule;
  if (loadPatch) {
    selectSoundLabFamily(guide.familyId, false);
    state.activeSynthModGuideId = guide.id;
    state.soundLabWorkflowStep = guide.workflowStep ?? state.soundLabWorkflowStep;
    state.activeWorkbenchModuleMapId = 'coach';
    state.activeWorkbenchModule = guide.moduleId ?? state.activeWorkbenchModule;
    state.soundLabMacros = { ...state.soundLabMacros, ...(guide.macroHints ?? {}) };
    state.soundLabLayerMix = { ...state.soundLabLayerMix, ...(guide.layerMix ?? {}) };
  }
  renderSameView();
  scrollSoundLabIntoView('.workbench-coach-panel');
  if (play) playSoundLabPatch();
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

function formatSvgNumber(value) {
  return Number.parseFloat(value).toFixed(2).replace(/\.?0+$/, '');
}

function formatSvgPoints(points = []) {
  return points.map(([x, y]) => `${formatSvgNumber(x)},${formatSvgNumber(y)}`).join(' ');
}

function syncInteractiveAdsrSurface(lab, labState) {
  const model = buildLabVisualModel(lab, labState);
  const card = document.querySelector('.interactive-lab-card');
  const svg = card?.querySelector('.lab-svg-adsr');
  if (!svg || model.type !== 'adsr') return;

  const points = formatSvgPoints(model.pathPoints);
  const envelope = svg.querySelector('.svg-envelope');
  envelope?.setAttribute('points', points);
  envelope?.setAttribute('data-visual-path', points);

  model.handles.forEach((handle) => {
    const node = svg.querySelector(`[data-adsr-handle="${handle.id}"]`);
    node?.setAttribute('cx', formatSvgNumber(handle.x));
    node?.setAttribute('cy', formatSvgNumber(handle.y));
  });

  svg.querySelectorAll('.svg-label').forEach((labelNode, index) => {
    const label = model.labels[index];
    if (!label) return;
    labelNode.setAttribute('x', formatSvgNumber(label.x));
    labelNode.setAttribute('y', formatSvgNumber(label.y));
    labelNode.textContent = label.text;
  });

  lab.controls.forEach((control) => {
    const input = card?.querySelector(`[data-lab-control="${control.id}"]`);
    if (!input) return;
    input.value = String(labState[control.id] ?? control.defaultValue);
    updateRangeChrome(input);
  });

  const explanations = card?.querySelector('.lab-explanations ul');
  if (explanations) {
    explanations.innerHTML = model.activeExplanations.map((item) => (
      `<li><strong>${escapeHtml(item.labelZh)} ${escapeHtml(item.value)}${escapeHtml(item.unit)}</strong>：${escapeHtml(item.explanationZh)}</li>`
    )).join('');
  }
}

function finishAdsrDrag() {
  state.draggingAdsrHandle = null;
  document.querySelectorAll('[data-adsr-handle].is-dragging').forEach((handle) => {
    handle.classList.remove('is-dragging');
  });
  setDirectManipulation(false);
}

function updateAdsrFromPointer(event) {
  if (!state.draggingAdsrHandle) return;
  const lab = getActiveLab();
  if (lab.visualType !== 'adsr') return;
  const point = svgPointFromPointer(event);
  if (!point) return;

  const nextLabState = updateAdsrStateFromDrag(lab, getActiveLabState(lab), state.draggingAdsrHandle, point.x, point.y);
  state.labStates = {
    ...state.labStates,
    [lab.id]: nextLabState,
  };
  refreshAuditionPatch();
  syncInteractiveAdsrSurface(lab, nextLabState);
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
  renderSameView();
}

function stopAudition({ rerender = true } = {}) {
  audioPlayer.stop();
  state.isAuditioning = false;
  updateLiveMeter(0);
  if (rerender) renderSameView();
}

function bindDynamicForms() {
  bindDashboardControls();
  bindSourceForm();
  bindDailyVideoControls();
  bindInteractiveLabControls();
  bindSoundLabControls();
  bindMicroRouteControls();
  bindChallengeControls();
  bindMaterialControls();
  bindCommunityTechniqueControls();
  bindDeepDiveControls();
  bindIntegrationControls();
}

function applyDashboardPathStep(step) {
  state.activeDashboardPathStep = step.id;

  if (step.labId && interactiveLabs.some((lab) => lab.id === step.labId)) {
    state.activeLabId = step.labId;
  }

  if (step.familyId) {
    selectSoundLabFamily(step.familyId, false);
    state.soundLabWorkflowStep = step.workflowStep ?? state.soundLabWorkflowStep;
    state.activeAtlasNode = step.atlasNode ?? state.activeAtlasNode;
    state.activeWorkbenchModuleMapId = step.moduleMapId ?? state.activeWorkbenchModuleMapId;
    state.activeWorkbenchModule = step.workbenchModule ?? state.activeWorkbenchModule;
    state.activeAdvancedModule = step.advancedModule ?? state.activeAdvancedModule;
    state.workbenchActionFeedback = `路线 ${step.index}：${step.title}。${step.focusZh}`;
    syncSoundLabPatchSoon();
  }
}

function launchDashboardPathStep(step) {
  applyDashboardPathStep(step);
  switchView(step.view);
}

function handleDashboardPrescriptionAction(action) {
  const activePathStep = getActiveDashboardPathStep();
  if (action === 'launch') {
    launchDashboardPathStep(activePathStep);
    return;
  }

  if (action === 'ab') {
    applyDashboardPathStep(activePathStep);
    state.soundLabWorkflowStep = 'compare';
    state.activeAtlasNode = 'compare';
    state.activeWorkbenchModuleMapId = 'compare';
    state.activeAdvancedModule = 'ab-compare';
    state.workbenchActionFeedback = `处方验证：${activePathStep.title}。先听 dry，再听 changed，响度匹配后决定保留或撤回。`;
    syncSoundLabPatchSoon();
    switchView('soundlab');
  }
}

function bindDashboardLearningPathControls() {
  document.querySelectorAll('[data-dashboard-path-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const step = DASHBOARD_LEARNING_PATH.find((item) => item.id === button.dataset.dashboardPathStep);
      if (!step) return;
      applyDashboardPathStep(step);
      renderSameView();
    });
  });

  document.querySelectorAll('[data-dashboard-path-launch]').forEach((button) => {
    button.addEventListener('click', () => {
      const step = DASHBOARD_LEARNING_PATH.find((item) => item.id === button.dataset.dashboardPathLaunch);
      if (!step) return;
      launchDashboardPathStep(step);
    });
  });

  document.querySelectorAll('[data-dashboard-prescription-action]').forEach((button) => {
    button.addEventListener('click', () => {
      handleDashboardPrescriptionAction(button.dataset.dashboardPrescriptionAction);
    });
  });
}

function bindDashboardControls() {
  bindDashboardLearningPathControls();
  document.querySelectorAll('[data-dashboard-primary-view], [data-dashboard-flow-view], [data-module-directory-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const dashboardTarget = button.dataset.dashboardPrimaryView ?? button.dataset.dashboardFlowView ?? button.dataset.moduleDirectoryView;
      if (dashboardTarget) switchView(dashboardTarget);
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
    const noteZh = String(data.get('noteZh') ?? '').trim() || '手动添加的英文资料，后续需要补字幕、翻译和知识卡片。';

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
    renderSameView();
  });
}

function soundFamilyForDailyVideo(video) {
  const text = normalizeText([video.title, ...(video.tags ?? [])].join(' '));
  if (text.includes('whoosh') || text.includes('riser') || text.includes('sweep')) return 'air-whoosh';
  if (text.includes('robot') || text.includes('mechanical') || text.includes('servo')) return 'servo-tick';
  if (text.includes('electric') || text.includes('glitch') || text.includes('crackle')) return 'electric-crackle';
  if (text.includes('pulse') || text.includes('charge') || text.includes('energy') || text.includes('trailer')) return 'energy-charge';
  if (text.includes('glass') || text.includes('crystal')) return 'glass-ping';
  if (text.includes('metal') || text.includes('industrial') || text.includes('friction') || text.includes('fm')) return 'metal-impact';
  if (text.includes('impact') || text.includes('boom') || text.includes('hit')) return 'metal-impact';
  return 'metal-impact';
}

function bindDailyVideoControls() {
  document.querySelectorAll('[data-daily-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.dailyVideoFilter = button.dataset.dailyFilter || 'all';
      renderSameView();
    });
  });

  document.querySelectorAll('[data-daily-video-action="practice"]').forEach((button) => {
    button.addEventListener('click', () => {
      const video = dailyVideoFeed.find((item) => item.id === button.dataset.dailyVideoPractice);
      if (!video) return;
      const familyId = soundFamilyForDailyVideo(video);
      selectSoundLabFamily(familyId, false);
      state.soundLabWorkflowStep = 'shape';
      state.activeWorkbenchModuleMapId = 'source';
      state.activeAdvancedModule = 'advanced';
      state.dailyVideoActionMessage = `已把《${video.title}》推到 Sound Lab：先按中文练习提示做 dry 主体，再回到教程核对细节。`;
      state.workbenchActionFeedback = `来自每日教程：《${video.title}》。先听 dry 主体，再按教程补材质和尾巴。`;
      switchView('soundlab');
    });
  });

  document.querySelectorAll('[data-daily-video-action="open"]').forEach((link) => {
    link.addEventListener('click', () => {
      const card = link.closest('[data-daily-video-id]');
      const video = dailyVideoFeed.find((item) => item.id === card?.dataset.dailyVideoId);
      if (video) state.dailyVideoActionMessage = `已打开《${video.title}》，回来看时先整理目标声音、核心方法和可复刻参数。`;
    });
  });
}

function bindInteractiveLabControls() {
  document.querySelectorAll('[data-lab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeLabId = button.dataset.labId;
      refreshAuditionPatch();
      renderSameView();
    });
  });

  document.querySelectorAll('[data-waveform]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeWaveform = button.dataset.waveform;
      refreshAuditionPatch();
      renderSameView();
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
      setDirectManipulation(true);
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
      renderSameView();
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
      renderSameView();
    });
  });
}

function updateSoundLabControl(controlId, value) {
  if (!(controlId in state.soundLabMacros)) return;
  state.soundLabMacros = {
    ...state.soundLabMacros,
    [controlId]: Math.max(0, Math.min(100, Number(value))),
  };
  syncSoundLabPatchSoon();
}

function updateSoundLabEnvelope(controlId, value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return;
  const next = { ...state.soundLabEnvelope };
  if (controlId === 'sustain') next.sustain = Math.max(0, Math.min(100, numericValue)) / 100;
  if (controlId === 'attack') next.attack = Math.max(1, Math.min(1500, numericValue)) / 1000;
  if (controlId === 'decay') next.decay = Math.max(10, Math.min(3200, numericValue)) / 1000;
  if (controlId === 'release') next.release = Math.max(10, Math.min(4200, numericValue)) / 1000;
  state.soundLabEnvelope = next;
  syncSoundLabPatchSoon();
}

function updateSoundLabModRoute(routeId, value) {
  const modelRoutes = getSoundLabModel().modMatrix.routes;
  const routes = state.soundLabModMatrix.length ? state.soundLabModMatrix : modelRoutes;
  state.soundLabModMatrix = routes.map((route) => (
    route.id === routeId ? { ...route, amount: Math.max(-100, Math.min(100, Number(value))) } : route
  ));
  syncSoundLabPatchSoon();
}

function moveFxSlot(slotId, direction) {
  const order = [...state.soundLabFxOrder];
  const index = order.indexOf(slotId);
  const nextIndex = Math.max(0, Math.min(order.length - 1, index + direction));
  if (index < 0 || index === nextIndex) return;
  const [slot] = order.splice(index, 1);
  order.splice(nextIndex, 0, slot);
  state.soundLabFxOrder = order;
  syncActiveSoundLabPatch();
  renderSameView();
}

function updateXyPadFromPointer(pad, event) {
  const rect = pad.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
  state.soundLabXyPad = { ...state.soundLabXyPad, x, y };
  pad.style.setProperty('--xy-x', `${x.toFixed(2)}%`);
  pad.style.setProperty('--xy-y', `${y.toFixed(2)}%`);
  updateParameterCoach(
    { categoryZh: 'XY Pad', ...SOUND_LAB_PARAMETER_COACH.special.xyPad },
    `${Math.round(x)} / ${Math.round(y)}`,
  );
  syncSoundLabPatchSoon();
}

function updateMacroMorph(value) {
  const amount = Math.max(0, Math.min(100, Number(value)));
  state.soundLabMacroMorph = amount;
  const morphed = getSoundLabModel({}, { macroMorph: amount }).macroMorph.morphed;
  state.soundLabMacros = { ...state.soundLabMacros, ...morphed };
  syncSoundLabPatchSoon();
}

function randomizeSoundLabMacros() {
  const nextMacros = Object.fromEntries(Object.entries(state.soundLabMacros).map(([key, value]) => {
    const drift = Math.round((Math.random() - 0.5) * 26);
    return [key, Math.max(0, Math.min(100, Number(value) + drift))];
  }));
  state.soundLabMacros = { ...state.soundLabMacros, ...nextMacros };
  state.soundLabWorkflowStep = 'shape';
  state.activeAtlasNode = 'modulation';
  state.activeWorkbenchModuleMapId = 'mod-matrix';
  state.activeAdvancedModule = 'mod-matrix';
  state.activeWorkbenchModule = 'modulation';
  syncSoundLabPatchSoon();
}

function applyDeltaMap(baseValues, deltaValues = {}) {
  return Object.fromEntries(Object.entries(deltaValues).map(([key, delta]) => [
    key,
    clampPercent((baseValues[key] ?? 0) + Number(delta || 0)),
  ]));
}

function applyPatchDoctorSuggestion(diagnosticId, button) {
  const model = getSoundLabModel();
  const diagnostic = model.patchDoctor?.diagnostics?.find((item) => item.id === diagnosticId);
  const applyAction = diagnostic?.applyAction;
  if (!applyAction) {
    state.workbenchActionFeedback = '这个诊断暂时没有可试调的参数；先按“去处理”进入对应模块。';
    renderSameView();
    return;
  }

  const nextMacros = applyDeltaMap(state.soundLabMacros, applyAction.macroDelta);
  const nextLayers = applyDeltaMap(state.soundLabLayerMix, applyAction.layerDelta);
  state.soundLabMacros = { ...state.soundLabMacros, ...nextMacros };
  state.soundLabLayerMix = { ...state.soundLabLayerMix, ...nextLayers };
  state.soundLabWorkflowStep = applyAction.targetWorkflowStep ?? 'compare';
  state.activeAtlasNode = applyAction.targetAtlasNode ?? 'material';
  state.activeWorkbenchModule = applyAction.targetModule ?? 'macro';
  state.activeAdvancedModule = applyAction.targetAdvancedModule ?? 'ab-compare';
  state.activeWorkbenchModuleMapId = applyAction.targetModuleMap ?? 'compare';
  state.workbenchActionFeedback = applyAction.feedbackZh ?? '已小幅试调。现在用 A/B 验证这次变化是否真的更接近目标。';
  if (button) {
    button.classList.add('is-confirmed');
    globalThis.setTimeout(() => button.classList.remove('is-confirmed'), 900);
  }
  syncSoundLabPatchSoon();
  renderSameView();
  scrollSoundLabIntoView(applyAction.targetSelector ?? '.practice-loop-panel');
}

function setAbSlot(slot) {
  state.soundLabAbSlot = slot === 'b' ? 'b' : 'a';
  renderSameView();
}

function toggleFavoritePatch() {
  const patch = getSoundLabModel().patch;
  const patchKey = patch.libraryKey ?? patch.id;
  state.soundLabFavorites = state.soundLabFavorites.includes(patchKey)
    ? state.soundLabFavorites.filter((id) => id !== patchKey)
    : [patchKey, ...state.soundLabFavorites];
  saveSoundLabLibrary();
  renderSameView();
}

function saveCurrentPatchToProject() {
  const patch = getSoundLabModel().patch;
  const patchKey = patch.libraryKey ?? patch.id;
  const projectId = `project-${patch.familyId}`;
  const existing = state.soundLabProjects.find((project) => project.id === projectId);
  if (existing) {
    existing.patchIds = [...new Set([patchKey, ...(existing.patchIds ?? [])])];
  } else {
    state.soundLabProjects = [
      { id: projectId, name: `${patch.familyId} sound pack`, patchIds: [patchKey], tags: [patch.familyId] },
      ...state.soundLabProjects,
    ];
  }
  saveSoundLabLibrary();
  renderSameView();
}

function utf8ToBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function base64ToUtf8(value) {
  return decodeURIComponent(escape(atob(value.replace(/\s/g, ''))));
}

function buildSoundLabLibraryPayload() {
  const model = getSoundLabModel();
  const patchKey = model.patch.libraryKey ?? model.patch.id;
  return {
    updatedAt: new Date().toISOString(),
    activePatchId: model.patch.id,
    activePatchKey: patchKey,
    favorites: state.soundLabFavorites,
    projects: state.soundLabProjects,
    midiMappings: state.soundLabMidiMappings,
    patches: {
      [patchKey]: JSON.parse(model.patchJson),
    },
  };
}

async function runGitPresetSync(action, button) {
  const model = getSoundLabModel();
  const sync = model.library.gitSync;
  let token = localStorage.getItem('synthSfxLearningTool:githubToken') ?? '';
  const url = `https://api.github.com${sync.apiPath}?ref=${encodeURIComponent(sync.branch)}`;
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const original = button.textContent;
  button.textContent = action === 'pull' ? 'Pulling' : 'Pushing';
  button.classList.add('is-confirmed');
  try {
    if (action === 'pull') {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('not-found');
      const remote = await response.json();
      const payload = JSON.parse(base64ToUtf8(remote.content ?? 'e30='));
      state.soundLabFavorites = Array.isArray(payload.favorites) ? payload.favorites : state.soundLabFavorites;
      state.soundLabProjects = Array.isArray(payload.projects) ? payload.projects : state.soundLabProjects;
      state.soundLabMidiMappings = Array.isArray(payload.midiMappings) ? payload.midiMappings : state.soundLabMidiMappings;
      saveSoundLabLibrary();
      state.integrationStatus = 'connected';
      state.integrationMessage = 'Git preset library pulled into local Sound Lab.';
    } else {
      if (!token) {
        token = globalThis.prompt?.('Paste a GitHub fine-grained token with Contents write access. It will only be used for this request.') ?? '';
      }
      if (!token) throw new Error('token-missing');
      headers.Authorization = `Bearer ${token}`;
      const existing = await fetch(url, { headers }).then((response) => (response.ok ? response.json() : null));
      const payload = buildSoundLabLibraryPayload();
      const putResponse = await fetch(`https://api.github.com${sync.apiPath}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update Sound Lab preset library ${payload.updatedAt}`,
          content: utf8ToBase64(JSON.stringify(payload, null, 2)),
          sha: existing?.sha,
          branch: sync.branch,
        }),
      });
      if (!putResponse.ok) throw new Error('push-failed');
      state.integrationStatus = 'connected';
      state.integrationMessage = 'Git preset library pushed with GitHub Contents API.';
    }
  } catch {
    state.integrationStatus = 'error';
    state.integrationMessage = 'Git sync request failed. Check network, repository, branch, file SHA, and token permissions.';
  }
  button.textContent = original;
  globalThis.setTimeout(() => button.classList.remove('is-confirmed'), 900);
  renderSameView();
}

async function playSoundLabPatch(macroOverrides = {}, optionOverrides = {}) {
  const model = getSoundLabModel(macroOverrides, optionOverrides);
  const patch = model.patch;
  state.isSoundLabPlaying = true;
  state.isAuditioning = false;
  refreshSoundLabRuntimeUi(model);

  try {
    const result = await audioPlayer.playSoundLabPatch(patch, {
      onLevel: (level) => updateSurfaceMeter('.sound-lab-workbench', level),
      onAnalyserFrame: drawSoundLabAnalyserFrame,
    });
    state.soundLabWorkletReady = Boolean(result?.workletReady);
    state.soundLabToneReady = Boolean(result?.toneReady);
    state.soundLabEngineUsed = result?.engineUsed ?? state.soundLabEngineMode;
    state.audioError = '';
  } catch (error) {
    state.audioError = error instanceof Error ? error.message : 'Audio could not start.';
  }

  refreshSoundLabRuntimeUi(model);

  globalThis.clearTimeout(patchPlayingTimer);
  patchPlayingTimer = globalThis.setTimeout(() => {
    state.isSoundLabPlaying = false;
    refreshSoundLabRuntimeUi(model);
  }, Math.max(520, patch.durationSeconds * 1000 + 520));
}

function bindSoundLabControls() {
  document.querySelectorAll('[data-sound-family-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectSoundLabFamily(button.dataset.soundFamilyId);
    });
  });

  document.querySelectorAll('[data-workbench-family]').forEach((button) => {
    button.addEventListener('click', () => {
      selectSoundLabFamily(button.dataset.workbenchFamily);
    });
  });

  document.querySelectorAll('[data-synth-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const synthId = button.dataset.synthTab;
      if (!(synthId in WORKBENCH_SYNTH_TO_COACH_SYNTH)) return;
      state.activeWorkbenchSynth = synthId;
      state.activeCoachSynth = WORKBENCH_SYNTH_TO_COACH_SYNTH[synthId];
      renderSameView();
    });
  });

  document.querySelectorAll('[data-sound-lab-engine]').forEach((button) => {
    button.addEventListener('click', () => {
      state.soundLabEngineMode = button.dataset.soundLabEngine;
      state.soundLabEngineUsed = button.dataset.soundLabEngine;
      renderSameView();
    });
  });

  document.querySelectorAll('[data-sound-lab-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      updateSoundLabControl(rangeInput.dataset.soundLabControl, rangeInput.value);
    });
  });

  document.querySelectorAll('[data-sound-lab-dna]').forEach((button) => {
    button.addEventListener('click', () => {
      const presetDna = getPresetDnaById(button.dataset.soundLabDna, getActiveSoundFamily().id);
      state.activeSoundPresetDnaId = presetDna.id;
      state.soundLabMacros = { ...state.soundLabMacros, ...presetDna.macroHints };
      renderSameView();
    });
  });

  document.querySelectorAll('[data-sound-lab-quality]').forEach((button) => {
    button.addEventListener('click', () => {
      state.soundLabQualityMode = button.dataset.soundLabQuality;
      renderSameView();
    });
  });

  document.querySelectorAll('[data-sound-lab-layer]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      const layerId = rangeInput.dataset.soundLabLayer;
      state.soundLabLayerMix = {
        ...state.soundLabLayerMix,
        [layerId]: Math.max(0, Math.min(100, Number(rangeInput.value))),
      };
      syncSoundLabPatchSoon();
    });
  });

  document.querySelectorAll('[data-performance-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      const controlId = rangeInput.dataset.performanceControl;
      const numericValue = Number(rangeInput.value);
      state.soundLabPerformance = {
        ...state.soundLabPerformance,
        [controlId]: Number.isFinite(numericValue) ? numericValue : state.soundLabPerformance[controlId],
      };
      syncSoundLabPatchSoon();
    });
  });

  document.querySelectorAll('[data-envelope-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      updateSoundLabEnvelope(rangeInput.dataset.envelopeControl, rangeInput.value);
    });
  });

  document.querySelectorAll('[data-mod-route-amount]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      updateSoundLabModRoute(rangeInput.dataset.modRouteAmount, rangeInput.value);
    });
  });

  document.querySelectorAll('[data-macro-morph]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      updateMacroMorph(rangeInput.value);
    });
  });

  document.querySelectorAll('[data-fx-move]').forEach((button) => {
    button.addEventListener('click', () => {
      moveFxSlot(button.dataset.fxMove, Number(button.dataset.fxDirection));
    });
  });

  document.querySelectorAll('[data-xy-pad]').forEach((pad) => {
    pad.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      pad.setPointerCapture?.(event.pointerId);
      setDirectManipulation(true);
      updateXyPadFromPointer(pad, event);
    });
    pad.addEventListener('pointermove', (event) => {
      if ((event.buttons & 1) !== 1) return;
      updateXyPadFromPointer(pad, event);
    });
    pad.addEventListener('pointerup', (event) => {
      pad.releasePointerCapture?.(event.pointerId);
      setDirectManipulation(false);
    });
    pad.addEventListener('pointercancel', (event) => {
      pad.releasePointerCapture?.(event.pointerId);
      setDirectManipulation(false);
    });
  });

  document.querySelectorAll('[data-ab-slot]').forEach((button) => {
    button.addEventListener('click', () => setAbSlot(button.dataset.abSlot));
  });

  document.querySelectorAll('[data-favorite-patch]').forEach((button) => {
    button.addEventListener('click', () => toggleFavoritePatch());
  });

  document.querySelectorAll('[data-project-library-action]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.projectLibraryAction === 'save') saveCurrentPatchToProject();
    });
  });

  document.querySelectorAll('[data-git-sync-action]').forEach((button) => {
    button.addEventListener('click', () => runGitPresetSync(button.dataset.gitSyncAction, button));
  });

  document.querySelectorAll('[data-midi-learn]').forEach((button) => {
    button.addEventListener('click', () => {
      state.integrationStatus = 'midi-learn';
      state.integrationMessage = 'MIDI Learn armed: move a hardware CC to map the next control.';
      button.classList.add('is-confirmed');
      globalThis.setTimeout(() => button.classList.remove('is-confirmed'), 900);
    });
  });

  document.querySelectorAll('[data-export-name-pattern]').forEach((input) => {
    input.addEventListener('change', () => {
      state.integrationStatus = 'export-rule';
      state.integrationMessage = `Batch naming rule updated: ${input.value}`;
    });
  });

  document.querySelectorAll('[data-performance-hold]').forEach((button) => {
    button.addEventListener('click', () => {
      state.soundLabPerformance = {
        ...state.soundLabPerformance,
        hold: !state.soundLabPerformance.hold,
      };
      syncActiveSoundLabPatch();
      renderSameView();
    });
  });

  document.querySelectorAll('[data-sound-lab-key]').forEach((button) => {
    button.addEventListener('click', () => {
      state.soundLabPerformance = {
        ...state.soundLabPerformance,
        note: button.dataset.soundLabKey,
      };
      playSoundLabPatch({}, { performance: state.soundLabPerformance });
    });
  });

  document.querySelectorAll('[data-sound-lab-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const family = getActiveSoundFamily();
      const preset = family.presets.find((item) => item.id === button.dataset.soundLabPreset);
      if (!preset) return;
      state.soundLabMacros = { ...state.soundLabMacros, ...preset.values };
      renderSameView();
    });
  });

  document.querySelectorAll('[data-sound-lab-play]').forEach((button) => {
    button.addEventListener('click', () => playSoundLabPatch());
  });

  document.querySelectorAll('[data-sound-lab-ab]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.soundLabAb;
      if (mode === 'tone') {
        playSoundLabPatch({}, { engineMode: 'hq', qualityMode: 'studio' });
        return;
      }
      playSoundLabPatch(
        mode === 'a' ? { space: 0, variation: 0 } : {},
        mode === 'a'
          ? { engineMode: 'webaudio', qualityMode: 'draft', layerMix: { ...state.soundLabLayerMix, texture: 0, tail: 0 } }
          : { engineMode: state.soundLabEngineMode },
      );
    });
  });

  document.querySelectorAll('[data-output-compare]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.outputCompare ?? 'comfort';
      state.soundLabOutputMode = ['raw', 'comfort', 'studio'].includes(mode) ? mode : 'comfort';
      state.workbenchActionFeedback = {
        raw: 'Raw 输出：关闭 polish，专门听刺耳边缘、动态拥挤和未整理的频段。',
        comfort: 'Comfort 输出：开启 de-harsh 和 headroom，听声音是否更稳、更不扎耳。',
        studio: 'Studio 输出：使用高质量抛光链，检查最终交付质感和响度。',
      }[state.soundLabOutputMode];
      playSoundLabPatch({}, buildOutputCompareOverrides(state.soundLabOutputMode));
    });
  });

  document.querySelectorAll('[data-layer-audition]').forEach((button) => {
    button.addEventListener('click', () => {
      playLayerAudition(button.dataset.layerAudition);
    });
  });

  document.querySelectorAll('[data-module-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const mapByWorkbenchModule = {
        generator: 'source',
        filter: 'source',
        modulation: 'mod-matrix',
        envelope: 'envelope',
        effects: 'fx-chain',
        macro: 'compare',
      };
      const atlasNodeByWorkbenchModule = {
        generator: 'source',
        filter: 'source',
        modulation: 'modulation',
        envelope: 'envelope',
        effects: 'fx-chain',
        macro: 'material',
      };
      state.activeWorkbenchModule = button.dataset.moduleTab;
      state.soundLabWorkflowStep = ['generator', 'filter'].includes(button.dataset.moduleTab) ? 'source' : 'shape';
      state.activeAtlasNode = atlasNodeByWorkbenchModule[button.dataset.moduleTab] ?? state.activeAtlasNode;
      state.activeWorkbenchModuleMapId = mapByWorkbenchModule[button.dataset.moduleTab] ?? state.activeWorkbenchModuleMapId;
      renderSameView();
    });
  });

  document.querySelectorAll('.workflow-step[data-workflow-step]').forEach((button) => {
    button.addEventListener('click', () => {
      handleWorkbenchStep(button.dataset.workflowStep, button.dataset.atlasNode);
    });
  });

  document.querySelectorAll('[data-analyzer-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.soundLabAnalyzerMode = button.dataset.analyzerMode;
      renderSameView();
    });
  });

  document.querySelectorAll('[data-advanced-module]').forEach((button) => {
    button.addEventListener('click', () => {
      selectAdvancedModule(button.dataset.advancedModule);
    });
  });

  document.querySelectorAll('[data-workbench-module-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      handleWorkbenchModuleJump(button.dataset.workbenchModuleJump);
    });
  });

  document.querySelectorAll('[data-session-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      handleSessionJump(button.dataset.sessionJump);
    });
  });

  document.querySelectorAll('[data-mod-guide]').forEach((button) => {
    button.addEventListener('click', () => {
      applySynthModGuide(button.dataset.modGuide);
    });
  });

  document.querySelectorAll('[data-coach-synth]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCoachSynth = button.dataset.coachSynth;
      renderSameView();
      scrollSoundLabIntoView('.workbench-coach-panel');
    });
  });

  document.querySelectorAll('[data-guide-load]').forEach((button) => {
    button.addEventListener('click', () => {
      applySynthModGuide(button.dataset.guideLoad, { loadPatch: true });
    });
  });

  document.querySelectorAll('[data-guide-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      applySynthModGuide(button.dataset.guidePreview, { loadPatch: true, play: true });
    });
  });

  document.querySelectorAll('[data-doctor-apply]').forEach((button) => {
    button.addEventListener('click', () => {
      applyPatchDoctorSuggestion(button.dataset.doctorApply, button);
    });
  });

  document.querySelectorAll('[data-quality-coach-apply]').forEach((button) => {
    button.addEventListener('click', () => {
      applyPatchDoctorSuggestion(button.dataset.qualityCoachApply, button);
    });
  });

  document.querySelectorAll('[data-workbench-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      await handleWorkbenchAction(button.dataset.workbenchAction, button);
    });
  });
}

function bindMicroRouteControls() {
  document.querySelectorAll('[data-micro-track-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeMicroTrackId = button.dataset.microTrackId;
      renderSameView();
    });
  });
}

function bindChallengeControls() {
  document.querySelectorAll('[data-challenge-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeChallengeId = button.dataset.challengeId;
      renderSameView();
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
      renderSameView();
    });
  });
}

function markPatchPlaying(patch) {
  state.isPatchPlaying = true;
  globalThis.clearTimeout(patchPlayingTimer);
  patchPlayingTimer = globalThis.setTimeout(() => {
    state.isPatchPlaying = false;
    renderSameView();
  }, Math.max(480, patch.durationSeconds * 1000 + 460));
}

function bindMaterialControls() {
  document.querySelectorAll('[data-material-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeMaterialId = button.dataset.materialId;
      renderSameView();
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
      renderSameView();
    });
  });

  document.querySelectorAll('[data-material-play]').forEach((button) => {
    button.addEventListener('click', async () => {
      const material = getActiveMaterial();
      const patch = buildMaterialAudioPatch(material, getActiveMaterialState(material));
      markPatchPlaying(patch);
      renderSameView();
      try {
        await audioPlayer.playPatch(patch, { onLevel: (level) => updateSurfaceMeter('.material-lab-card', level) });
        state.audioError = '';
      } catch (error) {
        state.isPatchPlaying = false;
        state.audioError = error instanceof Error ? error.message : 'Audio could not start.';
        renderSameView();
      }
    });
  });
}

function updateCommunityControl(labId, controlId, value) {
  const lab = communityTechniqueLabs.find((item) => item.id === labId);
  const control = lab?.controls.find((item) => item.id === controlId);
  if (!lab || !control) return;
  const nextValue = Math.max(control.min, Math.min(control.max, Number(value)));
  state.communityControlStates = {
    ...state.communityControlStates,
    [lab.id]: {
      ...getCommunityControlValues(lab),
      [control.id]: nextValue,
    },
  };
}

function getCommunityFocusPresets(lab) {
  if (lab.focusPresets?.length) return lab.focusPresets;
  const controls = lab.controls ?? [];
  const base = Object.fromEntries(controls.map((control) => [control.id, Number(control.default ?? 50)]));
  const clampToControl = (control, value) => Math.max(Number(control.min ?? 0), Math.min(Number(control.max ?? 100), Number(value)));
  const withValues = (rules) => Object.fromEntries(controls.map((control, index) => {
    const rule = rules.find((item) => item.ids?.includes(control.id) || item.index === index);
    return [control.id, clampToControl(control, rule ? rule.value : base[control.id])];
  }));
  return [
    {
      id: 'focus-core',
      labelZh: '主体优先',
      goalZh: '先听 dry/body 是否成立',
      values: withValues([{ index: 0, value: 72 }, { ids: ['space', 'tail', 'release'], value: 24 }]),
    },
    {
      id: 'focus-motion',
      labelZh: '运动/材质',
      goalZh: '放大调制和纹理变化',
      values: withValues([{ index: 1, value: 76 }, { index: 2, value: 74 }]),
    },
    {
      id: 'focus-delivery',
      labelZh: '完整交付',
      goalZh: '听 full 版和尾巴关系',
      values: withValues([{ ids: ['space', 'tail', 'release'], value: 68 }, { index: 3, value: 64 }]),
    },
  ];
}

function getCommunityPracticeScenes(lab) {
  if (lab.practiceScenes?.length) return lab.practiceScenes;
  const presets = getCommunityFocusPresets(lab);
  return [
    {
      id: 'scene-core',
      values: presets[0]?.values ?? {},
    },
    {
      id: 'scene-modulation',
      values: presets[1]?.values ?? {},
    },
    {
      id: 'scene-delivery',
      values: presets[2]?.values ?? {},
    },
  ];
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value)));
}

function buildCommunitySoundLabRecipe(lab) {
  const base = lab.soundLabRecipe;
  const values = getCommunityControlValues(lab);
  const valueList = Object.values(values).map(Number).filter(Number.isFinite);
  const average = valueList.length ? valueList.reduce((sum, value) => sum + value, 0) / valueList.length : 50;
  const pick = (ids, fallback = average) => {
    const hit = ids.map((id) => values[id]).find((value) => Number.isFinite(Number(value)));
    return Number.isFinite(Number(hit)) ? Number(hit) : fallback;
  };

  const bright = pick(['brightness', 'sparkle', 'spark', 'presence', 'rise', 'edge', 'cleanup'], base.macros.brightness);
  const motion = pick(['speed', 'direction', 'urgency', 'rise', 'grain', 'motion', 'gate', 'drift'], base.macros.motion);
  const material = pick(['edge', 'resonance', 'grain', 'techCore', 'density', 'drive', 'shell', 'inharmonicity', 'interval', 'cleanup'], base.macros.material);
  const space = pick(['space', 'release', 'wetness', 'dragLength', 'tail'], base.macros.space);
  const variation = pick(['variation', 'loopSafety', 'grain', 'density', 'drift', 'randomness'], base.macros.variation);
  const dryFocus = pick(['dryFocus', 'anchor', 'techCore', 'loopSafety', 'carrier', 'weight'], base.layerMix.body);

  return {
    ...base,
    macros: {
      ...base.macros,
      brightness: clampPercent((base.macros.brightness + bright) / 2),
      motion: clampPercent((base.macros.motion + motion) / 2),
      material: clampPercent((base.macros.material + material) / 2),
      space: clampPercent((base.macros.space + space) / 2),
      variation: clampPercent((base.macros.variation + variation) / 2),
    },
    layerMix: {
      ...base.layerMix,
      transient: clampPercent((base.layerMix.transient + pick(['spark', 'presence', 'urgency', 'tick', 'attack'], base.layerMix.transient)) / 2),
      body: clampPercent((base.layerMix.body + dryFocus) / 2),
      texture: clampPercent((base.layerMix.texture + pick(['edge', 'grain', 'wetness', 'density', 'sparkle', 'drive', 'texture', 'interval'], base.layerMix.texture)) / 2),
      tail: clampPercent((base.layerMix.tail + space) / 2),
    },
  };
}

function loadCommunityTechniqueToSoundLab(lab) {
  const recipe = buildCommunitySoundLabRecipe(lab);
  state.activeSoundFamilyId = recipe.familyId;
  state.activeSoundPresetDnaId = recipe.presetDnaId;
  state.soundLabQualityMode = recipe.qualityMode ?? 'studio';
  state.soundLabMacros = { ...SOUND_LAB_MACROS, ...recipe.macros };
  state.soundLabLayerMix = { ...SOUND_LAB_LAYER_MIX, ...recipe.layerMix };
  state.isSoundLabPlaying = false;
  switchView('soundlab');
}

function bindCommunityTechniqueControls() {
  document.querySelectorAll('button[data-community-technique]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCommunityTechniqueId = button.dataset.communityTechnique;
      state.activeCommunitySynthRoute = 'serum';
      renderSameView();
    });
  });

  const activeLab = communityTechniqueLabs.find((lab) => lab.id === state.activeCommunityTechniqueId) ?? communityTechniqueLabs[0];
  document.querySelectorAll('[data-community-control]').forEach((input) => {
    bindSmoothRangeInput(input, (rangeInput) => {
      updateCommunityControl(activeLab.id, rangeInput.dataset.communityControl, rangeInput.value);
    });
  });

  document.querySelectorAll('[data-community-focus-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = getCommunityFocusPresets(activeLab).find((item) => item.id === button.dataset.communityFocusPreset);
      if (!preset) return;
      state.communityControlStates = {
        ...state.communityControlStates,
        [activeLab.id]: {
          ...getCommunityControlValues(activeLab),
          ...preset.values,
        },
      };
      renderSameView();
    });
  });

  document.querySelectorAll('[data-community-practice-scene]').forEach((button) => {
    button.addEventListener('click', () => {
      const scene = getCommunityPracticeScenes(activeLab).find((item) => item.id === button.dataset.communityPracticeScene);
      if (!scene) return;
      state.communityControlStates = {
        ...state.communityControlStates,
        [activeLab.id]: {
          ...getCommunityControlValues(activeLab),
          ...scene.values,
        },
      };
      renderSameView();
    });
  });

  document.querySelectorAll('[data-community-synth-route]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCommunitySynthRoute = button.dataset.communitySynthRoute || 'serum';
      renderSameView();
    });
  });

  document.querySelectorAll('[data-community-load-soundlab]').forEach((button) => {
    button.addEventListener('click', () => {
      const lab = communityTechniqueLabs.find((item) => item.id === button.dataset.communityLoadSoundlab);
      if (!lab) return;
      state.activeCommunityTechniqueId = lab.id;
      loadCommunityTechniqueToSoundLab(lab);
    });
  });
}

function bindDeepDiveControls() {
  document.querySelectorAll('[data-deep-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeDeepDiveId = button.dataset.deepId;
      renderSameView();
    });
  });
}

async function connectMidi() {
  if (!globalThis.navigator?.requestMIDIAccess) {
    state.integrationStatus = 'unsupported';
    state.integrationMessage = '当前浏览器没有开放 Web MIDI。建议在 Chrome 系浏览器和 localhost/https 环境中测试。';
    renderSameView();
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
        const messageType = (status & 0xf0) === 0xb0 ? 'cc' : (status & 0xf0) === 0x90 ? 'note' : 'other';
        const channel = (status & 0x0f) + 1;
        if (messageType === 'cc' && state.integrationStatus === 'midi-learn') {
          state.soundLabMidiMappings = [
            { controlId: 'brightness', messageType: 'cc', channel, number: data1 },
            ...state.soundLabMidiMappings.filter((mapping) => !(mapping.messageType === 'cc' && mapping.channel === channel && mapping.number === data1)),
          ];
          state.integrationStatus = 'connected';
          state.integrationMessage = `Mapped CC ${data1} channel ${channel} to Brightness.`;
          saveSoundLabLibrary();
        } else if (messageType === 'cc') {
          const mapping = state.soundLabMidiMappings.find((item) => item.messageType === 'cc' && item.channel === channel && item.number === data1);
          if (mapping?.controlId in state.soundLabMacros) {
            updateSoundLabControl(mapping.controlId, Math.round((data2 / 127) * 100));
          }
        }
        if (state.view === 'integrations') renderSameView();
      };
    });
  } catch {
    state.integrationStatus = 'denied';
    state.integrationMessage = '浏览器拒绝了 MIDI 权限，或当前环境不允许访问 MIDI。';
  }
  renderSameView();
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
  renderSameView();
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
  for (const tag of collectTags([...knowledgeCards, ...recipes, ...microLessons, ...techniqueTips, ...communityTechniqueLabs, ...deepDiveModules, ...soundLabFamilies, ...dailyVideoFeed])) {
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

document.querySelectorAll('.daily-suggestion-card [data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    switchView(button.dataset.view);
  });
});

globalThis.addEventListener('hashchange', () => {
  switchView(getViewFromHash(), { updateHash: false });
});

document.addEventListener('pointermove', (event) => {
  if (!state.draggingAdsrHandle) return;
  updateAdsrFromPointer(event);
});

document.addEventListener('pointerup', () => {
  finishAdsrDrag();
  if (activeRangeInput) finishSmoothRangeInput(activeRangeInput);
  setDirectManipulation(false);
});

document.addEventListener('pointercancel', () => {
  finishAdsrDrag();
  if (activeRangeInput) finishSmoothRangeInput(activeRangeInput);
  setDirectManipulation(false);
});

queryInput.addEventListener('input', () => {
  state.query = queryInput.value;
  renderSameView();
});

synthFilter.addEventListener('change', () => {
  state.synth = synthFilter.value;
  renderSameView();
});

difficultyFilter.addEventListener('change', () => {
  state.difficulty = difficultyFilter.value;
  renderSameView();
});

tagFilter.addEventListener('change', () => {
  state.tag = tagFilter.value;
  renderSameView();
});

populateTagFilter();
render();
