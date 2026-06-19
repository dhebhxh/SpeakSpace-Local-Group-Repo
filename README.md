# SpeakSpace Local 项目实时进度

> 本分支只用于展示自动生成的项目进度 dashboard，不包含可运行源码。  
> 内容基于 Git/repo 静态分析生成；未运行测试、build 或 dev server。  
> This branch contains only an auto-generated project status dashboard. It is based on static Git/repo analysis and does not include runnable source code.

## 分支状态

| 分支 | HEAD | 最近提交 | 作者 | 日期 |
|---|---:|---|---|---|
| `origin/LF-c-patch-1` | `fb2389c` | feat: 新增亮色模式與切換按鈕 | Jack8ot | 2026-06-16 |
| `origin/W` | `305e03b` | Merge pull request #5 from dhebhxh/codex/add-client-meeting-eval-prep | Wenlei Miao | 2026-06-07 |
| `origin/codex/remove-agent-handoff` | `dab0ebb` | Remove obsolete agent handoff | Yanqing | 2026-06-20 |
| `origin/feature/dod` | `6c82d18` | Update README.md | Jack8ot | 2026-06-19 |
| `origin/main` | `18a5655` | Merge pull request #7 from dhebhxh/YQ | Wenlei Miao | 2026-06-17 |
| `origin/project-proposal` | `259ed1a` | proposal-draft | Greta | 2026-06-10 |

## 最近变化摘要

- 删除 `origin/codex/meeting-note-templates`（`e7ac17c` → 已移除）
- 该分支此前已通过 PR #8 合入 `origin/Jack`，Jack 分支现为会议笔记模板及其工作流的主承载分支
- 已解决 1 项待确认事项（LLM 评估结果落地），当前 6 项待确认

## 更新记录

### 2026-06-20 00:54 — 自动更新

**分支变化**
- 删除 `origin/codex/meeting-note-templates`：`e7ac17c` → 已移除

**说明：** 远端分支 `origin/codex/meeting-note-templates` 已被删除。该分支此前已通过 PR #8 合入 `origin/Jack`，内容已由 Jack 分支继承。

**事项状态变化**
- 已解决：LLM 评估结果落地（SPK-LLM-评估结果落地）——脚本确认远端分支 `origin/YQ` 仍不存在，重新确认解决状态

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| deleted | origin/codex/meeting-note-templates | e7ac17c | 已移除 | — | — |

---

### 2026-06-20 00:49 — 自动更新

**分支变化**
- 新增 `origin/codex/remove-agent-handoff`：`dab0ebb`
- 更新 `origin/Jack`：`367fd0a` → `e23164a`

**提交摘要**
- `origin/codex/remove-agent-handoff` `dab0ebb`：Remove obsolete agent handoff（Yanqing，2026-06-20）
- `origin/Jack` `e7ac17c`：Fix Windows native rebuild invocation（Yanqing，2026-06-20）
- `origin/Jack` `77b9620`：Add resilient transcription and note workflows（Yanqing，2026-06-20）

**主要文件变化**
- `origin/codex/remove-agent-handoff`: `M  AGENTS.md`
- `origin/codex/remove-agent-handoff`: `D  docs/agents/speakspace-ui-pr6-handoff-2026-06-15.md`
- `origin/Jack`: `M  .github/workflows/verify-local.yml`
- `origin/Jack`: `M  package-lock.json`
- `origin/Jack`: `M  package.json`
- `origin/Jack`: `A  scripts/prepare-native.js`
- `origin/Jack`: `M  scripts/verify-local.js`
- `origin/Jack`: `A  src/main/audio-duration.js`
- `origin/Jack`: `A  src/main/audio-retention.js`
- `origin/Jack`: `M  src/main/db-service.js`
- `origin/Jack`: `M  src/main/llm-service.js`
- `origin/Jack`: `M  src/main/main.js`
- `origin/Jack`: `M  src/main/structured-processor.js`
- `origin/Jack`: `A  src/main/transcript-segments.js`
- `origin/Jack`: `A  src/main/transcription-job-manager.js`
- `origin/Jack`: `M  src/main/transcription-service.js`
- `origin/Jack`: `M  src/preload/preload.js`
- `origin/Jack`: `A  src/renderer/draft-conversation-context.js`
- `origin/Jack`: `A  src/renderer/drop-input.js`
- `origin/Jack`: `M  src/renderer/index.html`
- `origin/Jack`: `A  src/renderer/note-draft-source.js`
- `origin/Jack`: `A  src/renderer/note-library-state.js`

