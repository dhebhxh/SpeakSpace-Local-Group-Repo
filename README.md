# SpeakSpace Local 项目实时进度

> 本分支只用于展示自动生成的项目进度 dashboard，不包含可运行源码。  
> 内容基于 Git/repo 静态分析生成；未运行测试、build 或 dev server。  
> This branch contains only an auto-generated project status dashboard. It is based on static Git/repo analysis and does not include runnable source code.

- 最后更新：2026-06-19 11:26
- 分析方式：静态分析（Git refs / commits / docs / package.json / src tree）
- 仓库：`https://github.com/dhebhxh/SpeakSpace-Local-Group-Repo.git`

## 当前项目概览

SpeakSpace Local 是一个本地优先的桌面项目，基于 Electron 构建，目标是把本地录音、文件导入、语音转写、本地大模型整理、本地语音播报、笔记沉淀串成一条完整的桌面端工作流。

当前三条本地 AI 能力已统一接入：
- **STT**：`whisper.cpp` + `ggml-large-v3-turbo-q5_0.bin`
- **LLM**：`Ollama` + 可切换本地模型，默认 `qwen3:4b-instruct`
- **TTS**：`sherpa-onnx-node` + `kokoro-multi-lang-v1_0`（V2 功能）

从项目提案文档看，该项目定位为「一个由本地 AI 推理驱动的语音优先办公生产力系统」，注重模块化设计，便于灵活替换不同语音识别、语音合成和文本理解模型。

## 当前功能与模块

从 README 和项目结构静态识别到以下核心功能：

1. **本地聊天与多模型切换** — 支持本地 LLM 对话、设置面板切换已安装模型、下载/删除项目内模型
2. **文件转写** — 支持选择本地音频/视频文件，通过 whisper.cpp 离线转写，结果落盘到 `.speakspace-data/stt/output`
3. **麦克风录音** — 应用内录音，保存到本地托管目录，可直接进入转写和整理流程
4. **结构化笔记生成** — 将原始转写结果交给本地 LLM，自动生成标题、摘要、关键要点、行动项、标签
5. **笔记存储与检索** — 保存笔记，支持按文件夹、标签、关键词过滤，支持在笔记详情页继续问答
6. **针对笔记的继续提问** — 在单条笔记下继续追问
7. **中英文界面切换** — 界面语言切换与本地状态持久化
8. **本地硬件检测与推理能力提示**
9. **运行时与模型管理** — 下载、删除、状态检测，统一托管目录 `.speakspace-data/`
10. **Clean All Local Assets** — 一键清理

## 分支状态

| 分支 | HEAD | 最近提交 | 作者 | 日期 |
|---|---:|---|---|---|
| `origin/Jack` | `113b428` | db-service comment added & code review done | Jack8ot | 2026-06-19 |
| `origin/LF-c-patch-1` | `fb2389c` | feat: 新增亮色模式與切換按鈕 | Jack8ot | 2026-06-16 |
| `origin/W` | `305e03b` | Merge pull request #5 from dhebhxh/codex/add-client-meeting-eval-prep | Wenlei Miao | 2026-06-07 |
| `origin/YQ` | `1c7066b` | Move UI handoff into agent docs | Yanqing | 2026-06-16 |
| `origin/feature/dod` | `a4fb32b` | Update README.md | Jack8ot | 2026-06-19 |
| `origin/main` | `18a5655` | Merge pull request #7 from dhebhxh/YQ | Wenlei Miao | 2026-06-17 |
| `origin/project-proposal` | `259ed1a` | proposal-draft | Greta | 2026-06-10 |

本地当前所在分支：`Jack`

## 最近变化摘要

- 更新 `origin/feature/dod`：`6b077b7` → `a4fb32b`

### 最近提交
- `origin/feature/dod` `a4fb32b`：Update README.md（Jack8ot，2026-06-19）

### 主要文件变化
- `origin/feature/dod`: `M  README.md`

## 运行与开发信息（静态识别）

**package.json**：
- 名称：`speakspace-local-desktop` v1.0.0
- 描述：Local Electron desktop speech-to-text MVP powered by whisper.cpp
- 入口：`npm start` / `electron .`
- 核心依赖：`better-sqlite3`、`sherpa-onnx`、`sherpa-onnx-node`
- 开发依赖：`electron`

