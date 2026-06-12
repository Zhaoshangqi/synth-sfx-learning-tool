import test from 'node:test';
import assert from 'node:assert/strict';
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
} from '../src/content.js';

test('seed content includes the first-version learning surface', () => {
  assert.ok(sources.length >= 8, 'expected official, YouTube-search, and research sources');
  assert.ok(transcriptSegments.length >= 3, 'expected bilingual transcript examples');
  assert.ok(knowledgeCards.length >= 8, 'expected starter knowledge cards');
  assert.equal(roadmapLessons.length, 10, 'expected ten roadmap lessons');
  assert.equal(recipes.length, 20, 'expected twenty recipe exercises');
  assert.ok(glossary.length >= 12, 'expected core English-to-Chinese synth terms');
  assert.ok(reaperPracticeTasks.length >= 6, 'expected REAPER practice tasks');
  assert.ok(learningPathUnits.length >= 32, 'expected detailed zero-to-creative learning path units');
  assert.ok(microLearningTracks.length >= 8, 'expected detailed micro learning tracks');
  assert.ok(microLessons.length >= 80, 'expected at least eighty micro lessons');
  assert.ok(soundChallenges.length >= 5, 'expected ear-training and reverse-engineering sound challenges');
  assert.ok(materialLabs.length >= 8, 'expected material-focused sound labs');
  assert.ok(techniqueTips.length >= 12, 'expected a practical SFX technique library');
  assert.ok(communityTechniqueLabs.length >= 6, 'expected community creator technique labs');
  assert.ok(deepDiveModules.length >= 8, 'expected deep practical analysis modules');
  assert.ok(externalIntegrations.length >= 5, 'expected external integration options for browser sound quality');
  assert.ok(principleDiagrams.length >= 5, 'expected visual principle diagrams');
  assert.equal(interactiveLabs.length, 5, 'expected five Ableton-style interactive labs');
});

test('every source has traceable provenance and credibility', () => {
  for (const source of sources) {
    assert.match(source.id, /^[a-z0-9-]+$/);
    assert.ok(source.title);
    assert.ok(source.platform);
    assert.ok(source.url.startsWith('https://'));
    assert.ok(['official', 'youtube-search', 'paper', 'article', 'community'].includes(source.type));
    assert.ok(['official', 'professional-tutorial', 'verifiable-experience', 'inspiration', 'research'].includes(source.credibility));
  }
});

test('every knowledge card keeps Chinese learning text tied to source evidence', () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const card of knowledgeCards) {
    assert.match(card.id, /^[a-z0-9-]+$/);
    assert.ok(card.titleZh);
    assert.ok(card.principleZh.length > 20);
    assert.ok(Array.isArray(card.tags));
    assert.ok(card.tags.length > 0);
    assert.ok(['foundation', 'beginner', 'intermediate', 'advanced', 'creative'].includes(card.difficulty));
    assert.ok(sourceIds.has(card.sourceId), `unknown source ${card.sourceId}`);
    assert.ok(card.evidence.timecode);
    assert.ok(card.evidence.summaryZh);
    assert.ok(card.synthMappings.serum || card.synthMappings.phasePlant || card.synthMappings.vital);
  }
});

test('recipes include synth mappings, REAPER steps, and acceptance checks', () => {
  for (const recipe of recipes) {
    assert.match(recipe.id, /^[a-z0-9-]+$/);
    assert.ok(recipe.titleZh);
    assert.ok(recipe.goalZh.length > 10);
    assert.ok(recipe.methodTags.length > 0);
    assert.ok(recipe.synthMappings.serum || recipe.synthMappings.phasePlant || recipe.synthMappings.vital);
    assert.ok(recipe.reaperSteps.length >= 2);
    assert.ok(recipe.acceptanceChecks.length >= 2);
  }
});

