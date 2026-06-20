# SpeakSpace Local Desktop MVP

`SpeakSpace` 是一个基于 `Electron` 的本地离线桌面应用，目标是把“本地录音 / 文件导入 / 语音转写 / 本地大模型整理 / 本地语音播报 / 笔记沉淀”串成一条完整的桌面端工作流。

当前项目已经把三条本地 AI 能力统一接入到同一个应用中：

- `STT`：`whisper.cpp` + `ggml-large-v3-turbo-q5_0.bin`
- `LLM`：`Ollama` + 可切换本地模型，默认 `qwen3:4b-instruct`
- `TTS`：`sherpa-onnx-node` + `kokoro-multi-lang-v1_0`

同时，项目还补齐了：

- 运行时与模型的下载、删除、状态检测
- 项目内统一托管目录 `.speakspace-data/`
- `Clean All Local Assets` 一键清理
- 笔记保存、结构化整理、对笔记继续问答
- 本地硬件检测与推理能力提示
- 中英文界面切换与本地状态持久化

---

## 项目定位

这个项目不是一个纯聊天壳子，而是一个面向“本地会议记录 / 访谈整理 / 语音笔记 / 离线辅助问答”的桌面端原型。核心思路是：

1. 用户输入音频、视频、麦克风录音或普通文本
2. 本地 `STT` 把语音转成文本
3. 本地 `LLM` 对文本继续整理、总结、回答、抽取行动项
4. 本地 `TTS` 把回答播报出来
5. 内容可以保存为笔记，后续继续围绕笔记做问答

整个应用尽量不依赖云端 API，优先走本地运行时和本地模型。

---

## 核心功能

### 1. 本地聊天与多模型切换

- 支持本地 `LLM` 对话
- 支持在设置面板中切换已安装模型
- 支持下载候选模型、删除项目内模型
- 支持区分 `项目内 Ollama runtime` 和 `设备外部已安装 Ollama`

### 2. 文件转写

- 支持选择本地音频 / 视频文件
- 支持通过 `whisper.cpp` 进行本地离线转写
- 转写结果会落盘到 `.speakspace-data/stt/output`

### 3. 麦克风录音

- 支持应用内录音
- 支持将录音保存到本地托管目录
- 录音后可直接进入转写和后续整理流程

### 4. 结构化笔记生成

- 可将原始转写结果交给本地 `LLM`
- 自动生成：
  - 标题
  - 摘要
  - 关键要点
  - 行动项
  - 标签

### 5. 笔记存储与检索

- 基于 SQLite 进行本地结构化存储，支持保存笔记
- 支持按文件夹、标签、关键词过滤
- 支持在笔记详情页继续追加问答消息
- 支持完整的回收站机制（软删除、恢复、彻底删除）
- 支持对 LLM 提取的行动项（Action Items）进行“已完成/未完成”的状态管理
- 具备转写防呆机制，应用意外关闭时能自动标记并处理中断的转写任务

### 6. 针对笔记的继续提问

- 用户可以在单条笔记下继续追问
- 应用会把笔记摘要、要点、行动项、转写摘录和近期问答一起组装给本地 `LLM`
- 回答仍然走本地模型

### 7. 本地 TTS 播报

- 回答完成后可自动播放
- 也支持在回答卡片上通过悬浮操作按钮手动播放
- 支持停止播放
- 支持切换 `kokoro-multi-lang-v1_0` 内置音色
- 只允许通过本地 TTS 模型播报，不回退系统语音

### 8. 运行时管理

- 支持检测 `STT / LLM / TTS` 运行时状态
- 支持下载项目内运行时
- 支持下载 / 删除项目内模型
- 支持统一清理项目内托管资产

### 9. 硬件检测

- 支持读取 CPU、内存、GPU 信息
- 支持推断推荐后端，如 `CPU / CUDA / Metal / ROCm`
- 用于提示用户本机更适合怎样的本地推理配置

---

## 技术栈

### 桌面应用层

- `Electron`
- `BrowserWindow`
- `ipcMain / ipcRenderer`
- `contextBridge`

### 本地 AI 能力

- `whisper.cpp`
- `Ollama`
- `sherpa-onnx-node`
- `sherpa-onnx`

### Node / 运行时能力

- `child_process`
- `fs / fs/promises`
- `fetch`
- `stream/promises`

### 前端界面

- 原生 `HTML / CSS / JavaScript`
- 自定义下拉框
- 原生 Web Audio 播放控制

### 数据与存储

- SQLite 数据库型笔记存储 (基于 better-sqlite3)
- 项目内统一托管目录
- Electron `userData` 目录下的笔记数据库

---

## 应用启动方式

### 最常用启动流程

```bash
npm install
npm run download:runtime
npm run download:tts
npm run download:llm
npm start
```

在 Windows PowerShell 中，你实际更常见到的启动方式会是：

