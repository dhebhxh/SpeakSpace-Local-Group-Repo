# SpeakSpace Local 项目实时进度

> 本分支只用于展示自动生成的项目进度 dashboard，不包含可运行源码。  
> 内容基于 Git/repo 静态分析生成；未运行测试、build 或 dev server。  
> This branch contains only an auto-generated project status dashboard. It is based on static Git/repo analysis and does not include runnable source code.

- 最后更新：2026-07-01 14:51
- 分析方式：静态分析（Git refs / commits / docs / package.json / src tree）

## 分支状态

| 分支 | HEAD | 最近提交 | 作者 | 日期 |
|---|---:|---|---|---|
| `origin/Jack` | `d9539bf` | [verified] fix: persist agent notes and reset sessions | Yanqing | 2026-06-22 |
| `origin/LF-c-patch-1` | `fb2389c` | feat: 新增亮色模式與切換按鈕 | Jack8ot | 2026-06-16 |
| `origin/W` | `305e03b` | Merge pull request #5 from dhebhxh/codex/add-client-meeting-eval-prep | Wenlei Miao | 2026-06-07 |
| `origin/feature/dod` | `6c82d18` | Update README.md | Jack8ot | 2026-06-19 |
| `origin/fix/note-qa-grounded-ai-jack` | `e2cd6a4` | fix: restore settings runtime status initialization | Yanqing | 2026-07-01 |
| `origin/main` | `18a5655` | Merge pull request #7 from dhebhxh/YQ | Wenlei Miao | 2026-06-17 |
| `origin/project-proposal` | `259ed1a` | proposal-draft | Greta | 2026-06-10 |

## 最近变化摘要

- 更新 `origin/fix/note-qa-grounded-ai-jack`：`3801e1b` → `e2cd6a4`（fast-forward）

### 最近提交
- `origin/fix/note-qa-grounded-ai-jack` `e2cd6a4`：fix: restore settings runtime status initialization（Yanqing，2026-07-01）

### 主要文件变化
- `origin/fix/note-qa-grounded-ai-jack`:
  - `M	src/main/main.js` — 修复设置运行时状态初始化
  - `M	src/renderer/renderer.js` — 修复渲染进程相应的状态恢复逻辑
  - `A	tests/main-ipc-handler-integrity.test.js` — 新增主进程 IPC handler 完整性测试
  - `A	tests/renderer-dom-integrity.test.js` — 新增渲染进程 DOM 完整性测试

## 更新记录

### 2026-07-01 14:51 — 自动更新

**分支变化**
- 更新 `origin/fix/note-qa-grounded-ai-jack`：`3801e1b` → `e2cd6a4`

**提交摘要**
- `origin/fix/note-qa-grounded-ai-jack` `e2cd6a4`：fix: restore settings runtime status initialization（Yanqing，2026-07-01）

**主要文件变化**
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/main/main.js` (设置运行时状态初始化修复)
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/renderer/renderer.js` (渲染进程恢复逻辑)
- `origin/fix/note-qa-grounded-ai-jack`: `A	tests/main-ipc-handler-integrity.test.js`
- `origin/fix/note-qa-grounded-ai-jack`: `A	tests/renderer-dom-integrity.test.js`

**事项状态变化**
- 新增待确认：`origin/fix/note-qa-grounded-ai-jack 合并/同步计划`（SPK-ORIGIN-FIX-NOTE-QA-GROUN）
- 当前共 6 项待确认、1 项已解决、0 项过期

---

### 2026-06-28 16:13 — 自动更新

**分支变化**
- 更新 `origin/fix/note-qa-grounded-ai-jack`：`2f4ea51` → `3801e1b`

**提交摘要**
- `origin/fix/note-qa-grounded-ai-jack` `3801e1b`：Front End Update（Jack8ot，2026-06-28）

**主要文件变化**
- `origin/fix/note-qa-grounded-ai-jack`: `D	src/SpeakSpace-Local-Group-Repo.lnk`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/main/db-service.js`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/main/main.js`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/main/structured-processor.js`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/preload/preload.js`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/renderer/index.html`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/renderer/renderer.js`
- `origin/fix/note-qa-grounded-ai-jack`: `M	src/renderer/styles.css`