**可用脚本：**

| 命令 | 功能 |
|---|---|
| `npm start` | 启动 Electron 应用 |
| `npm run download:runtime` | 下载 whisper.cpp 运行时 |
| `npm run download:tts` | 下载 TTS 运行时 |
| `npm run download:llm` | 下载 LLM 运行时 |
| `npm run download:llm:candidates` | 下载候选 LLM 模型 |
| `npm run download:runtime:check` | 检查 whisper.cpp 运行时状态 |
| `npm run download:tts:check` | 检查 TTS 运行时状态 |
| `npm run download:llm:check` | 检查 LLM 运行时状态 |
| `npm run cleanup:assets` | 一键清理本地资源 |
| `npm run verify:local` | 本地环境验证 |
| `npm test` | 测试（当前无自动化测试） |

**文档与交付物：**

- `desktop-stt-model-summary-report.md` — STT 模型评估报告，推荐 `whisper.cpp ggml-large-v3-turbo-q5_0` 为首选方案
- `project-proposal.md` — 中英双语项目提案文档
- `docs/client-meeting-model-evaluation-prep.md` / `.zh.md` — 客户会议模型评估准备材料（中英双语）
- `scripts/ollama-model-catalog.json` — Ollama 模型目录

**CI 配置：**
- `.github/workflows/verify-local.yml` — GitHub Actions 验证工作流

> 注意：自动任务未运行测试、build 或 dev server；上面只是静态识别到的命令和文件。

## 当前待确认事项

1. **[SPK-SQLITE-VS-JSON-存储方案] SQLite vs JSON 存储方案** — `origin/Jack` 引入了 SQLite 数据层（notes + conversations 表），但 `origin/main` 当前使用的是 JSON 文件存储方案。两个数据层方案是否需要统一、何时合并，待团队确认。

2. **[SPK-ORIGIN-JACK-合并计划] `origin/Jack` 合并计划** — 该分支独立维护了一批功能（SQLite、全栈代码），尚未合并入 main。是否需要合并、合并顺序和冲突处理方案待确认。

3. **[SPK-LLM-评估结果落地] LLM 评估结果落地** — `origin/YQ` 包含多轮 LLM 评估报告（已合入 main），但当前默认模型 `qwen3:4b-instruct` 是否基于评估结果确定，从静态分析无法确认。

4. **[SPK-多语言支持范围] 多语言支持范围** — 客户会议材料提到需关注英文、中文和印地语，但当前 i18n 仅覆盖中英文界面切换（从 README 描述推断），印地语支持待确认。

5. **[SPK-WINDOWS-兼容性验证] Windows 兼容性验证** — GitHub Actions 工作流 `verify-local.yml` 的存在表明有 CI 关注，但当前项目启动方式有 Windows PowerShell 执行策略注意事项（npm.ps1 拦截），跨平台验证状态待确认。

6. **[SPK-TTS-V2-时间线] TTS V2 时间线** — README 和客户会议材料一致认为 TTS 为 V2 功能，具体时间表待确认。

7. **[SPK-ORIGIN-JACK-合并-同步计划] origin/Jack 合并/同步计划** — origin/Jack 有新的远端变化，是否需要合并入主线或同步方案待确认。

## 已解决或已变化事项

- 最近没有脚本确认的已解决/已变化事项。

## 过期或证据不足事项

- 最近没有过期或证据不足事项。

---

## 更新记录

### 2026-06-19 11:26 — origin/feature/dod README 再次更新

**分支变化**
- 更新 `origin/feature/dod`：`6b077b7` → `a4fb32b`

**提交摘要**
- `origin/feature/dod` `a4fb32b`：Update README.md（Jack8ot，2026-06-19）

**主要文件变化**
- `origin/feature/dod`: `M  README.md`

**说明：** Jack8ot 对 `feature/dod` 分支的 README.md 再次更新（距上次更新约 1 分钟）。从 Git 信息看为 README 内容维护，未引入新功能或架构变化。所有远端分支无其他变动，待确认事项保持 7 项不变。

