# 合成器音效学习工具

本工具用于把英文 YouTube、官方文档、论文和社区资料整理成中文合成器音效学习路线。当前版本是静态本地网页 App，重点是资料来源、中文知识卡片、互动课程、音效配方、三合成器对照和 REAPER 练习。

## 使用方式

在本目录运行：

```powershell
npm test
python server.py 5177
```

然后打开：

```text
http://localhost:5177
```

也可以直接打开 `index.html`，但用本地服务器更接近真实模块加载环境，并能保证 ES module 的 JavaScript MIME 类型正确。

## 当前版本包含

- 中文学习路线
- 32 个从零基础到创意反推的详细学习单元
- 8 条微课学习线、80+ 个小练习：听觉基础、波形、时间、频谱、调制、材质、分层、创意反推
- 5 张可维护 SVG 原理图：信号流、ADSR、滤波、FM 侧频、音效分层
- 5 个 Ableton Learning Synths 风格的互动实验：ADSR、Filter、FM Metal、Layer Stack、Recipe Playground
- 6 个声音挑战：A/B 听辨、参数反推、信号流判断，按钮可直接试听
- 8 个材质实验：金属、玻璃、电流、机械、能量、魔法、空气 Whoosh、机器底噪
- WebAudio 试听：每个互动实验可选择 sine、square、sawtooth、triangle 四个基础波形并实时播放
- WebAudio 材质声音：挑战和材质实验可播放独立 patch，包含 oscillator、FM、filter、noise 和 envelope
- 播放时的实时视觉反馈：电平条、图形 glow 和播放状态会跟随声音更新
- 高级深色声音空间视觉：玻璃面板、细线信号层、慢速粒子 Canvas、柔和冷光和轻微鼠标视差
- ADSR 图中可拖动控制点：拖动 Attack、Decay/Sustain、Release 节点会同步滑杆、曲线和声音参数
- 英文来源资料卡
- 双语字幕/提炼样例
- 20 个音效配方
- Serum / Phase Plant / Vital 对照
- REAPER 练习任务
- 本地搜索和筛选
- 手动添加 YouTube/资料来源，保存到浏览器 localStorage

## 第一版限制

- 不自动批量抓取 YouTube
- 不自动转录无字幕视频
- 不自动控制 Serum、Phase Plant 或 Vital 参数
- 不做真实音频文件质量自动评分；当前挑战是交互式听辨和参数判断
- 不做云同步或用户账号

## 数据入口

核心数据在 `src/content.js`：

- `sources`：官方、YouTube 搜索种子、论文和资料来源
- `transcriptSegments`：英文原文、中文翻译、中文提炼样例
- `knowledgeCards`：带来源证据的知识卡片
- `roadmapLessons`：从零到创意音效的课程路线
- `learningPathUnits`：细化到每一步的学习单元
- `microLearningTracks` / `microLessons`：8 条微课学习线和 80+ 小练习
- `soundChallenges`：可试听的 A/B、参数反推和信号流挑战
- `materialLabs`：材质实验数据、滑杆、预设、三合成器映射和 REAPER 检查清单
- `principleDiagrams`：内嵌 SVG 原理图
- `interactiveLabs`：互动课程实验、滑杆、预设、三合成器映射和 REAPER 检查清单
- `recipes`：20 个音效练习配方
- `glossary`：英文教程术语表
- `reaperPracticeTasks`：REAPER 练习流程

互动实验的状态和视觉模型在 `src/lab-engine.js`，挑战/材质模型在 `src/challenge-model.js`，音频参数映射在 `src/audio-model.js`，浏览器发声在 `src/audio-player.js`，页面渲染在 `src/render.js` 和 `src/app.js`，全局粒子/视差背景在 `src/visual-space.js`。

## 测试

使用 Node 自带测试器，无需安装依赖：

```powershell
npm test
```

测试覆盖内容结构、详细学习路径、微课、声音挑战、材质实验、原理图、互动实验、搜索筛选、dashboard 派生数据和 HTML 渲染助手。