---

### 2026-06-20 00:32 — 自动更新

**分支变化**
- 删除 `origin/YQ`：`1c7066b` → 已移除

**说明：** 远端分支 `origin/YQ` 已被删除。该分支此前包含多轮 LLM 模型评估报告，相关内容已通过 PR #7 合入 `origin/main`。因该分支不再存在，关联的待确认事项「LLM 评估结果落地」由脚本自动标记为已解决。其余 7 个远端分支无变化，待确认事项从 7 项减至 6 项。

---

### 2026-06-20 00:30 — 自动更新

- 更新 `origin/codex/meeting-note-templates`：`77b9620` → `e7ac17c`（Yanqing：Fix Windows native rebuild invocation）
- 变更文件：`M  scripts/prepare-native.js`、`M  tests/prepare-native.test.js`

---

### 2026-06-20 00:27 — 自动更新

- 新增 `origin/codex/meeting-note-templates`：`77b9620`（Yanqing：Add resilient transcription and note workflows，含 5 个提交）

---

### 2026-06-19 18:12 — origin/Jack 合并冲突修复

- 更新 `origin/Jack`：`113b428` → `367fd0a`（Yanqing：fix: resolve db-service merge conflict markers）
- 变更文件：`M  src/main/db-service.js`

---

### 2026-06-19 11:49 — origin/feature/dod README 更新

- 更新 `origin/feature/dod`：`a4fb32b` → `6c82d18`（Jack8ot：Update README.md）

---

### 2026-06-19 11:26 — origin/feature/dod README 更新

- 更新 `origin/feature/dod`：`6b077b7` → `a4fb32b`（Jack8ot：Update README.md）

---

### 2026-06-19 11:23 — origin/feature/dod README 更新

- 更新 `origin/feature/dod`：`44e3059` → `6b077b7`（Jack8ot：Update README.md）

---

### 2026-06-19 09:02 — origin/Jack 代码审查与注释完善

- 更新 `origin/Jack`：`4ca0cf9` → `113b428`（Jack8ot：db-service comment added & code review done，2 个提交）
- 变更文件：`M  src/main/db-service.js`

---

### 2026-06-18 22:00 — origin/Jack SQLite 验证与 LLM 选择修复

- 更新 `origin/Jack`：`80b4556` → `4ca0cf9`（Yanqing：3 个提交）
- 修复本地 LLM 模型选择、亮色模式消息显示、SQLite 验证流程
- 变更文件：`scripts/verify-local.js`、`src/main/db-service.js`、`src/main/main.js`、`src/renderer/renderer.js`、`src/renderer/styles.css`

---

### 2026-06-18 17:00 — origin/Jack 数据层重构（SQL Feature added）

- 更新 `origin/Jack`：`1593624` → `80b4556`（Jack8ot：SQL Feature added）
- 将分散的 note-store 和 sync-service 功能整合为统一 SQLite 数据层（`db-service.js`）
- 新增待确认事项：origin/Jack 合并/同步计划
- 变更文件：`D  src/main/db-service/`、`A  src/main/db-service.js`、`M  src/main/main.js`、`D  src/main/note-store.js`、`D  src/main/sync-service/`

---

### 2026-06-18 15:39 — 文档刷新与 dashboard 同步

