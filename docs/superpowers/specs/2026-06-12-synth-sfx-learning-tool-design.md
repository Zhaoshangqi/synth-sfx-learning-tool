# 合成器音效学习工具设计

日期：2026-06-12
目标工作区：E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool

## 目标

做一个本地学习工具，帮助用户从零开始系统学习合成器和用合成器制作音效。资料来源以英文 YouTube 为主，同时纳入官方文档、论文、博客、论坛和中文/B站补充资料。工具输出以中文为主，英文原文保留为可追溯证据。

工具不是简单收藏夹。它要把视频、字幕、时间戳和插件操作整理成可以学习、练习、复盘和检索的课程系统。

## 核心用户

用户使用 REAPER 作为 DAW，主要学习和使用 Serum、Phase Plant、Vital 三个合成器。目标是从基础概念到简单音效、复杂音效、材质音效和创意音效，尤其要理解原理，避免只照抄参数。

## 资料策略

资料分四层：

1. 原理依据层：DSP、声学、谐波、包络、滤波、FM、wavetable、granular、spectral、瞬态和空间处理。
2. 插件机制层：Serum、Phase Plant、Vital、REAPER 的官方文档和功能说明。
3. 制作案例层：英文 YouTube 教程为主，覆盖 metallic hit、laser、UI、whoosh、bass growl、magic charge、robot/mech、impact、glitch 等主题。
4. 技巧经验层：创作者 workflow、preset 拆解、论坛技巧和 quick tips。经验性内容必须标注可信度，不能伪装成物理定律。

每条资料都有来源链接、作者、平台、语言、标签、时间戳、可信度和是否已交叉验证。

## 视频处理流程

1. 用户输入 YouTube 链接、频道或关键词。
2. 工具读取视频标题、频道、简介、字幕、章节和时间戳。
3. 英文字幕按语义段落切分。
4. 每段保留英文原文，生成中文翻译。
5. 从字幕中抽取知识点、参数动作、插件名称、音色目标、可复用原理和练习任务。
6. 生成中文来源卡片。
7. 来源卡片进入知识库，可被课程路线、音效配方和搜索系统复用。

如果视频没有可用字幕，第一版先标记为“需要转录”，不强制实现自动语音识别。后续版本可以加入 Whisper 或其他转录流程。

## 知识卡片结构

每张知识卡片包含：

- 中文标题
- 英文来源标题
- 平台、作者、链接、时间戳
- 主题标签：Serum、Phase Plant、Vital、REAPER、FM、metal、UI、whoosh 等
- 难度：基础、初级、中级、高级、创意
- 原理解释：为什么这个方法会产生对应听感
- 插件操作：Serum / Phase Plant / Vital 的可执行步骤
- REAPER 练习：轨道、MIDI、自动化、渲染、A/B 对比
- 验收标准：听感、频谱、动态、尾音、可循环性或可交互性
- 可信度：官方、专业教程、可验证经验、仅供灵感
- 交叉验证来源

## 课程路线

第一版内置一条主路线：

1. 声音和频谱基础：频率、振幅、谐波、噪声、瞬态。
2. 合成器基础：oscillator、ADSR、filter、LFO、unison、noise。
3. 简单音效：beep、pluck、click、noise hit、short whoosh。
4. 调制语言：envelope modulation、LFO、macro、velocity、random、automation。
5. Wavetable 和 spectral：Serum/Vital/Phase Plant 的 wavetable 扫描、warp、spectral 变化。
6. FM/PM/AM/ring modulation：非谐波、金属、钟、机械和硬质纹理。
7. 复杂层次：transient、body、texture、movement、tail 的分层设计。
8. 材质音效：金属、玻璃、木头、石头、电流、液体、机械、能量。
9. 游戏/影视实战：UI、laser、impact、magic charge、robot movement、loop、release tail。
10. 创意音效：反推参考、混合合成器和素材、建立个人 preset 和 showreel。

## 音效配方库

第一版至少内置 20 个练习配方：

1. Pure beep
2. UI click
3. Soft pluck
4. Noise tick
5. Short whoosh
6. Laser zap
7. Sci-fi blip
8. Metal click
9. Metallic hit
10. Bell-like ring
11. Energy charge
12. Magic shimmer
13. Electric crackle
14. Mechanical servo
15. Robot movement
16. Bass growl
17. Glitch burst
18. Impact sweetener
19. Reverse swell
20. Loopable machine hum

每个配方都要说明声音目标、使用的合成方法、三合成器映射、REAPER 操作和验收标准。