### 2026-06-26 23:16 — 自动更新

**分支变化**
- 新增 `origin/fix/note-qa-grounded-ai-jack`：`2f4ea51`

**提交摘要**
- `origin/fix/note-qa-grounded-ai-jack` `2f4ea51`：fix: tune note ask ai grounding for testing（Yanqing，2026-06-26）
- `origin/fix/note-qa-grounded-ai-jack` `d9539bf`：[verified] fix: persist agent notes and reset sessions（Yanqing，2026-06-22）
- `origin/fix/note-qa-grounded-ai-jack` `13075df`：Add files via upload（Fan Lin，2026-06-21）
- `origin/fix/note-qa-grounded-ai-jack` `f06b9c6`：Update README.md info related to SQL（Jack8ot，2026-06-20）

**主要文件变化**
- 暂无可列出的文件 diff。

### 2026-06-22 12:56 — 自动更新

**分支变化**
- 删除 `origin/codex/remove-agent-handoff`：原 `dab0ebb`
- 删除 `origin/fix/agent-mode-session-notes`：原 `d9539bf`

**提交摘要**
- 本次没有可列出的新增提交。

**主要文件变化**
- 暂无可列出的文件 diff。

### 2026-06-22 12:50 — 自动更新

**分支变化**
- 新增 `origin/fix/agent-mode-session-notes`：`d9539bf`
- 更新 `origin/Jack`：`13075df` → `d9539bf`

**提交摘要**
- `origin/fix/agent-mode-session-notes` `d9539bf`：[verified] fix: persist agent notes and reset sessions（Yanqing，2026-06-22）
- `origin/fix/agent-mode-session-notes` `13075df`：Add files via upload（Fan Lin，2026-06-21）
- `origin/fix/agent-mode-session-notes` `f06b9c6`：Update README.md info related to SQL（Jack8ot，2026-06-20）
- `origin/fix/agent-mode-session-notes` `e7ac17c`：Fix Windows native rebuild invocation（Yanqing，2026-06-20）
- `origin/Jack` `d9539bf`：[verified] fix: persist agent notes and reset sessions（Yanqing，2026-06-22）

**主要文件变化**
- `origin/Jack`: `M	README.md`
- `origin/Jack`: `A	src/renderer/agent-conversation-state.js`
- `origin/Jack`: `M	src/renderer/index.html`
- `origin/Jack`: `M	src/renderer/renderer.js`
- `origin/Jack`: `A	tests/agent-conversation-state.test.js`

### 2026-06-21 04:03 — 自动更新

**分支变化**
- 更新 `origin/Jack`：`f06b9c6` → `13075df`

**提交摘要**
- `origin/Jack` `13075df`：Add files via upload（Fan Lin，2026-06-21）

**关键文件变化**（fast-forward，约60个文件变动）
- 新增：`docs/agent-design.md`、`src/main/agent-orchestrator.js`、`src/main/embedding-service.js`、`scripts/download-embedding-model.js`、对应测试文件
- 修改：大量 main/renderer/scripts/tests 文件

### 2026-06-20 15:07 — 自动更新

**分支变化**
- 更新 `origin/Jack`：`e23164a` → `f06b9c6`

**提交摘要**
- `origin/Jack` `f06b9c6`：Update README.md info related to SQL（Jack8ot，2026-06-20）

### 2026-06-20 00:54 — 自动更新

**分支变化**
- 删除 `origin/codex/meeting-note-templates`：`e7ac17c` → 已移除

**说明**：远端分支 `origin/codex/meeting-note-templates` 已被删除，此前已通过 PR #8 合入 `origin/Jack`。

**事项状态变化**
- 已解决：LLM 评估结果落地（SPK-LLM-评估结果落地）——脚本确认远端分支 `origin/YQ` 仍不存在

### 2026-06-20 00:49 — 自动更新

**分支变化**
- 新增 `origin/codex/remove-agent-handoff`：`dab0ebb`
- 更新 `origin/Jack`：`367fd0a` → `e23164a`