- 无远端分支变化
- 根据脚本裁决同步 7 项待确认事项，补充证据字段
- 充实概览和功能模块部分

---

### 2026-06-18 15:00 — origin/Jack 侧边栏主题切换完善

- 更新 `origin/Jack`：`ca4a834` → `1593624`（Yanqing：Refine sidebar theme toggle）
- 变更文件：`M  src/renderer/index.html`、`M  src/renderer/renderer.js`、`M  src/renderer/styles.css`

---

### 2026-06-18 10:00 — origin/Jack 亮色模式 UI 打磨修复

- 更新 `origin/Jack`：`e54f1b3` → `ca4a834`（Yanqing：Fix light theme UI polish）
- 变更文件：`M  src/main/note-store.js`、`M  src/renderer/renderer.js`、`M  src/renderer/styles.css`

---

### 2026-06-18 01:00 — origin/Jack 前端亮色主题完善

- 更新 `origin/Jack`：`f499af0` → `e54f1b3`（Jack8ot：Front End: light theme update and UI Fixing）
- 变更文件：`M  src/renderer/styles.css`、`M  .gitignore`

---

### 2026-06-17 11:00 — origin/main 里程碑合并

- 更新 `origin/main`：`305e03b` → `18a5655`（Wenlei Miao：Merge pull request #7 from dhebhxh/YQ）
- 通过 PR #7（from YQ）和 PR #6（from LF-c-patch-1）合并，main 分支现为项目最完整的集成分支

---

*本文件共保留 17 条更新记录（最近 20 条内）。*

## 当前待确认事项

以下事项由脚本基于静态事实裁决生成，文档仅按脚本提供的状态进行呈现。

- [SPK-SQLITE-VS-JSON-存储方案] **SQLite vs JSON 存储方案** — `origin/Jack` 引入了 SQLite 数据层（notes + conversations 表），但 `origin/main` 当前使用的是 JSON 文件存储方案。两个数据层方案是否需要统一、何时合并，待团队确认。
  - 证据：当前静态上下文仍出现相关证据：json, origin/jack, origin/main

- [SPK-ORIGIN-JACK-合并计划] **`origin/Jack` 合并计划** — 该分支独立维护了一批功能（SQLite、全栈代码），尚未合并入 main。是否需要合并、合并顺序和冲突处理方案待确认。
  - 证据：当前静态上下文仍出现相关证据：main, origin/jack

- [SPK-多语言支持范围] **多语言支持范围** — 客户会议材料提到需关注英文、中文和印地语，但当前 i18n 仅覆盖中英文界面切换（从 README 描述推断），印地语支持待确认。
  - 证据：当前静态上下文仍出现相关证据：readme, 切换

- [SPK-WINDOWS-兼容性验证] **Windows 兼容性验证** — GitHub Actions 工作流 `verify-local.yml` 的存在表明有 CI 关注，但当前项目启动方式有 Windows PowerShell 执行策略注意事项（npm.ps1 拦截），跨平台验证状态待确认。
  - 证据：当前静态上下文仍出现相关证据：github, npm.ps1, powershell, verify-local.yml, windows, 工作流, 拦截, 确认

- [SPK-TTS-V2-时间线] **TTS V2 时间线** — README 和客户会议材料一致认为 TTS 为 V2 功能，具体时间表待确认。
  - 证据：当前静态上下文仍出现相关证据：readme, tts, 功能

- [SPK-ORIGIN-JACK-合并-同步计划] **origin/Jack 合并/同步计划** — origin/Jack 有新的远端变化，是否需要合并入主线或同步方案待确认。
  - 证据：当前静态上下文仍出现相关证据：origin/jack

## 已解决或已变化事项

以下事项由脚本确认状态变更，文档仅如实呈现。

- [SPK-LLM-评估结果落地] **LLM 评估结果落地** — `origin/YQ` 包含多轮 LLM 评估报告（已合入 main），但当前默认模型 `qwen3:4b-instruct` 是否基于评估结果确定，从静态分析无法确认。
  - 解决时间：2026-06-20 00:54
  - 原因：提到的远端分支已不存在：origin/YQ