test('detailed learning path starts from zero and has actionable steps', () => {
  assert.equal(learningPathUnits[0].id, 'unit-01-what-is-sound');
  assert.equal(learningPathUnits[0].level, 'zero');

  for (const unit of learningPathUnits) {
    assert.match(unit.id, /^unit-\d{2}-[a-z0-9-]+$/);
    assert.ok(unit.stageZh);
    assert.ok(unit.titleZh);
    assert.ok(unit.conceptZh.length > 20);
    assert.ok(unit.whyZh.length > 20);
    assert.ok(unit.steps.length >= 4, `${unit.id} needs at least four learning steps`);
    assert.ok(unit.reaperPractice.length >= 3, `${unit.id} needs REAPER practice steps`);
    assert.ok(unit.acceptanceChecks.length >= 3, `${unit.id} needs concrete acceptance checks`);
    assert.ok(unit.diagramIds.length >= 1, `${unit.id} needs a linked diagram`);
    assert.ok(unit.sourceIds.length >= 1, `${unit.id} needs traceable sources`);
  }
});

test('principle diagrams have renderable labels and learning purpose', () => {
  for (const diagram of principleDiagrams) {
    assert.match(diagram.id, /^[a-z0-9-]+$/);
    assert.ok(diagram.titleZh);
    assert.ok(diagram.captionZh.length > 20);
    assert.ok(diagram.labels.length >= 3);
    assert.ok(diagram.svg.includes('<svg'));
    assert.ok(diagram.svg.includes('</svg>'));
  }
});

test('interactive labs provide controls, presets, and SFX-specific practice context', () => {
  const expectedIds = ['adsr-lab', 'filter-lab', 'fm-metal-lab', 'layer-stack-lab', 'recipe-playground'];
  assert.deepEqual(interactiveLabs.map((lab) => lab.id), expectedIds);

  for (const lab of interactiveLabs) {
    assert.ok(lab.titleZh);
    assert.ok(lab.objectiveZh.length > 20);
    assert.ok(lab.soundGoalZh.length > 20);
    assert.ok(lab.visualType);
    assert.ok(lab.controls.length >= 3);
    assert.ok(lab.presets.length >= 2);
    assert.ok(lab.walkthroughSteps.length >= 5, `${lab.id} needs beginner-friendly walkthrough steps`);
    assert.ok(lab.linkedUnitIds.length >= 1);
    assert.ok(lab.diagramIds.length >= 1);
    assert.ok(lab.reaperChecklist.length >= 3);
    assert.ok(lab.synthMappings.serum || lab.synthMappings.phasePlant || lab.synthMappings.vital);

    for (const control of lab.controls) {
      assert.match(control.id, /^[a-z0-9-]+$/);
      assert.ok(control.labelZh);
      assert.equal(typeof control.min, 'number');
      assert.equal(typeof control.max, 'number');
      assert.equal(typeof control.defaultValue, 'number');
      assert.ok(control.min < control.max);
      assert.ok(control.defaultValue >= control.min && control.defaultValue <= control.max);
      assert.ok(control.explainLowZh);
      assert.ok(control.explainHighZh);
    }
  }
});