```bash
npm.cmd start
```

终端里通常会继续展开成：

```bash
> speakspace-local-desktop@1.0.0 start
> electron .
```

这表示：

- `npm start` 或 `npm.cmd start` 最终都会执行 `package.json` 里的 `start` 脚本
- 当前项目的 `start` 脚本实际内容是 `electron .`
- `electron .` 会读取当前目录下 `package.json` 的 `main` 字段，并从 `src/main/main.js` 启动整个桌面应用

如果你只想先检查本地是否准备好，可以运行：

```bash
npm run download:runtime:check
npm run download:tts:check
npm run download:llm:check
```

如果你在 Windows PowerShell 中遇到 `npm.ps1` 被执行策略拦截，可以改用：

```bash
npm.cmd run download:runtime
npm.cmd run download:tts
npm.cmd run download:llm
npm.cmd start
```

---

## 启动链路

应用启动时，代码层面的主链路大致如下：

1. 执行 `npm start` 或 `npm.cmd start`
2. npm 展开 `start` 脚本，实际执行 `electron .`
3. Electron 读取 `package.json` 中的 `main` 字段
4. 入口来到 `src/main/main.js`
5. 主进程加载 db-service.js，初始化本地 SQLite 数据库并完成表结构同步
6. 主进程初始化窗口、权限、IPC
7. 主窗口加载 `src/renderer/index.html`
8. `preload.js` 把受控 API 挂到 `window.desktopSTT`
9. 渲染层 `renderer.js` 开始刷新运行时状态、绑定交互、渲染 UI

其中：

- 主进程负责本地文件系统、运行时下载、子进程调用、硬件信息、模型调用以及 SQLite 本地数据库的读写与版本迁移
- 预加载层负责把 IPC 能力以白名单 API 暴露给前端
- 渲染层负责界面、交互、状态管理、播放控制、笔记视图和设置面板

---

## 分层架构

项目当前采用典型的 `Electron Main / Preload / Renderer` 分层。

### 1. Main Process

目录：`src/main/`

职责：

- 创建窗口
- 注册 IPC
- 管理本地 AI 服务
- 管理下载 / 删除 / 清理
- 管理笔记存储
- 读取本机硬件信息

主要文件：

- `main.js`
  - Electron 主进程入口
  - 窗口创建
  - IPC 注册中心
  - 下载、删除、转写、聊天、结构化、笔记、硬件检测都从这里串联
- `transcription-service.js`
  - STT 运行时检测
  - STT 模型检测与切换
  - 音频转写
  - 录音文件保存
- `llm-service.js`
  - Ollama runtime 检测
  - portable Ollama 安装
  - 本地模型拉取与删除
  - 本地聊天调用
- `tts-service.js`
  - TTS 运行时检测
  - TTS 模型下载与删除
  - 音色管理
  - 语音合成
- `tts-worker.js`
  - TTS 子进程工作逻辑
- `db-service.js`
  - 笔记增删改查
  - 文件夹 / 标签聚合
  - 问答消息追加
- `structured-processor.js`
  - 结构化笔记整理
  - 针对笔记问答
- `managed-paths.js`
  - 统一管理项目内托管目录

### 2. Preload Layer

目录：`src/preload/`

职责：

- 使用 `contextBridge` 暴露白名单 API
- 把渲染层和主进程隔离开
- 避免在前端直接开放 Node 全量能力

主要文件：

- `preload.js`

对前端暴露的能力包括：

- 运行时信息读取
- 运行时下载 / 删除
- 模型下载 / 删除
- 本地聊天
- 音频转写
- 录音保存
- TTS 合成
- 笔记 CRUD
- 结构化整理
- 硬件信息读取

### 3. Renderer Layer

目录：`src/renderer/`

职责：

- 主界面展示
- 聊天消息展示
- 自定义下拉交互
- 运行时状态面板
- 笔记页与详情页
- 音频播放控制
- i18n 文案切换

主要文件：

- `index.html`
  - 页面结构
  - 聊天区、设置区、笔记区、硬件信息区
- `renderer.js`
  - 全局状态
  - 用户交互
  - IPC 调用
  - TTS 播放控制
  - 模型下拉逻辑
  - 运行时状态刷新
  - 笔记视图渲染
- `styles.css`
  - 全局样式
  - 设置面板
  - 按钮
  - 自定义下拉框
  - 响应式布局

---

## 运行时与模型架构

### STT

- runtime：`whisper.cpp`
- 默认模型：`ggml-large-v3-turbo-q5_0.bin`
- 支持来源：
  - 项目内 runtime
  - 系统已有 runtime
- 当前策略：
  - Windows 下可下载项目内 runtime
  - macOS / Linux 下也会检查系统已有 `whisper-cli`

### LLM

