import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sources, soundLabFamilies } from '../src/content.js';
import {
  SOUND_LAB_MACROS,
  SOUND_LAB_PARAMETER_COACH,
  buildSoundLabPatch,
  buildSoundLabViewModel,
  buildWorkletMessage,
  getSoundLabFamily,
} from '../src/sound-lab-model.js';

test('sound lab content exposes high-quality diverse sound families', () => {
  assert.ok(soundLabFamilies.length >= 6, 'expected metal, glass, electric, air, servo, energy style families');
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const family of soundLabFamilies) {
    assert.match(family.id, /^[a-z0-9-]+$/);
    assert.ok(family.titleZh);
    assert.ok(family.materialAxis.length >= 4);
    assert.ok(family.presets.length >= 3, `${family.id} needs at least three presets`);
    assert.ok(family.practiceSteps.length >= 4, `${family.id} needs beginner-to-delivery steps`);
    assert.ok(family.reaperExport.length >= 3, `${family.id} needs REAPER export guidance`);
    assert.ok(family.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${family.id} has unknown source`);
  }
});

test('buildSoundLabPatch maps macros to AudioWorklet-ready DSP parameters', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 36,
    material: 74,
    space: 28,
    variation: 41,
  });

  assert.equal(patch.familyId, 'metal-impact');
  assert.ok(patch.workletName);
  assert.ok(patch.durationSeconds > 0.2);
  assert.ok(patch.dsp.resonators.length >= 2);
  assert.ok(patch.dsp.transient.clickGain > 0);
  assert.ok(patch.dsp.filter.frequency > 1000);
  assert.ok(patch.dsp.space.mix > 0);
  assert.ok(patch.dsp.safety.outputGain <= 0.9);
});

test('buildWorkletMessage produces a stable message contract for the browser audio engine', () => {
  const patch = buildSoundLabPatch(soundLabFamilies[0], SOUND_LAB_MACROS);
  const message = buildWorkletMessage(patch);

  assert.deepEqual(Object.keys(message).sort(), ['familyId', 'id', 'payload', 'type'].sort());
  assert.equal(message.type, 'sound-lab:play');
  assert.equal(message.payload.sampleRateHint, 48000);
  assert.ok(Array.isArray(message.payload.resonators));
  assert.equal(typeof message.payload.seed, 'number');
});

test('buildSoundLabViewModel exposes meters, macro labels, evidence, and export text', () => {
  const model = buildSoundLabViewModel(soundLabFamilies[0], SOUND_LAB_MACROS);

  assert.equal(model.macros.length, 5);
  assert.ok(model.macros.every((macro) => macro.percent >= 0 && macro.percent <= 100));
  assert.ok(model.meters.length >= 4);
  assert.ok(model.evidence.length >= 1);
  assert.match(model.patchJson, /"familyId"/);
  assert.match(model.reaperNotes, /REAPER/);
});

test('buildSoundLabViewModel exposes a live parameter coach for beginner control feedback', () => {
  const model = buildSoundLabViewModel(soundLabFamilies[0], {
    brightness: 42,
    motion: 38,
    material: 92,
    space: 30,
    variation: 18,
  });

  assert.ok(SOUND_LAB_PARAMETER_COACH.macros.material.listenZh);
  assert.ok(SOUND_LAB_PARAMETER_COACH.performance.glide.synthZh);
  assert.ok(SOUND_LAB_PARAMETER_COACH.layers.transient.reaperZh);
  assert.equal(model.parameterCoach.titleZh, '实时参数导师');
  assert.equal(model.parameterCoach.focus.id, 'material');
  assert.match(model.parameterCoach.focus.listenZh, /材质|非谐波|主体/);
  assert.ok(model.parameterCoach.checklist.length >= 3);
});

test('buildSoundLabViewModel exposes an analyzer coach that turns spectrum into parameter moves', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 86,
    motion: 42,
    material: 88,
    space: 66,
    variation: 28,
  }, {
    qualityMode: 'studio',
    outputMode: 'comfort',
  });

  assert.equal(model.analyzerCoach.titleZh, '频谱 / 波形读图教练');
  assert.ok(model.analyzerCoach.bands.length >= 4);
  assert.ok(model.analyzerCoach.bands.some((band) => band.id === 'transient' && band.parameterId === 'transient'));
  assert.ok(model.analyzerCoach.bands.some((band) => band.id === 'body' && band.parameterId === 'material'));
  assert.ok(model.analyzerCoach.bands.some((band) => band.id === 'air' && band.parameterId === 'brightness'));
  assert.ok(model.analyzerCoach.bands.every((band) => band.listenZh && band.synthZh && band.reaperZh));
  assert.match(model.analyzerCoach.beginnerRuleZh, /先看时间|再看频段|最后 A\/B/);
  assert.match(model.analyzerCoach.nextMove.reaperNoteZh, /REAPER|A\/B|spectrum/i);
  assert.ok(model.analyzerCoach.nextMove.parameterId);
});

test('buildSoundLabViewModel explains the basic waveform ingredients behind a patch', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 78,
    motion: 42,
    material: 86,
    space: 30,
    variation: 55,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });

  assert.ok(model.waveformFingerprint, 'view model should include a beginner waveform fingerprint');
  assert.ok(model.waveformFingerprint.ingredients.length >= 4);
  assert.ok(model.waveformFingerprint.ingredients.some((item) => item.id === 'sine' && item.value > 0));
  assert.ok(model.waveformFingerprint.ingredients.some((item) => item.id === 'saw' && item.value > 0));
  assert.ok(model.waveformFingerprint.ingredients.some((item) => item.id === 'noise' && item.value > 0));
  assert.ok(model.waveformFingerprint.listeningSteps.length >= 4);
  assert.match(model.waveformFingerprint.beginnerSummaryZh, /基础波形|听感/);
});

test('buildSoundLabViewModel turns waveform detective into a playable reverse-engineering drill', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 42,
    material: 86,
    space: 44,
    variation: 38,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
  });
  const drill = model.waveformFingerprint.drillSteps;

  assert.ok(Array.isArray(drill), 'waveform detective should expose clickable drill steps');
  assert.deepEqual(drill.map((step) => step.id), ['anchor', 'body-solo', 'edge-sweep', 'ab-proof']);
  assert.ok(drill.every((step) => step.titleZh && step.listenZh && step.proofZh));
  assert.ok(drill.some((step) => step.playAction === 'current'));
  assert.ok(drill.some((step) => step.layerAudition === 'body'));
  assert.ok(drill.some((step) => step.action === 'focus-controls'));
  assert.ok(drill.some((step) => step.outputMode === 'comfort'));
  assert.ok(drill.every((step) => /Serum|Phase Plant|Vital/.test(step.synthZh)));
  assert.ok(drill.every((step) => /A\/B|REAPER|solo|pitch|filter|FM/i.test(step.proofZh + step.listenZh)));
  assert.ok(drill.every((step) => step.feedbackZh && step.nextZh), 'each drill step should explain what just happened and what to do next');
  assert.ok(drill.every((step) => /下一步|记录|验证|solo|A\/B|REAPER|filter|Brightness/i.test(step.nextZh + step.feedbackZh)));
});

test('buildSoundLabViewModel exposes a beginner ear chain that connects waveform layers repair and REAPER proof', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 36,
    material: 88,
    space: 58,
    variation: 42,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 90, body: 58, texture: 82, tail: 76 },
  });

  const chain = model.earTrainingChain;
  assert.ok(chain, 'view model should expose a single beginner ear training chain');
  assert.match(chain.titleZh, /Beginner Ear Chain|听音诊断链|听音/);
  assert.match(chain.summaryZh, /波形|起音|主体|尾巴|A\/B|REAPER/);
  assert.equal(chain.steps.length, 5);
  assert.deepEqual(chain.steps.map((step) => step.id), ['waveform-map', 'time-split', 'layer-solo', 'one-change', 'ab-proof']);
  assert.ok(chain.steps.every((step) => step.labelZh && step.listenZh && step.proofZh));
  assert.ok(chain.steps.every((step) => step.action || step.playAction || step.layerAudition || step.applyDiagnosticId || step.outputMode));
  assert.match(chain.steps[0].listenZh + chain.steps[0].proofZh, /Sine|Square|Saw|Triangle|Noise|噪声/);
  assert.match(chain.steps[1].listenZh, /起音|主体|尾巴/);
  assert.equal(chain.steps[2].layerAudition, 'body');
  assert.equal(chain.steps[3].applyDiagnosticId, model.patchDoctor.diagnostics[0].id);
  assert.equal(chain.steps[4].outputMode, 'comfort');
  assert.ok(chain.synthMap.serum && chain.synthMap.phasePlant && chain.synthMap.vital);
  assert.match(chain.reaperNoteTemplate, /A\/B|REAPER|dry|full|tail-only/);
  assert.equal(chain.activeStepId, 'one-change');
});

test('buildSoundLabViewModel creates a beginner practice loop with one-change A/B guidance', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 70,
    motion: 46,
    material: 82,
    space: 36,
    variation: 44,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });

  assert.ok(model.practiceLoop, 'view model should expose a practice loop');
  assert.match(model.practiceLoop.titleZh, /听辨闭环|A\/B/);
  assert.match(model.practiceLoop.goalZh, /金属|目标音效|Patch/);
  assert.ok(model.practiceLoop.steps.length >= 4);
  assert.ok(model.practiceLoop.steps.some((step) => /只改一个参数/.test(step)));
  assert.ok(model.practiceLoop.checkpoints.length >= 3);
  assert.ok(model.practiceLoop.reaperNoteTemplate.includes('A/B'));
  assert.ok(model.practiceLoop.focusMacroId);
});

test('buildSoundLabViewModel creates a dynamic listening compass for transient body and tail', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 76,
    motion: 44,
    material: 88,
    space: 66,
    variation: 38,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    workflowStep: 'shape',
  });

  assert.ok(model.listeningCompass, 'view model should expose a beginner listening compass');
  assert.match(model.listeningCompass.titleZh, /听辨导航/);
  assert.match(model.listeningCompass.summaryZh, /起音|主体|尾巴/);
  assert.equal(model.listeningCompass.stages.length, 3);
  assert.deepEqual(model.listeningCompass.stages.map((stage) => stage.id), ['transient', 'body', 'tail']);
  assert.ok(model.listeningCompass.stages.every((stage) => stage.listenForZh && stage.action));
  assert.ok(model.listeningCompass.stages.some((stage) => /金属|材质/.test(stage.listenForZh)));
  assert.match(model.listeningCompass.nextAction.labelZh, /A\/B|验证|下一步/);
  assert.match(model.listeningCompass.nextAction.noteZh, /只改一个参数|一个听感/);
});

test('buildSoundLabViewModel creates a Patch Doctor with prioritized next edits', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 91,
    motion: 34,
    material: 86,
    space: 72,
    variation: 38,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 86, body: 62, texture: 72, tail: 78 },
  });

  assert.ok(model.patchDoctor, 'view model should expose a beginner next-edit diagnosis');
  assert.match(model.patchDoctor.titleZh, /Patch Doctor|诊断/);
  assert.match(model.patchDoctor.summaryZh, /下一步|先听|只改一个/);
  assert.equal(model.patchDoctor.diagnostics.length, 3);
  assert.ok(model.patchDoctor.diagnostics.every((item) => item.priority >= 1 && item.listenZh && item.whyZh && item.action));
  assert.ok(model.patchDoctor.diagnostics.some((item) => /刺耳|空间|尾巴|瞬态/.test(item.labelZh + item.listenZh)));
  assert.ok(model.patchDoctor.diagnostics.every((item) => item.synthTargets?.serum && item.synthTargets?.phasePlant && item.synthTargets?.vital));
  assert.ok(model.patchDoctor.diagnostics.every((item) => /REAPER|A\/B|dry|full|tail/i.test(item.reaperCheckZh)));
});

test('Patch Doctor diagnostics expose safe one-click trial adjustments', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 94,
    motion: 24,
    material: 90,
    space: 78,
    variation: 28,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 92, body: 52, texture: 82, tail: 84 },
  });

  assert.equal(model.patchDoctor.diagnostics.length, 3);
  assert.ok(model.patchDoctor.diagnostics.every((item) => item.applyAction?.id === item.id));
  assert.ok(model.patchDoctor.diagnostics.every((item) => item.applyAction?.labelZh && item.applyAction?.feedbackZh));
  assert.ok(model.patchDoctor.diagnostics.every((item) => item.applyAction?.targetModule && item.applyAction?.targetSelector));

  const allDeltas = model.patchDoctor.diagnostics.flatMap((item) => [
    ...Object.values(item.applyAction?.macroDelta ?? {}),
    ...Object.values(item.applyAction?.layerDelta ?? {}),
  ]);
  assert.ok(allDeltas.length >= 3, 'Patch Doctor should suggest actual parameter changes');
  assert.ok(allDeltas.every((value) => Number.isFinite(value) && Math.abs(value) <= 12), 'trial adjustments should stay small enough for A/B learning');

  const harsh = model.patchDoctor.diagnostics.find((item) => item.id === 'harsh-edge');
  assert.ok(harsh?.applyAction?.macroDelta?.brightness < 0, 'harsh-edge should try lowering brightness first');
  assert.ok(harsh.applyAction.layerDelta?.texture <= 0, 'harsh-edge should reduce texture instead of adding more high-frequency material');
});

test('buildSoundLabViewModel exposes a sound quality coach tied to the safest next repair', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 96,
    motion: 26,
    material: 92,
    space: 82,
    variation: 30,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 92, body: 54, texture: 86, tail: 88 },
  });

  assert.ok(model.soundQualityCoach, 'view model should expose a beginner sound quality coach');
  assert.match(model.soundQualityCoach.titleZh, /音质|听诊|质量/);
  assert.match(model.soundQualityCoach.summaryZh, /响度|刺耳|主体|尾巴|A\/B/);
  assert.equal(model.soundQualityCoach.metrics.length, 5);
  assert.ok(model.soundQualityCoach.metrics.every((metric) => metric.id && metric.labelZh && metric.listenZh && metric.fixZh));
  assert.ok(model.soundQualityCoach.metrics.every((metric) => Number.isFinite(metric.value) && metric.value >= 0 && metric.value <= 100));
  assert.ok(model.soundQualityCoach.routine.length >= 3);
  assert.equal(model.soundQualityCoach.primaryFix.diagnosticId, model.patchDoctor.diagnostics[0].id);
  assert.match(model.soundQualityCoach.primaryFix.labelZh, /一键|试修|优先/);
  assert.match(model.soundQualityCoach.primaryFix.feedbackZh, /A\/B|只改一个|验证/);
});

test('buildSoundLabViewModel exposes a beginner mission brief with routed listen edit verify deliver steps', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 36,
    material: 84,
    space: 64,
    variation: 34,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'source',
    layerMix: { transient: 86, body: 58, texture: 74, tail: 62 },
  });

  assert.ok(model.missionBrief, 'view model should expose a mission brief for beginners');
  assert.match(model.missionBrief.titleZh, /Mission|任务|闭环/);
  assert.match(model.missionBrief.summaryZh, /听|改|验|交付|A\/B/);
  assert.equal(model.missionBrief.steps.length, 4);
  assert.deepEqual(model.missionBrief.steps.map((step) => step.id), ['listen', 'edit', 'verify', 'deliver']);
  assert.ok(model.missionBrief.steps.every((step) => step.labelZh && step.goalZh && step.proofZh && step.action));
  assert.ok(model.missionBrief.steps.every((step) => ['focus-source', 'focus-controls', 'focus-practice-loop', 'focus-export'].includes(step.action)));
  assert.match(model.missionBrief.nextAction.labelZh, /下一步|先做|开始/);
  assert.match(model.missionBrief.passCriteriaZh, /A\/B|REAPER|只改一个|记录/);
  assert.equal(model.missionBrief.primaryDiagnosticId, model.patchDoctor.diagnostics[0].id);
});

test('buildSoundLabViewModel exposes a first-screen practice focus rail for beginners', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 34,
    material: 88,
    space: 72,
    variation: 42,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 90, body: 58, texture: 82, tail: 78 },
  });

  const focus = model.practiceFocus;
  assert.ok(focus, 'view model should expose a compact practice focus rail');
  assert.match(focus.titleZh, /练习焦点|Practice Focus|Focus Rail/);
  assert.match(focus.summaryZh, /先听|只改一个|A\/B|REAPER/);
  assert.equal(focus.steps.length, 4);
  assert.deepEqual(focus.steps.map((step) => step.id), ['listen', 'isolate', 'adjust', 'verify']);
  assert.ok(focus.steps.every((step) => step.labelZh && step.bodyZh));
  assert.ok(focus.steps.some((step) => step.action === 'focus-source' || step.playAction === 'current'));
  assert.ok(focus.steps.some((step) => step.layerAudition || step.action === 'focus-practice-loop'));
  assert.ok(focus.steps.some((step) => step.applyDiagnosticId === model.patchDoctor.diagnostics[0].id));
  assert.match(focus.passCriteriaZh, /A\/B|dry|full|tail|只改一个|REAPER/i);
  assert.match(focus.reaperNoteTemplate, /A\/B|REAPER|保留|撤回/);
});

test('buildSoundLabViewModel exposes a target match coach with one-change guidance', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 34,
    material: 88,
    space: 68,
    variation: 32,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 88, body: 58, texture: 78, tail: 72 },
  });

  const coach = model.targetMatchCoach;
  assert.ok(coach, 'view model should expose a target match coach');
  assert.match(coach.titleZh, /Target|目标|匹配/);
  assert.equal(coach.metrics.length, 4);
  assert.deepEqual(coach.metrics.map((metric) => metric.id), ['transient', 'body', 'material', 'space']);
  assert.ok(coach.metrics.every((metric) => metric.labelZh && metric.targetZh && metric.currentZh && metric.listenZh));
  assert.ok(coach.metrics.every((metric) => Number.isFinite(metric.score) && metric.score >= 0 && metric.score <= 100));
  assert.ok(coach.metrics.every((metric) => Number.isFinite(metric.delta) && metric.action && metric.actionLabelZh));
  assert.equal(coach.oneChangeChallenge.diagnosticId, model.patchDoctor.diagnostics[0].id);
  assert.match(coach.oneChangeChallenge.titleZh, /只改一个|One Change/);
  assert.match(coach.oneChangeChallenge.expectedChangeZh, /听|A\/B|变化/);
  assert.match(coach.oneChangeChallenge.reaperNoteZh, /REAPER|A\/B|只改一个/);
  assert.ok(coach.oneChangeChallenge.parameterId);
  assert.ok(Number.isFinite(coach.oneChangeChallenge.from));
  assert.ok(Number.isFinite(coach.oneChangeChallenge.to));
});

test('buildSoundLabViewModel exposes a synth transfer plan for one-change practice', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 34,
    material: 88,
    space: 68,
    variation: 32,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 88, body: 58, texture: 78, tail: 72 },
  });

  const plan = model.synthTransferPlan;
  assert.ok(plan, 'view model should expose a synth transfer plan');
  assert.match(plan.titleZh, /Synth Transfer|迁移|三合成器/);
  assert.match(plan.summaryZh, /Serum/);
  assert.match(plan.summaryZh, /Phase Plant/);
  assert.match(plan.summaryZh, /Vital/);
  assert.match(plan.summaryZh, /REAPER/);
  assert.equal(plan.oneChange.diagnosticId, model.patchDoctor.diagnostics[0].id);
  assert.equal(plan.oneChange.applyActionId, model.patchDoctor.diagnostics[0].applyAction.id);
  assert.ok(plan.oneChange.parameterId);
  assert.ok(Number.isFinite(plan.oneChange.from));
  assert.ok(Number.isFinite(plan.oneChange.to));
  assert.deepEqual(plan.synthSteps.map((step) => step.id), ['serum', 'phasePlant', 'vital']);
  assert.ok(plan.synthSteps.every((step) => step.label && step.whereZh && step.doZh && step.listenZh && step.proofZh));
  assert.match(plan.synthSteps[0].label, /Serum/);
  assert.match(plan.synthSteps[1].label, /Phase Plant/);
  assert.match(plan.synthSteps[2].label, /Vital/);
  assert.match(plan.reaperProof.noteZh, /REAPER|A\/B|dry|full|tail|只改一个/i);
  assert.ok(plan.actions.some((action) => action.type === 'doctor-apply' && action.applyDiagnosticId === model.patchDoctor.diagnostics[0].id));
  assert.ok(plan.actions.some((action) => action.workbenchAction === 'focus-practice-loop'));
  assert.ok(plan.actions.some((action) => action.workbenchAction === 'focus-export'));
});

test('buildSoundLabViewModel exposes a perceptual signature for realistic synth SFX coaching', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 58,
    material: 88,
    space: 42,
    variation: 36,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 82, body: 66, texture: 72, tail: 44 },
  });

  const signature = model.perceptualSignature;
  assert.ok(signature, 'view model should explain why this patch feels like a real synth SFX');
  assert.match(signature.titleZh, /听感指纹|Perceptual/);
  assert.ok(signature.realismScore >= 0 && signature.realismScore <= 100);
  assert.match(signature.identityZh, /metal|FM|modal|金属|材质/i);
  assert.ok(signature.proofPoints.length >= 5);
  assert.deepEqual(signature.proofPoints.map((point) => point.role), ['transient', 'body', 'material', 'space', 'comfort']);
  assert.ok(signature.proofPoints.every((point) => point.labelZh && point.listenZh && point.evidenceZh && Number.isFinite(point.value)));
  assert.ok(signature.nextMove.parameterId, 'next move should point to a concrete parameter');
  assert.notEqual(signature.nextMove.from, signature.nextMove.to, 'next move should describe a small A/B change');
  assert.ok(signature.nextMove.reasonZh);
  assert.ok(signature.nextMove.action);
  assert.ok(signature.synthTranslation.serum);
  assert.ok(signature.synthTranslation.phasePlant);
  assert.ok(signature.synthTranslation.vital);
  assert.match(signature.reaperCheckZh, /A\/B|dry|full|REAPER/i);
});

test('buildSoundLabPatch can use preset DNA, quality mode, and layer mixer controls', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 44,
    material: 88,
    space: 38,
    variation: 57,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    sampleMix: 0.64,
    layerMix: {
      transient: 86,
      body: 78,
      texture: 52,
      tail: 34,
    },
  });

  assert.equal(patch.presetDna.id, 'vital-metal-modal-hit');
  assert.equal(patch.qualityMode, 'studio');
  assert.equal(patch.sampleMix, 0.64);
  assert.ok(patch.layers.length >= 5);
  assert.ok(patch.layers.some((layer) => layer.role === 'transient' && layer.engine === 'sampleGrain'));
  assert.ok(patch.layers.some((layer) => layer.engine === 'modalResonator'));
  assert.ok(patch.layers.some((layer) => layer.engine === 'combDelay'));
  assert.ok(patch.layers.every((layer) => layer.envelope && Number.isFinite(layer.gain)));
  assert.ok(patch.globalFx.softLimiter.ceiling <= 0.96);
  assert.ok(patch.globalFx.space.decaySeconds > 0.1);
  assert.match(patch.licenseNotice, /PresetShare|public domain|procedural/i);
});

test('studio worklet patches expose unison drift and stereo spread for realistic synth tone', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 74,
    motion: 58,
    material: 82,
    space: 52,
    variation: 68,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const tonalLayers = patch.layers.filter((layer) => ['fmBurst', 'combDelay'].includes(layer.engine));

  assert.ok(tonalLayers.length >= 2, 'test preset should expose FM and comb tonal layers');
  for (const layer of tonalLayers) {
    assert.ok(layer.unison?.voices >= 3, `${layer.id} should use multiple voices in studio mode`);
    assert.ok(layer.unison.detuneCents >= 4, `${layer.id} should detune voices enough to hear width`);
    assert.ok(layer.unison.analogDrift > 0, `${layer.id} should have slow pitch drift`);
    assert.ok(layer.stereoSpread > 0.12, `${layer.id} should expose stereo spread for the processor`);
  }

  const message = buildWorkletMessage(patch);
  const payloadLayer = message.payload.layers.find((layer) => layer.engine === 'fmBurst');
  assert.deepEqual(payloadLayer.unison, tonalLayers.find((layer) => layer.engine === 'fmBurst').unison);
});

test('studio worklet patches stagger transient body texture and tail for realistic SFX depth', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 78,
    motion: 52,
    material: 86,
    space: 64,
    variation: 72,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    layerMix: { transient: 84, body: 76, texture: 62, tail: 58 },
  });

  const byRole = (role) => patch.layers.filter((layer) => layer.role === role);
  assert.ok(byRole('transient').every((layer) => layer.onsetMs <= 3), 'transient layers should remain immediate');
  assert.ok(byRole('body').some((layer) => layer.onsetMs >= 2), 'body should arrive after the click');
  assert.ok(byRole('texture').some((layer) => layer.onsetMs >= 5), 'texture should bloom after the body starts');
  assert.ok(byRole('tail').some((layer) => layer.onsetMs >= 14), 'tail should have pre-delay instead of smearing the attack');
  assert.ok(patch.layers.every((layer) => Number.isFinite(layer.onsetMs) && layer.onsetMs >= 0 && layer.onsetMs <= 80));

  assert.ok(patch.globalFx.acousticCues, 'patch should expose global acoustic timing cues');
  assert.ok(patch.globalFx.acousticCues.bodyLagMs >= 2);
  assert.ok(patch.globalFx.acousticCues.tailPreDelayMs >= 14);
  assert.ok(patch.globalFx.space.preDelayMs >= patch.globalFx.acousticCues.tailPreDelayMs);

  const message = buildWorkletMessage(patch);
  assert.deepEqual(message.payload.globalFx.acousticCues, patch.globalFx.acousticCues);
  assert.ok(message.payload.layers.every((layer) => Number.isFinite(layer.onsetMs)));
});

test('studio patches expose master polish for tighter finished synth tone', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 46,
    material: 88,
    space: 34,
    variation: 54,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    layerMix: { transient: 92, body: 80, texture: 58, tail: 28 },
  });

  assert.ok(patch.globalFx.masterPolish, 'global bus should expose a final polish stage');
  assert.ok(patch.globalFx.masterPolish.glue > 0.18);
  assert.ok(patch.globalFx.masterPolish.lowTighten > 0.1);
  assert.ok(patch.globalFx.masterPolish.airGuard > 0.2);
  assert.ok(patch.globalFx.masterPolish.transientHold > 0.2);
  assert.ok(patch.globalFx.masterPolish.bodyGain <= 1);
  assert.ok(patch.globalFx.masterPolish.comfortBus, 'master polish should expose a comfort bus for smoother listening');
  assert.ok(patch.globalFx.masterPolish.comfortBus.warmth > 0.08);
  assert.ok(patch.globalFx.masterPolish.comfortBus.deHarsh > 0.18);
  assert.ok(patch.globalFx.masterPolish.comfortBus.headroom >= 0.04);
  assert.ok(patch.globalFx.masterPolish.comfortBus.airTame > 0.08);
  assert.ok(patch.fxRack.some((effect) => effect.id === 'polish' && effect.type === 'polish'));
  assert.ok(patch.fxRack.some((effect) => effect.id === 'polish' && effect.comfortBus));
  assert.ok(patch.fxOrder.indexOf('polish') > patch.fxOrder.indexOf('reverb'));
  assert.ok(patch.fxOrder.indexOf('polish') < patch.fxOrder.indexOf('limiter'));

  const message = buildWorkletMessage(patch);
  assert.deepEqual(message.payload.globalFx.masterPolish, patch.globalFx.masterPolish);
});

test('studio patches expose subtle motion bus for less static synth output', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'energy-charge');
  const patch = buildSoundLabPatch(family, {
    brightness: 76,
    motion: 82,
    material: 62,
    space: 68,
    variation: 74,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 62, body: 72, texture: 76, tail: 70 },
  });

  const motionBus = patch.globalFx.masterPolish.motionBus;
  assert.ok(motionBus, 'studio output needs a subtle motion bus so web synth patches do not feel static');
  assert.ok(motionBus.microDynamics > 0.035 && motionBus.microDynamics < 0.18);
  assert.ok(motionBus.transientShield > 0.06, 'transient shield should keep the attack clear before tail bloom');
  assert.ok(motionBus.tailBloom > 0.04, 'tail bloom should let space open after the transient');
  assert.ok(motionBus.wowFlutter > 0.001 && motionBus.wowFlutter < 0.04, 'motion should stay subtle, not seasick');

  const message = buildWorkletMessage(patch);
  assert.deepEqual(message.payload.globalFx.masterPolish.motionBus, motionBus);
  assert.ok(patch.fxRack.some((effect) => effect.id === 'polish' && effect.motionBus));
});

test('studio patches expose dynamic detail polish for snap glue and silky output', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 84,
    motion: 58,
    material: 88,
    space: 38,
    variation: 62,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 92, body: 82, texture: 64, tail: 34 },
  });

  const dynamicDetail = patch.globalFx.masterPolish.dynamicDetail;
  assert.ok(dynamicDetail, 'studio output should expose a small detail polish stage');
  assert.ok(dynamicDetail.transientAir > 0.08, 'transient air should add first-edge clarity without raising the whole patch');
  assert.ok(dynamicDetail.bodyGlue > 0.08, 'body glue should bind transient and modal body');
  assert.ok(dynamicDetail.outputSilk > 0.08, 'output silk should soften the final high edge');
  assert.ok(dynamicDetail.snapWindowMs >= 8 && dynamicDetail.snapWindowMs <= 42);
  assert.ok(patch.fxRack.some((effect) => effect.id === 'polish' && effect.dynamicDetail));

  const message = buildWorkletMessage(patch);
  assert.deepEqual(message.payload.globalFx.masterPolish.dynamicDetail, dynamicDetail);
});

test('browser audio engines apply dynamic detail polish in Worklet and Tone fallback paths', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(processorJs, /dynamicDetail/);
  assert.match(processorJs, /transientAir/);
  assert.match(processorJs, /bodyGlue/);
  assert.match(processorJs, /outputSilk/);
  assert.match(processorJs, /snapWindowMs/);
  assert.match(processorJs, /detailSnapWindow/);
  assert.match(audioPlayerJs, /connectDynamicDetailStage/);
  assert.match(audioPlayerJs, /dynamicDetail/);
  assert.match(audioPlayerJs, /transientAir/);
  assert.match(audioPlayerJs, /bodyGlue/);
  assert.match(audioPlayerJs, /outputSilk/);
});

test('studio patches expose temporal masking so tails do not smear the transient', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 48,
    material: 88,
    space: 76,
    variation: 52,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 92, body: 64, texture: 72, tail: 86 },
  });

  const masking = patch.globalFx.masterPolish.temporalMasking;
  assert.ok(masking, 'studio output needs transient-aware temporal masking');
  assert.ok(masking.attackHoldMs >= 18, 'masking should protect the first hit window');
  assert.ok(masking.releaseMs >= 80, 'masking should recover smoothly after the transient');
  assert.ok(masking.wetDuck > 0.08, 'wet tail should duck enough to avoid smearing the hit');
  assert.ok(masking.tailDuckDb >= 1.5, 'model should expose an understandable duck depth');
  assert.ok(masking.transientProtect > 0.08, 'dry transient should stay forward while wet tail ducks');

  const model = buildSoundLabViewModel(family, patch.macros, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: patch.layerMix,
  });
  const temporal = model.soundQuality.find((item) => item.id === 'temporal-mask');
  assert.ok(temporal, 'quality card should teach temporal masking as a real synth realism metric');
  assert.match(temporal.labelZh, /Temporal|遮蔽|尾巴/);
  assert.match(temporal.noteZh, /duck|瞬态|tail|尾巴/i);
  assert.ok(temporal.value >= 35 && temporal.value <= 100);

  const message = buildWorkletMessage(patch);
  assert.deepEqual(message.payload.globalFx.masterPolish.temporalMasking, masking);
});

test('studio patches expose spatial image cues for physical distance and early reflections', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'glass-ping');
  const patch = buildSoundLabPatch(family, {
    brightness: 74,
    motion: 58,
    material: 62,
    space: 78,
    variation: 66,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 54, body: 68, texture: 76, tail: 82 },
  });

  const spatial = patch.globalFx.spatialImage;
  assert.ok(spatial, 'studio output needs a spatial image layer instead of only generic reverb');
  assert.ok(spatial.earlyReflectionMs >= 4 && spatial.earlyReflectionMs <= 48, 'early reflections should stay in a realistic first-room window');
  assert.ok(spatial.earlyReflectionGain > 0.03 && spatial.earlyReflectionGain < 0.24, 'early reflection gain should be audible but subtle');
  assert.ok(spatial.distanceDamping > 0.04 && spatial.distanceDamping < 0.45, 'distance damping should tame far-field brightness');
  assert.ok(spatial.bodyAnchor > 0.06, 'the dry body should remain anchored while the tail opens around it');
  assert.ok(spatial.frontBack > 0.1, 'front/back placement should be explicit enough for teaching');
  assert.ok(spatial.widthFocus > 0.08, 'width focus should distinguish body center from tail sides');

  const message = buildWorkletMessage(patch);
  assert.deepEqual(message.payload.globalFx.spatialImage, spatial);
});

test('sound lab processor applies temporal masking to wet space before output polish', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.match(processorJs, /applyTemporalMasking/);
  assert.match(processorJs, /temporalMasking/);
  assert.match(processorJs, /wetDuck/);
  assert.match(processorJs, /maskedWetLeft/);
  assert.match(processorJs, /maskedWetRight/);
  assert.match(processorJs, /transientProtect/);
});

test('sound lab processor applies spatial image after temporal masking and before stereo comfort', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.match(processorJs, /createSpatialImageState/);
  assert.match(processorJs, /applySpatialImage/);
  assert.match(processorJs, /spatialImage/);
  assert.match(processorJs, /earlyReflectionMs/);
  assert.match(processorJs, /distanceDamping/);
  assert.match(processorJs, /bodyAnchor/);
  assert.match(processorJs, /applyTemporalMasking[\s\S]*applySpatialImage[\s\S]*applyStereoComfortBus/);
});

test('sound lab processor renders modal body diffusion with detune damping and stereo side', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  const modalBlock = processorJs.match(/renderModalResonator\([\s\S]*?\n  }\n\n  renderFilteredNoise/)?.[0] ?? '';
  assert.ok(modalBlock, 'modal resonator renderer should be easy to audit');
  assert.match(modalBlock, /materialBody/);
  assert.match(modalBlock, /detuneCents/);
  assert.match(modalBlock, /damping/);
  assert.match(modalBlock, /stereoSmear/);
  assert.match(modalBlock, /excitationBlend/);
  assert.match(modalBlock, /phaseSkew/);
  assert.match(modalBlock, /side/);
  assert.match(modalBlock, /mono:/);
  assert.match(modalBlock, /side:/);
});

test('sound quality exposes beginner-readable comfort bus metrics', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'glass-ping');
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 42,
    material: 56,
    space: 62,
    variation: 38,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-crystal-sparkle',
    qualityMode: 'studio',
    layerMix: { transient: 48, body: 58, texture: 74, tail: 66 },
  });

  const comfort = model.soundQuality.find((item) => item.id === 'comfort');
  assert.ok(comfort, 'quality card should expose comfort as a first-class synth realism metric');
  assert.match(comfort.statusZh, /舒适|smooth|comfort/i);
  assert.match(comfort.noteZh, /de-harsh|headroom|刺耳|余量/i);
  assert.ok(comfort.value >= 30);
});

test('sound quality explains motion bus as beginner-readable synth realism', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'energy-charge');
  const model = buildSoundLabViewModel(family, {
    brightness: 76,
    motion: 82,
    material: 62,
    space: 68,
    variation: 74,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 62, body: 72, texture: 76, tail: 70 },
  });

  const motion = model.soundQuality.find((item) => item.id === 'motion-bus');
  assert.ok(motion, 'quality card should explain the new motion bus instead of hiding it in the audio engine');
  assert.match(motion.labelZh, /Motion|生命感|微动态/i);
  assert.match(motion.statusZh, /微动态|呼吸|motion/i);
  assert.match(motion.noteZh, /transient shield|tail bloom|wow|瞬态|尾巴/i);
  assert.ok(motion.value >= 35 && motion.value <= 100);
});

test('sound quality explains spatial image as beginner-readable synth realism', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'glass-ping');
  const model = buildSoundLabViewModel(family, {
    brightness: 74,
    motion: 58,
    material: 62,
    space: 78,
    variation: 66,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 54, body: 68, texture: 76, tail: 82 },
  });

  const spatial = model.soundQuality.find((item) => item.id === 'spatial-image');
  assert.ok(spatial, 'quality card should teach spatial image instead of hiding distance cues in the DSP');
  assert.match(spatial.labelZh, /Spatial|空间|距离/i);
  assert.match(spatial.statusZh, /早期反射|距离|front/i);
  assert.match(spatial.noteZh, /early|body|front|distance|反射|主体/i);
  assert.ok(spatial.value >= 28 && spatial.value <= 100);
});

test('sound lab exposes an ear triage plan that turns diagnosis into one-change practice', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 94,
    motion: 28,
    material: 92,
    space: 76,
    variation: 44,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'compare',
    layerMix: { transient: 92, body: 44, texture: 86, tail: 82 },
  });

  const triage = model.earTriage;
  assert.ok(triage, 'view model should expose a beginner-facing ear triage plan');
  assert.equal(triage.problemId, model.patchDoctor.diagnostics[0].id);
  assert.match(triage.titleZh, /Ear Triage|听感分诊|分诊/i);
  assert.deepEqual(triage.steps.map((step) => step.id), ['listen', 'isolate', 'adjust', 'verify']);
  assert.ok(triage.steps.some((step) => step.layerAudition), 'triage needs a real layer solo action');
  assert.ok(triage.steps.some((step) => step.applyDiagnosticId === triage.problemId), 'triage should reuse the real Patch Doctor one-change action');
  assert.match(triage.decisionPromptZh, /A\/B|REAPER|保留|撤回/);
  assert.match(triage.synthMap.serum, /Serum/i);
  assert.match(triage.synthMap.phasePlant, /Phase Plant/i);
  assert.match(triage.synthMap.vital, /Vital/i);
});

test('sound lab exposes perceptual calibration for gain-matched comfortable synthesis', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 86,
    motion: 54,
    material: 88,
    space: 46,
    variation: 48,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    layerMix: { transient: 88, body: 76, texture: 58, tail: 42 },
  });

  const bus = model.patch.globalFx.masterPolish.comfortBus;
  assert.ok(bus.loudnessMatch > 0.72 && bus.loudnessMatch <= 1.05, 'comfort bus should keep loudness comparable');
  assert.ok(bus.monoAnchor > 0.05, 'comfort bus should anchor low/body energy for translation');
  assert.ok(bus.tailDuck > 0.04, 'comfort bus should keep reverb/tail away from the transient');
  assert.ok(bus.widthTrim >= 0.02, 'comfort bus should trim excessive side width before limiting');

  assert.ok(model.polishCalibration, 'view model should expose a beginner-facing quality calibration checklist');
  assert.deepEqual(model.polishCalibration.steps.map((step) => step.id), ['level', 'harsh', 'transient', 'stereo', 'space-depth', 'tail']);
  assert.ok(model.polishCalibration.steps.every((step) => step.listenZh && step.actionZh && typeof step.value === 'number'));
  assert.match(model.polishCalibration.summaryZh, /响度|刺耳|声像|空间|距离|尾巴/);
  assert.match(model.polishCalibration.steps.find((step) => step.id === 'level').actionZh, /Raw|Comfort|Studio|-14 LUFS/);
  assert.match(model.polishCalibration.steps.find((step) => step.id === 'space-depth').actionZh, /early reflection|predelay|空间|距离|tail-only/i);
});

test('sound lab exposes raw comfort studio output comparison for listening practice', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const rawPatch = buildSoundLabPatch(family, SOUND_LAB_MACROS, { outputMode: 'raw' });
  const comfortPatch = buildSoundLabPatch(family, SOUND_LAB_MACROS, { outputMode: 'comfort' });
  const studioPatch = buildSoundLabPatch(family, SOUND_LAB_MACROS, { outputMode: 'studio', qualityMode: 'studio' });
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, { outputMode: 'comfort' });

  assert.equal(rawPatch.globalFx.masterPolish.enabled, false);
  assert.equal(comfortPatch.globalFx.masterPolish.enabled, true);
  assert.ok(comfortPatch.globalFx.masterPolish.comfortBus.deHarsh > 0.1);
  assert.equal(studioPatch.qualityMode, 'studio');
  assert.ok(studioPatch.globalFx.masterPolish.comfortBus.headroom >= comfortPatch.globalFx.masterPolish.comfortBus.headroom);
  assert.deepEqual(model.outputCompare.modes.map((mode) => mode.id), ['raw', 'comfort', 'studio']);
  assert.match(model.outputCompare.modes.find((mode) => mode.id === 'raw').noteZh, /未处理|Raw|polish/i);
  assert.match(model.outputCompare.modes.find((mode) => mode.id === 'comfort').noteZh, /de-harsh|余量|舒适/i);
  assert.match(model.outputCompare.practiceZh, /先听 Raw|Comfort|Studio/);
});

test('sound lab exposes layer audition modes for transient body texture and tail isolation', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 52,
    material: 86,
    space: 46,
    variation: 38,
  }, {
    outputMode: 'comfort',
    qualityMode: 'studio',
    layerMix: { transient: 88, body: 74, texture: 64, tail: 42 },
  });

  assert.ok(model.layerAudition, 'view model should expose layer audition controls');
  assert.deepEqual(model.layerAudition.modes.map((mode) => mode.id), ['full', 'transient', 'body', 'texture', 'tail']);
  assert.ok(model.layerAudition.modes.every((mode) => mode.listenZh && mode.layerMix && mode.playOptions));
  assert.equal(model.layerAudition.modes.find((mode) => mode.id === 'transient').layerMix.transient, 100);
  assert.equal(model.layerAudition.modes.find((mode) => mode.id === 'transient').layerMix.body, 0);
  assert.equal(model.layerAudition.modes.find((mode) => mode.id === 'body').layerMix.body, 100);
  assert.equal(model.layerAudition.modes.find((mode) => mode.id === 'texture').layerMix.texture, 100);
  assert.equal(model.layerAudition.modes.find((mode) => mode.id === 'tail').layerMix.tail, 100);
  assert.match(model.layerAudition.practiceZh, /transient|body|texture|tail|分层|solo/i);
  assert.match(model.layerAudition.reaperZh, /REAPER|stem|dry|tail-only/i);
});

test('sound lab explains material resonators as audible synthesis targets', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 78,
    motion: 48,
    material: 88,
    space: 42,
    variation: 36,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });

  assert.ok(model.materialResonanceMap, 'view model should expose material resonance guidance');
  assert.match(model.materialResonanceMap.titleZh, /共振|Resonance|材质/i);
  assert.ok(model.materialResonanceMap.peaks.length >= 3, 'resonance map should expose multiple modal peaks');
  assert.ok(model.materialResonanceMap.peaks.every((peak) => (
    peak.frequencyHz > 40
    && peak.ratio
    && peak.gainPercent >= 0
    && peak.decayMs > 20
    && peak.listenZh
    && peak.synthZh
  )));
  assert.match(model.materialResonanceMap.beginnerZh, /金属|玻璃|材质|峰|衰减/);
  assert.match(model.materialResonanceMap.serumZh, /Serum|filter|comb|FM/i);
  assert.match(model.materialResonanceMap.phasePlantZh, /Phase Plant|Resonator|Comb|modal/i);
  assert.match(model.materialResonanceMap.vitalZh, /Vital|spectral|filter|FM/i);
  assert.match(model.materialResonanceMap.reaperZh, /REAPER|EQ|spectrum|body-only/i);
});

test('studio material patches expose modal body diffusion for more realistic resonators', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 46,
    material: 92,
    space: 42,
    variation: 58,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 86, body: 78, texture: 62, tail: 44 },
  });

  const modalLayer = patch.layers.find((layer) => layer.engine === 'modalResonator');
  assert.ok(modalLayer?.materialBody, 'modal layer should expose a material body model');
  assert.ok(modalLayer.materialBody.peakSpreadCents > 0, 'modal peaks need slight pitch spread instead of static sine peaks');
  assert.ok(modalLayer.materialBody.dampingTilt > 0, 'modal peaks need damping so higher modes decay differently');
  assert.ok(modalLayer.materialBody.stereoSmear > 0.08, 'modal body needs subtle stereo smear for physical width');
  assert.ok(modalLayer.materialBody.excitationBlend > 0.02, 'modal body needs a short strike excitation to feel less synthetic');
  assert.ok(modalLayer.resonators.every((resonator) => Number.isFinite(resonator.detuneCents)));
  assert.ok(modalLayer.resonators.some((resonator) => Math.abs(resonator.pan) > 0.02));
  assert.ok(modalLayer.resonators.every((resonator) => resonator.damping > 0));

  const message = buildWorkletMessage(patch);
  const payloadModal = message.payload.layers.find((layer) => layer.engine === 'modalResonator');
  assert.deepEqual(payloadModal.materialBody, modalLayer.materialBody);
  assert.deepEqual(payloadModal.resonators, modalLayer.resonators);
});

test('material resonance map teaches modal body diffusion as an audible quality target', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 46,
    material: 92,
    space: 42,
    variation: 58,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 86, body: 78, texture: 62, tail: 44 },
  });

  const bodyModel = model.materialResonanceMap.bodyModel;
  assert.ok(bodyModel, 'material resonance panel should expose a modal body model for beginners');
  assert.match(bodyModel.titleZh, /Modal Body|material body|modal/i);
  assert.match(bodyModel.beginnerZh, /detune|damping|stereo|strike|diffusion|modal/i);
  assert.ok(bodyModel.metrics.some((metric) => metric.id === 'spread' && metric.value > 0));
  assert.ok(bodyModel.metrics.some((metric) => metric.id === 'damping' && metric.value > 0));
  assert.ok(bodyModel.metrics.some((metric) => metric.id === 'stereo' && metric.value > 0));
  assert.ok(bodyModel.metrics.some((metric) => metric.id === 'excitation' && metric.value > 0));
  assert.match(bodyModel.synthZh, /Serum|Phase Plant|Vital/);
  assert.match(bodyModel.reaperZh, /REAPER|body-only|spectrum|A\/B/i);
});

test('target match coach exposes playable reference targets and a small nudge path', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 28,
    material: 94,
    space: 72,
    variation: 44,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    layerMix: { transient: 90, body: 46, texture: 86, tail: 78 },
  });

  const reference = model.targetMatchCoach.referenceMatch;
  assert.ok(reference, 'target match coach should expose reference matching data');
  assert.ok(reference.targets.macros.material >= 70, 'reference target should include synth macro targets');
  assert.ok(reference.targets.layerMix.body >= 50, 'reference target should include layer targets');
  assert.ok(reference.nudge.macros, 'reference match should provide a small macro nudge');
  assert.ok(reference.nudge.layerMix, 'reference match should provide a small layer nudge');
  assert.ok(reference.playTargets.target.macros, 'target reference must be playable as macro overrides');
  assert.ok(reference.playTargets.nudge.options.layerMix, 'nudge reference must be playable with layer overrides');
  assert.ok(reference.controls.some((control) => control.scope === 'macro' && control.id === 'material'));
  assert.ok(reference.controls.some((control) => control.scope === 'layer' && control.id === 'body'));
  assert.match(reference.practiceZh, /A\/B|目标|只改一个|REAPER/);
  assert.match(reference.synthMap.serum, /Serum|Macro|FM|filter/i);
  assert.match(reference.synthMap.phasePlant, /Phase Plant|lane|Macro/i);
  assert.match(reference.synthMap.vital, /Vital|Macro|spectral|FM/i);
});

test('buildWorkletMessage sends layered DSP data without dropping the legacy contract', () => {
  const patch = buildSoundLabPatch(soundLabFamilies[0], SOUND_LAB_MACROS, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    layerMix: { transient: 70, body: 70, texture: 40, tail: 30 },
  });
  const message = buildWorkletMessage(patch);

  assert.ok(Array.isArray(message.payload.resonators));
  assert.ok(Array.isArray(message.payload.layers));
  assert.ok(message.payload.layers.length >= 5);
  assert.equal(message.payload.qualityMode, 'studio');
  assert.ok(message.payload.globalFx.softLimiter);
  assert.ok(message.payload.layers.some((layer) => layer.engine === 'sampleGrain'));
  assert.ok(message.payload.layers.some((layer) => layer.engine === 'modalResonator'));
});

test('sound lab performance feel shapes playable dynamics and worklet payload', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 76,
    motion: 62,
    material: 86,
    space: 44,
    variation: 58,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    performance: { note: 'D3', velocity: 104, glide: 46, hold: false, octave: 0 },
  });
  const model = buildSoundLabViewModel(family, patch.macros, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    performance: patch.performance,
  });
  const message = buildWorkletMessage(patch);

  assert.ok(patch.performanceFeel, 'patch should expose audible performance feel data');
  assert.ok(patch.performanceFeel.transientPunch > 1, 'higher velocity should increase transient punch');
  assert.ok(patch.performanceFeel.microTimingMs > 1, 'motion and variation should add controlled timing feel');
  assert.ok(patch.performanceFeel.pitchDriftCents > 1, 'variation should create subtle pitch drift');
  assert.ok(patch.performanceFeel.triggerPattern.length === 3, 'performance feel should provide a three-hit gesture');
  assert.ok(patch.layers.some((layer) => layer.performanceFeel?.velocityGain > 1), 'layers should receive performance gain shaping');
  assert.ok(patch.layers.some((layer) => layer.performanceFeel?.microOffsetMs !== 0), 'layers should receive micro-timing offsets');
  assert.equal(message.payload.performanceFeel.mode, patch.performanceFeel.mode);
  assert.equal(message.payload.performanceFeel.triggerPattern.length, 3);
  assert.ok(model.performanceFeel.controls.some((control) => control.id === 'microTiming'));
  assert.match(model.performanceFeel.beginnerZh, /力度|微漂移|三连|真实|手感/);
  assert.match(model.performanceFeel.reaperZh, /REAPER|velocity|A\/B|三连/);
});

test('sound lab worklet renders performance trigger pattern as separate gesture hits', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 74,
    motion: 70,
    material: 86,
    space: 44,
    variation: 64,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    performance: { note: 'D3', velocity: 108, glide: 42, hold: false, octave: 0 },
  });
  const message = buildWorkletMessage(patch);
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.equal(message.payload.performanceFeel.triggerPattern.length, 3);
  assert.ok(message.payload.performanceFeel.triggerPattern.some((hit) => hit.delayMs > 0), 'gesture needs delayed hits');
  assert.match(processorJs, /performanceGestureHits/);
  assert.match(processorJs, /createLayerStateMatrix/);
  assert.match(processorJs, /gesturePitchRatio/);
  assert.match(processorJs, /hit\.delayMs/);
  assert.match(processorJs, /for \(let hitIndex = 0; hitIndex < gestureHits\.length; hitIndex \+= 1\)/);
  assert.match(processorJs, /renderTimedLayer\(layer,\s*hitState,\s*t,\s*duration,\s*hit\)/);
});

test('buildSoundLabPatch exposes HQ synth engine graph and playable performance controls', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'energy-charge');
  const patch = buildSoundLabPatch(family, {
    brightness: 84,
    motion: 78,
    material: 62,
    space: 54,
    variation: 46,
  }, {
    engineMode: 'hq',
    presetId: 'vital-energy-charge-rise',
    qualityMode: 'studio',
    performance: { note: 'G3', velocity: 82, glide: 28, hold: true, octave: 0 },
  });

  assert.equal(patch.engineMode, 'hq');
  assert.equal(patch.toneGraph.engine, 'Tone.js');
  assert.match(patch.toneGraph.instrument, /Synth|Noise|Metal|FM|AM/);
  assert.ok(patch.toneGraph.nodes.length >= 4, 'HQ graph should describe instrument, filter, movement, and output stages');
  assert.ok(patch.toneGraph.effects.some((effect) => effect.type === 'reverb'));
  assert.ok(patch.toneGraph.effects.some((effect) => effect.type === 'drive'));
  assert.equal(patch.performance.note, 'G3');
  assert.equal(patch.performance.hold, true);
  assert.ok(patch.macroModulation.some((route) => route.source === 'motion' && route.target.includes('filter')));
  assert.equal(patch.fallbackChain.join(' > '), 'tone > worklet > webaudio');
});

test('browser audio engines honor layer onset and space pre-delay cues', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(processorJs, /layerOnsetSeconds/);
  assert.match(processorJs, /localT/);
  assert.match(processorJs, /if \(t < onset\) return/);
  assert.match(processorJs, /duration - layerOnset/);
  assert.match(processorJs, /preDelayMs/);
  assert.match(processorJs, /spacePreDelay/);

  assert.match(audioPlayerJs, /layerStartTime/);
  assert.match(audioPlayerJs, /layerDuration/);
  assert.match(audioPlayerJs, /layer\.onsetMs/);
  assert.match(audioPlayerJs, /globalFx\.space\.preDelayMs/);
});

test('browser audio engine keeps performance gesture tail before auto stop', () => {
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(audioPlayerJs, /performanceGestureTailMs/);
  assert.match(audioPlayerJs, /triggerPattern/);
  assert.match(audioPlayerJs, /patch\.durationSeconds \* 1000 \+ performanceGestureTailMs\(patch\)/);
});

test('HQ Tone engine transposes performance gesture note offsets', () => {
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(audioPlayerJs, /transposeNote/);
  assert.match(audioPlayerJs, /hit\.noteOffset/);
  assert.match(audioPlayerJs, /const hitNote = transposeNote\(note,\s*hit\.noteOffset\)/);
  assert.match(audioPlayerJs, /triggerAttackRelease\(hitNote,\s*hitDuration,\s*hitTime,\s*hitVelocity\)/);
});

test('buildSoundLabViewModel exposes HQ engine modes, FX rack, and performance UI data', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'air-whoosh');
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, { engineMode: 'hq' });

  assert.ok(model.engineModes.some((mode) => mode.id === 'hq' && mode.labelZh.includes('HQ')));
  assert.equal(model.activeEngineMode, 'hq');
  assert.ok(model.performanceControls.some((control) => control.id === 'velocity'));
  assert.ok(model.performanceControls.some((control) => control.id === 'glide'));
  assert.ok(model.keyboardNotes.length >= 12);
  assert.ok(model.fxRack.some((effect) => effect.id === 'reverb'));
  assert.match(model.patchJson, /"toneGraph"/);
});
