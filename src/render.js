import { buildWaveformPreview } from './audio-model.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function badgeList(items = []) {
  return items.map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join('');
}

function compactExternalUrl(url = '') {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    return `${host}${parsed.pathname}${parsed.search}`.replace(/\/$/, '');
  } catch {
    return String(url).trim();
  }
}

function listItems(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function synthName(key) {
  return { serum: 'Serum', phasePlant: 'Phase Plant', vital: 'Vital' }[key] ?? key;
}

function renderSynthMappings(mappings = {}) {
  const rows = Object.entries(mappings)
    .filter(([, steps]) => Array.isArray(steps) && steps.length > 0)
    .map(([key, steps]) => `
      <div class="mapping-row">
        <strong>${escapeHtml(synthName(key))}</strong>
        <ul>${listItems(steps)}</ul>
      </div>
    `)
    .join('');
  return rows || '<p class="muted">这个知识点暂时没有合成器映射。</p>';
}

function formatNumber(value) {
  return Number.parseFloat(value).toFixed(2).replace(/\.?0+$/, '');
}

function pointList(points = []) {
  return points.map(([x, y]) => `${formatNumber(x)},${formatNumber(y)}`).join(' ');
}

function rangeValuePercent(control, value) {
  if (control.max === control.min) return 0;
  return Math.max(0, Math.min(100, ((Number(value) - control.min) / (control.max - control.min)) * 100));
}

function renderAdsrVisual(model) {
  const points = pointList(model.pathPoints);
  return `
    <svg class="lab-svg lab-svg-adsr" viewBox="0 0 412 260" role="img" aria-label="ADSR envelope visual">
      <line x1="24" y1="220" x2="388" y2="220" class="svg-axis" />
      <line x1="24" y1="40" x2="24" y2="220" class="svg-axis" />
      <polyline class="svg-envelope" data-visual-path="${escapeHtml(points)}" points="${escapeHtml(points)}" />
      ${model.handles.map((handle) => `
        <circle
          class="adsr-handle"
          data-adsr-handle="${escapeHtml(handle.id)}"
          tabindex="0"
          role="slider"
          aria-label="${escapeHtml(handle.labelZh)}"
          cx="${formatNumber(handle.x)}"
          cy="${formatNumber(handle.y)}"
          r="9"
        />
      `).join('')}
      ${model.labels.map((label) => `
        <text x="${formatNumber(label.x)}" y="${formatNumber(label.y)}" class="svg-label">${escapeHtml(label.text)}</text>
      `).join('')}
    </svg>
  `;
}

function renderFilterVisual(model) {
  const points = pointList(model.curvePoints);
  return `
    <svg class="lab-svg lab-svg-filter" viewBox="0 0 412 260" role="img" aria-label="Filter spectrum visual">
      <defs>
        <linearGradient id="filterFill" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#46b7a6" stop-opacity="0.36" />
          <stop offset="100%" stop-color="#f1c15d" stop-opacity="0.08" />
        </linearGradient>
      </defs>
      <line x1="24" y1="212" x2="388" y2="212" class="svg-axis" />
      <polyline class="svg-filter-fill" points="24,212 ${escapeHtml(points)} 388,212" />
      <polyline class="svg-filter-curve" data-visual-path="${escapeHtml(points)}" points="${escapeHtml(points)}" />
      <line x1="${formatNumber(model.cutoffX)}" y1="48" x2="${formatNumber(model.cutoffX)}" y2="222" class="svg-marker" />
      <path class="svg-motion" d="M ${formatNumber(model.sweepStartX)} 236 L ${formatNumber(model.sweepEndX)} 236" />
      <text x="30" y="38" class="svg-label">dark</text>
      <text x="346" y="38" class="svg-label">bright</text>
    </svg>
  `;
}

function renderFmVisual(model) {
  return `
    <svg class="lab-svg lab-svg-fm" viewBox="0 0 412 260" role="img" aria-label="FM sidebands visual">
      <line x1="24" y1="216" x2="388" y2="216" class="svg-axis" />
      ${model.sidebands.map((band) => `
        <rect
          class="${band.isCarrier ? 'svg-carrier' : 'svg-sideband'}"
          x="${formatNumber(band.x - band.width / 2)}"
          y="${formatNumber(band.y)}"
          width="${formatNumber(band.width)}"
          height="${formatNumber(band.height)}"
          opacity="${formatNumber(band.opacity)}"
        />
      `).join('')}
      <path class="svg-decay" d="M 72 46 C 142 22, ${formatNumber(model.decayArc)} 46, 336 162" />
      <text x="34" y="238" class="svg-label">sidebands</text>
      <text x="176" y="38" class="svg-label">ratio ${escapeHtml(model.ratio)}</text>
    </svg>
  `;
}

function renderLayersVisual(model) {
  return `
    <svg class="lab-svg lab-svg-layers" viewBox="0 0 412 260" role="img" aria-label="SFX layer stack visual">
      ${model.layers.map((layer) => `
        <g>
          <text x="30" y="${formatNumber(layer.y + 17)}" class="svg-label">${escapeHtml(layer.labelZh)}</text>
          <rect class="svg-layer-bg" x="120" y="${formatNumber(layer.y)}" width="252" height="24" rx="5" />
          <rect
            class="svg-layer-bar"
            x="120"
            y="${formatNumber(layer.y)}"
            width="${formatNumber(layer.width)}"
            height="24"
            rx="5"
            opacity="${formatNumber(layer.opacity)}"
          />
        </g>
      `).join('')}
    </svg>
  `;
}

function renderRecipeVisual(model) {
  const polygon = pointList(model.polygonPoints);
  return `
    <svg class="lab-svg lab-svg-recipe" viewBox="0 0 412 280" role="img" aria-label="Recipe parameter radar visual">
      <circle cx="206" cy="138" r="46" class="svg-radar-ring" />
      <circle cx="206" cy="138" r="92" class="svg-radar-ring" />
      <circle cx="206" cy="138" r="138" class="svg-radar-ring" />
      ${model.axes.map((axis) => `
        <line x1="206" y1="138" x2="${formatNumber(axis.endX)}" y2="${formatNumber(axis.endY)}" class="svg-axis" />
        <text x="${formatNumber(axis.endX)}" y="${formatNumber(axis.endY)}" class="svg-label">${escapeHtml(axis.labelZh)}</text>
      `).join('')}
      <polygon class="svg-radar-shape" data-visual-path="${escapeHtml(polygon)}" points="${escapeHtml(polygon)}" />
    </svg>
  `;
}

function renderLabVisual(model) {
  if (model.type === 'adsr') return renderAdsrVisual(model);
  if (model.type === 'filter') return renderFilterVisual(model);
  if (model.type === 'fm') return renderFmVisual(model);
  if (model.type === 'layers') return renderLayersVisual(model);
  if (model.type === 'recipe') return renderRecipeVisual(model);
  return '<div class="lab-empty-visual">No visual model</div>';
}

function renderWaveformButton(waveform, activeWaveform) {
  const preview = buildWaveformPreview(waveform.id, { width: 120, height: 40, samples: 36, cycles: 2 });
  return `
    <button
      class="waveform-button ${waveform.id === activeWaveform ? 'is-active' : ''}"
      type="button"
      data-waveform="${escapeHtml(waveform.id)}"
      title="${escapeHtml(waveform.soundZh)}"
    >
      <svg viewBox="0 0 ${preview.width} ${preview.height}" aria-hidden="true">
        <polyline points="${escapeHtml(preview.points)}" />
      </svg>
      <span>${escapeHtml(waveform.labelZh)}</span>
    </button>
  `;
}

function renderAudioPanel({ waveforms, activeWaveform, isAuditioning }) {
  return `
    <section class="lab-audio-panel" aria-label="声音试听">
      <div class="audio-panel-header">
        <div>
          <h4>声音试听</h4>
          <p>选择四个基础波形之一，再按试听。浏览器需要一次点击后才会发声。</p>
        </div>
        <button
          class="audition-button ${isAuditioning ? 'is-playing' : ''}"
          type="button"
          data-audition-toggle
          aria-pressed="${isAuditioning ? 'true' : 'false'}"
        >
          <span class="audition-dot" aria-hidden="true"></span>
          ${isAuditioning ? '停止' : '试听'}
        </button>
      </div>
      <div class="waveform-picker" aria-label="四个基础波形">
        ${waveforms.map((waveform) => renderWaveformButton(waveform, activeWaveform)).join('')}
      </div>
      <div class="live-scope" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </section>
  `;
}

function renderMacroModPanel(lab, model) {
  const controls = model.normalizedControls ?? [];
  const controlNames = controls.map((control) => control.labelZh).slice(0, 4).join(' / ');
  const macroCopy = {
    tone: {
      label: 'Tone 质感',
      note: lab.visualType === 'fm' ? '推高非谐波和亮度，适合金属、玻璃、硬质点击。' : '推高明暗和材质识别，让声音更容易被听见。',
    },
    motion: {
      label: 'Motion 动态',
      note: '增加时间运动和参数变化，适合 whoosh、能量、机械动作。',
    },
    space: {
      label: 'Space 尾巴',
      note: '拉开释放、空间或尾音，适合交付 dry/full/tail-only 对照。',
    },
  };

  return `
    <section class="macro-mod-panel" aria-label="听感宏控制">
      <div>
        <h4>听感宏</h4>
        <p>用 Tone / Motion / Space 快速把参数推到可听区域，再用滑杆细修。当前实验参数：${escapeHtml(controlNames)}</p>
      </div>
      <div class="macro-button-row">
        ${Object.entries(macroCopy).map(([macroId, macro]) => `
          <button class="macro-button" type="button" data-lab-macro="${escapeHtml(macroId)}">
            <strong>${escapeHtml(macro.label)}</strong>
            <span>${escapeHtml(macro.note)}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function findSource(sources, sourceId) {
  return sources.find((source) => source.id === sourceId);
}

export function renderSourceCard(source) {
  return `
    <article class="card source-card">
      <div class="card-kicker">${escapeHtml(source.platform)} · ${escapeHtml(source.credibility)}</div>
      <h3>${escapeHtml(source.title)}</h3>
      <p>${escapeHtml(source.noteZh)}</p>
      <div class="badges">${badgeList(source.tags)}</div>
      <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">打开来源</a>
    </article>
  `;
}

export function renderDailyVideoCard(video) {
  const published = video.publishedAt || '日期待补';
  const duration = video.durationLabel ? ` · ${video.durationLabel}` : '';
  const status = video.statusZh || '待精读';
  const videoUrl = String(video.url ?? '').trim();
  const openControl = videoUrl
    ? `<a class="source-link daily-video-open-link" data-daily-video-action="open" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer" aria-label="打开视频页：${escapeHtml(video.title)}">打开视频页</a>`
    : '<span class="source-link daily-video-open-link is-disabled" aria-disabled="true">视频链接待补</span>';
  const urlControl = videoUrl
    ? `<a href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(compactExternalUrl(videoUrl))}</a>`
    : '<span>等待同步脚本补充链接</span>';
  return `
    <article class="card daily-video-card" data-daily-video-id="${escapeHtml(video.id)}">
      <div class="daily-video-topline">
        <span class="card-kicker">${escapeHtml(video.platform)} · ${escapeHtml(video.difficulty ?? 'intermediate')}</span>
        <span class="daily-video-status">${escapeHtml(status)}</span>
      </div>
      <h3>${escapeHtml(video.title)}</h3>
      <p class="english-title">${escapeHtml(video.creator ?? 'Unknown creator')} · ${escapeHtml(published)}${escapeHtml(duration)}</p>
      <p>${escapeHtml(video.learningNoteZh)}</p>
      <section class="daily-practice-note">
        <h4>今日练习</h4>
        <p>${escapeHtml(video.practicePromptZh)}</p>
      </section>
      <div class="badges daily-video-tags">${badgeList(video.tags)}</div>
      <p class="daily-video-url"><span>视频页</span>${urlControl}</p>
      <div class="daily-video-actions">
        ${openControl}
        <button class="secondary-button" type="button" data-daily-video-action="practice" data-daily-video-practice="${escapeHtml(video.id)}">推到 Sound Lab</button>
      </div>
    </article>
  `;
}

export function renderKnowledgeCard(card, sources) {
  const source = findSource(sources, card.sourceId);
  return `
    <article class="card knowledge-card">
      <div class="card-kicker">${escapeHtml(card.difficulty)} · ${badgeList(card.tags)}</div>
      <h3>${escapeHtml(card.titleZh)}</h3>
      <p class="english-title">${escapeHtml(card.titleEn)}</p>
      <section>
        <h4>原理</h4>
        <p>${escapeHtml(card.principleZh)}</p>
      </section>
      <section>
        <h4>合成器操作</h4>
        ${renderSynthMappings(card.synthMappings)}
      </section>
      <section>
        <h4>来源</h4>
        <p>${escapeHtml(source?.title ?? '未知来源')} · ${escapeHtml(card.evidence.timecode)}</p>
        <p class="muted">${escapeHtml(card.evidence.summaryZh)}</p>
      </section>
    </article>
  `;
}

export function renderRecipeCard(recipe) {
  return `
    <article class="card recipe-card">
      <div class="card-kicker">${escapeHtml(recipe.difficulty)} · ${badgeList(recipe.methodTags)}</div>
      <h3>${escapeHtml(recipe.titleZh)}</h3>
      <p class="english-title">${escapeHtml(recipe.titleEn)}</p>
      <p>${escapeHtml(recipe.goalZh)}</p>
      <section>
        <h4>合成器操作</h4>
        ${renderSynthMappings(recipe.synthMappings)}
      </section>
      <section>
        <h4>REAPER</h4>
        <ol>${listItems(recipe.reaperSteps)}</ol>
      </section>
      <section>
        <h4>验收</h4>
        <ul>${listItems(recipe.acceptanceChecks)}</ul>
      </section>
    </article>
  `;
}

export function renderLessonCard(lesson, index) {
  const number = String(index + 1).padStart(2, '0');
  return `
    <article class="card lesson-card">
      <div class="lesson-number">${number}</div>
      <div>
        <div class="card-kicker">${escapeHtml(lesson.stage)} · ${escapeHtml(lesson.difficulty)}</div>
        <h3>${escapeHtml(lesson.titleZh)}</h3>
        <p>${escapeHtml(lesson.focusZh)}</p>
        <p><strong>产出：</strong>${escapeHtml(lesson.outputZh)}</p>
        <div class="badges">${badgeList(lesson.tags)}</div>
      </div>
    </article>
  `;
}

function findDiagram(diagrams, diagramId) {
  return diagrams.find((diagram) => diagram.id === diagramId);
}

export function renderPrincipleDiagram(diagram) {
  return `
    <article class="card diagram-card">
      <div class="card-kicker">原理图 · ${badgeList(diagram.labels)}</div>
      <h3>${escapeHtml(diagram.titleZh)}</h3>
      <div class="diagram-frame">${diagram.svg}</div>
      <p>${escapeHtml(diagram.captionZh)}</p>
    </article>
  `;
}

export function renderLearningUnitCard(unit, diagrams, index) {
  const number = String(index + 1).padStart(2, '0');
  const linkedDiagrams = unit.diagramIds
    .map((diagramId) => findDiagram(diagrams, diagramId))
    .filter(Boolean);
  return `
    <article class="card learning-unit-card">
      <div class="unit-header">
        <span class="lesson-number">${number}</span>
        <div>
          <div class="card-kicker">${escapeHtml(unit.stageZh)} · ${escapeHtml(unit.level)}</div>
          <h3>${escapeHtml(unit.titleZh)}</h3>
          <p>${escapeHtml(unit.conceptZh)}</p>
        </div>
      </div>
      <section>
        <h4>为什么学</h4>
        <p>${escapeHtml(unit.whyZh)}</p>
      </section>
      <section class="unit-diagrams">
        ${linkedDiagrams.map((diagram) => `
          <figure class="mini-diagram">
            <div>${diagram.svg}</div>
            <figcaption>${escapeHtml(diagram.titleZh)}</figcaption>
          </figure>
        `).join('')}
      </section>
      <section>
        <h4>学习步骤</h4>
        <ol>${listItems(unit.steps)}</ol>
      </section>
      <section>
        <h4>REAPER 练习</h4>
        <ol>${listItems(unit.reaperPractice)}</ol>
      </section>
      <section>
        <h4>验收</h4>
        <ul>${listItems(unit.acceptanceChecks)}</ul>
      </section>
      <div class="badges">${badgeList(unit.synthFocus)}</div>
    </article>
  `;
}

export function renderInteractiveLab(lab, visualModel, linkedUnits = [], state = {}, audioOptions = {}) {
  const waveforms = audioOptions.waveforms ?? [];
  const activeWaveform = audioOptions.activeWaveform ?? waveforms[0]?.id ?? 'sine';
  const isAuditioning = Boolean(audioOptions.isAuditioning);

  return `
    <article
      class="interactive-lab-card card ${isAuditioning ? 'is-auditioning' : ''}"
      data-active-lab="${escapeHtml(lab.id)}"
      data-active-waveform="${escapeHtml(activeWaveform)}"
      data-auditioning="${isAuditioning ? 'true' : 'false'}"
    >
      <div class="card-kicker">互动实验 · ${escapeHtml(lab.visualType)}</div>
      <header class="lab-heading">
        <div>
          <h3>${escapeHtml(lab.titleZh)}</h3>
          <p>${escapeHtml(lab.objectiveZh)}</p>
        </div>
        <p class="lab-goal">${escapeHtml(lab.soundGoalZh)}</p>
      </header>
      ${waveforms.length ? renderAudioPanel({ waveforms, activeWaveform, isAuditioning }) : ''}
      ${renderMacroModPanel(lab, visualModel)}
      <section class="lab-workbench">
        <div class="lab-visual-frame">
          ${renderLabVisual(visualModel)}
        </div>
        <div class="lab-controls" aria-label="互动实验控制">
          ${lab.controls.map((control) => {
            const value = state[control.id] ?? control.defaultValue;
            const rangePercent = rangeValuePercent(control, value);
            return `
              <label class="lab-control">
                <span>
                  <strong>${escapeHtml(control.labelZh)}</strong>
                  <output>${escapeHtml(value)}${escapeHtml(control.unit)}</output>
                </span>
                <span class="range-shell" style="--range-value: ${formatNumber(rangePercent)}%">
                  <input
                    type="range"
                    data-lab-control="${escapeHtml(control.id)}"
                    data-control-unit="${escapeHtml(control.unit)}"
                    min="${escapeHtml(control.min)}"
                    max="${escapeHtml(control.max)}"
                    step="${escapeHtml(control.step)}"
                    value="${escapeHtml(value)}"
                  />
                </span>
              </label>
            `;
          }).join('')}
          <div class="lab-presets">
            ${lab.presets.map((preset) => `
              <button class="preset-button" type="button" data-lab-preset="${escapeHtml(preset.id)}">${escapeHtml(preset.labelZh)}</button>
            `).join('')}
          </div>
        </div>
      </section>
      <section class="lab-explanations">
        <h4>参数正在说明什么</h4>
        <ul>
          ${visualModel.activeExplanations.map((item) => `
            <li><strong>${escapeHtml(item.labelZh)} ${escapeHtml(item.value)}${escapeHtml(item.unit)}</strong>：${escapeHtml(item.explanationZh)}</li>
          `).join('')}
        </ul>
      </section>
      <section class="lab-walkthrough">
        <h4>操作步骤</h4>
        <ol>${listItems(lab.walkthroughSteps)}</ol>
      </section>
      <section>
        <h4>Serum / Phase Plant / Vital 复刻</h4>
        ${renderSynthMappings(lab.synthMappings)}
      </section>
      <section class="lab-linked-units">
        <h4>接着学习</h4>
        <ol>
          ${linkedUnits.map((unit) => `<li>${escapeHtml(unit.titleZh)}</li>`).join('')}
        </ol>
      </section>
      <section>
        <h4>REAPER 练习</h4>
        <ol>${listItems(lab.reaperChecklist)}</ol>
      </section>
    </article>
  `;
}

function renderSourceEvidence(sourceIds = [], sources = []) {
  return sourceIds.map((sourceId) => {
    const source = findSource(sources, sourceId);
    if (!source) return `<span class="badge">${escapeHtml(sourceId)}</span>`;
    return `<a class="source-pill" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.platform)} · ${escapeHtml(source.credibility)}</a>`;
  }).join('');
}

export function renderMicroTrackPanel(track, isActive = false, index = 0) {
  return `
    <button
      class="micro-track-button ${isActive ? 'is-active' : ''}"
      type="button"
      data-micro-track-id="${escapeHtml(track.id)}"
    >
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${escapeHtml(track.titleZh)}</strong>
      <small>${escapeHtml(track.lessonIds.length)} 节 · ${escapeHtml(track.interactionType)}</small>
    </button>
  `;
}

export function renderMicroLessonCard(lesson, sources = [], index = 0) {
  return `
    <article class="card micro-lesson-card" data-micro-lesson-id="${escapeHtml(lesson.id)}">
      <div class="unit-header">
        <span class="lesson-number">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <div class="card-kicker">微课 · ${escapeHtml(lesson.difficulty)} · ${escapeHtml(lesson.interactionType)}</div>
          <h3>${escapeHtml(lesson.titleZh)}</h3>
          <p>${escapeHtml(lesson.principleZh)}</p>
        </div>
      </div>
      <section>
        <h4>学习步骤</h4>
        <ol>${listItems(lesson.steps)}</ol>
      </section>
      <section>
        <h4>声音练习</h4>
        <p>${escapeHtml(lesson.soundExerciseZh)}</p>
        <p class="micro-practice-prompt">${escapeHtml(lesson.practicePromptZh)}</p>
        <ol>${listItems(lesson.reaperPractice)}</ol>
      </section>
      <section class="micro-detail-grid">
        <div>
          <h4>听辨提示</h4>
          <ul>${listItems(lesson.earCues)}</ul>
        </div>
        <div>
          <h4>参数落点</h4>
          <ul>${listItems(lesson.parameterTargets)}</ul>
        </div>
        <div>
          <h4>常见误区</h4>
          <ul>${listItems(lesson.commonMistakes)}</ul>
        </div>
      </section>
      <section>
        <h4>Serum / Phase Plant / Vital</h4>
        ${renderSynthMappings(lesson.synthMappings)}
      </section>
      <section>
        <h4>验收</h4>
        <ul>${listItems(lesson.acceptanceChecks)}</ul>
      </section>
      <section>
        <h4>来源依据</h4>
        <div class="source-evidence">${renderSourceEvidence(lesson.sourceIds, sources)}</div>
      </section>
    </article>
  `;
}

export function renderTechniqueTipCard(tip, sources = []) {
  return `
    <article class="card technique-card" data-technique-id="${escapeHtml(tip.id)}">
      <div class="card-kicker">${escapeHtml(tip.categoryZh)} · ${escapeHtml(tip.difficulty)} · ${badgeList(tip.tags)}</div>
      <header class="technique-heading">
        <div>
          <h3>${escapeHtml(tip.titleZh)}</h3>
          <p>${escapeHtml(tip.whenToUseZh)}</p>
        </div>
        <span class="technique-chip">${escapeHtml(tip.quickDrillZh)}</span>
      </header>
      <section>
        <h4>技巧原理</h4>
        <p>${escapeHtml(tip.principleZh)}</p>
      </section>
      <section>
        <h4>效果链顺序</h4>
        <ol class="technique-chain">${listItems(tip.chainOrder)}</ol>
      </section>
      <section class="technique-validation">
        <h4>正确度验证</h4>
        <p><strong>依据：</strong>${escapeHtml(tip.verification.basisZh)}</p>
        <p class="source-reliability">${escapeHtml(tip.verification.sourceReliabilityZh)}</p>
        <div class="technique-validation-grid">
          <div>
            <h5>听感检查</h5>
            <ul>${listItems(tip.verification.listeningChecks)}</ul>
          </div>
          <div>
            <h5>参数边界</h5>
            <ul>${listItems(tip.verification.parameterBoundaries)}</ul>
          </div>
        </div>
      </section>
      <section>
        <h4>Serum / Phase Plant / Vital</h4>
        ${renderSynthMappings(tip.synthMappings)}
      </section>
      <section>
        <h4>REAPER</h4>
        <ol>${listItems(tip.reaperSteps)}</ol>
      </section>
      <section>
        <h4>常见误区</h4>
        <ul>${listItems(tip.commonMistakes)}</ul>
      </section>
      <section>
        <h4>来源依据</h4>
        <div class="source-evidence">${renderSourceEvidence(tip.sourceIds, sources)}</div>
      </section>
    </article>
  `;
}

function renderCommunityControl(control, value) {
  const current = Number(value ?? control.default ?? control.min ?? 0);
  const min = Number(control.min ?? 0);
  const max = Number(control.max ?? 100);
  const percent = ((current - min) / Math.max(1, max - min)) * 100;
  return `
    <label class="community-control">
      <span><strong>${escapeHtml(control.labelZh)}</strong><output>${escapeHtml(current)}${escapeHtml(control.unit ?? '')}</output></span>
      <small>${escapeHtml(control.descriptionZh)}</small>
      <span class="range-shell" style="--range-value: ${formatNumber(percent)}%">
        <input type="range" data-community-control="${escapeHtml(control.id)}" min="${escapeHtml(min)}" max="${escapeHtml(max)}" step="1" value="${escapeHtml(current)}" />
      </span>
    </label>
  `;
}

function renderCommunitySteps(steps = []) {
  return steps.map((step, index) => `
    <li>
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div>
        <strong>${escapeHtml(step.titleZh)}</strong>
        <p>${escapeHtml(step.detailZh)}</p>
        <small>${escapeHtml(step.whyZh)}</small>
      </div>
    </li>
  `).join('');
}

function renderCommunityModuleGuide(lab = {}) {
  const steps = lab.moduleGuideSteps ?? [
    '先看观看任务，明确应该观察什么。',
    '再看调制蓝图，把教程动作转成可操作路由。',
    '切换三合成器路径图，选择你要复刻的软件。',
    '点场景练习并加载 Sound Lab 试听。',
  ];
  return `
    <section class="community-module-guide" aria-label="这个模块怎么用">
      <div>
        <h4>这个模块怎么用</h4>
        <p>按这个顺序走，避免在文字、参数和试听之间来回迷路。</p>
      </div>
      <ol>
        ${steps.map((step, index) => `
          <li>
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(step)}</strong>
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function renderCommunityBlueprint(lab) {
  const fallbackRows = Object.entries(lab.interactiveMappings ?? {}).slice(0, 5).map(([source, moves]) => ({
    source,
    target: String(moves?.[0] ?? 'macro target'),
    result: String(moves?.[1] ?? '听感变化'),
  }));
  const rows = lab.modulationBlueprint ?? fallbackRows;
  if (!rows.length) return '';
  return `
    <section class="community-blueprint-panel" aria-label="调制蓝图">
      <div>
        <h4>调制蓝图</h4>
        <p>把“看教程”转成可操作路由：控制源 → 合成器目标 → 你应该听到的变化。</p>
      </div>
      <div class="community-blueprint-grid">
        ${rows.map((row, index) => `
          <div class="community-blueprint-row">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(row.source)}</strong>
            <i aria-hidden="true"></i>
            <b>${escapeHtml(row.target)}</b>
            <small>${escapeHtml(row.result)}</small>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function getCommunitySynthSignalFlow(lab = {}, activeSynth = 'serum') {
  const mappings = lab.synthParameterSteps ?? lab.synthMappings ?? {};
  const fallback = (mappings[activeSynth] ?? []).slice(0, 4).map((step) => step.split('；')[0]);
  const flow = lab.synthSignalFlow?.[activeSynth] ?? fallback;
  return flow.length ? flow.slice(0, 5) : ['声源', '调制源', '效果链', '听感检查'];
}

function renderCommunitySynthRouteMap(lab = {}, activeSynth = 'serum') {
  const synthOrder = [
    ['serum', 'Serum 2'],
    ['phasePlant', 'Phase Plant'],
    ['vital', 'Vital'],
  ];
  const activeKey = synthOrder.some(([key]) => key === activeSynth) ? activeSynth : 'serum';
  const activeLabel = synthOrder.find(([key]) => key === activeKey)?.[1] ?? 'Serum 2';
  const route = getCommunitySynthSignalFlow(lab, activeKey);
  return `
    <section class="community-synth-route-map" aria-label="合成器路径图">
      <div class="community-route-head">
        <div>
          <h4>合成器路径图</h4>
          <p>先选你要复刻的软件，再按节点从左到右搭 patch。当前：${escapeHtml(activeLabel)}</p>
        </div>
        <div class="community-route-tabs" role="group" aria-label="选择合成器路径">
          ${synthOrder.map(([key, label]) => `
            <button class="${key === activeKey ? 'is-active' : ''}" type="button" data-community-synth-route="${escapeHtml(key)}" aria-pressed="${key === activeKey ? 'true' : 'false'}">
              ${escapeHtml(label)}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="community-route-lane">
        ${route.map((node, index) => `
          <div class="community-route-node">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(node)}</strong>
          </div>
          ${index < route.length - 1 ? '<i aria-hidden="true"></i>' : ''}
        `).join('')}
      </div>
    </section>
  `;
}

function getCommunityParameterCards(lab = {}, activeSynth = 'serum') {
  const fallbackBySynth = {
    serum: [
      ['01 声源', 'Osc A / B / Sub / Noise', '先做 dry 主体，再分配 Macro 或 LFO。', '调制深度从 10%-35% 起步。', '关闭 FX 后仍能听出主体。'],
      ['02 调制', 'Matrix / Macro / LFO', '把一个控制源映射到 filter、WT Pos、pitch 或 FM。', '一次只推一个听感问题。', '变化应该是材质或运动，不只是音量变化。'],
      ['03 效果', 'FX Rack / post filter', '失真、短延迟、滤波和空间按角色排列。', 'drive 后必须整理高频刺点。', '更大但不糊，主体不丢。'],
      ['04 导出', 'Preset note + REAPER render', '记录宏值并导 dry / full / tail。', '响度匹配后比较。', '版本之间功能清楚。'],
    ],
    phasePlant: [
      ['01 分组', 'Generator Group', '按 body / edge / tail 建组。', '每组先 solo，留足 headroom。', '不用 FX 也能分清角色。'],
      ['02 调制', 'LFO / Curve / Remap', '拖到 pitch、filter、gain 或 snapin 参数。', '用 Remap 限制过大范围。', '运动跟声音功能一致。'],
      ['03 Snapin', 'Group lane / global lane', '组内先塑材质，全局再整理响度。', 'feedback 和 drive 少量起步。', '更硬或更大，但不破坏分组。'],
      ['04 变体', 'Macro + REAPER naming', '导 low / medium / high 三档。', '每个宏只命名一个职责。', '像同一家族的三个变体。'],
    ],
    vital: [
      ['01 主体', 'Osc / Noise / WT Frame', '先固定 frame 和 root，再加 warp。', 'noise 高通后低混入。', '波形可视反馈和听感一致。'],
      ['02 调制', 'LFO / MSEG / Random', '拖到 frame、cutoff、pitch 或 warp。', '慢调制 0.05-0.4Hz 起步。', '运动可感但不晕。'],
      ['03 FX', 'Warp / Filter / Distortion', '先做身份，再用 filter 整理。', 'distortion 后收刺点。', '中心音或暗度没有被吞掉。'],
      ['04 循环', 'Envelope / loop / tail render', '检查循环点和尾巴低频。', 'tail-only 低频要清理。', '循环三遍没有 click。'],
    ],
  };
  const cards = lab.synthDialPlan?.[activeSynth];
  if (cards?.length) return cards.slice(0, 6);
  return (fallbackBySynth[activeSynth] ?? fallbackBySynth.serum).map(([stageZh, whereZh, targetZh, rangeZh, listenZh]) => ({
    stageZh,
    whereZh,
    targetZh,
    rangeZh,
    listenZh,
  }));
}

function renderCommunityParameterTranslator(lab = {}, activeSynth = 'serum') {
  const synthLabels = {
    serum: 'Serum 2',
    phasePlant: 'Phase Plant',
    vital: 'Vital',
  };
  const activeLabel = synthLabels[activeSynth] ?? 'Serum 2';
  const cards = getCommunityParameterCards(lab, activeSynth);
  return `
    <section class="community-parameter-translator" aria-label="参数翻译台">
      <div class="community-parameter-head">
        <div>
          <h4>参数翻译台</h4>
          <p>当前：${escapeHtml(activeLabel)}。把视频技巧翻译成“在哪里调、调什么、范围多大、听什么”。</p>
        </div>
        <span>不要逐帧抄参数，先复刻可听逻辑</span>
      </div>
      <div class="community-parameter-grid">
        ${cards.map((card, index) => `
          <article data-community-parameter-card="${escapeHtml(String(index + 1).padStart(2, '0'))}">
            <span>${escapeHtml(card.stageZh)}</span>
            <strong>${escapeHtml(card.whereZh)}</strong>
            <p>${escapeHtml(card.targetZh)}</p>
            <div class="parameter-action-list">
              <b>操作步骤 · 一步一步复刻</b>
              <ol>
                ${(card.actions ?? []).map((action) => `<li>${escapeHtml(action)}</li>`).join('')}
              </ol>
            </div>
            <dl>
              <div>
                <dt>建议范围</dt>
                <dd>${escapeHtml(card.rangeZh)}</dd>
              </div>
              <div>
                <dt>听感检查</dt>
                <dd>${escapeHtml(card.listenZh)}</dd>
              </div>
            </dl>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderCommunitySynthProcedure(lab = {}, activeSynth = 'serum') {
  const mappings = lab.synthParameterSteps ?? lab.synthMappings ?? {};
  const synthOrder = [
    ['serum', 'Serum 2'],
    ['phasePlant', 'Phase Plant'],
    ['vital', 'Vital'],
  ];
  return `
    <section class="community-synth-procedure" aria-label="三合成器参数步骤">
      <div class="community-procedure-head">
        <h4>三合成器参数步骤</h4>
        <p>同一个技巧分别落到 Serum 2、Phase Plant、Vital。照顺序做，先听干声，再打开调制和 FX。</p>
      </div>
      <div class="community-synth-procedure-grid">
        ${synthOrder.map(([key, label]) => {
          const steps = mappings[key] ?? [];
          return `
            <article>
              <strong>${escapeHtml(label)}</strong>
              <ol>
                ${steps.slice(0, 5).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
              </ol>
            </article>
          `;
        }).join('')}
      </div>
      ${renderCommunitySynthRouteMap(lab, activeSynth)}
      ${renderCommunityParameterTranslator(lab, activeSynth)}
    </section>
  `;
}

function getCommunityFocusPresets(lab) {
  if (lab.focusPresets?.length) return lab.focusPresets;
  const controls = lab.controls ?? [];
  const base = Object.fromEntries(controls.map((control) => [control.id, Number(control.default ?? 50)]));
  const clamp = (control, value) => Math.max(Number(control.min ?? 0), Math.min(Number(control.max ?? 100), Number(value)));
  const withValues = (rules) => Object.fromEntries(controls.map((control, index) => {
    const rule = rules.find((item) => item.ids?.includes(control.id) || item.index === index);
    return [control.id, clamp(control, rule ? rule.value : base[control.id])];
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

function renderCommunityFocusPresets(lab) {
  const presets = getCommunityFocusPresets(lab);
  if (!presets.length) return '';
  return `
    <div class="community-focus-presets" aria-label="快速听感预设">
      ${presets.map((preset) => `
        <button type="button" data-community-focus-preset="${escapeHtml(preset.id)}">
          <strong>${escapeHtml(preset.labelZh)}</strong>
          <span>${escapeHtml(preset.goalZh)}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function getCommunityPracticeScenes(lab) {
  if (lab.practiceScenes?.length) return lab.practiceScenes;
  const presets = getCommunityFocusPresets(lab);
  return [
    {
      id: 'scene-core',
      labelZh: '先听核心',
      intentZh: '把 Sound Lab 推到最少层数，只判断 dry/body 是否成立。',
      listenForZh: '此时应该能听清主体、触点或低频锚点；如果核心不成立，先别加空间和失真。',
      values: presets[0]?.values ?? {},
    },
    {
      id: 'scene-modulation',
      labelZh: '放大调制',
      intentZh: '只推运动、材质或音程，让变化变得容易听见。',
      listenForZh: '注意参数变化是不是带来身份、方向或材质，而不是单纯更响或更刺。',
      values: presets[1]?.values ?? {},
    },
    {
      id: 'scene-delivery',
      labelZh: '完整交付',
      intentZh: '打开 tail、空间和后级整理，检查 dry/full/tail 的关系。',
      listenForZh: '完整版本应该更有尺寸，但起音、主体和低频中心不能被尾巴盖住。',
      values: presets[2]?.values ?? {},
    },
  ];
}

function renderCommunityPracticeScenes(lab) {
  const scenes = getCommunityPracticeScenes(lab);
  if (!scenes.length) return '';
  return `
    <section class="community-practice-scenes" aria-label="场景练习">
      <div>
        <h4>场景练习</h4>
        <p>按顺序点：先确认核心，再放大调制，最后听完整交付。每个按钮都会把下方参数推到对应练习状态。</p>
      </div>
      <div class="community-practice-scene-grid">
        ${scenes.map((scene, index) => `
          <button type="button" data-community-practice-scene="${escapeHtml(scene.id)}">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(scene.labelZh)}</strong>
            <small>${escapeHtml(scene.intentZh)}</small>
            <em>${escapeHtml(scene.listenForZh)}</em>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderCommunityTechniqueLab(lab, sources = [], options = {}) {
  const controlValues = options.controlValues ?? {};
  const activeClass = options.isActive ? 'is-active' : '';
  const mappingRows = Object.entries(lab.interactiveMappings ?? {}).map(([key, moves]) => `
    <div>
      <strong>${escapeHtml(key)}</strong>
      <ul>${listItems(moves)}</ul>
    </div>
  `).join('');

  return `
    <article class="card community-technique-card ${activeClass}" data-community-technique="${escapeHtml(lab.id)}">
      <div class="card-kicker">非官方博主技巧 · ${escapeHtml(lab.platformFocusZh)} · ${escapeHtml(lab.difficulty)} · ${badgeList(lab.tags)}</div>
      <header class="community-technique-heading">
        <div>
          <h3>${escapeHtml(lab.titleZh)}</h3>
          <p>${escapeHtml(lab.principleZh)}</p>
        </div>
        <aside class="creator-source-pill">
          <span>Creator</span>
          <strong>${escapeHtml(lab.creatorZh)}</strong>
        </aside>
      </header>
      <section class="community-watch-task">
        <h4>观看任务</h4>
        <p>${escapeHtml(lab.watchTaskZh)}</p>
      </section>
      <section>
        <h4>详细方法</h4>
        <ol class="community-method-list">${renderCommunitySteps(lab.methodSteps)}</ol>
      </section>
      ${renderCommunityModuleGuide(lab)}
      ${renderCommunityBlueprint(lab)}
      ${renderCommunitySynthProcedure(lab, options.activeCommunitySynthRoute)}
      <section class="community-control-panel" aria-label="交互练习">
        <div>
          <h4>交互练习</h4>
          <p>调这些听感参数，再把配方加载到 Sound Lab 试听。这里调整的是网页练习配方，不会伪装成原视频的逐帧参数。</p>
        </div>
        ${renderCommunityPracticeScenes(lab)}
        ${renderCommunityFocusPresets(lab)}
        <div class="community-control-grid">
          ${(lab.controls ?? []).map((control) => renderCommunityControl(control, controlValues[control.id])).join('')}
        </div>
        <div class="community-mapping-grid">
          ${mappingRows}
        </div>
        <button class="primary-button community-load-button" type="button" data-community-load-soundlab="${escapeHtml(lab.id)}">加载到 Sound Lab</button>
      </section>
      <section>
        <h4>Serum / Phase Plant / Vital</h4>
        ${renderSynthMappings(lab.synthMappings)}
      </section>
      <section>
        <h4>REAPER</h4>
        <ol>${listItems(lab.reaperDrill)}</ol>
      </section>
      <section class="technique-validation">
        <h4>正确度验证</h4>
        <div class="technique-validation-grid">
          <div>
            <h5>听感检查</h5>
            <ul>${listItems(lab.verification?.listeningChecks)}</ul>
          </div>
          <div>
            <h5>参数边界</h5>
            <ul>${listItems(lab.verification?.parameterBoundaries)}</ul>
          </div>
        </div>
      </section>
      <section>
        <h4>常见误区</h4>
        <ul>${listItems(lab.commonMistakes)}</ul>
      </section>
      <section>
        <h4>来源依据</h4>
        <div class="source-evidence">${renderSourceEvidence(lab.sourceIds, sources)}</div>
      </section>
    </article>
  `;
}

function renderSignalFlow(flow = []) {
  return flow.map((step, index) => `
    <li>
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div>
        <strong>${escapeHtml(step.roleZh)}</strong>
        <p>${escapeHtml(step.actionZh)}</p>
        <small>${escapeHtml(step.reasonZh)}</small>
      </div>
    </li>
  `).join('');
}

function renderPracticeStages(stages = []) {
  return stages.map((stage) => `
    <div class="deep-practice-stage">
      <strong>${escapeHtml(stage.stageZh)}</strong>
      <p>${escapeHtml(stage.taskZh)}</p>
      <small>${escapeHtml(stage.outputZh)}</small>
    </div>
  `).join('');
}

export function renderDeepDiveModuleCard(module, sources = [], options = {}) {
  const isActive = Boolean(options.isActive);
  return `
    <article class="card deep-dive-card ${isActive ? 'is-active' : ''}" data-deep-module-card="${escapeHtml(module.id)}">
      <div class="card-kicker">深度解析 · ${escapeHtml(module.categoryZh)} · ${escapeHtml(module.difficulty)} · ${badgeList(module.tags)}</div>
      <header class="deep-dive-heading">
        <div>
          <h3>${escapeHtml(module.titleZh)}</h3>
          <p><strong>解析问题：</strong>${escapeHtml(module.analysisQuestionZh)}</p>
        </div>
        <div class="deep-module-meter" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
      </header>
      <section>
        <h4>核心原理</h4>
        <p>${escapeHtml(module.corePrincipleZh)}</p>
      </section>
      <section>
        <h4>信号链拆解</h4>
        <ol class="deep-signal-flow">${renderSignalFlow(module.signalFlow)}</ol>
      </section>
      <section class="deep-analysis-grid">
        <div>
          <h4>参数边界</h4>
          <ul>${listItems(module.parameterBoundaries)}</ul>
        </div>
        <div>
          <h4>听感测试</h4>
          <ul>${listItems(module.earTests)}</ul>
        </div>
      </section>
      <section>
        <h4>实践阶段</h4>
        <div class="deep-practice-grid">${renderPracticeStages(module.practiceStages)}</div>
      </section>
      <section>
        <h4>Serum / Phase Plant / Vital</h4>
        ${renderSynthMappings(module.synthMappings)}
      </section>
      <section class="deep-analysis-grid">
        <div>
          <h4>REAPER</h4>
          <ol>${listItems(module.reaperDrill)}</ol>
        </div>
        <div>
          <h4>实践交付</h4>
          <ul>${listItems(module.deliveryChecklist)}</ul>
        </div>
      </section>
      <section>
        <h4>故障诊断</h4>
        <ul class="deep-diagnostic-list">${listItems(module.failureDiagnostics)}</ul>
      </section>
      <section>
        <h4>来源依据</h4>
        <div class="source-evidence">${renderSourceEvidence(module.sourceIds, sources)}</div>
      </section>
    </article>
  `;
}

export function renderSoundChallenge(challenge, answerState = {}) {
  const result = answerState.result;
  return `
    <article class="card sound-challenge-card" data-active-challenge="${escapeHtml(challenge.id)}">
      <div class="card-kicker">声音挑战 · ${escapeHtml(challenge.type)}</div>
      <header class="challenge-heading">
        <div>
          <h3>${escapeHtml(challenge.titleZh)}</h3>
          <p>${escapeHtml(challenge.promptZh)}</p>
        </div>
        <div class="live-scope compact" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </header>
      <div class="challenge-audio-row">
        ${challenge.audioSlots.map((slot) => `
          <button class="challenge-play-button" type="button" data-challenge-play="${escapeHtml(slot.id)}">
            <span class="audition-dot" aria-hidden="true"></span>
            试听 ${escapeHtml(slot.labelZh)}
          </button>
        `).join('')}
      </div>
      <div class="challenge-options">
        ${challenge.options.map((option) => {
          const selected = answerState.selectedAnswerId === option.id;
          return `
            <button
              class="challenge-answer-button ${selected ? 'is-selected' : ''}"
              type="button"
              data-challenge-answer="${escapeHtml(option.id)}"
            >
              ${escapeHtml(option.labelZh)}
            </button>
          `;
        }).join('')}
      </div>
      ${result ? `
        <div class="challenge-result ${result.correct ? 'is-correct' : 'is-wrong'}">
          <strong>${result.correct ? '答对' : '再听一次'}</strong>
          <p>${escapeHtml(result.explanationZh)}</p>
        </div>
      ` : ''}
    </article>
  `;
}

function renderMaterialVisual(model) {
  const polygon = pointList(model.polygonPoints);
  return `
    <svg class="lab-svg lab-svg-material" viewBox="0 0 412 284" role="img" aria-label="Material parameter radar">
      <circle cx="206" cy="140" r="46" class="svg-radar-ring" />
      <circle cx="206" cy="140" r="92" class="svg-radar-ring" />
      <circle cx="206" cy="140" r="140" class="svg-radar-ring" />
      ${model.axes.map((axis) => `
        <line x1="206" y1="140" x2="${formatNumber(axis.endX)}" y2="${formatNumber(axis.endY)}" class="svg-axis" />
        <text x="${formatNumber(axis.endX)}" y="${formatNumber(axis.endY)}" class="svg-label">${escapeHtml(axis.labelZh.split(' ')[0])}</text>
      `).join('')}
      <polygon class="svg-radar-shape material-shape" data-visual-path="${escapeHtml(polygon)}" points="${escapeHtml(polygon)}" />
    </svg>
  `;
}

export function renderMaterialLab(material, visualModel, state = {}, options = {}) {
  const isPlaying = Boolean(options.isPlaying);
  return `
    <article class="card material-lab-card ${isPlaying ? 'is-playing' : ''}" data-active-material="${escapeHtml(material.id)}">
      <div class="card-kicker">材质实验 · ${escapeHtml(material.titleEn)}</div>
      <header class="lab-heading">
        <div>
          <h3>${escapeHtml(material.titleZh)}</h3>
          <p>${escapeHtml(material.principleZh)}</p>
        </div>
        <div class="material-audio-cluster">
          <button class="audition-button ${isPlaying ? 'is-playing' : ''}" type="button" data-material-play>
            <span class="audition-dot" aria-hidden="true"></span>
            材质试听
          </button>
          <div class="live-scope compact" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </header>
      <section class="material-workbench">
        <div class="lab-visual-frame">
          ${renderMaterialVisual(visualModel)}
        </div>
        <div class="lab-controls">
          ${material.controls.map((control) => {
            const value = state[control.id] ?? control.defaultValue;
            const rangePercent = rangeValuePercent(control, value);
            return `
              <label class="lab-control">
                <span>
                  <strong>${escapeHtml(control.labelZh)}</strong>
                  <output>${escapeHtml(value)}${escapeHtml(control.unit)}</output>
                </span>
                <span class="range-shell" style="--range-value: ${formatNumber(rangePercent)}%">
                  <input
                    type="range"
                    data-material-control="${escapeHtml(control.id)}"
                    data-control-unit="${escapeHtml(control.unit)}"
                    min="${escapeHtml(control.min)}"
                    max="${escapeHtml(control.max)}"
                    step="${escapeHtml(control.step)}"
                    value="${escapeHtml(value)}"
                  />
                </span>
              </label>
            `;
          }).join('')}
          <div class="lab-presets">
            ${material.presets.map((preset) => `
              <button class="preset-button" type="button" data-material-preset="${escapeHtml(preset.id)}">${escapeHtml(preset.labelZh)}</button>
            `).join('')}
          </div>
        </div>
      </section>
      <section class="lab-explanations">
        <h4>参数听感</h4>
        <ul>
          ${visualModel.activeExplanations.map((item) => `
            <li><strong>${escapeHtml(item.labelZh)} ${escapeHtml(item.value)}${escapeHtml(item.unit)}</strong>：${escapeHtml(item.explanationZh)}</li>
          `).join('')}
        </ul>
      </section>
      <section>
        <h4>Serum / Phase Plant / Vital 复刻</h4>
        ${renderSynthMappings(material.synthMappings)}
      </section>
      <section>
        <h4>REAPER 交付</h4>
        <ol>${listItems(material.reaperChecklist)}</ol>
      </section>
    </article>
  `;
}


function renderSoundLabDnaControls(model = {}) {
  const patch = model.patch ?? {};
  const activeDnaId = patch.presetDna?.id ?? '';
  const dnaCards = (model.presetDnaOptions ?? []).map((dna) => {
    const shapes = (dna.parameters?.oscillators ?? []).map((osc) => osc.shape).join(' + ');
    return '<button class="dna-card ' + (dna.id === activeDnaId ? 'is-active' : '') + '" type="button" data-sound-lab-dna="' + escapeHtml(dna.id) + '">' +
      '<strong>' + escapeHtml(dna.titleZh) + '</strong>' +
      '<small>' + escapeHtml(dna.source?.name ?? '') + '</small>' +
      '<span>' + escapeHtml(shapes) + '</span>' +
    '</button>';
  }).join('');
  const qualityButtons = (model.qualityModes ?? []).map((mode) => '<button class="quality-mode-button ' + (mode.id === patch.qualityMode ? 'is-active' : '') + '" type="button" data-sound-lab-quality="' + escapeHtml(mode.id) + '"><strong>' + escapeHtml(mode.labelZh) + '</strong><span>' + escapeHtml(mode.noteZh) + '</span></button>').join('');
  const layerControls = (model.layerMixer ?? []).map((layer) => '<label class="lab-control layer-control"><span><strong>' + escapeHtml(layer.labelZh) + '</strong><output>' + escapeHtml(layer.value) + '%</output></span><small>' + escapeHtml(layer.activeEngines.join(' / ')) + '</small><span class="range-shell" style="--range-value: ' + formatNumber(layer.percent) + '%"><input type="range" data-sound-lab-layer="' + escapeHtml(layer.id) + '" data-control-unit="%" min="0" max="100" step="1" value="' + escapeHtml(layer.value) + '" /></span></label>').join('');
  const drawer = model.sourceDrawer ?? {};
  return '<section class="sound-lab-dna-panel" aria-label="Preset DNA">' +
    '<div class="panel-heading-row"><div><h4>Preset DNA</h4><p>Free/public preset observations translated into playable layer recipes.</p></div><span>' + escapeHtml(patch.presetDna?.titleEn ?? '') + '</span></div>' +
    '<div class="dna-card-grid">' + dnaCards + '</div>' +
    '</section>' +
    '<section class="sound-lab-control-console"><div class="quality-mode-panel" aria-label="Quality Mode"><h4>Quality Mode</h4><div class="quality-mode-row">' + qualityButtons + '</div></div>' +
    '<div class="layer-mixer-panel" aria-label="Layer Mixer"><h4>Layer Mixer</h4>' + layerControls + '</div></section>' +
    '<section class="sound-lab-source-drawer" data-sound-lab-source-drawer><div><h4>Source & License</h4><p>' + escapeHtml(drawer.extractionZh ?? '') + '</p><p><strong>License:</strong> ' + escapeHtml(drawer.licenseLabel ?? '') + '</p></div>' +
    '<a class="source-link" href="' + escapeHtml(drawer.sourceUrl ?? '#') + '" target="_blank" rel="noreferrer">Open Source</a></section>';
}

function renderPerformanceFeelPanel(model = {}) {
  const feel = model.performanceFeel ?? {};
  const controls = (feel.controls ?? []).map((control) => {
    const meter = control.id === 'microTiming'
      ? Math.min(100, Number(control.value ?? 0) * 7)
      : control.id === 'pitchDrift'
        ? Math.min(100, Number(control.value ?? 0) * 6)
        : Math.min(100, Number(control.value ?? 0));
    return '<div class="performance-feel-meter" style="--feel-meter:' + formatNumber(meter) + '%">' +
      '<span><strong>' + escapeHtml(control.labelZh) + '</strong><em>' + escapeHtml(control.value) + escapeHtml(control.unit) + '</em></span>' +
      '<i aria-hidden="true"></i>' +
      '<small>' + escapeHtml(control.noteZh) + '</small>' +
    '</div>';
  }).join('');
  const pattern = (feel.triggerPattern ?? []).map((hit) => '<li><strong>' + escapeHtml(hit.velocity) + '</strong><span>' + escapeHtml(hit.labelZh) + '</span></li>').join('');

  return '<div class="performance-feel-panel" aria-label="Performance Feel 演奏手感">' +
    '<div class="performance-feel-head"><div><h4>Performance Feel / 演奏手感</h4><p>' + escapeHtml(feel.beginnerZh ?? '用力度、微漂移和空间响应把静态按钮声音变成真实可演奏的合成器音效。') + '</p></div><span>' + escapeHtml(feel.mode ?? 'tight') + '</span></div>' +
    '<div class="performance-feel-actions">' +
      '<button class="secondary-button" type="button" data-performance-feel-play="gesture">三连试听</button>' +
      '<button class="ghost-button" type="button" data-performance-feel-apply="tight">Tight</button>' +
      '<button class="ghost-button" type="button" data-performance-feel-apply="expressive">Expressive</button>' +
    '</div>' +
    '<div class="performance-feel-meter-grid">' + controls + '</div>' +
    '<ol class="performance-feel-pattern">' + pattern + '</ol>' +
    '<div class="performance-feel-notes">' +
      '<p><strong>Serum</strong>：Velocity -> amp/filter/drive，Chaos/Random 只推微量 pitch 或 wavetable position。</p>' +
      '<p><strong>Phase Plant</strong>：Velocity + Random modulator 控 generator gain、filter cutoff 和 lane width。</p>' +
      '<p><strong>Vital</strong>：Velocity 控 Env amount，Random 控 phase / spectral warp，小幅即可。</p>' +
      '<p><strong>REAPER</strong>：' + escapeHtml(feel.reaperZh ?? '用 velocity 三连 MIDI 做 A/B，响度匹配后判断手感。') + '</p>' +
    '</div>' +
    '</div>';
}

function renderSoundLabEngineControls(model = {}, options = {}) {
  const activeEngine = options.engineMode ?? model.activeEngineMode ?? model.patch?.engineMode ?? 'worklet';
  const engineUsed = options.engineUsed ?? activeEngine;
  const engineButtons = (model.engineModes ?? []).map((mode) => (
    '<button class="engine-mode-button ' + (mode.id === activeEngine ? 'is-active' : '') + '" type="button" data-sound-lab-engine="' + escapeHtml(mode.id) + '">' +
      '<strong>' + escapeHtml(mode.labelZh) + '</strong>' +
      '<span>' + escapeHtml(mode.noteZh) + '</span>' +
    '</button>'
  )).join('');
  const performanceControls = (model.performanceControls ?? []).map((control) => (
    '<label class="lab-control performance-control"><span><strong>' + escapeHtml(control.labelZh) + '</strong><output>' + escapeHtml(control.value) + escapeHtml(control.unit) + '</output></span>' +
      '<small>' + escapeHtml(control.value < (control.max + control.min) / 2 ? control.lowZh : control.highZh) + '</small>' +
      '<span class="range-shell" style="--range-value: ' + formatNumber(((control.value - control.min) / Math.max(1, control.max - control.min)) * 100) + '%">' +
        '<input type="range" data-performance-control="' + escapeHtml(control.id) + '" data-control-unit="' + escapeHtml(control.unit) + '" min="' + escapeHtml(control.min) + '" max="' + escapeHtml(control.max) + '" step="' + escapeHtml(control.step) + '" value="' + escapeHtml(control.value) + '" />' +
      '</span></label>'
  )).join('');
  const keys = (model.keyboardNotes ?? []).map((note) => '<button class="sound-lab-key ' + (note.isBlack ? 'is-black' : '') + '" type="button" data-sound-lab-key="' + escapeHtml(note.note) + '"><span>' + escapeHtml(note.label) + '</span></button>').join('');
  const fx = (model.fxRack ?? []).map((effect) => '<div class="fx-rack-item"><span>' + escapeHtml(effect.labelZh) + '</span><strong>' + formatNumber((effect.amount ?? 0) * 100) + '%</strong><i style="--meter:' + formatNumber((effect.amount ?? 0) * 100) + '%"></i></div>').join('');

  return '<section class="sound-lab-engine-panel">' +
    '<div class="panel-heading-row"><div><h4>HQ Engine</h4><p>Tone.js gives mature synth modules; native engines stay ready as fallback.</p></div><span>' + escapeHtml(engineUsed) + '</span></div>' +
    '<div class="engine-mode-row">' + engineButtons + '</div>' +
    '<div class="performance-grid"><div class="keyboard-panel" aria-label="Playable keyboard"><div class="keyboard-head"><strong>Playable Synth</strong><span>Tone.js / Native</span></div><div class="sound-lab-keyboard">' + keys + '</div><button class="secondary-button hold-button ' + (model.patch?.performance?.hold ? 'is-active' : '') + '" type="button" data-performance-hold>Hold Loop</button></div>' +
    '<div class="performance-panel" aria-label="Performance controls">' + performanceControls + '</div>' +
    renderPerformanceFeelPanel(model) +
    '<div class="fx-rack-panel" aria-label="FX Rack"><h4>FX Rack</h4>' + fx + '</div></div>' +
    '</section>';
}

function percentFromRange(value, min, max) {
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((Number(value) - min) / (max - min)) * 100));
}

function renderWorkbenchSynthTabs(activeSynth = 'serum') {
  const activeSynthId = ['serum', 'phase-plant', 'vital'].includes(activeSynth) ? activeSynth : 'serum';
  const tabs = [
    { id: 'serum', label: 'Serum 2' },
    { id: 'phase-plant', label: 'Phase Plant' },
    { id: 'vital', label: '+ Vital' },
  ];
  return tabs.map((tab) => `
    <button class="synth-tab ${tab.id === activeSynthId ? 'is-active' : ''}" type="button" data-synth-tab="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeSynthId ? 'true' : 'false'}">
      ${escapeHtml(tab.label)}
    </button>
  `).join('');
}

function renderWorkbenchWaveform(model = {}) {
  const patch = model.patch ?? {};
  const waveform = {
    width: 360,
    height: 108,
    points: Array.from({ length: 116 }, (_, index) => {
      const x = (index / 115) * 360;
      const normalized = index / 115;
      const decay = Math.max(0.14, 1 - normalized * 0.86);
      const angle = normalized * Math.PI * 22;
      const fm = Math.sin(normalized * Math.PI * 5) * 0.34;
      const y = 54 + Math.sin(angle + fm) * 42 * decay;
      return `${formatNumber(x)},${formatNumber(y)}`;
    }).join(' '),
  };
  const wtPos = Math.round(patch.macros?.material ?? 35);
  return `
    <section class="workbench-panel waveform-panel" aria-label="波形">
      <div class="mini-panel-head">
        <strong>波形</strong>
        <select aria-label="Oscillator wavetable">
          <option>Osc A · Default Shapes</option>
          <option>FM Basic Shapes</option>
          <option>Metal Modal Source</option>
        </select>
      </div>
      <svg class="workbench-waveform-svg" viewBox="0 0 ${waveform.width} ${waveform.height}" role="img" aria-label="当前振荡器波形">
        <defs>
          <linearGradient id="workbenchWaveLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="#17a7a3" />
            <stop offset="62%" stop-color="#4882d9" />
            <stop offset="100%" stop-color="#b8c3d4" />
          </linearGradient>
        </defs>
        <polyline points="${escapeHtml(waveform.points)}" />
      </svg>
      <canvas class="live-analyzer-canvas waveform-analyzer-canvas" data-analyzer-waveform width="720" height="216" aria-hidden="true"></canvas>
      <div class="osc-param-row">
        <span><strong>OCT</strong>0</span>
        <span><strong>SEM</strong>0</span>
        <span><strong>FIN</strong>0</span>
        <span><strong>CRS</strong>--</span>
        <span><strong>WT POS</strong>${escapeHtml(wtPos)}%</span>
      </div>
    </section>
  `;
}

function renderWorkbenchSpectrum(model = {}, analyzerMode = 'live') {
  const bars = model.spectrumBars ?? [];
  const modes = [
    ['live', '实时'],
    ['freeze', '冻结'],
    ['log', '对数'],
  ];
  return `
    <section class="workbench-panel spectrum-panel spectrum-stage" aria-label="频谱分析">
      <div class="mini-panel-head">
        <strong>频谱分析</strong>
        <div class="segmented-mini" aria-label="频谱模式">
          ${modes.map(([id, label]) => `
            <button class="${id === analyzerMode ? 'is-active' : ''}" type="button" data-analyzer-mode="${escapeHtml(id)}" aria-pressed="${id === analyzerMode ? 'true' : 'false'}">${escapeHtml(label)}</button>
          `).join('')}
        </div>
      </div>
      <div class="spectrum-canvas">
        <div class="spectrum-grid" aria-hidden="true"></div>
        <canvas class="live-analyzer-canvas spectrum-analyzer-canvas" data-analyzer-spectrum width="720" height="216" aria-hidden="true"></canvas>
        <div class="spectrum-bars" aria-hidden="true">
          ${bars.map((bar, index) => `<span style="--bar:${formatNumber(bar)}%; --i:${index}"></span>`).join('')}
        </div>
      </div>
      <div class="frequency-scale" aria-hidden="true"><span>20</span><span>100</span><span>1k</span><span>10k</span><span>20k</span></div>
    </section>
  `;
}

function renderWorkbenchOutputMeter(model = {}) {
  const meters = (model.meters ?? []).slice(0, 4);
  return `
    <section class="workbench-panel output-meter-strip" aria-label="输出电平">
      <strong>输出电平</strong>
      <div class="output-meter-bars" data-analyzer-meter aria-hidden="true">
        ${meters.map((meter, index) => `<i style="--meter:${formatNumber(meter.value)}%; --i:${index}"></i>`).join('')}
      </div>
      <span>-8.2 dB</span>
    </section>
  `;
}

function renderAnalyzerCoachPanel(model = {}) {
  const coach = model.analyzerCoach;
  if (!coach) return '';
  const bands = coach.bands ?? [];
  const nextMove = coach.nextMove ?? {};

  return `
    <section class="workbench-panel analyzer-coach-panel" data-flow-surface aria-label="频谱波形读图教练">
      <div class="mini-panel-head analyzer-coach-head">
        <strong>${escapeHtml(coach.titleZh ?? '频谱 / 波形读图教练')}</strong>
        <span>Waveform / Spectrum / REAPER A/B</span>
      </div>
      <p class="analyzer-coach-rule">${escapeHtml(coach.beginnerRuleZh ?? '先看时间，再看频段，最后做 A/B。')}</p>
      <small class="analyzer-coach-live-status" data-analyzer-coach-status>等待试听，播放后会用真实 waveform / spectrum 更新下方读图指标。</small>
      <div class="analyzer-coach-next" data-analyzer-coach-live-move data-live-move="${escapeHtml(nextMove.id ?? nextMove.parameterId ?? 'body')}">
        <div>
          <span>下一步</span>
          <strong data-analyzer-coach-live-title>${escapeHtml(nextMove.labelZh ?? 'Body 主体')}</strong>
          <small data-analyzer-coach-live-note>${escapeHtml(nextMove.reaperNoteZh ?? 'REAPER A/B: 只改一个参数并记录 waveform/spectrum 证据。')}</small>
        </div>
        <button
          type="button"
          data-analyzer-coach-live-action
          data-analyzer-coach-live-parameter="${escapeHtml(nextMove.parameterId ?? 'material')}"
          data-analyzer-coach-target="${escapeHtml(nextMove.parameterId ?? 'material')}"
          data-workbench-action="${escapeHtml(nextMove.action ?? 'focus-controls')}"
        >${escapeHtml(nextMove.actionLabelZh ?? '定位参数')}</button>
      </div>
      <div class="analyzer-coach-grid">
        ${bands.map((band) => `
          <article class="analyzer-coach-band" data-analyzer-coach-band="${escapeHtml(band.id)}" data-analyzer-coach-live="${escapeHtml(band.id)}" data-live-status="idle" style="--coach-value:${formatNumber(band.value ?? 50)}%; --coach-live-value:${formatNumber(band.value ?? 50)}%">
            <div class="analyzer-coach-band-top">
              <span>${escapeHtml(band.rangeZh)}</span>
              <strong>${escapeHtml(band.labelZh)}</strong>
              <output>${escapeHtml(band.value ?? 50)}</output>
            </div>
            <small class="analyzer-coach-band-status" data-analyzer-coach-band-status>等待实时信号</small>
            <div class="analyzer-coach-meter" aria-hidden="true"><i></i></div>
            <dl>
              <dt>听感</dt>
              <dd>${escapeHtml(band.listenZh)}</dd>
              <dt>Serum / Phase Plant / Vital</dt>
              <dd>${escapeHtml(band.synthZh)}</dd>
              <dt>REAPER</dt>
              <dd>${escapeHtml(band.reaperZh)}</dd>
            </dl>
            <button type="button" data-workbench-action="${escapeHtml(band.action ?? 'focus-controls')}" data-analyzer-coach-target="${escapeHtml(band.parameterId)}">${escapeHtml(band.actionLabelZh ?? '定位')}</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderWaveformEarDecisionTree(model = {}, options = {}) {
  const tree = model.waveformEarDecisionTree ?? {};
  const clues = tree.clues ?? [];
  if (!clues.length) return '';

  const activeClueId = options.activeWaveformEarClue ?? tree.activeClueId ?? clues[0]?.id ?? '';
  const renderClueAttributes = (clue) => {
    const attrs = [
      `data-waveform-ear-clue="${escapeHtml(clue.id)}"`,
      `aria-pressed="${clue.id === activeClueId ? 'true' : 'false'}"`,
    ];
    if (clue.waveformDrillStep) {
      attrs.push(`data-waveform-drill-step="${escapeHtml(clue.waveformDrillStep)}"`);
    }
    if (clue.playAction) {
      attrs.push('data-sound-lab-play');
    }
    if (clue.layerAudition) {
      attrs.push(`data-layer-audition="${escapeHtml(clue.layerAudition)}"`);
    }
    if (clue.outputMode) {
      attrs.push(`data-output-compare="${escapeHtml(clue.outputMode)}"`);
    }
    if (clue.workbenchAction) {
      attrs.push(`data-workbench-action="${escapeHtml(clue.workbenchAction)}"`);
    }
    return attrs.join(' ');
  };

  return `
    <div class="waveform-ear-tree" aria-label="Waveform Ear Decision Tree">
      <div class="waveform-ear-head">
        <div>
          <span>Ear Decision Tree</span>
          <strong>${escapeHtml(tree.titleZh ?? 'Waveform Ear Decision Tree 波形听辨决策树')}</strong>
          <p>${escapeHtml(tree.summaryZh ?? '')}</p>
        </div>
        <small>${escapeHtml(tree.principleZh ?? '')}</small>
      </div>
      <div class="waveform-ear-clue-grid">
        ${clues.map((clue, index) => {
          const isActive = clue.id === activeClueId;
          const className = ['waveform-ear-clue', isActive ? 'is-active' : '']
            .filter(Boolean)
            .join(' ');
          return `
            <button class="${className}" type="button" ${renderClueAttributes(clue)}>
              <span>${escapeHtml(String(index + 1).padStart(2, '0'))} ${escapeHtml(clue.labelZh ?? '')}</span>
              <strong>${escapeHtml(clue.questionZh ?? '')}</strong>
              <p>${escapeHtml(clue.listenTestZh ?? '')}</p>
              <small class="waveform-ear-sources">${escapeHtml((clue.likelySources ?? []).join(' / '))}</small>
              <em class="wrong-trap">误判：${escapeHtml(clue.wrongTrapZh ?? '')}</em>
              <b>${escapeHtml(clue.verifyActionZh ?? '')}</b>
              <dl>
                <div><dt>Serum</dt><dd>${escapeHtml(clue.synthMap?.serum ?? '')}</dd></div>
                <div><dt>Phase Plant</dt><dd>${escapeHtml(clue.synthMap?.phasePlant ?? '')}</dd></div>
                <div><dt>Vital</dt><dd>${escapeHtml(clue.synthMap?.vital ?? '')}</dd></div>
              </dl>
              <code>${escapeHtml(clue.reaperNoteZh ?? '')}</code>
            </button>
          `;
        }).join('')}
      </div>
      <div class="waveform-ear-proof">
        <span>REAPER proof</span>
        <code>${escapeHtml(tree.reaperProofTemplate ?? '')}</code>
      </div>
    </div>
  `;
}

function renderWaveformDetectivePanel(model = {}, options = {}) {
  const fingerprint = model.waveformFingerprint ?? {};
  const ingredients = fingerprint.ingredients ?? [];
  const steps = fingerprint.listeningSteps ?? [];
  const drillSteps = fingerprint.drillSteps ?? [];
  const activeDrillStepId = options.activeWaveformDrillStep ?? drillSteps[0]?.id ?? '';
  const completedDrillSteps = new Set(options.completedWaveformDrillSteps ?? []);
  const activeDrillStep = drillSteps.find((step) => step.id === activeDrillStepId) ?? drillSteps[0] ?? {};
  const renderDrillAttributes = (step, isActive) => {
    const attrs = [
      `data-waveform-drill-step="${escapeHtml(step.id)}"`,
      `data-waveform-drill-feedback="${escapeHtml(step.feedbackZh ?? '')}"`,
      `data-waveform-drill-next="${escapeHtml(step.nextZh ?? '')}"`,
      `aria-pressed="${isActive ? 'true' : 'false'}"`,
    ];
    if (step.playAction) {
      attrs.push('data-sound-lab-play');
    } else if (step.layerAudition) {
      attrs.push(`data-layer-audition="${escapeHtml(step.layerAudition)}"`);
    } else if (step.outputMode) {
      attrs.push(`data-output-compare="${escapeHtml(step.outputMode)}"`);
    } else {
      attrs.push(`data-workbench-action="${escapeHtml(step.action ?? 'focus-waveform')}"`);
    }
    return attrs.join(' ');
  };
  return `
    <section class="workbench-panel waveform-detective-panel" aria-label="波形拆解">
      <div class="mini-panel-head">
        <strong>波形拆解</strong>
        <button type="button" data-workbench-action="focus-waveform">听感判断</button>
      </div>
      <p>${escapeHtml(fingerprint.beginnerSummaryZh ?? '从基础波形和噪声层判断当前音效的来源。')}</p>
      <div class="waveform-ingredient-grid">
        ${ingredients.map((item) => `
          <article class="waveform-ingredient-card" style="--ingredient:${formatNumber(item.value ?? 0)}%">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value ?? 0)}%</strong>
            <i aria-hidden="true"></i>
            <small>${escapeHtml(item.listenZh)}</small>
            <em>${escapeHtml(item.synthCheckZh)}</em>
          </article>
        `).join('')}
      </div>
      <ol class="waveform-detective-steps">
        ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
      ${renderWaveformEarDecisionTree(model, options)}
      ${drillSteps.length ? `
        <div class="waveform-drill-rail" aria-label="波形反推训练">
          <div class="waveform-drill-head">
            <strong>Waveform Reverse Drill</strong>
            <span>听证据 → solo 层 → 只改一个参数 → A/B 写结论</span>
          </div>
          <div class="waveform-drill-progress" data-waveform-drill-progress>
            <strong>当前训练：${escapeHtml(activeDrillStep.labelZh ?? '')} ${escapeHtml(activeDrillStep.titleZh ?? '')}</strong>
            <span>下一步：${escapeHtml(activeDrillStep.nextZh ?? '先听完整 Patch，再拆开每一层验证。')}</span>
          </div>
          <div class="waveform-drill-grid">
            ${drillSteps.map((step) => {
              const isActive = step.id === activeDrillStepId;
              const isComplete = completedDrillSteps.has(step.id);
              const className = ['waveform-drill-step', isActive ? 'is-active' : '', isComplete ? 'is-complete' : '']
                .filter(Boolean)
                .join(' ');
              return `
              <button class="${className}" type="button" ${renderDrillAttributes(step, isActive)}>
                <span>${escapeHtml(step.labelZh ?? '')}</span>
                <strong>${escapeHtml(step.titleZh ?? '')}</strong>
                <p>${escapeHtml(step.listenZh ?? '')}</p>
                <small>${escapeHtml(step.synthZh ?? '')}</small>
                <em>${escapeHtml(step.proofZh ?? '')}</em>
                <b class="waveform-drill-state">${escapeHtml(isActive ? '当前训练' : isComplete ? '已验证' : '待验证')}</b>
              </button>
            `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}

function renderPerceptualSignaturePanel(model = {}) {
  const signature = model.perceptualSignature ?? {};
  const points = signature.proofPoints ?? [];
  if (!points.length) return '';
  const move = signature.nextMove ?? {};
  const synthTranslation = signature.synthTranslation ?? {};
  const action = move.action ?? 'focus-controls';

  return `
    <section class="workbench-panel perceptual-signature-panel" aria-label="Perceptual Signature 听感指纹">
      <div class="mini-panel-head">
        <strong>${escapeHtml(signature.titleZh ?? 'Perceptual Signature 听感指纹')}</strong>
        <button type="button" data-workbench-action="${escapeHtml(action)}">下一步只改</button>
      </div>
      <div class="signature-score" style="--signature-score:${formatNumber(signature.realismScore ?? 0)}%">
        <span>真实感</span>
        <strong>${escapeHtml(signature.realismScore ?? 0)}%</strong>
        <i aria-hidden="true"></i>
      </div>
      <p>${escapeHtml(signature.identityZh ?? '')}</p>
      <div class="signature-proof-grid">
        ${points.map((point) => `
          <article class="signature-proof-card" style="--signature-proof:${formatNumber(point.value ?? 0)}%">
            <span>${escapeHtml(point.labelZh)}</span>
            <strong>${escapeHtml(point.value ?? 0)}%</strong>
            <p>${escapeHtml(point.listenZh)}</p>
            <small>${escapeHtml(point.evidenceZh)}</small>
            <i aria-hidden="true"></i>
          </article>
        `).join('')}
      </div>
      <div class="signature-next-move">
        <span>下一步只改</span>
        <strong>${escapeHtml(move.labelZh ?? move.parameterId ?? 'Macro')} ${escapeHtml(move.from ?? '')} -> ${escapeHtml(move.to ?? '')}</strong>
        <p>${escapeHtml(move.reasonZh ?? '')}</p>
        <button type="button" data-workbench-action="${escapeHtml(action)}">去调这个参数</button>
      </div>
      <div class="signature-synth-map">
        <article><strong>Serum</strong><p>${escapeHtml(synthTranslation.serum ?? '')}</p></article>
        <article><strong>Phase Plant</strong><p>${escapeHtml(synthTranslation.phasePlant ?? '')}</p></article>
        <article><strong>Vital</strong><p>${escapeHtml(synthTranslation.vital ?? '')}</p></article>
      </div>
      <small class="signature-reaper">${escapeHtml(signature.reaperCheckZh ?? '')}</small>
    </section>
  `;
}

function renderMaterialResonancePanel(model = {}) {
  const map = model.materialResonanceMap ?? {};
  const peaks = map.peaks ?? [];
  if (!peaks.length) return '';
  const bodyModel = map.bodyModel ?? {};
  const bodyMetrics = bodyModel.metrics ?? [];

  return `
    <section class="workbench-panel material-resonance-panel" aria-label="Material Resonance 材质共振地图">
      <div class="mini-panel-head resonance-panel-head">
        <strong>${escapeHtml(map.titleZh ?? 'Material Resonance 材质共振地图')}</strong>
        <button type="button" data-workbench-action="focus-material-resonance">聚焦共振峰</button>
      </div>
      <p>${escapeHtml(map.beginnerZh ?? '')}</p>
      ${bodyMetrics.length ? `
        <div class="material-body-model" aria-label="Modal body diffusion model">
          <div>
            <strong>${escapeHtml(bodyModel.titleZh ?? 'Modal Body material body model')}</strong>
            <p>${escapeHtml(bodyModel.beginnerZh ?? '')}</p>
          </div>
          <div class="material-body-metrics">
            ${bodyMetrics.map((metric) => `
              <article style="--body-metric:${formatNumber(metric.value ?? 0)}%">
                <span>${escapeHtml(metric.labelZh ?? metric.id)}</span>
                <strong>${escapeHtml(metric.value ?? 0)}%</strong>
                <i aria-hidden="true"></i>
                <small>${escapeHtml(metric.detailZh ?? '')}</small>
              </article>
            `).join('')}
          </div>
          <div class="material-body-proof">
            <span>${escapeHtml(bodyModel.synthZh ?? '')}</span>
            <span>${escapeHtml(bodyModel.reaperZh ?? '')}</span>
          </div>
        </div>
      ` : ''}
      <div class="resonance-peak-grid" aria-label="modal resonator peaks">
        ${peaks.map((peak) => `
          <article class="resonance-peak-card" style="--peak-gain:${formatNumber(peak.gainPercent ?? 0)}%; --peak-decay:${formatNumber(Math.min(100, (peak.decayMs ?? 0) / 18))}%">
            <div>
              <span>${escapeHtml(String(peak.index).padStart(2, '0'))}</span>
              <strong>${escapeHtml(peak.labelZh)}</strong>
            </div>
            <dl>
              <dt>Hz</dt><dd>${escapeHtml(peak.frequencyHz)}</dd>
              <dt>ratio</dt><dd>${escapeHtml(peak.ratio)}</dd>
              <dt>decay</dt><dd>${escapeHtml(peak.decayMs)}ms</dd>
              <dt>Q</dt><dd>${escapeHtml(peak.q)}</dd>
            </dl>
            <i aria-hidden="true"></i>
            <p>${escapeHtml(peak.listenZh)}</p>
            <small>${escapeHtml(peak.synthZh)}</small>
          </article>
        `).join('')}
      </div>
      <div class="resonance-action-row">
        <button type="button" data-layer-audition="body">试听 body-only 共振</button>
        <button type="button" data-layer-audition="full">回到 full patch</button>
        <span>${escapeHtml(map.practiceZh ?? '')}</span>
      </div>
      <div class="resonance-synth-map">
        <article><strong>Serum</strong><p>${escapeHtml(map.serumZh ?? '')}</p></article>
        <article><strong>Phase Plant</strong><p>${escapeHtml(map.phasePlantZh ?? '')}</p></article>
        <article><strong>Vital</strong><p>${escapeHtml(map.vitalZh ?? '')}</p></article>
        <article><strong>REAPER</strong><p>${escapeHtml(map.reaperZh ?? '')}</p></article>
      </div>
    </section>
  `;
}

function renderPracticeLoopPanel(model = {}) {
  const loop = model.practiceLoop ?? {};
  const steps = loop.steps ?? [];
  const checkpoints = loop.checkpoints ?? [];
  return `
    <section class="side-panel practice-loop-panel" aria-label="听辨闭环">
      <div class="atlas-inspector-heading">
        <span aria-hidden="true">A/B</span>
        <strong>${escapeHtml(loop.titleZh ?? '听辨闭环 A/B')}</strong>
      </div>
      <p>${escapeHtml(loop.goalZh ?? '先做 A/B，再只改一个参数，把听感变化写成可复盘的 REAPER 记录。')}</p>
      <div class="practice-loop-contrast">
        <span>本轮变量</span>
        <strong>${escapeHtml(loop.contrastZh ?? 'Macro 50 -> 68')}</strong>
        <small>${escapeHtml(loop.expectedCueZh ?? '听感方向应明确变化，但主体身份不能丢。')}</small>
      </div>
      <ol class="practice-loop-step-list">
        ${steps.map((step, index) => `<li class="practice-loop-step"><span>${index + 1}</span>${escapeHtml(step)}</li>`).join('')}
      </ol>
      <div class="practice-loop-checks">
        ${checkpoints.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
      </div>
      <div class="practice-loop-note">
        <strong>REAPER 记录句式</strong>
        <code>${escapeHtml(loop.reaperNoteTemplate ?? 'A/B: 参数 -> 参数; 听感变化=____; 保留/撤回=____。')}</code>
      </div>
      <div class="practice-loop-actions">
        <button type="button" data-workbench-action="focus-practice-loop">开始听辨闭环</button>
        <button type="button" data-workbench-action="compare-view">打开 A/B</button>
      </div>
    </section>
  `;
}

function renderListeningCompassPanel(model = {}) {
  const compass = model.listeningCompass ?? {};
  const stages = compass.stages ?? [];
  const nextAction = compass.nextAction ?? {};
  return `
    <section class="side-panel listening-compass-panel" aria-label="听辨导航">
      <div class="atlas-inspector-heading">
        <span aria-hidden="true">Ear</span>
        <strong>${escapeHtml(compass.titleZh ?? '听辨导航')}</strong>
      </div>
      <p>${escapeHtml(compass.summaryZh ?? '把声音拆成起音、主体和尾巴三段听，再用 A/B 验证。')}</p>
      <div class="listening-compass-grid">
        ${stages.map((stage) => `
          <article class="listening-compass-step" style="--compass-meter:${formatNumber(stage.meter ?? 0)}%">
            <div>
              <strong>${escapeHtml(stage.labelZh)}</strong>
              <button type="button" data-workbench-action="${escapeHtml(stage.action)}">${escapeHtml(stage.actionLabelZh ?? '聚焦')}</button>
            </div>
            <p>${escapeHtml(stage.listenForZh)}</p>
            <small>${escapeHtml(stage.checkZh)}</small>
            <i aria-hidden="true"></i>
          </article>
        `).join('')}
      </div>
      <button class="listening-compass-next" type="button" data-workbench-action="${escapeHtml(nextAction.action ?? 'focus-practice-loop')}">
        <strong>${escapeHtml(nextAction.labelZh ?? '下一步 A/B 验证')}</strong>
        <span>${escapeHtml(nextAction.noteZh ?? '只改一个参数，先听一个听感问题。')}</span>
      </button>
    </section>
  `;
}

function renderEarTriagePanel(model = {}) {
  const triage = model.earTriage ?? {};
  const steps = triage.steps ?? [];
  if (!steps.length) return '';
  const synthMap = triage.synthMap ?? {};
  const renderStepAction = (step) => {
    const label = escapeHtml(step.actionLabelZh ?? '执行');
    if (step.layerAudition) {
      return `<button type="button" data-layer-audition="${escapeHtml(step.layerAudition)}">${label}</button>`;
    }
    if (step.applyDiagnosticId) {
      return `<button type="button" data-quality-coach-apply="${escapeHtml(step.applyDiagnosticId)}">${label}</button>`;
    }
    return `<button type="button" data-workbench-action="${escapeHtml(step.action ?? 'focus-practice-loop')}">${label}</button>`;
  };

  return `
    <section class="side-panel ear-triage-panel" aria-label="Ear Triage 听感分诊">
      <div class="atlas-inspector-heading">
        <span aria-hidden="true">Ear</span>
        <strong>${escapeHtml(triage.titleZh ?? 'Ear Triage 听感分诊')}</strong>
      </div>
      <div class="ear-triage-problem">
        <span>${escapeHtml(triage.subtitleZh ?? '当前先处理最高优先问题')}</span>
        <p>${escapeHtml(triage.summaryZh ?? '先听、再 solo、只改一次、最后 A/B 记录。')}</p>
      </div>
      <div class="triage-step-grid">
        ${steps.map((step) => `
          <article class="triage-step-card" data-triage-step="${escapeHtml(step.id)}">
            <div>
              <strong>${escapeHtml(step.labelZh)}</strong>
              ${renderStepAction(step)}
            </div>
            <p>${escapeHtml(step.bodyZh ?? '')}</p>
          </article>
        `).join('')}
      </div>
      <div class="triage-synth-map" aria-label="Serum Phase Plant Vital translation">
        <span><b>Serum</b>${escapeHtml(synthMap.serum ?? '')}</span>
        <span><b>Phase Plant</b>${escapeHtml(synthMap.phasePlant ?? '')}</span>
        <span><b>Vital</b>${escapeHtml(synthMap.vital ?? '')}</span>
      </div>
      <p class="triage-decision">${escapeHtml(triage.decisionPromptZh ?? 'REAPER: A/B 后写保留/撤回原因。')}</p>
    </section>
  `;
}

function renderPatchDoctorPanel(model = {}) {
  const doctor = model.patchDoctor ?? {};
  const diagnostics = doctor.diagnostics ?? [];
  if (!diagnostics.length) return '';
  const synthLabels = {
    serum: 'Serum',
    phasePlant: 'Phase Plant',
    vital: 'Vital',
  };

  return `
    <section class="side-panel patch-doctor-panel" aria-label="Patch Doctor 下一步诊断">
      <div class="atlas-inspector-heading">
        <span aria-hidden="true">Dx</span>
        <strong>${escapeHtml(doctor.titleZh ?? 'Patch Doctor 下一步诊断')}</strong>
      </div>
      <p>${escapeHtml(doctor.summaryZh ?? '先听最重要的问题，只改一个参数，再回到 A/B 验证。')}</p>
      <div class="patch-doctor-stack">
        ${diagnostics.map((diagnostic) => `
          <article class="patch-doctor-card" style="--doctor-score:${formatNumber(diagnostic.score ?? 0)}%">
            <div class="patch-doctor-card-head">
              <span>${escapeHtml(String(diagnostic.priority ?? 1).padStart(2, '0'))}</span>
              <strong>${escapeHtml(diagnostic.labelZh)}</strong>
              <em>${escapeHtml(String(diagnostic.score ?? 0))}</em>
            </div>
            <dl>
              <div>
                <dt>先听</dt>
                <dd>${escapeHtml(diagnostic.listenZh)}</dd>
              </div>
              <div>
                <dt>为什么</dt>
                <dd>${escapeHtml(diagnostic.whyZh)}</dd>
              </div>
              <div>
                <dt>去修改</dt>
                <dd>
                  ${Object.entries(diagnostic.synthTargets ?? {}).map(([synth, target]) => `
                    <span><b>${escapeHtml(synthLabels[synth] ?? synth)}</b>${escapeHtml(target)}</span>
                  `).join('')}
                </dd>
              </div>
            </dl>
            ${diagnostic.applyAction?.summaryZh ? `<p class="patch-doctor-trial">${escapeHtml(diagnostic.applyAction.summaryZh)}</p>` : ''}
            <small>${escapeHtml(diagnostic.reaperCheckZh ?? '')}</small>
            <div class="patch-doctor-actions">
              <button type="button" data-workbench-action="${escapeHtml(diagnostic.action)}">${escapeHtml(diagnostic.actionLabelZh ?? '去处理')}</button>
              <button class="patch-doctor-apply-button" type="button" data-doctor-apply="${escapeHtml(diagnostic.id)}">${escapeHtml(diagnostic.applyAction?.labelZh ?? '试调一次')}</button>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderWorkbenchModuleTabs(activeWorkbenchModule = 'envelope') {
  const tabs = [
    ['generator', '声音生成'],
    ['filter', '滤波器'],
    ['modulation', '调制'],
    ['envelope', '包络'],
    ['effects', '效果'],
    ['macro', '宏控制'],
  ];
  return `
    <div class="workbench-module-tabs" role="tablist" aria-label="工作台模块">
      ${tabs.map(([id, label]) => `
        <button class="${id === activeWorkbenchModule ? 'is-active' : ''}" type="button" data-module-tab="${escapeHtml(id)}">${escapeHtml(label)}</button>
      `).join('')}
    </div>
  `;
}

function renderWorkbenchEnvelope(model = {}) {
  const envelope = model.patch?.toneGraph?.envelope ?? { attack: 0.002, decay: 0.18, sustain: 0.04, release: 0.32 };
  const attackMs = Math.max(1, Math.round(envelope.attack * 1000));
  const decayMs = Math.max(20, Math.round(envelope.decay * 1000));
  const sustain = Math.round((envelope.sustain ?? 0) * 100);
  const releaseMs = Math.max(30, Math.round(envelope.release * 1000));
  const sliders = [
    { id: 'attack', label: '攻击', value: attackMs, min: 0, max: 120, unit: 'ms' },
    { id: 'decay', label: '衰减', value: decayMs, min: 20, max: 1000, unit: 'ms' },
    { id: 'sustain', label: '延音', value: sustain, min: 0, max: 100, unit: '%' },
    { id: 'release', label: '释放', value: releaseMs, min: 30, max: 1400, unit: 'ms' },
  ];
  const sustainY = Math.max(48, 202 - sustain * 1.28);
  const path = `26,212 52,42 148,${formatNumber(sustainY)} 360,${formatNumber(sustainY)} 430,212`;
  return `
    <section class="workbench-panel envelope-panel" aria-label="ADSR 包络">
      <div class="mini-panel-head">
        <strong>ADSR 包络</strong>
        <div class="toggle-chip"><span></span> 循环</div>
      </div>
      <div class="envelope-grid">
        <svg class="adsr-workbench-svg" viewBox="0 0 456 232" role="img" aria-label="ADSR 包络曲线">
          <defs>
            <linearGradient id="adsrFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#17a7a3" stop-opacity="0.42" />
              <stop offset="100%" stop-color="#17a7a3" stop-opacity="0.03" />
            </linearGradient>
          </defs>
          <path class="adsr-fill" d="M ${path} L 430,212 L 26,212 Z" />
          <polyline class="adsr-line" points="${escapeHtml(path)}" />
          <circle cx="52" cy="42" r="5" />
          <circle cx="148" cy="${formatNumber(sustainY)}" r="5" />
          <circle cx="360" cy="${formatNumber(sustainY)}" r="5" />
          <circle cx="430" cy="212" r="5" />
          <text x="25" y="226">0ms</text>
          <text x="128" y="226">${escapeHtml(decayMs)}ms</text>
          <text x="300" y="226">Sustain</text>
          <text x="403" y="226">${escapeHtml((releaseMs / 1000).toFixed(1))}s</text>
        </svg>
        <div class="vertical-slider-stack">
          ${sliders.map((slider) => `
            <label class="vertical-slider">
              <span>${escapeHtml(slider.label)}</span>
              <input
                type="range"
                data-envelope-control="${escapeHtml(slider.id)}"
                data-control-unit="${escapeHtml(slider.unit)}"
                aria-orientation="vertical"
                min="${escapeHtml(slider.min)}"
                max="${escapeHtml(slider.max)}"
                step="1"
                value="${escapeHtml(slider.value)}"
                style="--range-value:${formatNumber(percentFromRange(slider.value, slider.min, slider.max))}%"
              />
              <strong>${escapeHtml(slider.value)}${escapeHtml(slider.unit)}</strong>
            </label>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderWorkbenchMacroPanel(model = {}) {
  return `
    <section class="workbench-panel macro-control-panel" aria-label="宏控制">
      <div class="mini-panel-head"><strong>宏控制</strong><span>可映射任意参数</span></div>
      <div class="macro-bank compact-macro-bank">
        ${(model.macros ?? []).map((macro, index) => `
          <label class="macro-knob" style="--knob-value:${formatNumber(macro.percent)}%">
            <span class="knob-face" aria-hidden="true"><i></i></span>
            <strong>Macro ${index + 1}</strong>
            <small>${escapeHtml(macro.labelZh.split(' ')[0])}</small>
            <output>${escapeHtml(macro.value)}</output>
            <input type="range" data-sound-lab-control="${escapeHtml(macro.id)}" min="0" max="100" step="1" value="${escapeHtml(macro.value)}" />
          </label>
        `).join('')}
      </div>
    </section>
  `;
}

function renderWorkbenchModulation(model = {}) {
  const rows = (model.patch?.macroModulation ?? []).slice(0, 5);
  return `
    <section class="workbench-panel modulation-strip" aria-label="调制源">
      <div class="mini-panel-head"><strong>调制源</strong><span>LFO / Env / MIDI</span></div>
      <div class="modulation-grid">
        ${rows.map((row, index) => `
          <div class="mod-source">
            <strong>${index < 2 ? `LFO ${index + 1}` : index === 2 ? 'Env 2' : index === 3 ? 'Vel' : 'Note'}</strong>
            <i style="--amount:${formatNumber((row.amount ?? 0) * 100)}%"></i>
            <span>${escapeHtml(row.source)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderWorkbenchMaterialPanel(family = {}) {
  const materials = [
    ['metal-impact', '金属', '非谐波 / 短共振'],
    ['glass-ping', '玻璃', '清亮 partial'],
    ['electric-crackle', '电流', '随机 gate'],
    ['servo-tick', '机械', '短脉冲'],
    ['air-whoosh', '空气', '滤波运动'],
    ['energy-charge', '魔法', '持续上升'],
  ];
  return `
    <section class="workbench-panel material-selector-grid" aria-label="材质选择">
      <div class="mini-panel-head"><strong>材质选择</strong><span>${escapeHtml((family.materialAxis ?? []).join(' / '))}</span></div>
      <div class="material-token-row">
        ${materials.map(([familyId, label, note]) => `
          <button class="${family.id === familyId ? 'is-active' : ''}" type="button" data-workbench-family="${escapeHtml(familyId)}">
            <span aria-hidden="true"></span>
            <strong>${escapeHtml(label)}</strong>
            <small>${escapeHtml(note)}</small>
          </button>
        `).join('')}
      </div>
      <div class="material-current-brief">
        <strong>${escapeHtml(family.titleEn ?? family.titleZh)}</strong>
        <span>${escapeHtml(family.summaryZh ?? '')}</span>
      </div>
      <div class="material-workflow-hint">
        <span>下一步</span>
        <strong>选材质 → 按播放 → 调 Macro → A/B 对比</strong>
        <small>材料决定频率关系和瞬态边缘，播放控制负责验证 dry / full / Tone.js 三种听感。</small>
      </div>
    </section>
  `;
}

function renderWorkbenchFlowMap(family = {}, activeStep = 'source', activeAtlasNode = '') {
  const familyName = (family.titleZh ?? '').split('：')[0] || 'Sound Lab';
  const steps = [
    ['source', '01', 'source', '声源', familyName, '确认基础波形、层级角色和瞬态来源。'],
    ['shape', '02', 'envelope', '包络', 'ADSR / Macro', '用时间形状决定 click、pluck、hit 或 tail。'],
    ['shape', '03', 'modulation', '调制', 'LFO / Env / MIDI', '让材质有运动，但不靠音量错觉。'],
    ['shape', '04', 'fx-chain', '效果链', 'Drive / Filter / Space', '决定谐波、空间、宽度和动态边缘。'],
    ['compare', '05', 'material', '材质', 'Metal / Glass / Air', '用 A/B 验证目标质感是否成立。'],
    ['deliver', '06', 'export', '导出', 'Patch / REAPER', '保存 Patch、命名规则和交付检查。'],
  ];
  const activeNodeByStep = {
    source: 'source',
    shape: 'envelope',
    compare: 'material',
    deliver: 'export',
  };
  const activeNode = activeAtlasNode || activeNodeByStep[activeStep] || 'source';
  const current = steps.find(([, , nodeId]) => nodeId === activeNode) ?? steps.find(([id]) => id === activeStep) ?? steps[0];
  return `
    <section class="workbench-flow-map atlas-signal-ribbon" aria-label="Sound Lab workflow">
      ${steps.map(([id, index, nodeId, label, note, detail]) => `
        <button class="workflow-step atlas-signal-node ${nodeId === activeNode ? 'is-active' : ''}" type="button" data-atlas-node="${escapeHtml(nodeId)}" data-workflow-step="${escapeHtml(id)}" aria-pressed="${nodeId === activeNode ? 'true' : 'false'}">
          <span>${escapeHtml(index)}</span>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(note)}</small>
          <em>${escapeHtml(detail)}</em>
        </button>
      `).join('')}
      <div class="workflow-context-strip">
        <span>当前信号节点 ${escapeHtml(current[1])}</span>
        <strong>${escapeHtml(current[3])}</strong>
        <p>${escapeHtml(current[5])}</p>
      </div>
    </section>
  `;
}

function renderWorkbenchUsageGuide(family = {}, activeStep = 'source') {
  const familyName = family.titleZh?.split('：')[0] ?? '当前音效';
  const cards = [
    {
      id: 'target',
      index: '1',
      titleZh: '先选目标音效',
      bodyZh: `当前练习是「${familyName}」。先确认它属于 transient、body、texture 还是 tail 任务。`,
      action: 'focus-source',
    },
    {
      id: 'controls',
      index: '2',
      titleZh: '再调声音结构',
      bodyZh: '看波形和频谱，再改 ADSR、Macro、材质和层级；一次只改一个听感问题。',
      action: 'focus-controls',
    },
    {
      id: 'coach',
      index: '3',
      titleZh: '跟着教练复刻',
      bodyZh: '切 Serum 2 / Phase Plant / Vital，按路由图和参数步骤把同一技巧落到插件里。',
      action: 'focus-coach',
    },
    {
      id: 'export',
      index: '4',
      titleZh: '最后导出复盘',
      bodyZh: '复制 Patch JSON 与 REAPER Notes，导出 dry / full / tail-only，避免只留下偶然版本。',
      action: 'focus-export',
    },
  ];
  return `
    <section class="workbench-usage-panel" aria-label="怎么用这个工作台">
      <div class="usage-panel-head">
        <span>怎么用这个工作台</span>
        <strong>${escapeHtml(familyName)}</strong>
        <small>当前路径：${escapeHtml(activeStep)}</small>
      </div>
      ${cards.map((card) => `
        <button class="usage-card" type="button" data-workbench-action="${escapeHtml(card.action)}">
          <span>${escapeHtml(card.index)}</span>
          <strong>${escapeHtml(card.titleZh)}</strong>
          <small>${escapeHtml(card.bodyZh)}</small>
        </button>
      `).join('')}
    </section>
  `;
}

function renderWorkbenchModuleMap(family = {}, activeStep = 'source', activeAdvancedModule = 'advanced', activeModuleMapId = '') {
  const familyName = family.titleZh?.split('：')[0] ?? '当前音效';
  const currentByAdvancedModule = {
    advanced: 'source',
    'envelope-editor': 'envelope',
    'mod-matrix': 'mod-matrix',
    'fx-chain': 'fx-chain',
    'ab-compare': 'compare',
    favorites: 'coach',
    'project-library': 'coach',
    'cloud-sync': 'coach',
    'midi-input': 'coach',
    'batch-export': 'compare',
  };
  const currentByStep = {
    source: 'source',
    shape: 'envelope',
    compare: 'compare',
    deliver: 'compare',
  };
  const validCardIds = new Set(['source', 'envelope', 'mod-matrix', 'fx-chain', 'compare', 'coach']);
  const currentCardId = validCardIds.has(activeModuleMapId)
    ? activeModuleMapId
    : currentByAdvancedModule[activeAdvancedModule] ?? currentByStep[activeStep] ?? 'source';
  const cards = [
    {
      id: 'source',
      step: 'source',
      index: 'A',
      title: '声源与频谱',
      role: `确认「${familyName}」的声源角色、波形、频谱峰值和输出电平。`,
      listen: '先听 transient 是否够清楚，再看低频是否占太多空间。',
      action: '进入监听',
    },
    {
      id: 'envelope',
      step: 'shape',
      index: 'B',
      title: 'ADSR / 宏控制',
      role: '把 Attack、Decay、Sustain、Release 与 Tone / Motion / Space 连接到听感。',
      listen: '每次只改一个时间段：起音、主体、尾巴或运动感。',
      action: '调包络',
    },
    {
      id: 'mod-matrix',
      step: 'shape',
      index: 'C',
      title: 'Mod Matrix / Envelope',
      role: '查看 LFO、Env、Velocity、Note 到目标参数的调制关系。',
      listen: '确认调制是在推动材质，而不是让音量忽大忽小。',
      action: '看调制',
    },
    {
      id: 'fx-chain',
      step: 'shape',
      index: 'D',
      title: 'FX Chain / 材质',
      role: '调整失真、滤波、空间、宽度和材质家族，决定声音的质地。',
      listen: 'A/B drive 前后，保留有用谐波，削掉刺耳共振。',
      action: '排效果链',
    },
    {
      id: 'compare',
      step: 'compare',
      index: 'E',
      title: 'A/B / 参考响度',
      role: '对比 dry、full、Tone.js 高质量引擎和参考响度。',
      listen: '不要被音量欺骗，先匹配响度再判断质感好坏。',
      action: '开始对照',
    },
    {
      id: 'coach',
      step: 'shape',
      index: 'F',
      title: '合成器教练',
      role: '把同一个技巧分别翻译到 Serum 2、Phase Plant、Vital。',
      listen: '跟着路由图复刻，再回到 REAPER 检查交付版本。',
      action: '看步骤',
    },
  ];

  return `
    <section class="workbench-module-map" aria-label="工作台模块速查">
      <div class="module-map-head">
        <span>模块速查</span>
        <strong>从左到右完成一次可交付音效</strong>
        <small>点任意模块会切到对应面板</small>
      </div>
      <div class="module-map-grid">
        ${cards.map((card) => `
          <button class="module-map-card ${card.id === currentCardId ? 'is-current' : ''}" type="button" data-workbench-module-jump="${escapeHtml(card.id)}" aria-pressed="${card.id === currentCardId ? 'true' : 'false'}">
            <span>${escapeHtml(card.index)}</span>
            <strong>${escapeHtml(card.title)}</strong>
            <em>${escapeHtml(card.action)}</em>
            <p>${escapeHtml(card.role)}</p>
            <small>${escapeHtml(card.listen)}</small>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderWorkbenchZoneTitle(indexZh, titleZh, bodyZh) {
  return `
    <div class="workbench-zone-title" aria-label="${escapeHtml(`${indexZh} ${titleZh}`)}">
      <span>${escapeHtml(indexZh)}</span>
      <strong>${escapeHtml(titleZh)}</strong>
      <small>${escapeHtml(bodyZh)}</small>
    </div>
  `;
}

function renderWorkbenchCoach(guides = [], activeGuideId, activeSynth = 'serum') {
  const activeGuide = guides.find((guide) => guide.id === activeGuideId) ?? guides[0];
  if (!activeGuide) return '';
  const synthLabels = {
    serum: 'Serum',
    phasePlant: 'Phase Plant',
    vital: 'Vital',
  };
  const synthOrder = ['serum', 'phasePlant', 'vital'];
  const activeSynthKey = synthOrder.includes(activeSynth) ? activeSynth : 'serum';
  const activeSynthSteps = activeGuide.synthSteps?.[activeSynthKey] ?? [];
  const activeRoute = activeGuide.synthRoutes?.[activeSynthKey] ?? activeGuide.diagramNodes ?? [];
  return `
    <section class="workbench-coach-panel" aria-label="模块使用教练">
      <div class="coach-nav" role="list" aria-label="选择学习模块">
        ${guides.map((guide, index) => `
          <button class="${guide.id === activeGuide.id ? 'is-active' : ''}" type="button" data-mod-guide="${escapeHtml(guide.id)}" aria-pressed="${guide.id === activeGuide.id ? 'true' : 'false'}">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHtml(guide.titleZh.split('：')[0])}</strong>
          </button>
        `).join('')}
      </div>
      <div class="coach-main">
        <div class="coach-explain">
          <span class="card-kicker">模块怎么用</span>
          <h4>${escapeHtml(activeGuide.titleZh)}</h4>
          <p>${escapeHtml(activeGuide.questionZh)}</p>
          <div class="coach-listen">
            <strong>先听什么</strong>
            <span>${escapeHtml(activeGuide.listenForZh)}</span>
          </div>
          <div class="coach-actions">
            <button type="button" data-guide-load="${escapeHtml(activeGuide.id)}">加载练习参数</button>
            <button type="button" data-guide-preview="${escapeHtml(activeGuide.id)}">加载并试听</button>
          </div>
        </div>
        <div class="coach-diagram" aria-label="信号流图">
          ${(activeGuide.diagramNodes ?? []).map((node, index, nodes) => `
            <div class="coach-node">
              <span>${String(index + 1).padStart(2, '0')}</span>
              <strong>${escapeHtml(node)}</strong>
            </div>
            ${index < nodes.length - 1 ? '<i aria-hidden="true"></i>' : ''}
          `).join('')}
        </div>
      </div>
      <div class="coach-synth-switch" role="tablist" aria-label="选择合成器操作视角">
        ${synthOrder.map((synth) => `
          <button class="${synth === activeSynthKey ? 'is-active' : ''}" type="button" data-coach-synth="${escapeHtml(synth)}" aria-pressed="${synth === activeSynthKey ? 'true' : 'false'}">
            ${escapeHtml(synthLabels[synth])}
          </button>
        `).join('')}
      </div>
      <div class="coach-route-panel">
        <div class="coach-route-head">
          <strong>${escapeHtml(synthLabels[activeSynthKey])} 路由图</strong>
          <span>按这个顺序检查：源头、调制、目标、听感结果。</span>
        </div>
        <div class="coach-route-diagram" aria-label="${escapeHtml(synthLabels[activeSynthKey])} routing diagram">
          ${activeRoute.map((node, index) => `
            <div class="coach-route-node">
              <span>${String(index + 1).padStart(2, '0')}</span>
              <strong>${escapeHtml(node)}</strong>
            </div>
            ${index < activeRoute.length - 1 ? '<i aria-hidden="true"></i>' : ''}
          `).join('')}
        </div>
      </div>
      <div class="coach-synth-grid">
        <article class="coach-synth-focus">
          <strong>${escapeHtml(synthLabels[activeSynthKey])} 具体怎么调</strong>
          <ol>
            ${activeSynthSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
        </article>
        <div class="coach-synth-compare">
          ${synthOrder.filter((synth) => synth !== activeSynthKey).map((synth) => `
            <button type="button" data-coach-synth="${escapeHtml(synth)}">
              <strong>${escapeHtml(synthLabels[synth])}</strong>
              <span>${escapeHtml((activeGuide.synthSteps?.[synth] ?? [])[0] ?? '切换查看这套合成器的做法')}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="coach-bottom-row">
        <div><strong>重点参数</strong><span>${escapeHtml((activeGuide.controlFocus ?? []).join(' / '))}</span></div>
        <div><strong>别踩坑</strong><span>${escapeHtml(activeGuide.mistakeZh)}</span></div>
      </div>
    </section>
  `;
}

function renderWorkbenchPlayback(model = {}, isPlaying = false) {
  const outputCompare = model.outputCompare ?? {};
  const outputModes = outputCompare.modes ?? [];
  return `
    <section class="workbench-panel playback-card" aria-label="播放控制">
      <div class="mini-panel-head"><strong>播放控制</strong><span>参考响度 -14 LUFS</span></div>
      <div class="playback-grid">
        <button class="ab-button" type="button" data-sound-lab-ab="a">A</button>
        <button class="ab-button is-b" type="button" data-sound-lab-ab="b">B</button>
        <button class="play-main-button ${isPlaying ? 'is-playing' : ''}" type="button" data-sound-lab-play aria-label="试听"><span aria-hidden="true"></span></button>
        <button class="tone-button" type="button" data-sound-lab-ab="tone">Tone.js</button>
      </div>
      <div class="output-compare-strip" aria-label="输出总线听辨">
        ${outputModes.map((mode) => `
          <button
            class="${mode.id === outputCompare.activeMode ? 'is-active' : ''}"
            type="button"
            data-output-compare="${escapeHtml(mode.id)}"
            title="${escapeHtml(mode.noteZh)}"
          >
            <strong>${escapeHtml(mode.label)}</strong>
            <span>${escapeHtml(mode.titleZh)}</span>
          </button>
        `).join('')}
      </div>
      <p class="output-compare-hint">${escapeHtml(outputCompare.practiceZh ?? '')}</p>
      ${renderLayerAuditionStrip(model)}
      <div class="reference-volume">
        <span>参考音量</span>
        <strong>-14 LUFS</strong>
        <i style="--range-value:${formatNumber(model.patch?.macros?.space ?? 32)}%"></i>
      </div>
    </section>
  `;
}

function renderLayerAuditionStrip(model = {}, activeMode = model.layerAudition?.activeMode) {
  const audition = model.layerAudition ?? {};
  const modes = audition.modes ?? [];
  if (!modes.length) return '';

  return `
    <div class="layer-audition-strip" aria-label="Layer Audition 分层试听">
      <div class="layer-audition-head">
        <strong>${escapeHtml(audition.titleZh ?? 'Layer Audition 分层试听')}</strong>
        <span>${escapeHtml(audition.practiceZh ?? 'solo transient / body / texture / tail')}</span>
      </div>
      <div class="layer-audition-buttons">
        ${modes.map((mode) => `
          <button
            class="${mode.id === activeMode ? 'is-active' : ''}"
            type="button"
            data-layer-audition="${escapeHtml(mode.id)}"
            title="${escapeHtml(mode.listenZh ?? '')}"
          >
            <strong>${escapeHtml(mode.label)}</strong>
            <span>${escapeHtml(mode.titleZh ?? mode.roleZh ?? '')}</span>
          </button>
        `).join('')}
      </div>
      <p>${escapeHtml(audition.reaperZh ?? '')}</p>
    </div>
  `;
}

function renderProceduralSourceMapPanel(model = {}) {
  const sourceMap = model.proceduralSourceMap ?? {};
  const items = sourceMap.items ?? [];
  if (!items.length) return '';

  return `
    <section class="procedural-source-panel" aria-label="Procedural Source Map 程序化声源地图" data-flow-surface>
      <div class="procedural-source-head">
        <span>Procedural Source Map</span>
        <strong>${escapeHtml(sourceMap.titleZh ?? '程序化声源地图')}</strong>
        <p>${escapeHtml(sourceMap.beginnerZh ?? '把每一层程序化声源拆成可试听、可复刻、可在 REAPER 验证的路径。')}</p>
      </div>
      <div class="procedural-source-grid">
        ${items.map((item, index) => `
          <button
            class="procedural-source-card"
            type="button"
            data-layer-audition="${escapeHtml(item.layerAudition)}"
            data-procedural-source="${escapeHtml(item.id ?? `${item.role}-${index}`)}"
            data-procedural-source-play="${escapeHtml(item.id ?? `${item.role}-${index}`)}"
            aria-label="${escapeHtml(`${item.roleZh ?? item.role ?? 'layer'} ${item.labelZh ?? ''}`)}"
          >
            <span>${escapeHtml(item.roleZh ?? item.role ?? `Layer ${index + 1}`)}</span>
            <strong>${escapeHtml(item.labelZh ?? item.sampleAssetId ?? '')}</strong>
            <em>${escapeHtml(item.generatorLabelZh ?? item.generatorType ?? '')}</em>
            <ul>
              ${item.generatorShape.map((shape) => `<li>${escapeHtml(shape)}</li>`).join('')}
            </ul>
            <p>${escapeHtml(item.listenZh ?? '')}</p>
            <small>${escapeHtml(item.synthZh ?? '')}</small>
          </button>
        `).join('')}
      </div>
      <div class="procedural-source-proof">
        <strong>REAPER 验证</strong>
        <span>${escapeHtml(sourceMap.reaperProofZh ?? '')}</span>
      </div>
    </section>
  `;
}

function renderParameterCoachPanel(model = {}) {
  const coach = model.parameterCoach ?? {};
  const focus = coach.focus ?? {};
  const checklist = coach.checklist ?? [];
  return `
    <section
      class="workbench-panel parameter-coach-panel"
      data-live-parameter-coach
      style="--coach-level:${formatNumber(focus.value ?? 50)}%"
      aria-label="实时参数导师"
    >
      <div class="mini-panel-head">
        <strong>${escapeHtml(coach.titleZh ?? '实时参数导师')}</strong>
        <span data-live-coach-category>${escapeHtml(focus.categoryZh ?? 'Macro')}</span>
      </div>
      <p>${escapeHtml(coach.summaryZh ?? '拖动参数时，立刻把听感变化翻译成合成器动作。')}</p>
      <div class="parameter-coach-now">
        <span>当前关注</span>
        <strong data-live-coach-title>${escapeHtml(focus.titleZh ?? 'Material 材质')}</strong>
        <output data-live-coach-value>${escapeHtml(String(focus.value ?? 50))}</output>
      </div>
      <div class="parameter-coach-meter" aria-hidden="true"><i></i></div>
      <div class="parameter-coach-grid">
        <article>
          <span>听什么</span>
          <p data-live-coach-listen>${escapeHtml(focus.listenZh ?? '')}</p>
        </article>
        <article>
          <span>插件里改什么</span>
          <p data-live-coach-synth>${escapeHtml(focus.synthZh ?? '')}</p>
        </article>
        <article>
          <span>REAPER 验证</span>
          <p data-live-coach-reaper>${escapeHtml(focus.reaperZh ?? '')}</p>
        </article>
      </div>
      <div class="parameter-coach-target">
        <strong>目标参数</strong>
        <span data-live-coach-target>${escapeHtml(focus.targetZh ?? '')}</span>
      </div>
      <ol class="parameter-coach-checklist">
        ${checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </section>
  `;
}

function renderSessionTransportDock(family = {}, model = {}, options = {}) {
  const outputCompare = model.outputCompare ?? {};
  const outputModes = outputCompare.modes ?? [];
  const activeStep = options.activeWorkflowStep ?? 'source';
  const stepLabel = {
    source: '先听目标声源',
    shape: '只改一个参数',
    compare: '对照 Raw / Comfort / Studio',
    deliver: '整理 REAPER 交付',
  }[activeStep] ?? '先听目标声源';

  return `
    <section class="session-transport-dock" aria-label="Current Sound Lab session">
      <div class="session-current">
        <span>当前练习</span>
        <strong>${escapeHtml(stepLabel)}</strong>
        <p>先听 ${escapeHtml(model.patch?.nameZh ?? family.titleZh ?? '当前 Patch')}，再用一个明确参数验证听感变化。</p>
      </div>
      <div class="session-main-actions" aria-label="试听与输出对照">
        <button class="session-play-button ${options.isPlaying ? 'is-playing' : ''}" type="button" data-sound-lab-play>
          <span aria-hidden="true"></span>
          <strong>${options.isPlaying ? '播放中' : '试听'}</strong>
        </button>
        <div class="session-output-compare" aria-label="Raw Comfort Studio">
          ${outputModes.map((mode) => `
            <button
              class="${mode.id === outputCompare.activeMode ? 'is-active' : ''}"
              type="button"
              data-output-compare="${escapeHtml(mode.id)}"
              title="${escapeHtml(mode.noteZh)}"
            >
              <strong>${escapeHtml(mode.label)}</strong>
              <span>${escapeHtml(mode.titleZh)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="session-jump-actions" aria-label="快速跳转">
        <button type="button" data-session-jump="playback">听输出</button>
        <button type="button" data-session-jump="controls">改参数</button>
        <button type="button" data-session-jump="coach">看复刻</button>
      </div>
      ${renderLayerAuditionStrip(model, options.activeLayerAudition)}
    </section>
  `;
}

function renderPracticeFocusStrip(model = {}) {
  const focus = model.practiceFocus ?? {};
  const steps = focus.steps ?? [];
  if (!steps.length) return '';

  const renderStepAttributes = (step) => {
    const attrs = [`data-practice-focus-step="${escapeHtml(step.id)}"`];
    if (step.playAction) {
      attrs.push('data-sound-lab-play');
    } else if (step.layerAudition) {
      attrs.push(`data-layer-audition="${escapeHtml(step.layerAudition)}"`);
    } else if (step.applyDiagnosticId) {
      attrs.push(`data-doctor-apply="${escapeHtml(step.applyDiagnosticId)}"`);
    } else if (step.outputMode) {
      attrs.push(`data-output-compare="${escapeHtml(step.outputMode)}"`);
    } else {
      attrs.push(`data-workbench-action="${escapeHtml(step.action ?? 'focus-source')}"`);
    }
    return attrs.join(' ');
  };

  return `
    <section class="practice-focus-strip" aria-label="Practice Focus 练习焦点">
      <div class="practice-focus-head">
        <span>Practice Focus</span>
        <strong>${escapeHtml(focus.titleZh ?? 'Practice Focus 练习焦点')}</strong>
        <p>${escapeHtml(focus.summaryZh ?? '')}</p>
      </div>
      <div class="practice-focus-steps">
        ${steps.map((step) => `
          <button
            class="practice-focus-step ${step.id === focus.currentStepId ? 'is-active' : ''}"
            type="button"
            ${renderStepAttributes(step)}
            aria-pressed="${step.id === focus.currentStepId ? 'true' : 'false'}"
          >
            <span>${escapeHtml(step.labelZh ?? '')}</span>
            <strong>${escapeHtml(step.titleZh ?? '')}</strong>
            <small>${escapeHtml(step.bodyZh ?? '')}</small>
          </button>
        `).join('')}
      </div>
      <div class="practice-focus-proof">
        <p>${escapeHtml(focus.passCriteriaZh ?? '')}</p>
        <code>${escapeHtml(focus.reaperNoteTemplate ?? '')}</code>
      </div>
    </section>
  `;
}

function renderEarTrainingChainPanel(model = {}) {
  const chain = model.earTrainingChain ?? {};
  const steps = chain.steps ?? [];
  const synthMap = chain.synthMap ?? {};
  if (!steps.length) return '';

  const renderStepAttributes = (step) => {
    const attrs = [`data-ear-chain-step="${escapeHtml(step.id)}"`];
    if (step.action) {
      attrs.push(`data-workbench-action="${escapeHtml(step.action)}"`);
    }
    if (step.waveformDrillStep) {
      attrs.push(`data-waveform-drill-step="${escapeHtml(step.waveformDrillStep)}"`);
    }
    if (step.playAction) {
      attrs.push('data-sound-lab-play');
    }
    if (step.layerAudition) {
      attrs.push(`data-layer-audition="${escapeHtml(step.layerAudition)}"`);
    }
    if (step.applyDiagnosticId) {
      attrs.push(`data-doctor-apply="${escapeHtml(step.applyDiagnosticId)}"`);
    }
    if (step.outputMode) {
      attrs.push(`data-output-compare="${escapeHtml(step.outputMode)}"`);
    }
    return attrs.join(' ');
  };

  return `
    <section class="ear-chain-panel" aria-label="Beginner Ear Chain 听音诊断链">
      <div class="ear-chain-head">
        <span>Beginner Ear Chain</span>
        <strong>${escapeHtml(chain.titleZh ?? 'Beginner Ear Chain：听音诊断链')}</strong>
        <p>${escapeHtml(chain.summaryZh ?? '')}</p>
      </div>
      <div class="ear-chain-step-grid">
        ${steps.map((step) => {
          const isActive = step.id === chain.activeStepId;
          return `
            <button
              class="ear-chain-step ${isActive ? 'is-active' : ''}"
              type="button"
              ${renderStepAttributes(step)}
              aria-pressed="${isActive ? 'true' : 'false'}"
            >
              <span>${escapeHtml(step.labelZh ?? '')}</span>
              <strong>${escapeHtml(step.titleZh ?? '')}</strong>
              <p>${escapeHtml(step.listenZh ?? '')}</p>
              <small>${escapeHtml(step.proofZh ?? '')}</small>
              <em>${escapeHtml(step.actionLabelZh ?? '开始')}</em>
            </button>
          `;
        }).join('')}
      </div>
      <div class="ear-chain-synth-map">
        <article><strong>Serum</strong><p>${escapeHtml(synthMap.serum ?? '')}</p></article>
        <article><strong>Phase Plant</strong><p>${escapeHtml(synthMap.phasePlant ?? '')}</p></article>
        <article><strong>Vital</strong><p>${escapeHtml(synthMap.vital ?? '')}</p></article>
      </div>
      <div class="ear-chain-proof">
        <span>REAPER Proof</span>
        <code>${escapeHtml(chain.reaperNoteTemplate ?? '')}</code>
      </div>
    </section>
  `;
}

function renderMissionBriefPanel(model = {}) {
  const mission = model.missionBrief ?? {};
  const steps = mission.steps ?? [];
  if (!steps.length) return '';

  return `
    <section class="mission-brief-panel" aria-label="Mission Brief">
      <div class="mission-brief-head">
        <span>Mission Brief</span>
        <strong>${escapeHtml(mission.titleZh ?? 'Mission Brief：听 / 改 / 验 / 交付')}</strong>
        <p>${escapeHtml(mission.summaryZh ?? '')}</p>
      </div>
      <div class="mission-brief-step-grid">
        ${steps.map((step, index) => `
          <button
            class="mission-brief-step ${step.id === mission.activeStepId ? 'is-active' : ''}"
            type="button"
            data-workbench-action="${escapeHtml(step.action)}"
            aria-pressed="${step.id === mission.activeStepId ? 'true' : 'false'}"
          >
            <span>${escapeHtml(step.labelZh ?? String(index + 1))}</span>
            <strong>${escapeHtml(step.titleZh ?? '')}</strong>
            <p>${escapeHtml(step.goalZh ?? '')}</p>
            <small>${escapeHtml(step.proofZh ?? '')}</small>
          </button>
        `).join('')}
      </div>
      <div class="mission-brief-footer">
        <p>${escapeHtml(mission.passCriteriaZh ?? '过关标准：A/B 后能说明保留或撤回理由，并记录 REAPER note。')}</p>
        <button class="mission-brief-action" type="button" data-workbench-action="${escapeHtml(mission.nextAction?.action ?? 'focus-source')}">
          ${escapeHtml(mission.nextAction?.labelZh ?? '下一步：先听目标')}
        </button>
      </div>
    </section>
  `;
}

function renderTargetMatchCoachPanel(model = {}) {
  const coach = model.targetMatchCoach ?? {};
  const metrics = coach.metrics ?? [];
  const challenge = coach.oneChangeChallenge ?? {};
  const reference = coach.referenceMatch ?? {};
  if (!metrics.length) return '';

  return `
    <section class="target-match-coach-panel" aria-label="Target Match 目标匹配教练">
      <div class="target-match-head">
        <span>Target Match</span>
        <strong>${escapeHtml(coach.titleZh ?? 'Target Match 目标匹配教练')}</strong>
        <p>${escapeHtml(coach.summaryZh ?? '把当前 Patch 拆成起音、主体、材质和空间四个听感目标，再做一次只改一个参数的 A/B。')}</p>
      </div>
      <div class="target-match-score">
        <span>Match</span>
        <strong>${escapeHtml(String(coach.overall ?? 0))}</strong>
        <small>${escapeHtml(coach.targetNameZh ?? '当前目标音效')}</small>
      </div>
      <div class="target-match-grid">
        ${metrics.map((metric) => `
          <button
            class="target-match-card"
            type="button"
            data-target-match-action="${escapeHtml(metric.id)}"
            data-workbench-action="${escapeHtml(metric.action)}"
            style="--target-score:${formatNumber(metric.score ?? 0)}%"
          >
            <div>
              <strong>${escapeHtml(metric.labelZh)}</strong>
              <span>${escapeHtml(String(metric.score ?? 0))}</span>
            </div>
            <p>${escapeHtml(metric.targetZh)}</p>
            <small>${escapeHtml(metric.currentZh)}</small>
            <em>${escapeHtml(metric.listenZh)}</em>
            <i class="target-match-meter" aria-hidden="true"></i>
            <b>${escapeHtml(metric.actionLabelZh ?? '聚焦')}</b>
          </button>
        `).join('')}
      </div>
      <div class="target-match-challenge">
        <div>
          <span>${escapeHtml(challenge.titleZh ?? 'One Change Challenge：只改一个参数')}</span>
          <strong>${escapeHtml(challenge.labelZh ?? '本轮只改一个参数')}</strong>
          <p>${escapeHtml(challenge.expectedChangeZh ?? 'A/B 时只听这一个参数带来的变化，并记录保留或撤回理由。')}</p>
          <code>${escapeHtml(challenge.reaperNoteZh ?? 'REAPER note: A/B; 只改一个参数; 听感变化=____; 保留/撤回=____。')}</code>
        </div>
        <div class="target-match-change">
          <small>${escapeHtml(challenge.parameterId ?? 'parameter')}</small>
          <strong>${escapeHtml(String(challenge.from ?? 0))} → ${escapeHtml(String(challenge.to ?? 0))}</strong>
          <span>${escapeHtml(challenge.synthPathZh ?? 'Serum / Phase Plant / Vital 里只动一个等价参数。')}</span>
        </div>
        <div class="target-match-actions">
          <button type="button" data-workbench-action="${escapeHtml(challenge.action ?? 'focus-controls')}">${escapeHtml(challenge.actionLabelZh ?? '去改参数')}</button>
          ${challenge.applyActionId ? `<button class="target-match-apply" type="button" data-doctor-apply="${escapeHtml(challenge.applyActionId)}">试调这个变化</button>` : ''}
          <button type="button" data-workbench-action="focus-practice-loop">REAPER note / A/B</button>
        </div>
      </div>
      ${renderReferenceMatchPanel(reference)}
    </section>
  `;
}

function renderSynthTransferPlanPanel(model = {}) {
  const plan = model.synthTransferPlan ?? {};
  const synthSteps = plan.synthSteps ?? [];
  const oneChange = plan.oneChange ?? {};
  const proof = plan.reaperProof ?? {};
  const actions = plan.actions ?? [];
  if (!synthSteps.length) return '';

  return `
    <section class="synth-transfer-panel" aria-label="Synth Transfer 三合成器迁移练习">
      <div class="synth-transfer-head">
        <span>Synth Transfer</span>
        <strong>${escapeHtml(plan.titleZh ?? 'Synth Transfer：三合成器迁移练习')}</strong>
        <p>${escapeHtml(plan.summaryZh ?? '')}</p>
      </div>
      <div class="synth-transfer-one-change">
        <span>One Change</span>
        <strong>${escapeHtml(oneChange.labelZh ?? oneChange.parameterId ?? 'parameter')}</strong>
        <p>${escapeHtml(plan.problemZh ?? '')}</p>
        <code>${escapeHtml(`${oneChange.parameterId ?? 'parameter'} ${oneChange.from ?? 0} -> ${oneChange.to ?? 0}`)}</code>
      </div>
      <div class="synth-transfer-grid">
        ${synthSteps.map((step) => `
          <article class="synth-transfer-step" data-synth-transfer-step="${escapeHtml(step.id)}">
            <span>${escapeHtml(step.label ?? step.id)}</span>
            <strong>${escapeHtml(step.whereZh ?? '')}</strong>
            <p>${escapeHtml(step.doZh ?? '')}</p>
            <small>${escapeHtml(step.listenZh ?? '')}</small>
            <em>${escapeHtml(step.proofZh ?? '')}</em>
          </article>
        `).join('')}
      </div>
      <div class="synth-transfer-proof">
        <div>
          <span>${escapeHtml(proof.titleZh ?? 'REAPER 证明')}</span>
          <code>${escapeHtml(proof.noteZh ?? 'REAPER A/B: dry / full / tail-only; 只改一个参数。')}</code>
        </div>
        <ul>
          ${(proof.checklist ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
      <div class="synth-transfer-actions">
        ${actions.map((action) => {
          if (action.type === 'doctor-apply') {
            return `<button type="button" data-doctor-apply="${escapeHtml(action.applyDiagnosticId ?? '')}">${escapeHtml(action.labelZh ?? '试调这个变化')}</button>`;
          }
          return `<button type="button" data-workbench-action="${escapeHtml(action.workbenchAction ?? 'focus-controls')}">${escapeHtml(action.labelZh ?? '去改参数')}</button>`;
        }).join('')}
      </div>
    </section>
  `;
}

function renderReferenceMatchPanel(reference = {}) {
  const controls = reference.controls ?? [];
  const playTargets = reference.playTargets ?? {};
  if (!controls.length) return '';

  const playButtons = ['current', 'target', 'nudge']
    .filter((id) => playTargets[id])
    .map((id) => {
      const target = playTargets[id] ?? {};
      return `
        <button type="button" data-target-reference-play="${escapeHtml(id)}">
          <strong>${escapeHtml(target.labelZh ?? id)}</strong>
          <span>${escapeHtml(target.listenZh ?? '')}</span>
        </button>
      `;
    })
    .join('');

  return `
    <div class="reference-match-panel" aria-label="Reference Match 参考目标">
      <div class="reference-match-head">
        <span>Reference Match</span>
        <strong>${escapeHtml(reference.profileNameZh ?? reference.titleZh ?? '参考目标')}</strong>
        <p>${escapeHtml(reference.targetSoundZh ?? reference.practiceZh ?? '')}</p>
      </div>
      <div class="reference-listen-row">
        ${playButtons}
        <button class="reference-apply-button" type="button" data-target-reference-apply="nudge">
          <strong>应用 Nudge</strong>
          <span>${escapeHtml(reference.nudge?.noteZh ?? '只向目标靠近一小步。')}</span>
        </button>
      </div>
      <div class="reference-control-grid">
        ${controls.slice(0, 8).map((control) => `
          <div class="reference-control-row" style="--reference-current:${formatNumber(control.current ?? 0)}%; --reference-target:${formatNumber(control.target ?? 0)}%; --reference-nudge:${formatNumber(control.nudge ?? 0)}%">
            <div>
              <span>${escapeHtml(control.scope === 'layer' ? 'Layer' : 'Macro')}</span>
              <strong>${escapeHtml(control.labelZh ?? control.id)}</strong>
              <small>${escapeHtml(String(control.current ?? 0))} → ${escapeHtml(String(control.target ?? 0))}</small>
            </div>
            <i aria-hidden="true"><b></b><em></em></i>
          </div>
        `).join('')}
      </div>
      <div class="reference-synth-map">
        <p>${escapeHtml(reference.practiceZh ?? '')}</p>
        <span>${escapeHtml(reference.synthMap?.serum ?? 'Serum: Macro A/B')}</span>
        <span>${escapeHtml(reference.synthMap?.phasePlant ?? 'Phase Plant: lane A/B')}</span>
        <span>${escapeHtml(reference.synthMap?.vital ?? 'Vital: Macro A/B')}</span>
        <code>${escapeHtml(reference.reaperNoteZh ?? 'REAPER A/B note')}</code>
      </div>
    </div>
  `;
}

function renderSoundQualityCoachPanel(model = {}) {
  const coach = model.soundQualityCoach ?? {
    titleZh: '音质听诊台',
    summaryZh: '先听最高风险，再只改一个参数做 A/B 验证。',
    metrics: [],
    routine: [],
    primaryFix: { diagnosticId: 'harsh-edge', labelZh: '一键试修优先项', feedbackZh: '只改一个参数后，用 A/B 验证。' },
  };
  const metrics = coach.metrics ?? [];
  const routine = coach.routine ?? [];
  if (!metrics.length) return '';

  return `
    <div class="sound-quality-coach-panel" aria-label="音质听诊台">
      <div class="quality-coach-head">
        <span>Quality Coach</span>
        <strong>${escapeHtml(coach.titleZh ?? '音质听诊台')}</strong>
        <p>${escapeHtml(coach.summaryZh ?? '')}</p>
      </div>
      <div class="quality-coach-metric-grid">
        ${metrics.map((metric) => `
          <article class="quality-coach-metric" style="--quality-coach-value:${formatNumber(metric.value ?? 0)}%">
            <div>
              <strong>${escapeHtml(metric.labelZh)}</strong>
              <span>${escapeHtml(String(metric.value ?? 0))}</span>
            </div>
            <small>${escapeHtml(metric.statusZh ?? '')}</small>
            <p>${escapeHtml(metric.listenZh)}</p>
            <em>${escapeHtml(metric.fixZh)}</em>
            <i aria-hidden="true"></i>
          </article>
        `).join('')}
      </div>
      <div class="quality-coach-routine">
        ${routine.map((step, index) => `<span><b>${String(index + 1).padStart(2, '0')}</b>${escapeHtml(step)}</span>`).join('')}
      </div>
      <button class="quality-coach-apply-button" type="button" data-quality-coach-apply="${escapeHtml(coach.primaryFix.diagnosticId)}">
        <strong>${escapeHtml(coach.primaryFix.labelZh ?? '一键试修优先项')}</strong>
        <span>${escapeHtml(coach.primaryFix.feedbackZh ?? '只改一个参数后，用 A/B 验证。')}</span>
      </button>
    </div>
  `;
}

function renderTranslationMonitorPanel(model = {}) {
  const monitor = model.translationMonitor ?? {};
  const checks = monitor.checks ?? [];
  if (!checks.length) return '';

  return `
    <div class="translation-monitor-panel" aria-label="Translation Monitor 翻译检查">
      <div class="translation-monitor-head">
        <span>Translation Monitor</span>
        <strong>${escapeHtml(monitor.titleZh ?? 'Translation Monitor 翻译检查')}</strong>
        <p>${escapeHtml(monitor.summaryZh ?? '')}</p>
      </div>
      <div class="translation-check-grid">
        ${checks.map((check) => {
          const attributes = [
            check.action ? `data-workbench-action="${escapeHtml(check.action)}"` : '',
            check.layerAudition ? `data-layer-audition="${escapeHtml(check.layerAudition)}"` : '',
            check.outputMode ? `data-output-compare="${escapeHtml(check.outputMode)}"` : '',
          ].filter(Boolean).join(' ');
          return `
            <article class="translation-check-card ${check.id === monitor.primaryCheckId ? 'is-primary' : ''}" data-translation-check="${escapeHtml(check.id)}" style="--translation-value:${formatNumber(check.value ?? 0)}%">
              <div class="translation-check-top">
                <span>${escapeHtml(check.statusZh ?? '')}</span>
                <strong>${escapeHtml(check.labelZh ?? check.id)}</strong>
                <output>${escapeHtml(String(check.value ?? 0))}</output>
              </div>
              <i aria-hidden="true"><b></b></i>
              <p>${escapeHtml(check.listenZh ?? '')}</p>
              <em>${escapeHtml(check.fixZh ?? '')}</em>
              <small>${escapeHtml(check.reaperZh ?? '')}</small>
              <button type="button" ${attributes} data-translation-action="${escapeHtml(check.id)}">${escapeHtml(check.actionLabelZh ?? '试听检查')}</button>
            </article>
          `;
        }).join('')}
      </div>
      <div class="translation-reaper-strip">
        ${(monitor.reaperChecklist ?? []).map((item, index) => `
          <span><b>${String(index + 1).padStart(2, '0')}</b>${escapeHtml(item)}</span>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSpectralBalanceMonitor(model = {}) {
  const monitor = model.spectralBalanceMonitor ?? {};
  const bands = monitor.bands ?? [];
  if (!bands.length) return '';

  return `
    <div class="spectral-balance-monitor" aria-label="Spectral Balance 频谱平衡听诊">
      <div class="spectral-balance-head">
        <span>Spectral Balance</span>
        <strong>${escapeHtml(monitor.titleZh ?? 'Spectral Balance / 频谱平衡听诊')}</strong>
        <p>${escapeHtml(monitor.summaryZh ?? '')}</p>
        <button class="quality-audition-button spectral-balance-ab-button" type="button" data-quality-audition="${escapeHtml(monitor.auditionId ?? 'spectral-balance')}" title="A/B bypass spectral-balance">A/B bypass</button>
      </div>
      <div class="spectral-balance-band-grid">
        ${bands.map((band) => `
          <article class="spectral-balance-band" data-spectral-band="${escapeHtml(band.id)}" style="--spectral-value:${formatNumber(band.value ?? 0)}%">
            <div>
              <strong>${escapeHtml(band.labelZh ?? band.id)}</strong>
              <output>${escapeHtml(String(Math.round(band.value ?? 0)))}</output>
            </div>
            <i aria-hidden="true"><b></b></i>
            <small>${escapeHtml(band.detailZh ?? '')}</small>
            <p>${escapeHtml(band.listenZh ?? '')}</p>
          </article>
        `).join('')}
      </div>
      <div class="spectral-balance-proof">
        <div>
          <strong>Practice / A/B</strong>
          ${(monitor.steps ?? []).map((step) => `<span>${escapeHtml(step)}</span>`).join('')}
        </div>
        <div>
          <strong>REAPER / LUFS</strong>
          ${(monitor.reaperChecklist ?? []).map((step) => `<span>${escapeHtml(step)}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderWorkbenchQuality(model = {}) {
  const qualityItems = (model.soundQuality?.length
    ? model.soundQuality
    : (model.fxRack ?? []).map((item) => ({
      id: item.id,
      labelZh: item.labelZh.split('/')[0].trim(),
      value: (item.amount ?? 0) * 100,
      statusZh: (item.amount ?? 0) > 0.66 ? '优秀' : '良好',
      noteZh: item.type ?? 'FX',
    }))
  ).slice(0, 12);
  const qualityAuditionById = new Map((model.qualityAudition?.items ?? []).map((item) => [item.id, item]));
  const calibration = model.polishCalibration ?? {};
  const calibrationSteps = calibration.steps ?? [];
  const calibrationMeters = calibration.meters ?? [];
  return `
    <section class="workbench-panel patch-quality-card" aria-label="合成器真实感">
      <div class="mini-panel-head"><strong>合成器真实感</strong><button type="button" data-workbench-action="analyze-patch">分析补丁</button></div>
      <div class="quality-knob-row">
        ${qualityItems.map((item) => {
          const audition = qualityAuditionById.get(item.id);
          return `
          <div class="mini-quality-knob" style="--knob-value:${formatNumber(item.value ?? 0)}%">
            <span></span>
            <strong>${escapeHtml(item.labelZh)}</strong>
            <small>${escapeHtml(item.statusZh ?? item.noteZh ?? 'ready')}</small>
            <em>${escapeHtml(item.noteZh ?? '')}</em>
            ${audition ? `<button class="quality-audition-button" type="button" data-quality-audition="${escapeHtml(audition.id)}" title="${escapeHtml(audition.listenZh ?? '')}">${escapeHtml(audition.actionLabelZh ?? '听差异')}</button>` : ''}
          </div>
        `;
        }).join('')}
      </div>
      ${renderSpectralBalanceMonitor(model)}
      ${calibrationSteps.length ? `
        <div class="polish-calibration-panel" aria-label="Perceptual Calibration 音质校准">
          <div class="calibration-panel-head">
            <span>Perceptual Calibration</span>
            <strong>音质校准</strong>
            <p>${escapeHtml(calibration.summaryZh ?? '')}</p>
          </div>
          <div class="calibration-meter-row">
            ${calibrationMeters.map((meter) => `
              <div class="calibration-meter" style="--calibration-value:${formatNumber(meter.value ?? 0)}%">
                <span>${escapeHtml(meter.labelZh)}</span>
                <strong>${escapeHtml(String(meter.value ?? 0))}</strong>
                <small>${escapeHtml(meter.detailZh ?? '')}</small>
              </div>
            `).join('')}
          </div>
          <div class="calibration-step-grid">
            ${calibrationSteps.map((step, index) => `
              <div class="calibration-step" data-calibration-step="${escapeHtml(step.id ?? '')}">
                <div>
                  <span>${String(index + 1).padStart(2, '0')}</span>
                  <strong>${escapeHtml(step.labelZh)}</strong>
                  <em>${escapeHtml(String(step.value ?? 0))}%</em>
                </div>
                <p>${escapeHtml(step.listenZh)}</p>
                <small>${escapeHtml(step.actionZh)}</small>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${renderSoundQualityCoachPanel(model)}
      ${renderTranslationMonitorPanel(model)}
    </section>
  `;
}

function renderAdvancedModuleDock(model = {}, activeAdvancedModule = 'advanced') {
  return `
    <section class="advanced-module-dock" aria-label="Advanced Sound Lab modules">
      ${(model.advancedModules ?? []).map((module) => `
        <button class="advanced-module-pill ${module.id === activeAdvancedModule ? 'is-active' : ''}" type="button" data-advanced-module="${escapeHtml(module.id)}" aria-pressed="${module.id === activeAdvancedModule ? 'true' : 'false'}">
          <strong>${escapeHtml(module.labelZh)}</strong>
          <span>${escapeHtml(module.noteZh)}</span>
        </button>
      `).join('')}
    </section>
  `;
}

function renderAdvancedOverviewPanel(model = {}) {
  const patch = model.patch ?? {};
  const layerCount = patch.layers?.length ?? 0;
  const fallback = patch.fallbackChain?.join(' → ') ?? 'hq → worklet → webaudio';
  return `
    <section class="workbench-panel professional-module-panel advanced-overview-panel" data-advanced-panel="advanced" aria-label="Advanced Panel">
      <div class="mini-panel-head"><strong>Advanced Panel</strong><span>engine / quality / safety</span></div>
      <div class="advanced-overview-grid">
        <div><span>Engine</span><strong>${escapeHtml(patch.engineMode ?? model.activeEngineMode ?? 'hq')}</strong><small>${escapeHtml(fallback)}</small></div>
        <div><span>Quality</span><strong>${escapeHtml(patch.qualityMode ?? 'balanced')}</strong><small>层级、FX 和 limiter 同步调整</small></div>
        <div><span>Layers</span><strong>${escapeHtml(layerCount)}</strong><small>transient / body / texture / tail</small></div>
      </div>
    </section>
  `;
}

function renderEnvelopeEditorFocusPanel(model = {}) {
  const envelope = model.envelopeEditor ?? {};
  const controls = envelope.controls ?? [];
  return `
    <section class="workbench-panel professional-module-panel envelope-focus-panel" data-advanced-panel="envelope-editor" aria-label="Envelope Editor">
      <div class="mini-panel-head"><strong>Envelope Editor</strong><span>ADSR drives function</span></div>
      <div class="envelope-focus-grid">
        ${controls.map((control) => `
          <div>
            <span>${escapeHtml(control.labelZh)}</span>
            <strong>${escapeHtml(control.value)}${escapeHtml(control.unit ?? '')}</strong>
          </div>
        `).join('')}
      </div>
      <p>下方 ADSR 曲线和四个纵向推子会实时改当前 Patch；先让时间形状决定 click、pluck、hit、swell 或 tail。</p>
    </section>
  `;
}

function renderProfessionalModMatrix(model = {}) {
  const matrix = model.modMatrix ?? {};
  const routes = matrix.routes ?? [];
  return `
    <section class="workbench-panel professional-module-panel mod-matrix-panel" data-advanced-panel="mod-matrix" aria-label="Mod Matrix">
      <div class="mini-panel-head"><strong>Mod Matrix</strong><span>${escapeHtml(routes.length)} routes · audio-rate ready</span></div>
      <div class="mod-matrix-table">
        ${routes.slice(0, 8).map((route) => `
          <div class="mod-matrix-row" data-mod-route="${escapeHtml(route.id)}">
            <span>${escapeHtml(route.source)}</span>
            <i></i>
            <span>${escapeHtml(route.target)}</span>
            <label style="--range-value:${formatNumber((route.amount + 100) / 2)}%">
              <input type="range" data-mod-route-amount="${escapeHtml(route.id)}" min="-100" max="100" step="1" value="${escapeHtml(route.amount)}" />
              <output>${escapeHtml(route.amount)}</output>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderFxChainEditor(model = {}) {
  const slots = model.fxChain?.slots ?? [];
  return `
    <section class="workbench-panel professional-module-panel fx-chain-editor" data-advanced-panel="fx-chain" aria-label="FX Chain reorder">
      <div class="mini-panel-head"><strong>FX Chain reorder</strong><span>Drag order · rebuild graph</span></div>
      <div class="fx-chain-list" data-fx-chain-list role="listbox" aria-label="FX Chain order" data-fx-order="${escapeHtml(slots.map((slot) => slot.id).join('>'))}">
        ${slots.map((slot, index) => `
          <div
            class="fx-chain-slot"
            draggable="true"
            tabindex="0"
            role="option"
            aria-grabbed="false"
            aria-posinset="${index + 1}"
            aria-setsize="${slots.length}"
            data-fx-chain-slot="${escapeHtml(slot.id)}"
            data-fx-order="${index + 1}"
          >
            <span data-fx-index>${index + 1}</span>
            <strong>${escapeHtml(slot.labelZh)}</strong>
            <small>${formatNumber((slot.amount ?? slot.ceiling ?? 0) * 100)}%</small>
            <button type="button" data-fx-move="${escapeHtml(slot.id)}" data-fx-direction="-1" aria-label="Move up">↑</button>
            <button type="button" data-fx-move="${escapeHtml(slot.id)}" data-fx-direction="1" aria-label="Move down">↓</button>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderXYMacroPanel(model = {}) {
  const xy = model.xyPad ?? { x: 50, y: 50 };
  const morph = model.macroMorph ?? { amount: 0 };
  const xyReadout = `X ${formatNumber(xy.x)} / Y ${formatNumber(xy.y)}`;
  return `
    <section class="workbench-panel professional-module-panel xy-macro-panel" data-advanced-panel="xy-macro" aria-label="XY Pad and Macro Morph">
      <div class="mini-panel-head"><strong>XY Pad / Macro Morph</strong><span>gestural modulation</span></div>
      <div class="xy-macro-grid">
        <div
          class="xy-pad"
          data-xy-pad
          tabindex="0"
          role="slider"
          aria-label="XY Pad gesture modulation"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuetext="${escapeHtml(xyReadout)}"
          data-live-value="${escapeHtml(xyReadout)}"
          style="--xy-x:${formatNumber(xy.x)}%; --xy-y:${formatNumber(xy.y)}%"
        >
          <button class="xy-handle" type="button" data-xy-handle aria-label="XY Pad handle"></button>
          <output data-xy-readout>${escapeHtml(xyReadout)}</output>
          <span>X → ${escapeHtml(xy.xTarget ?? 'filter.cutoff')}</span>
          <span>Y → ${escapeHtml(xy.yTarget ?? 'fx.reverb')}</span>
        </div>
        <div class="macro-morph-card">
          <strong>Macro morph</strong>
          <label class="range-shell" style="--range-value:${formatNumber(morph.amount ?? 0)}%">
            <input type="range" data-macro-morph min="0" max="100" step="1" value="${escapeHtml(morph.amount ?? 0)}" />
          </label>
          <p>A ${formatNumber(100 - (morph.amount ?? 0))}% / B ${formatNumber(morph.amount ?? 0)}%</p>
        </div>
      </div>
    </section>
  `;
}

function renderAbComparePanel(model = {}) {
  const compare = model.abCompare ?? {};
  return `
    <section class="workbench-panel professional-module-panel ab-compare-panel" data-advanced-panel="ab-compare" aria-label="A/B Compare">
      <div class="mini-panel-head"><strong>A/B Compare</strong><span>${escapeHtml(compare.activeSlot ?? 'a')} active</span></div>
      <div class="ab-compare-grid">
        <button class="${compare.activeSlot === 'a' ? 'is-active' : ''}" type="button" data-ab-slot="a"><strong>A</strong><span>${escapeHtml(compare.a?.label ?? 'Core')}</span></button>
        <button class="${compare.activeSlot === 'b' ? 'is-active' : ''}" type="button" data-ab-slot="b"><strong>B</strong><span>${escapeHtml(compare.b?.label ?? 'Full')}</span></button>
      </div>
      <div class="ab-diff-row">
        ${(compare.diff ?? []).slice(0, 5).map((item) => `<span>${escapeHtml(item.labelZh.split(' ')[0])} ${item.delta > 0 ? '+' : ''}${escapeHtml(item.delta)}</span>`).join('')}
      </div>
    </section>
  `;
}

function renderLibrarySyncPanel(model = {}, activeModule = 'project-library') {
  const library = model.library ?? {};
  const gitSync = library.gitSync ?? {};
  const patchKey = model.patch?.libraryKey ?? model.patch?.id ?? '';
  const isFavorite = (library.favorites ?? []).some((favorite) => favorite.patchId === patchKey && favorite.active);
  const titles = {
    favorites: ['Favorites', '收藏当前声音，方便反复 A/B。'],
    'project-library': ['Project Library', '把当前 Patch 存到项目库。'],
    'cloud-sync': ['Git Sync', '用 GitHub 仓库同步预设 JSON。'],
    'midi-input': ['MIDI Input', '进入 MIDI Learn，把硬件 CC 映射到宏。'],
    'batch-export': ['Batch Export', '设置命名规则，方便 REAPER 批量交付。'],
  };
  const [title, note] = titles[activeModule] ?? ['Project Library / Git sync', `${gitSync.owner ?? ''}/${gitSync.repo ?? ''}`];
  return `
    <section class="workbench-panel professional-module-panel library-sync-panel" data-advanced-panel="${escapeHtml(activeModule)}" aria-label="Project library and sync">
      <div class="mini-panel-head"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span></div>
      <div class="library-sync-grid">
        <button class="${isFavorite ? 'is-active' : ''}" type="button" data-favorite-patch="${escapeHtml(patchKey)}">${isFavorite ? 'Favorited' : 'Favorite'}</button>
        <button type="button" data-project-library-action="save">Save to project</button>
        <button type="button" data-git-sync-action="pull">Pull</button>
        <button type="button" data-git-sync-action="push">Push</button>
        <button type="button" data-midi-learn> MIDI Learn</button>
      </div>
      <label class="export-name-rule">
        <span>Batch naming</span>
        <input data-export-name-pattern value="${escapeHtml(library.exportRules?.pattern ?? '{family}_{preset}_{date}_{version}_{variant}')}" />
        <strong>${escapeHtml(library.exportRules?.preview ?? '')}</strong>
      </label>
    </section>
  `;
}

function renderProfessionalControlGrid(model = {}, activeAdvancedModule = 'advanced') {
  const activeModule = activeAdvancedModule === 'advanced-panel' ? 'advanced' : activeAdvancedModule;
  const libraryModules = new Set(['favorites', 'project-library', 'cloud-sync', 'midi-input', 'batch-export']);
  const panelHtml = (() => {
    if (activeModule === 'advanced') return renderAdvancedOverviewPanel(model);
    if (activeModule === 'mod-matrix') return renderProfessionalModMatrix(model);
    if (activeModule === 'envelope-editor') return renderEnvelopeEditorFocusPanel(model);
    if (activeModule === 'fx-chain') return renderFxChainEditor(model);
    if (activeModule === 'xy-pad' || activeModule === 'macro-morph') return renderXYMacroPanel(model);
    if (activeModule === 'ab-compare') return renderAbComparePanel(model);
    if (libraryModules.has(activeModule)) return renderLibrarySyncPanel(model, activeModule);
    return renderAdvancedOverviewPanel(model);
  })();
  return `
    <div class="professional-control-grid" data-active-advanced-panel="${escapeHtml(activeModule)}">
      ${panelHtml}
    </div>
  `;
}

function renderWorkbenchRightRail(family = {}, model = {}) {
  const drawer = model.sourceDrawer ?? {};
  const familyName = family.titleZh?.split('：')[0] ?? '当前声音';
  const goalText = `用 ${familyName} 做一个可交付的目标音效：先听 dry 主体，再用频谱、包络、调制和空间判断是否接近参考。`;
  const theoryText = family.summaryZh ?? '通过频谱、包络和调制关系判断声音材质，而不是只靠音量变化。';
  return `
    <aside class="workbench-right-rail atlas-right-rail">
      <section class="side-panel atlas-goal-panel">
        <div class="atlas-inspector-heading">
          <span aria-hidden="true">◎</span>
          <strong>今日目标</strong>
        </div>
        <p>${escapeHtml(goalText)}</p>
      </section>
      <section class="side-panel atlas-theory-panel">
        <div class="atlas-inspector-heading">
          <span aria-hidden="true">✓</span>
          <strong>理论重点</strong>
        </div>
        <p>${escapeHtml(theoryText)}</p>
      </section>
      ${renderListeningCompassPanel(model)}
      ${renderEarTriagePanel(model)}
      ${renderPatchDoctorPanel(model)}
      ${renderPracticeLoopPanel(model)}
      <section class="side-panel source-inspector-panel">
        <div class="side-panel-title">来源快照</div>
        <div class="video-source-row">
          <span class="youtube-dot" aria-hidden="true"></span>
          <div>
            <strong>${escapeHtml(drawer.sourceName ?? 'Public tutorial / preset source')}</strong>
            <p>${escapeHtml(drawer.titleZh ?? family.titleZh)}</p>
          </div>
          <small>08:25</small>
        </div>
        <div class="source-quote">
          <span>时间轴 04:12</span>
          <p>${escapeHtml(drawer.extractionZh ?? family.summaryZh)}</p>
        </div>
        <div class="translated-note">
          <strong>中文提炼</strong>
          <p>${escapeHtml(family.summaryZh)}</p>
        </div>
        <div class="source-evidence"><span class="source-pill">来源依据</span>${(family.sourceIds ?? []).map((sourceId) => `<span class="source-pill">${escapeHtml(sourceId)}</span>`).join('')}</div>
      </section>
      <section class="side-panel learning-step-panel">
        <div class="side-panel-title">学习步骤</div>
        <ol class="numbered-step-list">
          ${(family.practiceSteps ?? []).slice(0, 3).map((step, index) => `<li><span>${index + 1}</span>${escapeHtml(step)}</li>`).join('')}
        </ol>
        <button class="atlas-push-button" type="button" data-workbench-action="focus-source">推到 Sound Lab</button>
      </section>
      <section class="side-panel reaper-export-panel">
        <div class="side-panel-title">REAPER 导出清单</div>
        <ul class="check-list">
          ${(family.reaperExport ?? []).map((item, index) => `<li class="${index < 4 ? 'is-checked' : ''}"><span></span>${escapeHtml(item)}</li>`).join('')}
        </ul>
        <button class="reaper-template-button" type="button" data-workbench-action="open-reaper-template">打开 REAPER 模板</button>
      </section>
    </aside>
  `;
}

function renderWorkbenchFooter(family = {}) {
  const route = [
    ['LISTENING', '听辨参考'],
    ['BASIC WAVE', '基础波形'],
    ['SOUND LAB', '当前步骤'],
    ['DELIVERY PREP', '导出准备'],
    ['REAPER DELIVERY', '交付检查'],
  ];
  return `
    <section class="workbench-footer-grid atlas-roadmap-strip">
      <div class="route-progress-panel">
        <div class="mini-panel-head"><strong>学习路线进度</strong><span>${escapeHtml(family.titleZh?.split('：')[0] ?? '当前声音')}</span></div>
        <div class="route-timeline">
          ${route.map((item, index) => `
            <div class="${index <= 2 ? 'is-current' : ''}">
              <span>${index + 1}</span>
              <strong>${escapeHtml(item[0])}</strong>
              <small>${escapeHtml(item[1])}</small>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="challenge-panel">
        <div class="mini-panel-head"><strong>今日挑战</strong><span>3 个 10 分钟练习</span></div>
        <button type="button" data-workbench-action="start-ab">A/B 听辨</button>
        <button type="button" data-workbench-action="start-parameter">参数反推</button>
        <button type="button" data-workbench-action="start-signal">信号流排序</button>
      </div>
      <div class="quick-entry-panel">
        <div class="mini-panel-head"><strong>快速入口</strong><span>继续制作</span></div>
        <button type="button" data-workbench-action="new-experiment">新建实验</button>
        <button type="button" data-workbench-action="open-library">打开预设库</button>
        <button type="button" data-workbench-action="import-serum">导入 Serum 预设</button>
      </div>
    </section>
  `;
}

function renderWorkbenchCommandCenter(family = {}, model = {}, options = {}) {
  const stepCopy = {
    source: ['01 选目标', '先选材质家族，听 dry 主体是否已经像目标声音。', '下一步：打开参数塑形，把 Attack、Decay、材质和运动分开调。'],
    shape: ['02 调声音', '现在处理包络、宏、调制和效果链，每次只解决一个听感问题。', '下一步：做 A/B 对照，确认变化不是音量错觉。'],
    compare: ['03 试听对比', '对比 dry / full / Tone.js，高质量引擎和参考响度要一起看。', '下一步：把当前版本导出为 dry、full、tail-only。'],
    deliver: ['04 导出交付', '复制 Patch JSON 与 REAPER Notes，保存可复盘的版本。', '下一步：回到来源或新建实验，继续做变体。'],
  };
  const activeStep = options.activeWorkflowStep ?? 'source';
  const [title, body, next] = stepCopy[activeStep] ?? stepCopy.source;
  const familyName = family.titleZh?.split('：')[0] ?? '当前音效';
  const activePanel = options.activeAdvancedModule ?? 'advanced';
  const activeSynth = {
    serum: 'Serum 2',
    'phase-plant': 'Phase Plant',
    vital: 'Vital',
  }[options.activeWorkbenchSynth] ?? 'Serum 2';

  return `
    <section class="workbench-command-center" aria-label="工作台指挥条">
      <div class="command-current-task">
        <span>当前任务</span>
        <strong>${escapeHtml(title)} · ${escapeHtml(familyName)}</strong>
        <p>${escapeHtml(body)}</p>
      </div>
      <div class="workbench-command-actions" aria-label="快速操作">
        <button type="button" data-workbench-action="focus-source">
          <span>01</span>
          <strong>声源</strong>
          <small>波形 / 频谱</small>
        </button>
        <button type="button" data-workbench-action="focus-controls">
          <span>02</span>
          <strong>参数</strong>
          <small>包络 / 宏</small>
        </button>
        <button type="button" data-workbench-action="focus-coach">
          <span>03</span>
          <strong>教练</strong>
          <small>三合成器</small>
        </button>
        <button type="button" data-workbench-action="focus-export">
          <span>04</span>
          <strong>交付</strong>
          <small>REAPER</small>
        </button>
        <button class="command-play-button ${options.isPlaying ? 'is-playing' : ''}" type="button" data-sound-lab-play>
          <span>${options.isPlaying ? '暂停感' : '▶'}</span>
          <strong>${options.isPlaying ? '播放中' : '试听'}</strong>
          <small>当前 Patch</small>
        </button>
      </div>
      <div class="workbench-state-strip" aria-label="当前工作台状态">
        <span><strong>下一步</strong>${escapeHtml(next)}</span>
        <span><strong>面板</strong>${escapeHtml(activePanel)}</span>
        <span><strong>合成器</strong>${escapeHtml(activeSynth)}</span>
        <span><strong>音色</strong>${escapeHtml(model.patch?.nameZh ?? familyName)}</span>
      </div>
      <div class="workbench-feedback" role="status" aria-live="polite">
        ${escapeHtml(options.workbenchActionFeedback ?? '先选材质或点击播放；每次只解决一个听感问题。')}
      </div>
    </section>
  `;
}

function renderAtlasCommandDock(model = {}, options = {}) {
  const morphAmount = model.macroMorph?.amount ?? 0;
  const confirmedClass = (action) => options.confirmedWorkbenchAction === action ? ' is-confirmed' : '';
  return `
    <section class="atlas-command-dock" aria-label="Signal Atlas playback and compare controls">
      <div class="atlas-dock-status" role="status" aria-live="polite">
        <span>当前 Patch</span>
        <strong>${escapeHtml(model.patch?.nameZh ?? 'Sound Lab')}</strong>
        <small>${escapeHtml(options.workbenchActionFeedback ?? '先听 dry 主体，再判断材质和空间。')}</small>
      </div>
      <div class="atlas-dock-actions" aria-label="试听与对照">
        <button class="atlas-ab-button" type="button" data-sound-lab-ab="a"><span>A</span><strong>Dry</strong></button>
        <button class="atlas-ab-button is-b" type="button" data-sound-lab-ab="b"><span>B</span><strong>Full</strong></button>
        <button class="atlas-play-button ${options.isPlaying ? 'is-playing' : ''}" type="button" data-sound-lab-play>
          <span aria-hidden="true"></span>
          <strong>${options.isPlaying ? '播放中' : '试听'}</strong>
        </button>
        <button class="atlas-tool-button${confirmedClass('randomize-patch')}" type="button" data-workbench-action="randomize-patch">Randomize</button>
        <button class="atlas-tool-button${confirmedClass('export-preset')}" type="button" data-workbench-action="export-preset">Export</button>
      </div>
      <label class="atlas-morph-control range-shell" style="--range-value:${formatNumber(morphAmount)}%">
        <span>Macro Morph</span>
        <input type="range" data-macro-morph min="0" max="100" step="1" value="${escapeHtml(morphAmount)}" />
        <strong>${formatNumber(100 - morphAmount)} / ${formatNumber(morphAmount)}</strong>
      </label>
    </section>
  `;
}

function renderBeginnerSynthesisPathPanel(model = {}) {
  const path = model.beginnerSynthesisPath ?? {};
  const steps = path.steps ?? [];
  if (!steps.length) return '';
  const currentStepId = path.currentStepId ?? steps[0]?.id;
  const nextStepId = path.nextStep?.id ?? '';
  const focusCard = path.focusCard ?? null;
  const renderStepAttributes = (step) => {
    const attrs = [`data-beginner-synthesis-step="${escapeHtml(step.id)}"`];
    if (step.applyDiagnosticId) {
      attrs.push(`data-doctor-apply="${escapeHtml(step.applyDiagnosticId)}"`);
    } else if (step.layerAudition) {
      attrs.push(`data-layer-audition="${escapeHtml(step.layerAudition)}"`);
    } else if (step.outputMode) {
      attrs.push(`data-output-compare="${escapeHtml(step.outputMode)}"`);
    } else {
      attrs.push(`data-workbench-action="${escapeHtml(step.workbenchAction ?? 'focus-controls')}"`);
    }
    return attrs.join(' ');
  };
  const renderFocusActionAttributes = (action) => {
    const attrs = [`data-beginner-focus-action="${escapeHtml(action.id ?? '')}"`];
    if (action.type === 'play') {
      attrs.push('data-sound-lab-play');
    } else if (action.type === 'doctor') {
      attrs.push(`data-doctor-apply="${escapeHtml(action.doctorId ?? '')}"`);
    } else if (action.type === 'layer') {
      attrs.push(`data-layer-audition="${escapeHtml(action.layerAudition ?? 'full')}"`);
    } else if (action.type === 'output') {
      attrs.push(`data-output-compare="${escapeHtml(action.outputMode ?? 'comfort')}"`);
    } else {
      attrs.push(`data-workbench-action="${escapeHtml(action.workbenchAction ?? 'focus-controls')}"`);
    }
    return attrs.join(' ');
  };
  const renderFocusCard = () => {
    if (!focusCard) return '';
    return `
      <div class="beginner-synthesis-focus" data-beginner-focus="${escapeHtml(focusCard.stepId ?? currentStepId)}">
        <div class="beginner-focus-copy">
          <span>Current Step</span>
          <strong>${escapeHtml(focusCard.titleZh ?? '现在先听当前步骤')}</strong>
          <p>${escapeHtml(focusCard.listenQuestionZh ?? '')}</p>
        </div>
        <div class="beginner-focus-prompts">
          <article>
            <span>只改一个</span>
            <p>${escapeHtml(focusCard.oneChangeRuleZh ?? '')}</p>
          </article>
          <article>
            <span>验收标准</span>
            <p>${escapeHtml(focusCard.proofQuestionZh ?? '')}</p>
          </article>
        </div>
        <div class="beginner-focus-actions">
          ${(focusCard.actions ?? []).map((action) => `
            <button type="button" ${renderFocusActionAttributes(action)}>
              <strong>${escapeHtml(action.labelZh ?? '执行')}</strong>
              <small>${escapeHtml(action.noteZh ?? '')}</small>
            </button>
          `).join('')}
        </div>
        <ul class="beginner-focus-guardrails">
          ${(focusCard.guardrails ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  return `
    <section class="beginner-synthesis-path-panel" aria-label="从零到交付路线" data-flow-surface>
      <div class="beginner-synthesis-head">
        <div>
          <span>Beginner Director</span>
          <strong>${escapeHtml(path.titleZh ?? 'Synthesis Path')}</strong>
          <p>${escapeHtml(path.summaryZh ?? '按顺序听、改、验证和交付。')}</p>
        </div>
        <aside>
          <span>下一步</span>
          <strong>${escapeHtml(path.nextStep?.titleZh ?? '继续 A/B')}</strong>
          <small>${escapeHtml(path.nextStep?.actionLabelZh ?? '只改一个参数')}</small>
        </aside>
      </div>
      ${renderFocusCard()}
      <div class="beginner-synthesis-grid">
        ${steps.map((step) => {
          const className = [
            'beginner-synthesis-step',
            step.id === currentStepId ? 'is-current' : '',
            step.id === nextStepId ? 'is-next' : '',
          ].filter(Boolean).join(' ');
          return `
            <button class="${className}" type="button" ${renderStepAttributes(step)} aria-pressed="${step.id === currentStepId ? 'true' : 'false'}">
              <span>${escapeHtml(step.labelZh)}</span>
              <strong>${escapeHtml(step.titleZh)}</strong>
              <p>${escapeHtml(step.whyZh)}</p>
              <small>${escapeHtml(step.listenZh)}</small>
              <em>${escapeHtml(step.actionLabelZh)}</em>
            </button>
          `;
        }).join('')}
      </div>
      <div class="beginner-synthesis-detail">
        <article>
          <strong>Serum</strong>
          <p>${escapeHtml(steps.find((step) => step.id === currentStepId)?.synthActions?.serum ?? steps[0]?.synthActions?.serum ?? '')}</p>
        </article>
        <article>
          <strong>Phase Plant</strong>
          <p>${escapeHtml(steps.find((step) => step.id === currentStepId)?.synthActions?.phasePlant ?? steps[0]?.synthActions?.phasePlant ?? '')}</p>
        </article>
        <article>
          <strong>Vital</strong>
          <p>${escapeHtml(steps.find((step) => step.id === currentStepId)?.synthActions?.vital ?? steps[0]?.synthActions?.vital ?? '')}</p>
        </article>
        <article class="beginner-synthesis-reaper">
          <strong>REAPER Proof</strong>
          <p>${escapeHtml(steps.find((step) => step.id === currentStepId)?.reaperProofZh ?? path.reaperTemplateZh ?? '')}</p>
          <code>${escapeHtml(path.reaperTemplateZh ?? '')}</code>
        </article>
      </div>
    </section>
  `;
}

function renderSoundLabWorkbenchLayout(family, model, options, status) {
  const { workletReady, toneReady, isPlaying, engineLabel } = status;
  const activeWorkbenchModule = options.activeWorkbenchModule ?? 'envelope';
  const activeWorkbenchSynth = options.activeWorkbenchSynth ?? 'serum';
  const focusMode = options.focusMode ?? 'guided';
  return `
    <article
      class="card sound-lab-workbench synth-workbench-layout is-${escapeHtml(focusMode)}-focus ${isPlaying ? 'is-playing' : ''}"
      data-active-sound-family="${escapeHtml(family.id)}"
      data-workflow-step="${escapeHtml(options.activeWorkflowStep ?? 'source')}"
      data-focus-mode="${escapeHtml(focusMode)}"
    >
      <header class="workbench-topbar">
        <div>
          <div class="workbench-breadcrumb">工作台 / <strong>${escapeHtml(family.titleZh.split('：')[0])}</strong> <span>★</span></div>
          <h3>${escapeHtml(family.titleZh)}</h3>
          <p>Sound Lab · Tone.js ${toneReady ? 'ready' : 'fallback'} · AudioWorklet ${workletReady ? 'ready' : 'fallback'} · ${escapeHtml(engineLabel)}</p>
        </div>
        <div class="workbench-actions">
          <button type="button" data-workbench-action="save-patch">保存 Patch</button>
          <button type="button" data-workbench-action="export-preset">导出 Preset</button>
          <button class="icon-more-button ${options.moreOpen ? 'is-active' : ''}" type="button" data-workbench-action="toggle-more" aria-label="更多" aria-pressed="${options.moreOpen ? 'true' : 'false'}">⋮</button>
          ${options.moreOpen ? `
            <div class="workbench-more-tray" role="status">
              <span>Quick</span>
              <button type="button" data-workbench-action="open-library">预设库</button>
              <button type="button" data-workbench-action="open-reaper-template">REAPER</button>
              <button type="button" data-workbench-action="analyze-patch">分析</button>
            </div>
          ` : ''}
        </div>
      </header>
      ${renderWorkbenchCommandCenter(family, model, { ...options, isPlaying })}
      ${renderBeginnerSynthesisPathPanel(model)}
      ${renderPracticeFocusStrip(model)}
      ${renderEarTrainingChainPanel(model)}
      ${renderMissionBriefPanel(model)}
      ${renderTargetMatchCoachPanel(model)}
      ${renderSynthTransferPlanPanel(model)}
      <div class="synth-tab-row">
        ${renderWorkbenchSynthTabs(activeWorkbenchSynth)}
        <button class="compare-tab" type="button" data-workbench-action="compare-view">对照视图</button>
      </div>
      ${renderWorkbenchFlowMap(family, options.activeWorkflowStep)}
      ${renderWorkbenchModuleMap(family, options.activeWorkflowStep, options.activeAdvancedModule, options.activeModuleMapId)}
      ${renderWorkbenchUsageGuide(family, options.activeWorkflowStep)}
      <div class="workbench-main-grid">
        <div class="workbench-core">
          ${renderWorkbenchZoneTitle('01', '监听与频谱', '先看波形、频谱和输出电平，确认声音是否真的在变化。')}
          <div class="analyzer-row">
            ${renderWorkbenchWaveform(model)}
            ${renderWorkbenchSpectrum(model, options.analyzerMode)}
            ${renderAnalyzerCoachPanel(model)}
            ${renderWorkbenchOutputMeter(model)}
          </div>
          ${renderWaveformDetectivePanel(model, options)}
          ${renderPerceptualSignaturePanel(model)}
          ${renderMaterialResonancePanel(model)}
          ${renderProceduralSourceMapPanel(model)}
          ${renderWorkbenchZoneTitle('02', '参数塑形', '从模块标签进入 ADSR、滤波、调制、效果和材质；每次只解决一个听感问题。')}
          ${renderWorkbenchModuleTabs(activeWorkbenchModule)}
          ${renderAdvancedModuleDock(model, options.activeAdvancedModule)}
          ${renderProfessionalControlGrid(model, options.activeAdvancedModule)}
          ${renderWorkbenchEnvelope(model)}
          <div class="control-lower-grid">
            ${renderWorkbenchMacroPanel(model)}
            ${renderWorkbenchModulation(model)}
          </div>
          ${renderParameterCoachPanel(model)}
          <div class="control-bottom-grid">
            ${renderWorkbenchMaterialPanel(family)}
            ${renderWorkbenchPlayback(model, isPlaying)}
            ${renderWorkbenchQuality(model)}
          </div>
          <div class="advanced-engine-grid">
            ${renderSoundLabEngineControls(model, options)}
            ${renderSoundLabDnaControls(model)}
          </div>
          ${renderWorkbenchZoneTitle('03', '合成器调制教练', '把同一声音拆成 Serum 2、Phase Plant、Vital 三套具体步骤，适合边看边复刻。')}
          ${renderWorkbenchCoach(options.modulationGuides, options.activeModulationGuideId, options.activeCoachSynth)}
        </div>
        ${renderWorkbenchRightRail(family, model)}
      </div>
      ${renderWorkbenchFooter(family)}
      <section class="sound-lab-export">
        <div>
          <h4>Patch JSON</h4>
          <pre>${escapeHtml(model.patchJson)}</pre>
        </div>
        <div>
          <h4>REAPER Notes</h4>
          <pre>${escapeHtml(model.reaperNotes)}</pre>
        </div>
      </section>
    </article>
  `;
}

function renderSignalAtlasWorkbenchLayout(family, model, options, status) {
  const { workletReady, toneReady, isPlaying, engineLabel } = status;
  const activeWorkbenchModule = options.activeWorkbenchModule ?? 'envelope';
  const activeWorkbenchSynth = options.activeWorkbenchSynth ?? 'serum';
  const focusMode = options.focusMode ?? 'guided';
  return `
    <article
      class="card sound-lab-workbench synth-workbench-layout signal-atlas-console is-${escapeHtml(focusMode)}-focus ${isPlaying ? 'is-playing' : ''}"
      data-active-sound-family="${escapeHtml(family.id)}"
      data-workflow-step="${escapeHtml(options.activeWorkflowStep ?? 'source')}"
      data-focus-mode="${escapeHtml(focusMode)}"
      data-atlas-console="signal-atlas"
    >
      <div class="atlas-orb" aria-hidden="true"></div>
      <header class="workbench-topbar atlas-topbar">
        <div>
          <div class="workbench-breadcrumb">Signal Atlas / <strong>${escapeHtml(family.titleZh.split('：')[0])}</strong> <span>★</span></div>
          <h3>${escapeHtml(family.titleZh)}</h3>
          <p>Sound Lab · Tone.js ${toneReady ? 'ready' : 'fallback'} · AudioWorklet ${workletReady ? 'ready' : 'fallback'} · ${escapeHtml(engineLabel)}</p>
        </div>
        <div class="workbench-actions">
          <button type="button" data-workbench-action="save-patch">保存 Patch</button>
          <button type="button" data-workbench-action="export-preset">导出 Preset</button>
          <button class="icon-more-button ${options.moreOpen ? 'is-active' : ''}" type="button" data-workbench-action="toggle-more" aria-label="更多" aria-pressed="${options.moreOpen ? 'true' : 'false'}">⋯</button>
          ${options.moreOpen ? `
            <div class="workbench-more-tray" role="status">
              <span>Quick</span>
              <button type="button" data-workbench-action="open-library">预设库</button>
              <button type="button" data-workbench-action="open-reaper-template">REAPER</button>
              <button type="button" data-workbench-action="analyze-patch">分析</button>
            </div>
          ` : ''}
        </div>
      </header>
      ${renderWorkbenchFlowMap(family, options.activeWorkflowStep, options.activeAtlasNode)}
      ${renderBeginnerSynthesisPathPanel(model)}
      ${renderSessionTransportDock(family, model, { ...options, isPlaying })}
      ${renderPracticeFocusStrip(model)}
      ${renderEarTrainingChainPanel(model)}
      ${renderMissionBriefPanel(model)}
      ${renderTargetMatchCoachPanel(model)}
      ${renderSynthTransferPlanPanel(model)}
      <main class="atlas-main-console">
        ${renderWorkbenchZoneTitle('01', '监听与频谱', '先看波形、频谱和输出电平，确认声音是否真的在变化。')}
        <section class="atlas-lab-stage" aria-label="Signal Atlas main lab">
          <div class="atlas-visual-deck">
            <div class="synth-tab-row atlas-synth-tabs">
              ${renderWorkbenchSynthTabs(activeWorkbenchSynth)}
              <button class="compare-tab" type="button" data-workbench-action="compare-view">对照视图</button>
            </div>
            <div class="analyzer-row atlas-analyzer-row">
              ${renderWorkbenchWaveform(model)}
              ${renderWorkbenchSpectrum(model, options.analyzerMode)}
              ${renderAnalyzerCoachPanel(model)}
              ${renderWorkbenchOutputMeter(model)}
            </div>
            ${renderWaveformDetectivePanel(model, options)}
            ${renderPerceptualSignaturePanel(model)}
            ${renderMaterialResonancePanel(model)}
            ${renderProceduralSourceMapPanel(model)}
          </div>
          <div class="atlas-control-column">
            ${renderWorkbenchEnvelope(model)}
            ${renderWorkbenchMacroPanel(model)}
            ${renderXYMacroPanel(model)}
            ${renderParameterCoachPanel(model)}
          </div>
        </section>
        ${renderAtlasCommandDock(model, { ...options, isPlaying })}
      </main>
      ${renderWorkbenchRightRail(family, model)}
      <section class="workbench-main-grid atlas-support-grid" aria-label="Advanced Sound Lab support modules">
        <div class="workbench-core">
          ${renderWorkbenchZoneTitle('02', '参数塑形', '高级编辑区保留 Mod Matrix、FX Chain、A/B、项目库、MIDI 和导出命名，但不再抢占主舞台。')}
          ${renderWorkbenchModuleTabs(activeWorkbenchModule)}
          ${renderAdvancedModuleDock(model, options.activeAdvancedModule)}
          ${renderProfessionalControlGrid(model, options.activeAdvancedModule)}
          ${renderWorkbenchModuleMap(family, options.activeWorkflowStep, options.activeAdvancedModule, options.activeModuleMapId)}
          ${renderWorkbenchUsageGuide(family, options.activeWorkflowStep)}
          ${renderParameterCoachPanel(model)}
          ${renderWorkbenchModulation(model)}
          <div class="control-bottom-grid">
            ${renderWorkbenchMaterialPanel(family)}
            ${renderWorkbenchPlayback(model, isPlaying)}
            ${renderWorkbenchQuality(model)}
          </div>
          <div class="advanced-engine-grid">
            ${renderSoundLabEngineControls(model, options)}
            ${renderSoundLabDnaControls(model)}
          </div>
          ${renderWorkbenchZoneTitle('03', '合成器调制教练', '把同一声音拆成 Serum 2、Phase Plant、Vital 三套具体步骤，适合边看边复制。')}
          ${renderWorkbenchCoach(options.modulationGuides, options.activeModulationGuideId, options.activeCoachSynth)}
        </div>
      </section>
      ${renderWorkbenchFooter(family)}
      <section class="sound-lab-export">
        <div>
          <h4>Patch JSON</h4>
          <pre>${escapeHtml(model.patchJson)}</pre>
        </div>
        <div>
          <h4>REAPER Notes</h4>
          <pre>${escapeHtml(model.reaperNotes)}</pre>
        </div>
      </section>
    </article>
  `;
}

export function renderSoundLabWorkbench(family, model, options = {}) {
  const workletReady = Boolean(options.workletReady);
  const toneReady = Boolean(options.toneReady);
  const isPlaying = Boolean(options.isPlaying);
  const engineLabel = options.engineUsed ? options.engineUsed : model.activeEngineMode;
  return renderSignalAtlasWorkbenchLayout(family, model, options, { workletReady, toneReady, isPlaying, engineLabel });
}
