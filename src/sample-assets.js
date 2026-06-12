export const SOUND_LAB_SAMPLE_ASSETS = [
  {
    id: 'pd-click-pin',
    labelZh: '程序化硬点击',
    role: 'transient',
    license: {
      kind: 'generated-procedural',
      label: 'Generated in app',
      attributionZh: '由网页实时生成，不包含第三方音频文件。',
    },
    generator: { type: 'impulse-noise', durationMs: 28, bandHz: 6800, decay: 0.72 },
  },
  {
    id: 'pd-metal-snap',
    labelZh: '程序化金属尖峰',
    role: 'transient',
    license: {
      kind: 'generated-procedural',
      label: 'Generated in app',
      attributionZh: '由白噪声、短包络和带通滤波实时合成。',
    },
    generator: { type: 'banded-burst', durationMs: 46, bandHz: 4200, decay: 0.84 },
  },
  {
    id: 'pd-glass-dust',
    labelZh: '程序化玻璃颗粒',
    role: 'texture',
    license: {
      kind: 'generated-procedural',
      label: 'Generated in app',
      attributionZh: '由随机微颗粒和高频稀疏包络生成。',
    },
    generator: { type: 'spark-grains', durationMs: 520, bandHz: 9200, decay: 1.38 },
  },
  {
    id: 'pd-electric-grain',
    labelZh: '程序化电流颗粒',
    role: 'texture',
    license: {
      kind: 'generated-procedural',
      label: 'Generated in app',
      attributionZh: '由随机门控噪声和软削波实时生成。',
    },
    generator: { type: 'gated-noise', durationMs: 760, bandHz: 5300, decay: 0.92 },
  },
  {
    id: 'pd-air-bed',
    labelZh: '程序化空气噪声床',
    role: 'noise-bed',
    license: {
      kind: 'generated-procedural',
      label: 'Generated in app',
      attributionZh: '由滤波噪声和缓慢扫频实时生成。',
    },
    generator: { type: 'filtered-noise', durationMs: 1300, bandHz: 1800, decay: 1.18 },
  },
  {
    id: 'pd-tail-shimmer',
    labelZh: '程序化微尾音',
    role: 'tail',
    license: {
      kind: 'generated-procedural',
      label: 'Generated in app',
      attributionZh: '由短混响脉冲响应和微调制实时生成。',
    },
    generator: { type: 'shimmer-tail', durationMs: 1600, bandHz: 6400, decay: 1.9 },
  },
];

export function getSampleAsset(assetId) {
  return SOUND_LAB_SAMPLE_ASSETS.find((asset) => asset.id === assetId) ?? SOUND_LAB_SAMPLE_ASSETS[0];
}