| 类型 | 说明 |
|---|---|
| 当前待确认 | 7 项（无新增/解决/过期） |
| 已解决 | 0 |
| 过期 | 0 |

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/feature/dod | 6b077b7 | a4fb32b | Jack8ot | Update README.md |

**变更文件：**
- `M  README.md`

---

### 2026-06-19 11:23 — origin/feature/dod 更新 README.md

**分支变化**
- 更新 `origin/feature/dod`：`44e3059` → `6b077b7`

**提交摘要**
- `origin/feature/dod` `6b077b7`：Update README.md（Jack8ot，2026-06-19）

**主要文件变化**
- `origin/feature/dod`: `M  README.md`

**说明：** Jack8ot 对 `feature/dod` 分支的 README.md 进行了更新。从提交信息看为文本文档维护，未引入新功能或架构变化。其他分支无变动，待确认事项保持 7 项不变。

| 类型 | 说明 |
|---|---|
| 当前待确认 | 7 项（无新增/解决/过期） |
| 已解决 | 0 |
| 过期 | 0 |

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/feature/dod | 44e3059 | 6b077b7 | Jack8ot | Update README.md |

**变更文件：**
- `M  README.md`

---

### 2026-06-19 09:02 — origin/Jack 代码审查与注释完善

**分支变化**
- 更新 `origin/Jack`：`4ca0cf9` → `113b428`

**提交摘要**
- `origin/Jack` `113b428`：db-service comment added & code review done（Jack8ot，2026-06-19）
- `origin/Jack` `6f6915a`：db-service comment added & code review done（Jack8ot，2026-06-19）

**主要文件变化**
- `origin/Jack`: `M  src/main/db-service.js`

**说明：** Jack8ot 对 `db-service.js` 添加了注释并完成了代码审查。本次更新无新功能引入，无新增待确认事项。

| 类型 | 说明 |
|---|---|
| 当前待确认 | 7 项（无新增/解决/过期） |
| 已解决 | 0 |
| 过期 | 0 |

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/Jack | 4ca0cf9 | 113b428 | Jack8ot | db-service comment added & code review done |

**变更文件：**
- `M  src/main/db-service.js`

---

### 2026-06-18 22:00 — origin/Jack SQLite 验证与 LLM 选择修复

`origin/Jack` 更新：`80b4556` → `4ca0cf9`（Yanqing: 3 commits）

Yanqing 对 Jack 分支进行了 3 轮修复性提交，聚焦 SQLite 数据层集成后的稳定性：

1. **Fix local LLM selection and light theme messages** — 修复本地 LLM 模型选择逻辑和亮色模式消息显示问题
2. **Fix local verification for SQLite service** — 调整本地验证流程以适配 SQLite 数据层架构
3. **Close SQLite store during local verification** — 确保 verify-local 脚本执行后正确关闭 SQLite 连接，避免资源泄漏

涉及文件均为修改（无新增/删除）：`scripts/verify-local.js`、`src/main/db-service.js`、`src/main/main.js`、`src/renderer/renderer.js`、`src/renderer/styles.css`

本次更新为快速迭代修复，无新功能引入，无新增待确认事项。

| 类型 | 说明 |
|---|---|
| 当前待确认 | 7 项（无新增/解决/过期） |
| 已解决 | 0 |
| 过期 | 0 |

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/Jack | 80b4556 | 4ca0cf9 | Yanqing | Close SQLite store during local verification |

**变更文件：**
- `M  scripts/verify-local.js`
- `M  src/main/db-service.js`
- `M  src/main/main.js`
- `M  src/renderer/renderer.js`
- `M  src/renderer/styles.css`

---

### 2026-06-18 17:00 — origin/Jack 数据层重构（SQL Feature added）

`origin/Jack` 更新：`1593624` → `80b4556`（Jack8ot: SQL Feature added）

本次提交对数据层进行了实质性重构：
- 删除 `src/main/db-service/` 目录（旧存根）
- 删除 `src/main/note-store.js`（笔记存储模块）
- 删除 `src/main/sync-service/` 目录（同步服务模块）
- 新增 `src/main/db-service.js`（统一的 SQLite 数据服务）
- 修改 `src/main/main.js` 以适配新架构

