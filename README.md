# SpeakSpace Local 项目实时进度

> 本分支只用于展示自动生成的项目进度 dashboard，不包含可运行源码。  
> 内容基于 Git/repo 静态分析生成；未运行测试、build 或 dev server。  
> This branch contains only an auto-generated project status dashboard. It is based on static Git/repo analysis and does not include runnable source code.

- 最后更新：2026-07-29 18:54
- 分析方式：静态分析（Git refs / commits / docs / package.json / src tree）

## 分支状态

### 本次变化分支

| 类型 | 分支 | old_sha → new_sha | 最近提交 |
|---|---|---|---|
| 新增 | `origin/integration/jack-to-main` | 不存在 → `2055ab3dcaa03de80fa8b9152e2d4bca289ae3cd` | `chore: integrate Jack app state for main` |
| 删除 | 无 | 无 | 无 |
| 更新 | 无 | 无 | 无 |

### 当前远端分支

| 分支 | HEAD | 最近提交 | 作者 | 日期 |
|---|---:|---|---|---|
| `origin/Jack` | `e2cd6a4` | fix: restore settings runtime status initialization | Yanqing | 2026-07-01 14:49:56 +0100 |
| `origin/LF-c-patch-1` | `fb2389c` | feat: 新增亮色模式與切換按鈕 | Jack8ot | 2026-06-16 13:06:01 +0100 |
| `origin/W` | `305e03b` | Merge pull request #5 from dhebhxh/codex/add-client-meeting-eval-prep | Wenlei Miao | 2026-06-07 21:58:30 +0100 |
| `origin/feature/dod` | `6c82d18` | Update README.md | Jack8ot | 2026-06-19 11:48:15 +0100 |
| `origin/fix/note-qa-grounded-ai-jack` | `e2cd6a4` | fix: restore settings runtime status initialization | Yanqing | 2026-07-01 14:49:56 +0100 |
| `origin/integration/jack-to-main` | `2055ab3` | chore: integrate Jack app state for main | Yanqing | 2026-07-01 15:38:27 +0100 |
| `origin/main` | `18a5655` | Merge pull request #7 from dhebhxh/YQ | Wenlei Miao | 2026-06-17 10:49:21 +0100 |
| `origin/project-proposal` | `259ed1a` | proposal-draft | Greta | 2026-06-10 13:06:35 +0100 |

静态 refs 显示，`origin/Jack` 与 `origin/fix/note-qa-grounded-ai-jack` 当前共同指向 `e2cd6a4fa7cdc20d9d8cbe2b887fcd7b00eadac6`。`origin/integration/jack-to-main` 指向单独的整合提交 `2055ab3dcaa03de80fa8b9152e2d4bca289ae3cd`，尚未与 `origin/main` 的 HEAD `18a56553ff4e71e5afa83ebfdc4b793b188f0caf` 对齐。

## 最近变化摘要

- 新增远端分支 `origin/integration/jack-to-main`：不存在 → `2055ab3dcaa03de80fa8b9152e2d4bca289ae3cd`；本次未记录远端分支删除或 HEAD 更新。
- 新分支当前包含提交 `2055ab3`：`chore: integrate Jack app state for main`（Yanqing，2026-07-01）。从分支名称和提交说明静态判断，该分支用于承载 Jack 应用状态向主线整合的代码与文档准备。
- 新增文件包括桌面 STT 模型总结、Agent 设计、Note Q&A grounding 测试说明和 embedding 模型下载脚本。
- 修改范围包括 GitHub Actions 验证工作流、README、项目提案、客户端会议材料、依赖清单及多平台本地资产清理脚本。
- Dashboard 当前裁决结果为 6 项待确认、1 项已解决、0 项过期；本次 `events` 为空。

### 本次记录的文件变化

**新增**

- `desktop-stt-model-summary-report.md`
- `docs/agent-design.md`
- `docs/note-qa-grounding-test-brief.md`
- `scripts/download-embedding-model.js`

**修改**

- `.github/workflows/verify-local.yml`
- `.gitignore`
- `README.md`
- `docs/client-meeting-model-evaluation-prep.md`
- `docs/client-meeting-model-evaluation-prep.zh.md`
- `package-lock.json`
- `package.json`
- `project-proposal.md`
- `scripts/cleanup-local-assets.js`
- `scripts/cleanup-local-assets.ps1`
- `scripts/cleanup-local-assets.sh`

## 更新记录

### 2026-07-29 18:54 — 自动更新

**分支变化**

- 新增 `origin/integration/jack-to-main`：不存在 → `2055ab3dcaa03de80fa8b9152e2d4bca289ae3cd`
- 删除分支：无
- 更新分支：无

**提交摘要**

- `origin/integration/jack-to-main` `2055ab3`：chore: integrate Jack app state for main（Yanqing，2026-07-01）

**主要文件变化**

- 新增模型总结、Agent 设计、Note Q&A grounding 测试说明和 embedding 模型下载脚本。
- 修改 CI 工作流、README、项目提案、模型评估材料、依赖清单和本地资产清理脚本。

**事项状态**

- `dashboard_items.events` 为空。
- 当前共 6 项待确认、1 项已解决、0 项过期。

---

### 2026-07-01 15:38 — 自动更新

**分支变化**

- 更新 `origin/Jack`：`d9539bf` → `e2cd6a4`（fast-forward）
- `origin/Jack` 与 `origin/fix/note-qa-grounded-ai-jack` 指向同一提交 `e2cd6a4`

