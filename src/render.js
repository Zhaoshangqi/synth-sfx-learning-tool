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
      <section class="community-control-panel" aria-label="交互练习">
        <div>
          <h4>交互练习</h4>
          <p>调这些听感参数，再把配方加载到 Sound Lab 试听。这里调整的是网页练习配方，不会伪装成原视频的逐帧参数。</p>
        </div>
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
    '<div class="fx-rack-panel" aria-label="FX Rack"><h4>FX Rack</h4>' + fx + '</div></div>' +
    '</section>';
}

function percentFromRange(value, min, max) {
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((Number(value) - min) / (max - min)) * 100));
}

function renderWorkbenchSynthTabs() {
  const tabs = [
    { id: 'serum', label: 'Serum 2', active: true },
    { id: 'phase-plant', label: 'Phase Plant', active: false },
    { id: 'vital', label: '+ Vital', active: false },
  ];
  return tabs.map((tab) => `
    <button class="synth-tab ${tab.active ? 'is-active' : ''}" type="button" data-synth-tab="${escapeHtml(tab.id)}">
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

function renderWorkbenchSpectrum(model = {}) {
  const bars = model.spectrumBars ?? [];
  return `
    <section class="workbench-panel spectrum-panel spectrum-stage" aria-label="频谱分析">
      <div class="mini-panel-head">
        <strong>频谱分析</strong>
        <div class="segmented-mini" aria-label="频谱模式">
          <button class="is-active" type="button">实时</button>
          <button type="button">冻结</button>
          <button type="button">对数</button>
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
    ['metal', '金属'],
    ['glass', '玻璃'],
    ['electric', '电流'],
    ['machine', '机械'],
    ['air', '空气'],
    ['magic', '魔法'],
    ['custom', '自定义'],
  ];
  const familyText = family.titleZh ?? '';
  return `
    <section class="workbench-panel material-selector-grid" aria-label="材质选择">
      <div class="mini-panel-head"><strong>材质选择</strong><span>${escapeHtml((family.materialAxis ?? []).join(' / '))}</span></div>
      <div class="material-token-row">
        ${materials.map(([id, label]) => `
          <button class="${familyText.includes(label) || (id === 'metal' && familyText.includes('金属')) ? 'is-active' : ''}" type="button" data-workbench-material="${escapeHtml(id)}">
            <span aria-hidden="true"></span>
            ${escapeHtml(label)}
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderWorkbenchPlayback(model = {}, isPlaying = false) {
  return `
    <section class="workbench-panel playback-card" aria-label="播放控制">
      <div class="mini-panel-head"><strong>播放控制</strong><span>参考响度 -14 LUFS</span></div>
      <div class="playback-grid">
        <button class="ab-button" type="button" data-sound-lab-ab="a">A</button>
        <button class="ab-button is-b" type="button" data-sound-lab-ab="b">B</button>
        <button class="play-main-button ${isPlaying ? 'is-playing' : ''}" type="button" data-sound-lab-play aria-label="试听"><span aria-hidden="true"></span></button>
        <button class="tone-button" type="button" data-sound-lab-ab="tone">Tone.js</button>
      </div>
      <div class="reference-volume">
        <span>参考音量</span>
        <strong>-14 LUFS</strong>
        <i style="--range-value:${formatNumber(model.patch?.macros?.space ?? 32)}%"></i>
      </div>
    </section>
  `;
}

function renderWorkbenchQuality(model = {}) {
  const fx = (model.fxRack ?? []).slice(0, 3);
  return `
    <section class="workbench-panel patch-quality-card" aria-label="补丁质量">
      <div class="mini-panel-head"><strong>补丁质量</strong><button type="button" data-workbench-action="analyze-patch">分析补丁</button></div>
      <div class="quality-knob-row">
        ${fx.map((item) => `
          <div class="mini-quality-knob" style="--knob-value:${formatNumber((item.amount ?? 0) * 100)}%">
            <span></span>
            <strong>${escapeHtml(item.labelZh.split('/')[0].trim())}</strong>
            <small>${(item.amount ?? 0) > 0.66 ? '优秀' : '良好'}</small>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAdvancedModuleDock(model = {}) {
  return `
    <section class="advanced-module-dock" aria-label="Advanced Sound Lab modules">
      ${(model.advancedModules ?? []).map((module) => `
        <button class="advanced-module-pill" type="button" data-advanced-module="${escapeHtml(module.id)}">
          <strong>${escapeHtml(module.labelZh)}</strong>
          <span>${escapeHtml(module.noteZh)}</span>
        </button>
      `).join('')}
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
      <div class="fx-chain-list">
        ${slots.map((slot, index) => `
          <div class="fx-chain-slot" draggable="true" data-fx-chain-slot="${escapeHtml(slot.id)}">
            <span>${index + 1}</span>
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
  return `
    <section class="workbench-panel professional-module-panel xy-macro-panel" data-advanced-panel="xy-macro" aria-label="XY Pad and Macro Morph">
      <div class="mini-panel-head"><strong>XY Pad / Macro Morph</strong><span>gestural modulation</span></div>
      <div class="xy-macro-grid">
        <div class="xy-pad" data-xy-pad style="--xy-x:${formatNumber(xy.x)}%; --xy-y:${formatNumber(xy.y)}%">
          <button class="xy-handle" type="button" data-xy-handle aria-label="XY Pad handle"></button>
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

function renderLibrarySyncPanel(model = {}) {
  const library = model.library ?? {};
  const gitSync = library.gitSync ?? {};
  const patchKey = model.patch?.libraryKey ?? model.patch?.id ?? '';
  const isFavorite = (library.favorites ?? []).some((favorite) => favorite.patchId === patchKey && favorite.active);
  return `
    <section class="workbench-panel professional-module-panel library-sync-panel" data-advanced-panel="library-sync" aria-label="Project library and sync">
      <div class="mini-panel-head"><strong>Project library / Git sync</strong><span>${escapeHtml(gitSync.owner ?? '')}/${escapeHtml(gitSync.repo ?? '')}</span></div>
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

function renderProfessionalControlGrid(model = {}) {
  return `
    <div class="professional-control-grid">
      ${renderProfessionalModMatrix(model)}
      ${renderFxChainEditor(model)}
      ${renderXYMacroPanel(model)}
      ${renderAbComparePanel(model)}
      ${renderLibrarySyncPanel(model)}
    </div>
  `;
}

function renderWorkbenchRightRail(family = {}, model = {}) {
  const drawer = model.sourceDrawer ?? {};
  return `
    <aside class="workbench-right-rail">
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
          ${(family.practiceSteps ?? []).slice(0, 5).map((step, index) => `<li><span>${index + 1}</span>${escapeHtml(step)}</li>`).join('')}
        </ol>
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
    ['基础入门', '完成'],
    ['声音生成', '完成'],
    ['调制控制', '进行中'],
    ['频谱塑形', '未开始'],
    ['材质设计', '未开始'],
    ['分层混合', '未开始'],
    ['创意反馈', '未开始'],
  ];
  return `
    <section class="workbench-footer-grid">
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

function renderLightSoundLabWorkbench(family, model, options, status) {
  const { workletReady, toneReady, isPlaying, engineLabel } = status;
  const activeWorkbenchModule = options.activeWorkbenchModule ?? 'envelope';
  return `
    <article class="card sound-lab-workbench synth-workbench-layout ${isPlaying ? 'is-playing' : ''}" data-active-sound-family="${escapeHtml(family.id)}">
      <header class="workbench-topbar">
        <div>
          <div class="workbench-breadcrumb">工作台 / <strong>${escapeHtml(family.titleZh.split('：')[0])}</strong> <span>★</span></div>
          <h3>${escapeHtml(family.titleZh)}</h3>
          <p>Sound Lab · Tone.js ${toneReady ? 'ready' : 'fallback'} · AudioWorklet ${workletReady ? 'ready' : 'fallback'} · ${escapeHtml(engineLabel)}</p>
        </div>
        <div class="workbench-actions">
          <button type="button" data-workbench-action="save-patch">保存 Patch</button>
          <button type="button" data-workbench-action="export-preset">导出 Preset</button>
          <button class="icon-more-button" type="button" aria-label="更多">⋮</button>
        </div>
      </header>
      <div class="synth-tab-row">
        ${renderWorkbenchSynthTabs()}
        <button class="compare-tab" type="button" data-workbench-action="compare-view">对照视图</button>
      </div>
      <div class="workbench-main-grid">
        <div class="workbench-core">
          <div class="analyzer-row">
            ${renderWorkbenchWaveform(model)}
            ${renderWorkbenchSpectrum(model)}
            ${renderWorkbenchOutputMeter(model)}
          </div>
          ${renderWorkbenchModuleTabs(activeWorkbenchModule)}
          ${renderAdvancedModuleDock(model)}
          ${renderWorkbenchEnvelope(model)}
          <div class="control-lower-grid">
            ${renderWorkbenchMacroPanel(model)}
            ${renderWorkbenchModulation(model)}
          </div>
          <div class="control-bottom-grid">
            ${renderWorkbenchMaterialPanel(family)}
            ${renderWorkbenchPlayback(model, isPlaying)}
            ${renderWorkbenchQuality(model)}
          </div>
          ${renderProfessionalControlGrid(model)}
          <div class="advanced-engine-grid">
            ${renderSoundLabEngineControls(model, options)}
            ${renderSoundLabDnaControls(model)}
          </div>
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

export function renderSoundLabWorkbench(family, model, options = {}) {
  const workletReady = Boolean(options.workletReady);
  const toneReady = Boolean(options.toneReady);
  const isPlaying = Boolean(options.isPlaying);
  const engineLabel = options.engineUsed ? options.engineUsed : model.activeEngineMode;
  return renderLightSoundLabWorkbench(family, model, options, { workletReady, toneReady, isPlaying, engineLabel });
  return `
    <article class="card sound-lab-workbench ${isPlaying ? 'is-playing' : ''}" data-active-sound-family="${escapeHtml(family.id)}">
      <div class="sound-lab-head">
        <div>
          <div class="card-kicker">Sound Lab · Tone.js ${toneReady ? 'ready' : 'fallback'} · AudioWorklet ${workletReady ? 'ready' : 'fallback'} · ${escapeHtml(engineLabel)}</div>
          <h3>${escapeHtml(family.titleZh)}</h3>
          <p>${escapeHtml(family.summaryZh)}</p>
        </div>
        <div class="sound-lab-actions">
          <button class="audition-button ${isPlaying ? 'is-playing' : ''}" type="button" data-sound-lab-play>
            <span class="audition-dot" aria-hidden="true"></span>
            ${isPlaying ? '播放中' : '试听'}
          </button>
          <button class="secondary-button" type="button" data-sound-lab-ab="a">A 干声</button>
          <button class="secondary-button" type="button" data-sound-lab-ab="b">B 完整</button>
          <button class="secondary-button" type="button" data-sound-lab-ab="tone">Tone.js</button>
        </div>
      </div>
      ${renderSoundLabEngineControls(model, options)}
      <section class="sound-lab-stage">
        <div class="spectrum-stage" aria-label="频谱和共振预览">
          <div class="spectrum-header">
            <span>频谱 / 共振</span>
            <strong>${escapeHtml(model.patch.workletName)}</strong>
          </div>
          <div class="spectrum-bars" aria-hidden="true">
            ${model.spectrumBars.map((bar, index) => `<span style="--bar:${formatNumber(bar)}%; --i:${index}"></span>`).join('')}
          </div>
          <div class="material-axis">
            ${family.materialAxis.map((axis) => `<span>${escapeHtml(axis)}</span>`).join('')}
          </div>
        </div>
        <div class="macro-bank" aria-label="Sound Lab 宏控制">
          ${model.macros.map((macro) => `
            <label class="macro-knob" style="--knob-value:${formatNumber(macro.percent)}%">
              <span class="knob-face" aria-hidden="true"><i></i></span>
              <strong>${escapeHtml(macro.labelZh)}</strong>
              <small>${escapeHtml(macro.percent < 50 ? macro.lowZh : macro.highZh)}</small>
              <input
                type="range"
                data-sound-lab-control="${escapeHtml(macro.id)}"
                min="0"
                max="100"
                step="1"
                value="${escapeHtml(macro.value)}"
              />
            </label>
          `).join('')}
        </div>
      </section>
      ${renderSoundLabDnaControls(model)}
      <section class="sound-lab-meter-grid">
        ${model.meters.map((meter) => `
          <div>
            <span>${escapeHtml(meter.labelZh)}</span>
            <strong>${formatNumber(meter.value)}</strong>
            <i style="--meter:${formatNumber(meter.value)}%"></i>
          </div>
        `).join('')}
      </section>
      <section class="sound-lab-practice">
        <div>
          <h4>练习步骤</h4>
          <ol>${listItems(family.practiceSteps)}</ol>
        </div>
        <div>
          <h4>REAPER 导出</h4>
          <ol>${listItems(family.reaperExport)}</ol>
        </div>
        <div>
          <h4>来源依据</h4>
          <div class="source-evidence">${family.sourceIds.map((sourceId) => `<span class="source-pill">${escapeHtml(sourceId)}</span>`).join('')}</div>
        </div>
      </section>
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