从静态分析看，`origin/Jack` 正将分散的 note-store 和 sync-service 功能整合为一个统一的 SQLite 数据层。该分支持续独立于 main 演进，合并协调仍是待确认事项。

**新增待确认事项：** origin/Jack 合并/同步计划（SPK-ORIGIN-JACK-合并-同步计划）

| 类型 | 说明 |
|---|---|
| 当前待确认 | 7 项（新增 1 项） |
| 已解决 | 0 |
| 过期 | 0 |

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/Jack | 1593624 | 80b4556 | Jack8ot | SQL Feature added |

**变更文件：**
- `D  src/main/db-service/`（目录移除）
- `A  src/main/db-service.js`（新增）
- `M  src/main/main.js`（修改）
- `D  src/main/note-store.js`（删除）
- `D  src/main/sync-service/`（目录移除）

---

### 2026-06-18 15:39 — 文档刷新与 dashboard 同步

本次更新无远端分支变化（所有分支 SHA 保持不变）。文档进行了以下调整：

- 移除备选模板标记（恢复 LLM 全量分析）
- 根据脚本裁决同步 7 项待确认事项，状态均保持不变
- 为每项待确认事项补充了证据字段
- 概览和功能模块部分基于 README 内容做了充实

| 类型 | 说明 |
|---|---|
| 当前待确认 | 7 项（无新增/解决/过期） |
| 已解决 | 0 |
| 过期 | 0 |

---

### 2026-06-18 15:00 — origin/Jack 侧边栏主题切换完善

`origin/Jack` 更新：`ca4a834` → `1593624`（Yanqing）

Yanqing 完善了亮色模式中侧边栏区域的主题切换交互，修改了 index.html、renderer.js 和 styles.css 三个渲染层文件。属于亮色模式持续打磨，未引入新功能模块或架构变化。

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/Jack | ca4a834 | 1593624 | Yanqing | Refine sidebar theme toggle |

**变更文件：**
- `M  src/renderer/index.html`
- `M  src/renderer/renderer.js`
- `M  src/renderer/styles.css`

---

### 2026-06-18 10:00 — origin/Jack 亮色模式 UI 打磨修复

`origin/Jack` 更新：`e54f1b3` → `ca4a834`（Yanqing）

Yanqing 对 Jack 分支的亮色模式前端做了打磨修复，修改了 note-store.js、renderer.js 和 styles.css 三个文件。属于前一个亮色模式提交之后的界面细节完善。

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/Jack | e54f1b3 | ca4a834 | Yanqing | Fix light theme UI polish |

**变更文件：**
- `M  src/main/note-store.js`
- `M  src/renderer/renderer.js`
- `M  src/renderer/styles.css`

---

### 2026-06-18 01:00 — origin/Jack 前端亮色主题完善

`origin/Jack` 更新：`f499af0` → `e54f1b3`（Jack8ot）

Jack8ot 对前端亮色模式做了进一步完善和 UI 修复，更新了样式文件（styles.css）和 .gitignore。项目进入界面细节打磨阶段。

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/Jack | f499af0 | e54f1b3 | Jack8ot | Front End: light theme update and UI Fixing |

**变更文件：**
- `M  src/renderer/styles.css`
- `M  .gitignore`

---

### 2026-06-17 11:00 — origin/main 里程碑合并

`origin/main` 更新：`305e03b` → `18a5655`（Wenlei Miao）

通过 PR #7（from YQ）和 PR #6（from LF-c-patch-1）合并，main 分支现已成为项目最完整的集成分支。

| 类型 | 分支 | 旧 SHA | 新 SHA | 作者 | 最新提交 |
|---|---|---|---|---|---|
| updated | origin/main | 305e03b | 18a5655 | Wenlei Miao | Merge pull request #7 from dhebhxh/YQ |

**合并内容概要：**
- YQ 分支（Yanqing）：AGENTS.md、UI handoff 文档、LLM 模型评估报告（3轮）、STT 报告迁移、.gitignore 更新
- LF-c-patch-1（Jack8ot/Yanqing/Fan Lin）：完整 src/ 代码、脚本工具链、亮色模式、package.json、CI 工作流、Parakeet STT、IME 修复、回收站工作流

---

*本文件共保留 10 条更新记录（最近 20 条内）。*