**提交摘要**
- `origin/codex/remove-agent-handoff` `dab0ebb`：Remove obsolete agent handoff（Yanqing，2026-06-20）
- `origin/Jack` `e7ac17c`：Fix Windows native rebuild invocation（Yanqing，2026-06-20）
- `origin/Jack` `77b9620`：Add resilient transcription and note workflows（Yanqing，2026-06-20）

**主要文件变化**
- `origin/codex/remove-agent-handoff`: `M	AGENTS.md`, `D	docs/agents/speakspace-ui-pr6-handoff-2026-06-15.md`
- `origin/Jack`: 大量新增/修改文件，包括 audio-duration.js、audio-retention.js、transcript-segments.js、transcription-job-manager.js、draft-conversation-context.js、drop-input.js、note-draft-source.js、note-library-state.js 等

### 2026-06-20 00:32 — 自动更新

**分支变化**
- 删除 `origin/YQ`：`1c7066b` → 已移除（已通过 PR #7 合入 main）

### 2026-06-20 00:30 — 自动更新

- 更新 `origin/codex/meeting-note-templates`：`77b9620` → `e7ac17c`（Yanqing：Fix Windows native rebuild invocation）

### 2026-06-20 00:27 — 自动更新

- 新增 `origin/codex/meeting-note-templates`：`77b9620`（Yanqing：Add resilient transcription and note workflows）

### 2026-06-19 18:12 — origin/Jack 合并冲突修复

- 更新 `origin/Jack`：`113b428` → `367fd0a`（Yanqing：fix: resolve db-service merge conflict markers）

### 2026-06-19 11:49 — origin/feature/dod README 更新

- 更新 `origin/feature/dod`：`a4fb32b` → `6c82d18`（Jack8ot：Update README.md）

## 当前待确认事项

> 以下事项来自脚本裁决，请勿自行修改、解决、归档或新增。

| 事项 | 状态 | 创建时间 | 说明 |
|---|---|---|---|
| SQLite vs JSON 存储方案 | ⏳ 待确认 | 2026-06-18 | `origin/Jack` 引入了 SQLite 数据层（notes + conversations 表），但 `origin/main` 当前使用的是 JSON 文件存储方案。两个数据层方案是否需要统一、何时合并，待团队确认。 |
| `origin/Jack` 合并计划 | ⏳ 待确认 | 2026-06-18 | 该分支独立维护了一批功能（SQLite、全栈代码），尚未合并入 main。是否需要合并、合并顺序和冲突处理方案待确认。 |
| 多语言支持范围 | ⏳ 待确认 | 2026-06-18 | 客户会议材料提到需关注英文、中文和印地语，但当前 i18n 仅覆盖中英文界面切换（从 README 描述推断），印地语支持待确认。 |
| Windows 兼容性验证 | ⏳ 待确认 | 2026-06-18 | GitHub Actions 工作流 `verify-local.yml` 的存在表明有 CI 关注，但当前项目启动方式有 Windows PowerShell 执行策略注意事项（npm.ps1 拦截），跨平台验证状态待确认。 |
| TTS V2 时间线 | ⏳ 待确认 | 2026-06-18 | README 和客户会议材料一致认为 TTS 为 V2 功能，具体时间表待确认。 |
| `origin/fix/note-qa-grounded-ai-jack` 合并/同步计划 | ⏳ 待确认 | 2026-07-01 | 该分支有新的远端变化（3801e1b → e2cd6a4），涉及 main.js、renderer.js 修复及 2 个新增测试文件，是否需要合并入主线或同步方案待确认。 |

## 已解决或已变化事项

| 事项 | 状态 | 解决时间 | 说明 |
|---|---|---|---|
| LLM 评估结果落地 | ✅ 已解决 | 2026-07-01 | 远端分支 `origin/YQ` 已删除，相关 LLM 评估报告已通过 PR #7 合入 `origin/main`。当前默认模型 `qwen3:4b-instruct` 是否直接基于评估结果确定，从静态分析无法确认。 |

## 过期或证据不足事项

_当前无过期或证据不足事项。_