test('micro learning route breaks online knowledge into sourced beginner-friendly steps', () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.equal(microLearningTracks[0].id, 'track-00-hearing');
  assert.equal(microLessons[0].trackId, 'track-00-hearing');
  assert.match(microLessons[0].titleZh, /听/);

  for (const track of microLearningTracks) {
    assert.match(track.id, /^track-\d{2}-[a-z0-9-]+$/);
    assert.ok(track.titleZh);
    assert.ok(track.summaryZh.length > 20);
    assert.ok(track.lessonIds.length >= 8, `${track.id} needs at least eight micro lessons`);
  }

  for (const lesson of microLessons) {
    assert.match(lesson.id, /^micro-\d{2}-\d{2}-[a-z0-9-]+$/);
    assert.ok(lesson.titleZh);
    assert.ok(lesson.principleZh.length > 28);
    assert.ok(lesson.interactionType);
    assert.ok(lesson.steps.length >= 4, `${lesson.id} needs four learning steps`);
    assert.ok(lesson.reaperPractice.length >= 2, `${lesson.id} needs REAPER practice`);
    assert.ok(lesson.acceptanceChecks.length >= 2, `${lesson.id} needs acceptance checks`);
    assert.ok(lesson.soundExerciseZh.length > 12);
    assert.ok(lesson.practicePromptZh.length > 18, `${lesson.id} needs a concrete practice prompt`);
    assert.ok(lesson.earCues.length >= 3, `${lesson.id} needs ear-training cues`);
    assert.ok(lesson.parameterTargets.length >= 3, `${lesson.id} needs parameter targets`);
    assert.ok(lesson.commonMistakes.length >= 2, `${lesson.id} needs common mistakes`);
    assert.ok(lesson.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${lesson.id} has unknown source`);
    assert.ok(lesson.synthMappings.serum || lesson.synthMappings.phasePlant || lesson.synthMappings.vital);
  }
});

test('sound challenges and material labs include playable evidence-backed exercises', () => {
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const challenge of soundChallenges) {
    assert.match(challenge.id, /^[a-z0-9-]+$/);
    assert.ok(['ear-ab', 'reverse-parameter', 'signal-flow'].includes(challenge.type));
    assert.ok(challenge.promptZh.length > 20);
    assert.ok(challenge.answerId);
    assert.ok(challenge.options.length >= 2);
    assert.ok(challenge.audioSlots.length >= 1);
    assert.ok(challenge.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
  }

  for (const material of materialLabs) {
    assert.match(material.id, /^[a-z0-9-]+$/);
    assert.ok(material.titleZh);
    assert.ok(material.principleZh.length > 30);
    assert.ok(material.controls.length >= 5);
    assert.ok(material.presets.length >= 2);
    assert.ok(material.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
    assert.ok(material.synthMappings.serum || material.synthMappings.phasePlant || material.synthMappings.vital);
    assert.ok(material.reaperChecklist.length >= 3);
  }
});

test('technique tips are sourced, practical, and mapped to synth plus REAPER workflows', () => {
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const tip of techniqueTips) {
    assert.match(tip.id, /^[a-z0-9-]+$/);
    assert.ok(tip.titleZh);
    assert.ok(tip.principleZh.length > 30);
    assert.ok(tip.whenToUseZh.length > 18);
    assert.ok(tip.chainOrder.length >= 3, `${tip.id} needs an effect-chain order`);
    assert.ok(tip.quickDrillZh.length > 20);
    assert.ok(tip.commonMistakes.length >= 2);
    assert.ok(tip.reaperSteps.length >= 3);
    assert.ok(tip.verification.basisZh.length > 30, `${tip.id} needs a verification basis`);
    assert.ok(tip.verification.sourceReliabilityZh.length > 18, `${tip.id} needs source reliability guidance`);
    assert.ok(tip.verification.listeningChecks.length >= 3, `${tip.id} needs ear-check checkpoints`);
    assert.ok(tip.verification.parameterBoundaries.length >= 3, `${tip.id} needs parameter boundaries`);
    assert.ok(tip.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${tip.id} has unknown source`);
    assert.ok(tip.synthMappings.serum || tip.synthMappings.phasePlant || tip.synthMappings.vital);
  }
});