**新增提交**

- `e2cd6a4`：fix: restore settings runtime status initialization（Yanqing，2026-07-01）
- `3801e1b`：Front End Update（Jack8ot，2026-06-28）
- `2f4ea51`：fix: tune note ask ai grounding for testing（Yanqing，2026-06-26）

**主要文件变化**

- 新增 `docs/note-qa-grounding-test-brief.md`、`tests/main-ipc-handler-integrity.test.js` 和 `tests/renderer-dom-integrity.test.js`。
- 删除 `src/SpeakSpace-Local-Group-Repo.lnk`。
- 修改 README、主进程、数据层、结构化处理、preload、renderer 和相关测试文件。

**事项状态**

- 当时记录为 6 项待确认、1 项已解决、0 项过期。

---

### 2026-07-01 14:51 — 自动更新

**分支变化**

- 更新 `origin/fix/note-qa-grounded-ai-jack`：`3801e1b` → `e2cd6a4`

**提交摘要**

- `origin/fix/note-qa-grounded-ai-jack` `e2cd6a4`：fix: restore settings runtime status initialization（Yanqing，2026-07-01）

**主要文件变化**

- 修改 `src/main/main.js` 和 `src/renderer/renderer.js`。
- 新增 `tests/main-ipc-handler-integrity.test.js` 和 `tests/renderer-dom-integrity.test.js`。

**事项状态**

- 新增待确认事项 `origin/fix/note-qa-grounded-ai-jack 合并/同步计划`（`SPK-ORIGIN-FIX-NOTE-QA-GROUN`）。
- 当时记录为 6 项待确认、1 项已解决、0 项过期。

## 当前待确认事项

> 以下事项严格按 `dashboard_items.current_pending` 渲染；状态由确定性脚本裁决。

### `SPK-SQLITE-VS-JSON-存储方案` — SQLite vs JSON 存储方案

- 状态：`pending`
- 详情：`origin/Jack` 引入了 SQLite 数据层（notes + conversations 表），但 `origin/main` 当前使用的是 JSON 文件存储方案。两个数据层方案是否需要统一、何时合并，待团队确认。
- 证据：当前静态上下文仍出现相关证据：json, notes, origin/jack, origin/main, sqlite
- 首次记录：2026-06-18 15:38
- 最近确认：2026-07-29 18:56

### `SPK-ORIGIN-JACK-合并计划` — `origin/Jack` 合并计划

- 状态：`pending`
- 详情：该分支独立维护了一批功能（SQLite、全栈代码），尚未合并入 main。是否需要合并、合并顺序和冲突处理方案待确认。
- 证据：当前静态上下文仍出现相关证据：main, origin/jack, sqlite
- 首次记录：2026-06-18 15:38
- 最近确认：2026-07-29 18:56

### `SPK-多语言支持范围` — 多语言支持范围

- 状态：`pending`
- 详情：客户会议材料提到需关注英文、中文和印地语，但当前 i18n 仅覆盖中英文界面切换（从 README 描述推断），印地语支持待确认。
- 证据：当前静态上下文仍出现相关证据：readme, 切换
- 首次记录：2026-06-18 15:38
- 最近确认：2026-07-29 18:56

### `SPK-WINDOWS-兼容性验证` — Windows 兼容性验证

- 状态：`pending`
- 详情：GitHub Actions 工作流 `verify-local.yml` 的存在表明有 CI 关注，但当前项目启动方式有 Windows PowerShell 执行策略注意事项（npm.ps1 拦截），跨平台验证状态待确认。
- 证据：当前静态上下文仍出现相关证据：github, verify-local.yml, windows, 工作流, 确认
- 首次记录：2026-06-18 15:38
- 最近确认：2026-07-29 18:56

### `SPK-TTS-V2-时间线` — TTS V2 时间线

- 状态：`pending`
- 详情：README 和客户会议材料一致认为 TTS 为 V2 功能，具体时间表待确认。
- 证据：当前静态上下文仍出现相关证据：readme, tts, 功能
- 首次记录：2026-06-18 15:38
- 最近确认：2026-07-29 18:56

### `SPK-ORIGIN-FIX-NOTE-QA-GROUN` — origin/fix/note-qa-grounded-ai-jack 合并/同步计划

- 状态：`pending`
- 来源：`branch_change`
- 来源分支：`origin/fix/note-qa-grounded-ai-jack`
- 详情：origin/fix/note-qa-grounded-ai-jack 有新的远端变化，是否需要合并入主线或同步方案待确认。
- 证据：当前静态上下文仍出现相关证据：origin/fix/note-qa-grounded-ai-jack, 合并
- 首次记录：2026-07-01 14:51
- 最近确认：2026-07-29 18:56

## 已解决或已变化事项

> 以下事项严格按 `dashboard_items.resolved_items` 渲染；不根据文档内容重新打开或改变状态。

### `SPK-LLM-评估结果落地` — LLM 评估结果落地

- 状态：`resolved`
- 详情：`origin/YQ` 包含多轮 LLM 评估报告（已合入 main），但当前默认模型 `qwen3:4b-instruct` 是否基于评估结果确定，从静态分析无法确认。
- 证据：当前静态上下文仍出现相关证据：llm, main, qwen3:4b-instruct
- 首次记录：2026-06-18 15:38
- 最近发现支持证据：2026-06-20 00:51
- 脚本解决时间：2026-07-29 18:56

## 过期或证据不足事项

无。`dashboard_items.stale_items` 当前为空。