## 三合成器对照

同一原理尽量给出三种实现：

- Serum：重点利用 wavetable、warp、noise、filter、matrix、FX 和 macro。
- Phase Plant：重点利用模块化 generator、audio-rate modulation、FM/PM、Snapin lanes 和复杂层次。
- Vital：重点利用免费可得、spectral warping、可视化调制、LFO/remap 和 wavetable 转换。

如果某个合成器不适合某项练习，工具要说明原因，并给出最接近替代方案。

## REAPER 集成

第一版先做文档和模板级集成：

- 生成练习步骤：建轨、插入合成器、MIDI 触发、自动化、渲染、A/B 对比。
- 输出 REAPER 练习清单和项目模板说明。
- 标注需要手动完成的插件参数。

第二版再加入 ReaScript：自动创建轨道、命名层级、插入标记、生成渲染区间、建立练习 checklist。

## 本地 App 结构

推荐实现为本地网页 App：

- 前端：React 或纯 HTML/CSS/JS，第一版优先轻量稳定。
- 数据：JSON/Markdown 起步，后续可迁移 SQLite。
- 内容目录：sources、cards、courses、recipes、reaper-practice。
- 搜索：按插件、难度、合成方法、音效类型、视频作者和可信度筛选。
- 输出：中文网页、Markdown 笔记、CSV/JSON 数据。

## 页面设计

第一版页面：

1. Dashboard：当前学习进度、下一课、最近添加资料。
2. Sources：视频和文档来源库。
3. Cards：中文知识卡片库。
4. Roadmap：从零到创意音效的学习路线。
5. Recipes：音效配方库。
6. Synth Compare：Serum / Phase Plant / Vital 对照。
7. REAPER Practice：练习任务和渲染检查。

界面要偏工具型，信息密度适中，方便学习和检索，不做营销式首页。

## 数据模型

核心数据对象：

- Source：资料来源。
- TranscriptSegment：字幕段落。
- KnowledgeCard：知识卡片。
- Recipe：音效配方。
- Lesson：课程单元。
- PracticeTask：REAPER 练习。
- SynthMapping：三合成器对照步骤。

对象之间通过 id 引用，避免重复保存同一来源内容。

## 可信度和反瞎编机制

工具必须区分事实、推论和经验。

- 官方文档可以作为插件机制依据。
- 论文、经典 DSP 资料和频谱分析可以作为原理依据。
- YouTube 教程可以作为制作案例依据。
- 社区技巧只能作为经验，除非有可听、可测或可交叉验证的证据。

AI 生成的总结必须保留来源时间戳。没有来源的内容标记为“待验证”，不能混入正式课程核心。

## 第一版范围

第一版实现：

1. 本地网页工具骨架。
2. 手动添加 YouTube 来源。
3. 保存英文字幕和中文翻译字段。
4. 生成和展示知识卡片。
5. 内置主学习路线。
6. 内置 20 个音效练习配方。
7. 三合成器对照展示。
8. REAPER 练习说明。
9. JSON/Markdown 数据文件。

第一版不实现：

- 自动批量抓全网视频。
- 无字幕视频自动语音识别。
- 自动控制 Serum/Phase Plant/Vital 参数。
- 自动评价音频质量。
- 用户账号和云同步。

这些留到第二版。

## 风险

- YouTube 字幕可用性不稳定：第一版允许手动粘贴字幕。
- 翻译会误解术语：建立术语表，例如 envelope、partial、sideband、warp、comb、resonance、mod matrix。
- 教程质量参差：必须有可信度字段和交叉验证字段。
- 范围容易膨胀：第一版只做资料、卡片、路线、配方和练习，不做全自动平台。

## 验收标准

第一版完成后，用户应能：

1. 打开本地网页工具。
2. 浏览中文学习路线。
3. 查看来源库中的英文 YouTube 视频卡片。
4. 查看带英文原文、中文翻译、时间戳和可信度的知识卡片。
5. 按 Serum / Phase Plant / Vital / REAPER / 金属 / FM 等标签搜索。
6. 按 20 个练习配方在 REAPER 中完成基础到中级音效练习。
7. 看到每个配方背后的原理和来源，而不是盲目照抄参数。

## 后续计划

设计文档确认后，下一步进入实现计划：

1. 创建项目结构。
2. 建立数据 schema 和示例数据。
3. 实现本地网页 UI。
4. 实现来源、卡片、路线、配方页面。
5. 添加搜索和筛选。
6. 写入第一批精选来源和练习配方。
7. 本地运行并用浏览器验证。