test('community creator technique labs connect non-official videos to interactive sound lab recipes', () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  const communitySources = sources.filter((source) => source.type === 'community');

  assert.ok(communitySources.some((source) => source.platform === 'YouTube'), 'needs YouTube creator videos');
  assert.ok(communitySources.some((source) => source.platform === 'Bilibili'), 'needs Bilibili creator videos');
  assert.ok(sourceIds.has('youtube-negativist-serum-metallic'), 'needs a concrete Serum metallic creator source');
  assert.ok(sourceIds.has('bilibili-serum-weapon-whoosh'), 'needs a concrete Bilibili Serum whoosh source');

  for (const lab of communityTechniqueLabs) {
    assert.match(lab.id, /^[a-z0-9-]+$/);
    assert.ok(lab.titleZh.length > 8, `${lab.id} needs a readable Chinese title`);
    assert.ok(lab.creatorZh.length > 1, `${lab.id} needs creator attribution`);
    assert.ok(lab.watchTaskZh.length > 30, `${lab.id} needs a concrete viewing task`);
    assert.ok(lab.principleZh.length > 80, `${lab.id} needs a detailed principle`);
    assert.ok(lab.methodSteps.length >= 4, `${lab.id} needs detailed method steps`);
    assert.ok(lab.controls.length >= 4, `${lab.id} needs interactive controls`);
    assert.ok(lab.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${lab.id} has an unknown source`);
    assert.ok(lab.soundLabRecipe.familyId, `${lab.id} needs a Sound Lab family`);
    assert.ok(lab.soundLabRecipe.presetDnaId, `${lab.id} needs a Sound Lab preset DNA`);
    assert.ok(Object.keys(lab.soundLabRecipe.macros).length >= 4, `${lab.id} needs macro recipe values`);
    assert.ok(Object.keys(lab.soundLabRecipe.layerMix).length >= 4, `${lab.id} needs layer mix recipe values`);
    assert.ok(lab.synthMappings.serum || lab.synthMappings.phasePlant || lab.synthMappings.vital);
    assert.ok(lab.verification.listeningChecks.length >= 3, `${lab.id} needs listening checks`);
    assert.ok(lab.commonMistakes.length >= 2, `${lab.id} needs common mistakes`);
  }
});

test('deep dive modules provide source-backed analysis and practice interaction structure', () => {
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const module of deepDiveModules) {
    assert.match(module.id, /^[a-z0-9-]+$/);
    assert.ok(module.titleZh);
    assert.ok(['foundation', 'beginner', 'intermediate', 'advanced', 'creative'].includes(module.difficulty));
    assert.ok(module.analysisQuestionZh.length > 20, `${module.id} needs an analysis question`);
    assert.ok(module.corePrincipleZh.length > 80, `${module.id} needs a deep principle explanation`);
    assert.ok(module.signalFlow.length >= 4, `${module.id} needs signal-flow roles`);
    assert.ok(module.parameterBoundaries.length >= 4, `${module.id} needs parameter boundaries`);
    assert.ok(module.earTests.length >= 4, `${module.id} needs listening tests`);
    assert.ok(module.practiceStages.length >= 4, `${module.id} needs practical stages`);
    assert.ok(module.reaperDrill.length >= 4, `${module.id} needs REAPER drill steps`);
    assert.ok(module.deliveryChecklist.length >= 3, `${module.id} needs delivery checks`);
    assert.ok(module.failureDiagnostics.length >= 3, `${module.id} needs failure diagnostics`);
    assert.ok(module.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${module.id} has unknown source`);
    assert.ok(module.synthMappings.serum || module.synthMappings.phasePlant || module.synthMappings.vital);
  }
});

test('external integrations are traceable and actionable without pretending to host VST engines', () => {
  const ids = new Set(externalIntegrations.map((integration) => integration.id));

  assert.ok(ids.has('web-midi-control'), 'needs Web MIDI control integration');
  assert.ok(ids.has('faust-wasm-dsp'), 'needs Faust/WASM DSP future route');
  assert.ok(ids.has('patch-json-export'), 'needs patch JSON export for REAPER notes');

  for (const integration of externalIntegrations) {
    assert.match(integration.id, /^[a-z0-9-]+$/);
    assert.ok(integration.titleZh);
    assert.ok(integration.valueZh.length > 30);
    assert.ok(integration.sourceUrl.startsWith('https://'));
    assert.ok(integration.actions.length >= 2);
    assert.ok(integration.constraintsZh.length >= 1);
    assert.doesNotMatch(integration.valueZh, /embed Serum|embed Phase Plant|embed Vital/i);
  }
});