- runtime：`Ollama`
- 默认模型：`qwen3:4b-instruct`
- 支持来源：
  - 项目内 `portable Ollama`
  - 设备外部已有 Ollama
- 当前策略：
  - 应用主动下载时优先安装到项目目录
  - 外部 Ollama 可以读取，但不会再被应用内强制删除

### TTS

- runtime backend：`sherpa-onnx-node`，兼容备选 `sherpa-onnx`
- 模型：`kokoro-multi-lang-v1_0`
- 当前策略：
  - 只走本地模型
  - 不回退系统 TTS
  - 缺失时必须明确报错

---

## 统一托管目录

应用主动下载的本地资源统一收口到项目根目录下：

```text
.speakspace-data/
  stt/
    whisper/
    models/
    output/
  llm/
    ollama/
      bin/
      models/
      .cache/
  tts/
    models/
    .cache/
    runtime-manifest.json
```

用途：

- 避免模型和缓存散落在仓库或系统各处
- 便于应用内统一清理
- 便于项目目录整体迁移
- 便于上传 GitHub 前清理不应提交的本地资产

---

## 笔记数据存储

与 `.speakspace-data/` 不同，笔记本身不保存在项目目录里，而是保存在 Electron `userData` 目录下。

当前存储实现：

- 笔记目录：`app.getPath("userData")/speakspace-notes`
- 数据文件：`notes.db`

每条笔记包含：

- `id`
- `title`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `audioPath`
- `transcript`
- `summary`
- `keyPoints`
- `actionItems`
- `tags`
- `folder`
- `performance`
- `conversations`
- `templateId`
- `sourceNoteId`
- `structuredData`
- `status`
- `statusMessage`
- `transcriptSegments`

这使得应用本体和模型目录可以清理，而笔记数据仍可独立管理。

---

## 代码层面的主要数据流

### 1. 文件转写流

1. 前端选择音频 / 视频文件
2. 渲染层调用 `window.desktopSTT.transcribeAudio(filePath)`
3. 主进程把请求转给 `transcription-service.js`
4. `whisper.cpp` 子进程执行转写
5. 输出文本保存到 `.speakspace-data/stt/output`
6. 转写文本返回前端展示

### 2. 麦克风录音流

1. 前端开始录音
2. 二进制音频传给 `recording:save`
3. 主进程保存录音文件
4. 再走转写链路
5. 转写结果可直接进入聊天或结构化整理

### 3. 本地聊天流

1. 前端组装 `messages`
2. 调用 `window.desktopSTT.chatWithLocalLLM(messages)`
3. 主进程转发到 `llm-service.js`
4. Ollama 返回本地回答
5. 回答渲染到消息区
6. 如果开启自动播报，则继续触发 TTS

### 4. 结构化笔记流

1. 用户将转写结果发起“结构化”
2. 主进程调用 `structured-processor.js`
3. 构造结构化 Prompt
4. 通过本地 `LLM` 生成 JSON
5. 结果写入笔记存储

### 5. 笔记问答流

1. 用户在某条笔记详情页发问
2. 系统把笔记标题、摘要、要点、行动项、转写摘录和近期对话组装成上下文
3. 调用本地 LLM 生成回答并返回给前端
4. 前端收到回答后，调用 db-service.js 的追加方法，将“用户的提问”与“LLM 的回答”一并存入 SQLite 数据库中该条笔记的 conversations 字段，完成持久化

### 6. TTS 播报流

1. 前端发起 `tts:synthesize`
2. 主进程调用 `tts-service.js`
3. TTS worker / Node backend 完成本地合成
4. 渲染层通过 Web Audio 播放
5. 前端负责播放状态、停止、切段与按钮联动

---

## 启动时会做什么

应用启动后，前端会主动做一轮状态刷新，主要包括：

- 检查 `STT` runtime / model
- 检查 `LLM` runtime / installed models
- 检查 `TTS` runtime / model / backend / voice
- 检查当前托管目录
- 加载笔记列表
- 加载硬件信息
- 根据硬件能力给出推荐推理提示

设置面板上的状态不是死文案，而是运行时动态计算的结果。

---

## 功能分区说明

### 助手主视图

- 文本输入
- 文件选择
- 麦克风录音
- 转写结果与 LLM 回答混合展示
- 消息级复制 / 播放 / 引用操作

### 笔记列表页

- 展示历史笔记
- 支持搜索
- 支持按文件夹 / 标签过滤

### 笔记详情页

- 查看结构化结果
- 查看原始转写
- 查看行动项
- 继续围绕笔记问答
- 输入框交互与主聊天页保持一致

### 设置面板

- `STT / LLM / TTS` 状态查看
- runtime 下载 / 删除
- 模型下载 / 删除
- TTS 模型和音色切换
- 自动播报开关
- 界面语言切换
- 硬件信息展示
- `Clean All Local Assets`

