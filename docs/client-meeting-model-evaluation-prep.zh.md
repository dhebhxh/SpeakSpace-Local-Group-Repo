## 问题 1：我们将首先测试哪些用于 STT、LLM/SLM 和 TTS 的本地模型 / runtime 选项？

### 推荐回答

我们会先测试一个小而明确的排序清单，而不是浅层测试大量模型。选择依据包括：本地 runtime 成熟度、多语言能力预期、模型大小、电脑端集成难度，以及当前仓库里已有的实测证据。

### STT

首选 runtime：`whisper.cpp`。

原因：当前仓库已经有基于 `whisper.cpp` 的电脑端 STT benchmark，测试设备是 Apple M4 / 16GB RAM 的 Mac mini。

首轮 STT 测试顺序：

1. `whisper.cpp ggml-large-v3-turbo-q5_0`
   - 默认候选。
   - 现有报告中在速度、模型大小、准确率和桌面集成之间最平衡。
2. `whisper.cpp ggml-large-v3-q5_0`
   - 高质量对照。
   - 适合用于比较更高转录质量下的速度和内存代价。
3. `whisper.cpp ggml-small` / `whisper.cpp ggml-small-q5_1`
   - 低资源 fallback 候选。
   - 如果部分组员电脑无法流畅运行大模型，可以用作降级方案。

次要对照路线：

- `faster-whisper / CTranslate2`
  - 保留为可能的比较路线，尤其适合 Python、CUDA 或 Windows 方向实验。
  - 除非 `whisper.cpp` 明显不合适，否则不作为 V1 主集成路线。

### LLM / SLM

V1 首选 runtime：`Ollama`。

原因：Ollama 方便快速切换本地模型，有简单的本地 HTTP API，并支持 streaming 输出，适合早期 benchmark 和原型集成。

后续嵌入式 / 打包路线：

- `llama.cpp` / GGUF
  - 等我们确认值得保留的模型家族后，再考虑作为后续打包和嵌入式 runtime 方向。

首轮 LLM/SLM 测试顺序：

1. `qwen3:4b-instruct`
   - 主要多语言结构化输出候选。
   - 重点测试印地语、中文、摘要、关键点、行动项和翻译。
2. `llama3.2:3b`
   - 轻量 baseline。
   - 用于衡量速度、稳定性和最低可接受质量。
3. `gemma3:1b` 或 `gemma3:4b`
   - 资源对照模型。
   - 如果组员设备偏弱或 8GB RAM 设备较多，用 `gemma3:1b`。
   - 如果多数设备有 16GB RAM，可以用 `gemma3:4b`。

Stretch / 质量上限模型：

- `qwen3:8b`
  - 只有在组员设备能够流畅运行时才测试。
  - 不作为 V1 默认模型。

可选替换候选：

- `phi4-mini`
  - 如果 `llama3.2:3b` 在多语言结构化任务上表现较差，可以考虑用它替换 `llama3.2:3b`。

### TTS

TTS 是 V2，不是 V1 阻塞项。

TTS 初步 runtime 方向：

1. `sherpa-onnx`
   - V2 主要 TTS 候选。
   - 它有本地 TTS 路线，也更方便后续考虑更广泛的设备/runtime 方向。
2. Piper-style lightweight TTS
   - fallback 或 baseline。
   - 用于比较速度、包体大小和电脑端本地运行难度。

### 根据硬件情况做启动推荐

应用应该在首次启动或首次配置本地模型时，做一次轻量级硬件检测。目标不是让每个用户手动理解和选择模型，而是根据当前设备自动推荐一个合理的模型 / runtime 组合。

建议检测的信息：

- OS 和架构，例如 macOS Apple Silicon、Windows x64 或 Linux x64
- CPU 或芯片型号
- RAM 和当前可用内存
- GPU 或加速能力，例如 Apple Metal 或 NVIDIA CUDA
- 可用于下载模型的磁盘空间

