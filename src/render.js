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

function renderWorkbenchFlowMap(family = {}, activeStep = 'source') {
  const familyName = (family.titleZh ?? '').split('：')[0] || 'Sound Lab';
  const steps = [
    ['source', '01', '选目标', familyName, '先选材质家族，再确认声源角色。'],
    ['shape', '02', '调声音', '包络 / 宏 / 调制', '用 ADSR、Macro 和 Mod Matrix 把听感变化做出来。'],
    ['compare', '03', '试听对比', 'A / B / Tone.js', '用干声、完整链路和高质量引擎排除错觉。'],
    ['deliver', '04', '导出交付', 'Patch / REAPER', '保存 Patch、记录命名并检查 REAPER 交付项。'],
  ];
  const current = steps.find(([id]) => id === activeStep) ?? steps[0];
  return `
    <section class="workbench-flow-map" aria-label="Sound Lab workflow">
      ${steps.map(([id, index, label, note]) => `
        <button class="workflow-step ${id === activeStep ? 'is-active' : ''}" type="button" data-workflow-step="${escapeHtml(id)}" aria-pressed="${id === activeStep ? 'true' : 'false'}">
          <span>${escapeHtml(index)}</span>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(note)}</small>
        </button>
      `).join('')}
      <div class="workflow-context-strip">
        <span>当前步骤 ${escapeHtml(current[1])}</span>
        <strong>${escapeHtml(current[2])}</strong>
        <p>${escapeHtml(current[4])}</p>
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
  const activeWorkbenchSynth = options.activeWorkbenchSynth ?? 'serum';
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
            ${renderWorkbenchOutputMeter(model)}
          </div>
          ${renderWorkbenchZoneTitle('02', '参数塑形', '从模块标签进入 ADSR、滤波、调制、效果和材质；每次只解决一个听感问题。')}
          ${renderWorkbenchModuleTabs(activeWorkbenchModule)}
          ${renderAdvancedModuleDock(model, options.activeAdvancedModule)}
          ${renderProfessionalControlGrid(model, options.activeAdvancedModule)}
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