---

## 目录结构

```text
src/
  main/
    main.js
    managed-paths.js
    transcription-service.js
    llm-service.js
    tts-service.js
    tts-worker.js
    db-service.js
    structured-processor.js
  preload/
    preload.js
  renderer/
    index.html
    renderer.js
    styles.css

scripts/
  download-runtime.js
  download-tts-runtime.js
  download-llm-runtime.js
  cleanup-local-assets.js
  cleanup-local-assets.ps1
  cleanup-local-assets.sh
  ollama-model-catalog.json

.speakspace-data/
  stt/
  llm/
  tts/
```

---

## 常用命令

安装依赖：

```bash
npm install
```

启动应用：

```bash
npm start
```

Windows PowerShell 下推荐同时记住这个等价写法：

```bash
npm.cmd start
```

下载默认 STT 运行时与模型：

```bash
npm run download:runtime
```

下载默认 TTS 运行时：

```bash
npm run download:tts
```

下载默认 LLM 运行时与模型：

```bash
npm run download:llm
```

下载一组候选 LLM：

```bash
npm run download:llm:candidates
```

检查本地环境：

```bash
npm run download:runtime:check
npm run download:tts:check
npm run download:llm:check
```

清理项目托管资产：

```bash
npm run cleanup:assets
```

只拉某个 LLM 模型：

```bash
node ./scripts/download-llm-runtime.js --models qwen2.5:3b-instruct
```

指定候选集合默认模型：

```bash
node ./scripts/download-llm-runtime.js --preset candidates --default-model phi4-mini
```

### npm 脚本实际映射

当前 `package.json` 中几个最常用脚本的实际展开如下：

- `npm start` -> `electron .`
- `npm run download:runtime` -> `node ./scripts/download-runtime.js`
- `npm run download:tts` -> `node ./scripts/download-tts-runtime.js`
- `npm run download:llm` -> `node ./scripts/download-llm-runtime.js`
- `npm run download:llm:candidates` -> `node ./scripts/download-llm-runtime.js --preset candidates`
- `npm run download:runtime:check` -> `node ./scripts/download-runtime.js --check`
- `npm run download:tts:check` -> `node ./scripts/download-tts-runtime.js --check`
- `npm run download:llm:check` -> `node ./scripts/download-llm-runtime.js --check`
- `npm run cleanup:assets` -> `node ./scripts/cleanup-local-assets.js`

---

## LLM 候选模型

当前项目内置候选模型：

- `qwen3:4b-instruct`
- `qwen2.5:3b-instruct`
- `ministral-3:3b`
- `ibm/granite4:micro-h`
- `phi4-mini`
- `qwen2.5:1.5b-instruct`

安装完成后，应用会从本地已安装模型中读取列表，并展示到设置面板下拉框中。

---

## 跨平台说明

### Windows

- `STT` 支持下载项目内 `whisper.cpp` runtime
- `LLM` 支持下载项目内 `portable Ollama`
- `TTS` 直接下载到项目目录
- PowerShell 遇到执行策略问题时建议使用 `npm.cmd`

### macOS

- `STT` 会优先检查系统里的 `whisper-cli`
- 如未安装，可考虑：

```bash
brew install whisper-cpp
```

- `LLM` 支持项目内 runtime，也支持读取系统已有 Ollama

### Linux

- `STT` 会检查系统中的 `whisper-cli`
- `LLM` 会检查 `ollama`
- 不同发行版差异较大，建议手动安装系统依赖后再接入

---

## 清理与卸载

- 应用设置页提供 `Clean All Local Assets`
- 会清理项目托管的 `STT / LLM / TTS` runtime、模型、缓存、转写输出以及旧版遗留目录
- 不会主动删除设备上原本已安装的外部 Ollama

命令行清理：

```bash
npm run cleanup:assets
```

Windows：

```powershell
./scripts/cleanup-local-assets.ps1
```

macOS / Linux：

```bash
./scripts/cleanup-local-assets.sh
```

推荐卸载顺序：

1. 在应用里点击 `Clean All Local Assets`，或运行 `npm run cleanup:assets`
2. 如有外部 Ollama，按系统方式单独卸载
3. 删除项目目录或应用本体

---

## 当前实现状态

当前这个仓库更接近一个“可运行、可演示、可继续产品化”的桌面 MVP，而不是一个已经工程化封装完毕的发行版。

已具备：

- 本地离线 STT / LLM / TTS 三链路
- 运行时下载、删除、状态检测
- 笔记沉淀与结构化整理
- 笔记问答
- 多模型与音色切换
- 统一托管目录与一键清理

当前仍可继续增强的方向：

- 更完整的自动化测试
- 安装包与分发流程
- 更强的错误恢复与下载重试
- 更细的模型与引擎配置面板
- 更完善的跨平台打包说明