建议行为：

- 如果设备是现代 16GB Apple Silicon 或同等级笔记本 / 台式机，推荐使用 `whisper.cpp ggml-large-v3-turbo-q5_0` 做 STT，使用 `Ollama qwen3:4b-instruct` 做 LLM/SLM。
- 如果设备只有约 8GB RAM，或 CPU/GPU 资源有限，推荐降级 profile，例如 `whisper.cpp ggml-small-q5_1` 加 `gemma3:1b` 或其他轻量 LLM/SLM。
- 如果设备资源更强，并且用户更重视质量，可以提供更高质量 profile，例如 `qwen3:8b`，但不作为默认选择。
- 如果某个首选 runtime 在当前设备上不可用，应 fallback 到最稳定的本地 runtime，而不是阻塞用户完成配置。
- 始终允许用户手动覆盖推荐结果，因为不同用户可能更重视速度、质量、更小下载体积或更低电量消耗。

这个功能应该表现为“推荐”，而不是永久锁定。首次配置页面可以说明系统选择了哪个 profile 以及原因，之后用户仍然可以在设置里修改。

## 问题 2：我们将如何测量延迟、质量和设备可行性？

### 延迟

我们会同时测用户感知的端到端延迟，以及各组件的分阶段延迟。

端到端延迟说明用户实际等待多久；分阶段延迟说明瓶颈出现在 STT、LLM、存储还是后续 TTS。

建议记录指标：

- `model_load_ms`
- `audio_preprocess_ms`
- `stt_first_token_ms`，如果 runtime 支持
- `stt_full_ms`
- `llm_ttft_ms`
- `llm_full_ms`
- `persist_ms`
- `end_to_end_ms`
- `peak_memory_mb`
- STT real-time factor，也就是 `RTF` 或 `RTFx`
- LLM tokens per second

V2 TTS 再额外记录：

- `tts_first_audio_ms`
- `tts_full_ms`
- TTS real-time factor


### 质量

STT 质量：

- 英文和印地语：WER
- 中文普通话：CER
- 先使用现有 STT benchmark 作为起点。
- 如果时间允许，再加入一小组更接近 SpeakSpace 使用场景的音频，例如会议记录、课堂内容或口头任务描述。

LLM/SLM 质量：

使用小规模人工评分 rubric，因为摘要、行动项和结构化输出不能只靠延迟判断。

建议 1-5 分评分维度：

- 忠实度：是否忠于原文，没有编造信息。
- 覆盖度：是否覆盖了重要内容。
- 结构稳定性：摘要、关键点和行动项是否符合预期格式。
- 可执行性：行动项是否具体、有用。
- 语言保持：输出是否保持输入语言。
- 翻译质量：只针对显式翻译任务，判断是否准确自然。

V2 TTS 质量：

- 可懂度
- 自然度
- 人名、数字、多语言文本的发音
- 首段音频延迟
- 音频时长与合成耗时的比例

### 设备可行性

电脑端设备可行性保持轻量检查，不做生产级认证。

对每台可用的组员电脑记录：

- OS
- CPU 或芯片型号
- RAM
- 模型是否能加载
- 流程是否能跑完
- 大致延迟
- 大致峰值内存
- UI 是否明显卡死
- 模型大小 / 安装负担

V1 不正式测试移动端。


## 需要向客户确认的问题

1. 最低目标电脑配置是什么？
   - 建议临时答案：以现代 16GB RAM 笔记本 / 台式机作为主要目标；8GB 设备只作为降级 / fallback 可行性观察。

2. 英文、中文普通话和印地语是否适合作为 V1 首轮重点语言？
   - 推荐答案：是。英文是通用 baseline，中文可以测试非空格语言和 CER，印地语符合客户背景。

3. 默认是否应该保持输入语言输出？
   - 推荐答案：是。转录、摘要、关键点和行动项都应保持输入语言。