## 过期或证据不足事项

- 最近没有过期或证据不足事项。

## 当前项目概览

SpeakSpace Local 是一个本地优先的桌面项目，基于 Electron 构建，目标是将「本地录音 / 文件导入 / 语音转写 / 本地大模型整理 / 本地语音播报 / 笔记沉淀」串成一条完整的离线工作流。当前总览基于仓库文档、提交记录、分支状态和项目结构静态生成；具体功能完成度仍以人工验收为准。

## 当前功能与模块

从仓库结构和 package.json 静态识别到：

- **Electron/Node 桌面应用** — 离线运行，不依赖云端 API
- **三条本地 AI 能力统一接入：**
  - **STT**：`whisper.cpp` + `ggml-large-v3-turbo-q5_0.bin`（默认）
  - **LLM**：`Ollama` + 可切换本地模型，默认 `qwen3:4b-instruct`
  - **TTS**：`sherpa-onnx-node` + `kokoro-multi-lang-v1_0`
- 运行时与模型下载、删除、状态检测脚本
- 项目内统一托管目录 `.speakspace-data/`
- 笔记保存、结构化整理、对笔记继续问答
- 本地硬件检测与推理能力提示
- 中英文界面切换与本地状态持久化
- 亮色模式主题切换（`origin/LF-c-patch-1`、`origin/Jack` 均有贡献）
- 软删除回收站工作流
- GitHub Actions CI：`.github/workflows/verify-local.yml`（macOS + Windows）

### 最近新增/活跃功能（从提交推断）

- `origin/Jack`：SQLite 数据层（统一 db-service.js）、弹性的转录与笔记工作流、Windows 原生编译修复、亮色模式主题切换与 UI 打磨
- `origin/LF-c-patch-1`：亮色模式切换按钮
- `origin/codex/meeting-note-templates`：已合并入 Jack 后删除，内容由 Jack 继承

## 运行与开发信息（静态识别）

### package.json scripts

| 命令 | 说明 |
|---|---|
| `npm start` | 准备原生模块后启动 Electron |
| `npm run download:runtime` | 下载 STT runtime（whisper.cpp） |
| `npm run download:tts` | 下载 TTS runtime（sherpa-onnx） |
| `npm run download:llm` | 下载 LLM 默认模型 |
| `npm run download:llm:candidates` | 下载候选 LLM 模型 |
| `npm run download:runtime:check` | 检查 STT runtime 状态 |
| `npm run download:tts:check` | 检查 TTS runtime 状态 |
| `npm run download:llm:check` | 检查 LLM 模型状态 |
| `npm run cleanup:assets` | 一键清理本地资源 |
| `npm run verify:local` | 验证本地环境与集成 |
| `npm test` | 运行单元测试（当前为占位） |

### 依赖（package.json 识别）

- `dependencies`：`sherpa-onnx`、`sherpa-onnx-node`
- `devDependencies`：`electron`

### 文档与评估材料

| 路径 | 说明 |
|---|---|
| `docs/client-meeting-model-evaluation-prep.md` / `.zh.md` | 与客户会议前的模型评估准备（中英双语） |
| `llm-evaluation/` | LLM 模型评估报告（3 轮） |
| `stt-evaluation/desktop-stt-model-summary-report.md` | 桌面 STT 模型摘要报告 |
| `project-proposal.md` | 项目提案（中英双语） |
| `AGENTS.md` | 开发代理指南 |

> 注意：以上信息全部基于仓库静态文件识别，不表示实际测试/运行结果。

- 最后更新：2026-06-20 00:54
- 分析方式：静态分析（Git refs / commits / docs / package.json / src tree）
- 仓库：`https://github.com/dhebhxh/SpeakSpace-Local-Group-Repo.git`
