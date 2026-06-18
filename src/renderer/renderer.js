const APP_LANGUAGE_STORAGE_KEY = "speakspace.uiLanguage";
const DEFAULT_APP_LANGUAGE = "en";
const LANGUAGE_OPTIONS = ["en", "zh-CN"];
const SETTINGS_CATEGORY_STORAGE_KEY = "speakspace.settingsCategory";
const SETTINGS_CATEGORIES = ["general", "stt", "llm", "tts", "hardware", "storage"];
const STT_ENGINE_OPTIONS = ["whisper", "parakeet"];
const textInputEvents = window.SpeakSpaceIme;
const THEME_STORAGE_KEY = "speakspace.theme";
const THEME_ICON_SVG = {
  dark: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  light:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
};
const I18N = {
  en: {
    systemPrompt:
      "You are SpeakSpace's local desktop assistant. The user may type plain text or raw voice transcription. Infer the real intent first, then answer, organize, summarize, polish, or extract action items directly. Unless the user explicitly asks for transcription cleanup, do not mechanically repeat their original words. By default, keep the user's language and respond clearly and concisely.",
    transcribedUserPrefix:
      "The following is my voice transcription. It may contain repetition, pauses, or spoken-language mistakes. Please infer the real intent first, then answer or organize it directly instead of mechanically repeating the original text.\n\n",
    statusPending: "Checking...",
    statusReady: "Ready",
    statusError: "Not Ready",
    on: "On",
    off: "Off",
    localModelNotReady: "Local model not ready",
    ttsRuntimeMissing:
      "No local TTS runtime detected. Download it using the button below.",
    currentEngine: "Engine",
    model: "Model",
    voice: "Voice",
    copied: "Copied",
    operationFailed: "Action failed: {message}",
    copy: "Copy",
    play: "Play",
    stop: "Stop",
    quote: "Quote",
    quotePrefix: "Quoted content:\n{content}\n",
    chatEmptyTitle: "SpeakSpace",
    chatEmptyDesc: "Type a message, import audio, or start recording.\nSave the result as a structured note when you're done.",
    loadingVoice: "Checking local TTS runtime...",
    webAudioUnsupported: "Web Audio playback is not supported in the current environment.",
    localTtsRequired: "Local TTS is not ready. The app will not fall back to system speech.",
    localTtsSynthesisFailed: "Local TTS synthesis failed.",
    localTtsPlaybackFailed: "Local TTS playback failed.",
    autoplayFailed: "Autoplay failed: {message}",
    playFailed: "Playback failed: {message}",
    dropdownEmptyModel: "No available models",
    dropdownEmptyVoice: "No available voices",
    recommended: "Recommended",
    speed: "Speed",
    quality: "Quality",
    localEngineLabel: "Local Engine",
    settingsTitle: "Runtime & Models",
    settingsGeneral: "General",
    settingsStorage: "Storage",
    languageHelp: "Choose the display language for the app.",
    ttsModelHelp: "Local TTS model used for reply playback.",
    managedDataDirectory: "Managed Data Directory",
    managedDataChecking: "Checking managed data directory...",
    cleanAssetsTitle: "Clean Local Assets",
    cleanAssetsHelp: "Removes project-managed runtimes, models, and caches. Notes are kept.",
    newSession: "New Session",
    notesLibrary: "Notes Library",
    trash: "Trash",
    trashKicker: "Notes",
    deletedNotes: "Deleted Notes",
    searchNotes: "Search notes...",
    copyReply: "Copy Reply",
    saveAsNote: "Save as Note",
    importAudio: "Import audio file",
    record: "Record",
    sttModelMissingTooltip:
      "Speech-to-text model is not downloaded. Open Settings to download a model.",
    promptPlaceholder: "Type a question, or import audio / record...",
    send: "Send",
    backToAssistant: "← Back to Assistant",
    delete: "Delete",
    moveToTrash: "Move to Trash",
    noteMovedToTrash: "Note moved to Trash",
    restoreNote: "Restore",
    deleteForever: "Delete Forever",
    noteRestored: "Note restored",
    noteDeletedForever: "Note permanently deleted",
    deleteForeverConfirm:
      "Permanently delete this note? This cannot be undone.",
    trashLoadFailed: "Failed to load Trash: {message}",
    trashEmpty: "Trash is empty",
    trashEmptyDesc: "Deleted notes will appear here.",
    trashPreviewEmpty: "Select a deleted note to preview it.",
    deletedAt: "Deleted",
    createdAt: "Created",
    askAboutNote: "Ask About This Note",
    noteQaPlaceholder: "For example: What should I do after this meeting?",
    ask: "Ask",
    deleteQaMessage: "Delete this message",
    close: "Close",
    language: "Language",
    interfaceLanguage: "Interface Language",
    sttTitle: "Speech-to-Text",
    sttEngineListTitle: "Local Engines",
    sttEngineActive: "Active",
    sttEngineAvailable: "Available",
    sttEngineNotInstalled: "Not installed",
    sttEngineWhisperDesc: "Cross-platform default engine.",
    sttEngineParakeetDesc: "Local ONNX engine candidate.",
    sttWhisperDetailDesc:
      "Whisper is the current connected STT engine. It keeps the app usable on macOS and Windows while covering the project language set.",
    sttParakeetDetailDesc:
      "Parakeet runs through sherpa-onnx as a local ONNX STT engine. Select it here to use it for transcription.",
    sttCapabilityCoverage: "Language coverage",
    sttCapabilityRuntime: "Runtime path",
    sttWhisperCoverage:
      "Broad multilingual coverage including English, Mandarin, Hindi, Japanese, Korean, Spanish, French, and Arabic in the existing benchmark set.",
    sttWhisperRuntime:
      "Runs through whisper.cpp and the existing model download flow. This remains the default fallback across macOS and Windows.",
    sttParakeetNotice:
      "Parakeet uses sherpa-onnx-node locally. WAV files work directly; other audio formats require ffmpeg for conversion before decoding.",
    sttParakeetCoverage:
      "Public Parakeet options are strong for English and selected multilingual sets. No current candidate covers English, Mandarin, and Hindi together as cleanly as Whisper.",
    sttParakeetRuntime:
      "Runs through sherpa-onnx-node on CPU in this desktop app. The model packages are stored under the project-managed STT data directory.",
    sttWhisperModelsTitle: "Whisper models",
    sttParakeetModelsTitle: "Parakeet models",
    currentModel: "Current",
    sttParakeetV2Desc:
      "English-focused TDT model with strong speed and punctuation support.",
    sttParakeetV3Desc:
      "Multilingual TDT model for 25 European languages; does not cover Mandarin or Hindi.",
    switchSttEngineFailed: "Failed to switch STT engine: {message}",
    llmTitle: "Local LLM",
    llmEngineOllamaDesc: "Local model runtime.",
    llmEngineDetailDesc:
      "Ollama runs local language models for chat, structuring, and note Q&A. Model cards below use the same download, delete, and select pattern as STT.",
    llmRuntimeSourceTitle: "Runtime source",
    llmModelStorageTitle: "Model storage",
    llmModelsTitle: "LLM models",
    llmRuntimeProject: "Project-managed Ollama",
    llmRuntimeExternal: "External Ollama",
    llmRuntimeMissing: "Ollama runtime is not installed.",
    llmModelStorageReady: "Current model: {model}. Storage: {path}",
    llmModelStorageMissing: "Choose a model card below and download it to enable local LLM inference.",
    ttsTitle: "Text-to-Speech",
    ttsEngineKokoroDesc: "Local sherpa-onnx voices.",
    ttsEngineDetailDesc:
      "Kokoro runs through the local sherpa-onnx stack for reply playback. The model card manages the local model bundle; voice selection stays in the dropdown below.",
    ttsRuntimeBackendTitle: "Runtime backend",
    ttsVoiceSetTitle: "Voice set",
    ttsModelsTitle: "TTS model",
    ttsRuntimeBackendReady: "{backend} · {sampleRate}Hz",
    ttsRuntimeBackendMissing: "Local TTS runtime is not installed.",
    ttsVoiceSetReady: "{count} voices · Current: {voice}",
    ttsVoiceSetMissing: "Download the TTS model bundle to enable voices.",
    ttsAutoplayTitle: "Autoplay Replies",
    ttsAutoplayHelp:
      "If disabled, you can still hover over assistant replies and use the action buttons to play them manually. Playback uses local TTS only.",
    ttsModelLabel: "Model",
    ttsVoiceLabel: "Voice",
    hardwareTitle: "Device Hardware",
    cpu: "Processor",
    memory: "System Memory",
    gpu: "Graphics (GPU)",
    inferenceAccel: "Inference Acceleration",
    refreshStatus: "Refresh Status",
    cleanAllAssets: "Clean All Local Assets",
    cleaningAssets: "Cleaning assets...",
    cleaningAssetsTarget: "Cleaning all local assets...",
    cleanAllAssetsSuccess: "All project-managed local assets were removed.",
    cleanAllAssetsFailed: "Failed to clean local assets: {message}",
    cleanAllAssetsConfirm:
      "Remove all project-managed STT, LLM, and TTS assets under {path}? This does not delete external Ollama already installed on the device.",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    toggleSidebar: "Toggle sidebar",
    localEngineSettings: "Local Engine Settings",
    cpuCoresThreads: "{cores} cores / {threads} threads",
    detectedGpuCount: "{count} GPUs detected",
    noGpuInfo: "No GPU information detected",
    detectFailed: "Detection failed",
    cudaAccel: "CUDA Acceleration",
    metalAccel: "Metal Acceleration",
    rocmAccel: "ROCm Acceleration",
    available: "Available",
    unavailable: "Unavailable",
    gpuLimited: "{backend} (Limited)",
    needCuda: "Need CUDA",
    needRocm: "Need ROCm",
    cpuBadge: "CPU",
    recGpu: "GPU acceleration is recommended for the best balance of speed and quality.",
    recGpuLimited: "GPU acceleration is available, but available memory may limit the larger models.",
    recGpuNoCuda: "A discrete GPU was detected, but CUDA acceleration is not available in the current runtime.",
    recGpuNoRocm: "A discrete GPU was detected, but ROCm acceleration is not available in the current runtime.",
    recCpu: "CPU execution is recommended on the current device. Prefer lighter local models.",
    checkFailed: "Runtime check failed: {message}",
    switchSttFailed: "Failed to switch STT model: {message}",
    switchLlmFailed: "Failed to switch LLM model: {message}",
    switchedVoice: "Voice switched: {voice}",
    llmNotReady: "LLM not ready",
    thinking: "Thinking...",
    failed: "Failed: {message}",
    sttNotReady: "Local transcription runtime is not ready.",
    transcribing: "Transcribing...",
    transcriptionEmpty: "Transcription result is empty.",
    transcribeTag: "Transcription",
    importedFile: "Imported File",
    typedInput: "Typed Input",
    generatingNote: "Generating structured note...",
    saved: "Saved: {title}",
    saveFailed: "Save failed: {message}",
    recording: "Recording...",
    recordingStartFailed: "Unable to start recording: {message}",
    processingRecording: "Processing recording...",
    recordingEmpty: "The recording is empty. Please try again.",
    microphoneRecording: "Microphone Recording",
    recordingFailed: "Recording failed",
    recordingFailedDetail: "Recording failed: {message}",
    notesLoadFailed: "Failed to load notes: {message}",
    noNotes: "No Notes Yet",
    noNotesDesc: 'Process audio or text, then click "Save as Note" to keep it here.',
    openNoteFailed: "Failed to open note: {message}",
    structuring: "Structuring",
    hasAudio: "Audio Attached",
    summary: "Summary",
    keyPoints: "Key Points",
    actionItems: "Action Items",
    originalTranscript: "Original Transcript",
    errorPrefix: "Error: {message}",
    deleteFailed: "Delete failed: {message}",
    languageEnglish: "English",
    languageChinese: "简体中文",
    llmModelLabel: "Model",
    ttsStatusChecking: "Checking...",
    sttHelpReady: "STT runtime and default model are ready.",
    sttHelpReadyProject:
      "Project-managed STT runtime is ready. Model: {model}.",
    sttHelpReadySystem:
      "Using STT runtime already installed on this device. Model: {model}. No project-local runtime download is required.",
    sttHelpMissingRuntime:
      "Local STT runtime is missing. Download it using the button below.",
    sttHelpMissingModelProject:
      "Project-managed STT runtime is ready, but no STT model is installed yet. Choose a model card below and tap the download icon.",
    sttHelpMissingModelSystem:
      "Using STT runtime already installed on this device, but no STT model is installed yet. Choose a model card below and tap the download icon.",
    sttHelpMissingModel:
      "No STT model found. Choose a model card below and tap the download icon.",
    llmHelpReadyProject:
      "Project-managed Ollama is ready. Models directory: {path}. If the first reply is slow, Ollama may still be starting.",
    llmHelpReadyExternal:
      "Using Ollama already installed on this device. Models directory: {path}. You can keep using it, or download a project-managed runtime below.",
    llmHelpMissingRuntime:
      "Ollama was not found. Download the project-managed runtime using the button below.",
    llmHelpMissingModelExternal:
      "Using Ollama already installed on this device, but no LLM model is installed yet. Choose a model card below and tap the download icon, or download a project-managed runtime below.",
    llmHelpMissingModel:
      "No LLM model found. Choose a model card below and tap the download icon.",
    downloadStt: "Download STT Runtime",
    downloadLlm: "Download Local LLM",
    downloadTts: "Download TTS Runtime",
    downloadModel: "Download",
    deleteModel: "Delete",
    deleteSttRuntime: "Delete STT Runtime",
    deleteLlmRuntime: "Delete Ollama Runtime",
    deleteTtsRuntime: "Delete TTS Runtime",
    cancelDownload: "Cancel download",
    externalRuntime: "External Ollama",
    projectRuntime: "Project Runtime",
    systemRuntime: "System Runtime",
    missingModel: "Not installed",
    installed: "Installed",
    downloading: "Downloading...",
    downloadingTarget: "Downloading {target}...",
    deleting: "Deleting...",
    deletingTarget: "Deleting {target}...",
    downloadSucceeded: "{target} is ready.",
    downloadFailed: "{target} download failed: {message}",
    deleteSucceeded: "{target} was deleted.",
    deleteFailed: "{target} delete failed: {message}",
    downloadCancelled: "Download cancelled.",
    runtimeNeeded: "Runtime not detected — click to download",
    runtimeReady: "Runtime is ready",
    setupStepRuntime: "Step 1: Download Runtime",
    setupStepModel: "Step 2: Select & Download Model",
    selectDownloadModel: "Select & Download Model",
    sttSetupHint: "Download the STT runtime to enable speech-to-text",
    llmSetupHint: "Download the project-managed Ollama runtime to enable local LLM inference",
    ttsSetupHint: "Download the TTS runtime to enable text-to-speech",
  },
  "zh-CN": {
    systemPrompt:
      "你是 SpeakSpace 的本地桌面助理。用户可能输入普通文本，也可能输入语音转写后的原始文本。你要先理解真实意图，再直接回答、整理、总结、润色或提炼行动项。除非用户明确要求转录整理，否则不要机械复述用户原话。默认保持用户输入语言，并用简洁清晰的方式输出。",
    transcribedUserPrefix:
      "下面是我的语音转写内容，里面可能包含口语重复、停顿和语病。请先理解真实意图，再直接回答或整理，不要机械复述原文。\n\n",
    statusPending: "检查中...",
    statusReady: "已就绪",
    statusError: "未就绪",
    on: "开启",
    off: "关闭",
    localModelNotReady: "本地模型未就绪",
    ttsRuntimeMissing: "未检测到本地 TTS 运行时，请点击下方按钮下载。",
    currentEngine: "当前引擎",
    model: "模型",
    voice: "音色",
    copied: "已复制",
    operationFailed: "操作失败: {message}",
    copy: "复制",
    play: "播放",
    stop: "停止",
    quote: "引用",
    quotePrefix: "引用内容：\n{content}\n",
    chatEmptyTitle: "SpeakSpace",
    chatEmptyDesc: "输入文字、导入音频或开始录音。\n处理后可保存为结构化笔记。",
    loadingVoice: "正在检测本地 TTS 模型...",
    webAudioUnsupported: "当前环境不支持 Web Audio 播放。",
    localTtsRequired: "本地 TTS 模型未就绪，当前不会回退到系统语音。",
    localTtsSynthesisFailed: "本地 TTS 合成失败。",
    localTtsPlaybackFailed: "本地 TTS 播放失败。",
    autoplayFailed: "自动播报失败: {message}",
    playFailed: "语音播放失败: {message}",
    dropdownEmptyModel: "无可用模型",
    dropdownEmptyVoice: "无可用音色",
    recommended: "推荐",
    speed: "速度",
    quality: "质量",
    localEngineLabel: "本地引擎",
    settingsTitle: "运行时与模型",
    settingsGeneral: "通用设置",
    settingsStorage: "存储管理",
    languageHelp: "选择应用界面显示语言。",
    ttsModelHelp: "用于播放助手回答的本地 TTS 模型。",
    managedDataDirectory: "托管数据目录",
    managedDataChecking: "正在检查托管数据目录...",
    cleanAssetsTitle: "清理本地资源",
    cleanAssetsHelp: "删除项目托管的运行时、模型和缓存；不会删除笔记。",
    newSession: "新建会话",
    notesLibrary: "笔记库",
    trash: "回收站",
    trashKicker: "笔记",
    deletedNotes: "已删除笔记",
    searchNotes: "搜索笔记...",
    copyReply: "复制回复",
    saveAsNote: "保存为笔记",
    importAudio: "导入音频文件",
    record: "录音",
    sttModelMissingTooltip: "语音转写模型未下载，请进入设置中下载模型。",
    promptPlaceholder: "输入问题，或导入音频 / 录音...",
    send: "发送",
    backToAssistant: "← 返回助理",
    delete: "删除",
    moveToTrash: "移到回收站",
    noteMovedToTrash: "笔记已移入回收站",
    restoreNote: "恢复",
    deleteForever: "永久删除",
    noteRestored: "笔记已恢复",
    noteDeletedForever: "笔记已永久删除",
    deleteForeverConfirm: "要永久删除这条笔记吗？此操作无法撤销。",
    trashLoadFailed: "加载回收站失败: {message}",
    trashEmpty: "回收站为空",
    trashEmptyDesc: "被删除的笔记会显示在这里。",
    trashPreviewEmpty: "选择一条已删除笔记进行预览。",
    deletedAt: "删除时间",
    createdAt: "创建时间",
    askAboutNote: "针对此笔记提问",
    noteQaPlaceholder: "例如：这段会议里我需要做什么？",
    ask: "提问",
    deleteQaMessage: "删除此消息",
    close: "关闭",
    language: "语言",
    interfaceLanguage: "界面语言",
    sttTitle: "语音转写",
    sttEngineListTitle: "本地引擎",
    sttEngineActive: "当前使用",
    sttEngineAvailable: "可用",
    sttEngineNotInstalled: "未安装",
    sttEngineWhisperDesc: "跨平台默认转写引擎。",
    sttEngineParakeetDesc: "本地 ONNX 转写引擎候选。",
    sttWhisperDetailDesc:
      "Whisper 是当前已接入的 STT 引擎，可在 macOS 和 Windows 上保持稳定可用，并覆盖项目重点语言。",
    sttParakeetDetailDesc:
      "Parakeet 会通过 sherpa-onnx 作为本地 ONNX 转写引擎运行；选中它后会直接用于转写。",
    sttCapabilityCoverage: "语言覆盖",
    sttCapabilityRuntime: "运行路径",
    sttWhisperCoverage:
      "覆盖面较广，现有 benchmark 已包含英文、中文普通话、印地语、日语、韩语、西语、法语和阿语。",
    sttWhisperRuntime:
      "通过 whisper.cpp 和现有模型下载流程运行；继续作为 macOS 与 Windows 的默认兜底方案。",
    sttParakeetNotice:
      "Parakeet 会在本地通过 sherpa-onnx-node 运行。WAV 文件可直接识别；其他音频格式需要系统安装 ffmpeg 后先转换再识别。",
    sttParakeetCoverage:
      "公开 Parakeet 选项在英文和部分多语言场景较强，但目前没有一个候选能像 Whisper 一样同时完整覆盖英文、中文普通话和印地语。",
    sttParakeetRuntime:
      "当前桌面应用中通过 sherpa-onnx-node 的 CPU 路径运行；模型包存放在项目管理的 STT 数据目录下。",
    sttWhisperModelsTitle: "Whisper 模型",
    sttParakeetModelsTitle: "Parakeet 模型",
    currentModel: "当前模型",
    sttParakeetV2Desc:
      "偏英文的 TDT 模型，速度和标点能力较强。",
    sttParakeetV3Desc:
      "支持 25 种欧洲语言的多语言 TDT 模型；不覆盖中文普通话或印地语。",
    switchSttEngineFailed: "切换 STT 引擎失败: {message}",
    llmTitle: "本地大语言模型",
    llmEngineOllamaDesc: "本地模型运行时。",
    llmEngineDetailDesc:
      "Ollama 用于本地对话、结构化整理和笔记问答；下方模型卡片沿用和 STT 一致的下载、删除和选择方式。",
    llmRuntimeSourceTitle: "运行时来源",
    llmModelStorageTitle: "模型存储",
    llmModelsTitle: "LLM 模型",
    llmRuntimeProject: "项目内托管 Ollama",
    llmRuntimeExternal: "设备外部 Ollama",
    llmRuntimeMissing: "未安装 Ollama 运行时。",
    llmModelStorageReady: "当前模型：{model}。存储位置：{path}",
    llmModelStorageMissing: "请在下方模型卡片中选择并下载模型，以启用本地大模型推理。",
    ttsTitle: "语音播报",
    ttsEngineKokoroDesc: "本地 sherpa-onnx 音色。",
    ttsEngineDetailDesc:
      "Kokoro 通过本地 sherpa-onnx 语音栈播放助手回答；模型卡片负责管理本地模型包，音色继续在下方下拉框中选择。",
    ttsRuntimeBackendTitle: "运行后端",
    ttsVoiceSetTitle: "音色集",
    ttsModelsTitle: "TTS 模型",
    ttsRuntimeBackendReady: "{backend} · {sampleRate}Hz",
    ttsRuntimeBackendMissing: "未安装本地 TTS 运行时。",
    ttsVoiceSetReady: "{count} 个音色 · 当前：{voice}",
    ttsVoiceSetMissing: "下载 TTS 模型包后即可启用音色。",
    ttsAutoplayTitle: "回答后自动播放",
    ttsAutoplayHelp:
      "关闭后，仍可把鼠标移到助手回答上，通过悬浮操作按钮手动播放；当前仅允许本地 TTS 模型发声。",
    ttsModelLabel: "模型",
    ttsVoiceLabel: "音色",
    hardwareTitle: "设备硬件",
    cpu: "处理器",
    memory: "系统内存",
    gpu: "显卡 (GPU)",
    inferenceAccel: "推理加速",
    refreshStatus: "刷新状态",
    cleanAllAssets: "清理全部本地资源",
    cleaningAssets: "清理中...",
    cleaningAssetsTarget: "正在清理全部本地资源...",
    cleanAllAssetsSuccess: "项目托管的本地资源已清理完成。",
    cleanAllAssetsFailed: "清理本地资源失败: {message}",
    cleanAllAssetsConfirm:
      "要清理 {path} 下全部由项目托管的 STT、LLM、TTS 资源吗？这不会删除设备里原本已安装的外部 Ollama。",
    collapseSidebar: "收起侧边栏",
    expandSidebar: "展开侧边栏",
    toggleSidebar: "切换侧边栏",
    localEngineSettings: "本地引擎设置",
    cpuCoresThreads: "{cores} 核心 / {threads} 线程",
    detectedGpuCount: "已检测 {count} 个 GPU",
    noGpuInfo: "未检测到 GPU 信息",
    detectFailed: "检测失败",
    cudaAccel: "CUDA 加速",
    metalAccel: "Metal 加速",
    rocmAccel: "ROCm 加速",
    available: "可用",
    unavailable: "不可用",
    gpuLimited: "{backend} (受限)",
    needCuda: "需 CUDA",
    needRocm: "需 ROCm",
    cpuBadge: "CPU",
    recGpu: "建议优先使用 GPU 加速，以获得更好的速度和质量平衡。",
    recGpuLimited: "检测到 GPU 加速，但显存可能不足以稳定运行更大的模型。",
    recGpuNoCuda: "检测到独立显卡，但当前运行环境未启用 CUDA 加速。",
    recGpuNoRocm: "检测到独立显卡，但当前运行环境未启用 ROCm 加速。",
    recCpu: "当前设备更适合使用 CPU 推理，建议优先选择轻量模型。",
    checkFailed: "检查失败: {message}",
    switchSttFailed: "切换STT模型失败: {message}",
    switchLlmFailed: "切换LLM模型失败: {message}",
    switchedVoice: "已切换音色：{voice}",
    llmNotReady: "LLM 未就绪",
    thinking: "思考中...",
    failed: "失败: {message}",
    sttNotReady: "本地转写运行时未就绪。",
    transcribing: "转写中...",
    transcriptionEmpty: "转写结果为空",
    transcribeTag: "转写",
    importedFile: "导入文件",
    typedInput: "输入",
    generatingNote: "正在生成结构化笔记...",
    saved: "已保存: {title}",
    saveFailed: "保存失败: {message}",
    recording: "录音中...",
    recordingStartFailed: "无法开始录音: {message}",
    processingRecording: "处理录音...",
    recordingEmpty: "录音内容为空，请重试。",
    microphoneRecording: "麦克风录音",
    recordingFailed: "录音失败",
    recordingFailedDetail: "录音失败: {message}",
    notesLoadFailed: "加载失败: {message}",
    noNotes: "暂无笔记",
    noNotesDesc: '处理音频或文本后，点击"保存为笔记"即可在此回看。',
    openNoteFailed: "打开笔记失败: {message}",
    structuring: "结构化",
    hasAudio: "有音频",
    summary: "摘要",
    keyPoints: "要点",
    actionItems: "待办事项",
    originalTranscript: "原始转录",
    errorPrefix: "错误: {message}",
    deleteFailed: "删除失败: {message}",
    languageEnglish: "English",
    languageChinese: "简体中文",
    llmModelLabel: "模型",
    ttsStatusChecking: "检查中...",
    sttHelpReady: "STT 运行时和默认模型已就绪。",
    sttHelpReadyProject:
      "项目内托管的 STT 运行时已就绪。当前模型：{model}。",
    sttHelpReadySystem:
      "当前正在使用设备里已安装的 STT 运行时。当前模型：{model}。此时无需再下载项目内运行时。",
    sttHelpMissingRuntime:
      "未检测到本地 STT 运行时，请点击下方按钮下载。",
    sttHelpMissingModelProject:
      "项目内托管的 STT 运行时已就绪，但还没有安装 STT 模型。请在下方模型卡片中选择并点击下载图标。",
    sttHelpMissingModelSystem:
      "当前正在使用设备里已安装的 STT 运行时，但还没有安装 STT 模型。请在下方模型卡片中选择并点击下载图标。",
    sttHelpMissingModel:
      "未检测到 STT 模型，请在下方模型卡片中选择并点击下载图标。",
    llmHelpReadyProject:
      "项目内托管的 Ollama 已就绪。模型目录：{path}。如果首条回复稍慢，可能是 Ollama 正在启动。",
    llmHelpReadyExternal:
      "当前正在使用设备里已安装的 Ollama。模型目录：{path}。你可以继续直接使用，也可以点击下方按钮下载项目内托管运行时。",
    llmHelpMissingRuntime:
      "未检测到 Ollama，请点击下方按钮下载项目内托管版本。",
    llmHelpMissingModelExternal:
      "当前正在使用设备里已安装的 Ollama，但还没有安装 LLM 模型。请在下方模型卡片中选择并点击下载图标，或点击下方按钮下载项目内托管运行时。",
    llmHelpMissingModel:
      "未检测到本地 LLM 模型，请在下方模型卡片中选择并点击下载图标。",
    downloadStt: "下载 STT 运行时",
    downloadLlm: "下载本地 LLM",
    downloadTts: "下载 TTS 运行时",
    downloadModel: "下载",
    deleteModel: "删除",
    deleteSttRuntime: "删除 STT 运行时",
    deleteLlmRuntime: "删除 Ollama 运行时",
    deleteTtsRuntime: "删除 TTS 运行时",
    cancelDownload: "取消下载",
    externalRuntime: "外部 Ollama",
    projectRuntime: "项目内运行时",
    systemRuntime: "系统运行时",
    missingModel: "未安装",
    installed: "已安装",
    downloading: "下载中...",
    downloadingTarget: "正在下载 {target}...",
    deleting: "删除中...",
    deletingTarget: "正在删除 {target}...",
    downloadSucceeded: "{target} 已就绪。",
    downloadFailed: "{target} 下载失败: {message}",
    deleteSucceeded: "{target} 已删除。",
    deleteFailed: "{target} 删除失败: {message}",
    downloadCancelled: "下载已取消。",
    runtimeNeeded: "未检测到运行时 — 点击下载",
    runtimeReady: "运行时已就绪",
    setupStepRuntime: "第一步：下载运行时",
    setupStepModel: "第二步：选择并下载模型",
    selectDownloadModel: "选择并下载模型",
    sttSetupHint: "下载 STT 运行时以启用语音转写",
    llmSetupHint: "下载项目内托管的 Ollama 以启用本地大模型推理",
    ttsSetupHint: "下载 TTS 运行时以启用语音合成",
  },
};

function t(key, params = {}) {
  const languagePack = I18N[state.uiLanguage] || I18N[DEFAULT_APP_LANGUAGE];
  const template = languagePack[key] || I18N[DEFAULT_APP_LANGUAGE][key] || key;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function getSystemPrompt() {
  return t("systemPrompt");
}

const state = {
  uiLanguage: DEFAULT_APP_LANGUAGE,
  runtime: {
    sttReady: false,
    sttEngineName: "whisper",
    llmReady: false,
    sttWhisperCliExists: false,
    sttModelExists: false,
    sttRuntimeLocation: "",
    sttParakeetReady: false,
    sttParakeetDependencyReady: false,
    sttParakeetModelExists: false,
    sttParakeetBackend: "",
    sttParakeetModelName: "",
    sttParakeetModels: [],
    llmOllamaExists: false,
    llmModelExists: false,
    llmRuntimeLocation: "",
    llmModelDir: "",
    managedDataRoot: "",
    sttModelName: "",
    llmModelName: "",
    sttModels: [],
    llmModels: [],
  },
  tts: {
    available: false,
    autoplayEnabled: false,
    systemAvailable: false,
    localAvailable: false,
    backend: "",
    localModelName: "",
    localSpeakerId: null,
    speakers: [],
    sampleRate: 0,
    errorMessage: "",
    voiceName: "",
    voiceLang: "",
  },
  currentView: "assistant",
  messages: [],
  draft: "",
  selectedFile: "",
  lastTranscript: "",
  lastAudioPath: "",
  lastAssistantText: "",
  lastPerformance: null,
  isWorking: false,
  isRecording: false,
  recordingSeconds: 0,
  runtimeDownloadTarget: "",
  runtimeDeleteTarget: "",
  sttEngineView: "whisper",
  assetCleanupInProgress: false,
  modelDownloadTarget: "",
  modelDownloadKind: "",
  modelDeleteTarget: "",
  modelDeleteKind: "",
  settingsCategory: "general",
  notes: [],
  deletedNotes: [],
  currentNoteId: null,
  currentTrashNoteId: null,
  noteQaMessages: [],
};

/* ========== DOM References ========== */

const sttStatusDotEl = document.querySelector("#sttStatusDot");
const llmStatusDotEl = document.querySelector("#llmStatusDot");
const sttStatusDotPanelEl = document.querySelector("#sttStatusDotPanel");
const llmStatusDotPanelEl = document.querySelector("#llmStatusDotPanel");
const sttStatusTextEl = document.querySelector("#sttStatusText");
const llmStatusTextEl = document.querySelector("#llmStatusText");
const ttsStatusDotPanelEl = document.querySelector("#ttsStatusDotPanel");
const ttsStatusTextEl = document.querySelector("#ttsStatusText");
const sttHelpTextEl = document.querySelector("#sttHelpText");
const llmHelpTextEl = document.querySelector("#llmHelpText");
const sttEngineSettingsEl = document.querySelector(".stt-engine-settings");
const sttDownloadBtn = document.querySelector("#sttDownloadBtn");
const sttDeleteBtn = document.querySelector("#sttDeleteBtn");
const llmDownloadBtn = document.querySelector("#llmDownloadBtn");
const llmDeleteBtn = document.querySelector("#llmDeleteBtn");
const ttsDownloadBtn = document.querySelector("#ttsDownloadBtn");
const ttsDeleteBtn = document.querySelector("#ttsDeleteBtn");
const llmModelDropdownEl = document.querySelector("#llmModelDropdown");
const ttsModelDropdownEl = document.querySelector("#ttsModelDropdown");
const languageDropdownEl = document.querySelector("#languageDropdown");
const ttsSpeakerDropdownEl = document.querySelector("#ttsSpeakerDropdown");
const ttsAutoplayToggleBtn = document.querySelector("#ttsAutoplayToggle");
const ttsAutoplayLabelEl = document.querySelector("#ttsAutoplayLabel");
const ttsVoiceTextEl = document.querySelector("#ttsVoiceText");
const selectedFileMetaEl = document.querySelector("#selectedFileMeta");
const recordingMetaEl = document.querySelector("#recordingMeta");
const jobStatusEl = document.querySelector("#jobStatus");
const noteSelectedFileMetaEl = document.querySelector("#noteSelectedFileMeta");
const noteRecordingMetaEl = document.querySelector("#noteRecordingMeta");
const noteJobStatusEl = document.querySelector("#noteJobStatus");
const chatListEl = document.querySelector("#chatList");
const promptInputEl = document.querySelector("#promptInput");
const pickFileBtn = document.querySelector("#pickFileBtn");
const recordToggleBtn = document.querySelector("#recordToggleBtn");
const pickFileTooltipEl = pickFileBtn?.closest("[data-composer-tooltip]");
const recordTooltipEl = recordToggleBtn?.closest("[data-composer-tooltip]");
const noteQaPickFileBtn = document.querySelector("#noteQaPickFileBtn");
const noteQaRecordToggleBtn = document.querySelector("#noteQaRecordToggleBtn");
const refreshRuntimeBtn = document.querySelector("#refreshRuntimeBtn");
const cleanAllAssetsBtn = document.querySelector("#cleanAllAssetsBtn");
const copyBtn = document.querySelector("#copyBtn");
const saveAsNoteBtn = document.querySelector("#saveAsNoteBtn");
const sendBtn = document.querySelector("#sendBtn");
const particleCanvas = document.querySelector("#particleCanvas");

const viewAssistant = document.querySelector("#viewAssistant");
const viewNoteDetail = document.querySelector("#viewNoteDetail");
const sidebarToggleBtn = document.querySelector("#sidebarToggleBtn");
const sidebarToggleBtnDetail = document.querySelector("#sidebarToggleBtnDetail");
const sidebarCollapseBtn = document.querySelector("#sidebarCollapseBtn");

const newSessionBtn = document.querySelector("#newSessionBtn");
const trashOpenBtn = document.querySelector("#trashOpenBtn");
const trashCountEl = document.querySelector("#trashCount");
const noteSearchInput = document.querySelector("#noteSearchInput");
const notesListEl = document.querySelector("#notesList");
const notesCountEl = document.querySelector("#notesCount");
const backToNotesBtn = document.querySelector("#backToNotesBtn");
const deleteNoteBtn = document.querySelector("#deleteNoteBtn");
const noteDetailContent = document.querySelector("#noteDetailContent");
const noteQaMessages = document.querySelector("#noteQaMessages");
const noteQaInput = document.querySelector("#noteQaInput");
const noteQaSendBtn = document.querySelector("#noteQaSendBtn");

const statusChip = document.querySelector("#statusChip");
const settingsOverlay = document.querySelector("#settingsOverlay");
const settingsCloseBtn = document.querySelector("#settingsCloseBtn");
const settingsNavEl = document.querySelector("#settingsNav");
const sttEngineNavEl = document.querySelector("#sttEngineNav");
const sttEngineListTitleEl = document.querySelector("#sttEngineListTitle");
const sttWhisperEngineStatusEl = document.querySelector("#sttWhisperEngineStatus");
const sttParakeetEngineStatusEl = document.querySelector("#sttParakeetEngineStatus");
const sttWhisperEngineDescEl = document.querySelector("#sttWhisperEngineDesc");
const sttParakeetEngineDescEl = document.querySelector("#sttParakeetEngineDesc");
const sttEngineDetailTitleEl = document.querySelector("#sttEngineDetailTitle");
const sttEngineDetailDescEl = document.querySelector("#sttEngineDetailDesc");
const sttEngineDetailBadgeEl = document.querySelector("#sttEngineDetailBadge");
const sttWhisperCoverageTitleEl = document.querySelector("#sttWhisperCoverageTitle");
const sttWhisperCoverageTextEl = document.querySelector("#sttWhisperCoverageText");
const sttWhisperRuntimeTitleEl = document.querySelector("#sttWhisperRuntimeTitle");
const sttWhisperRuntimeTextEl = document.querySelector("#sttWhisperRuntimeText");
const sttWhisperModelsTitleEl = document.querySelector("#sttWhisperModelsTitle");
const sttWhisperModelsBadgeEl = document.querySelector("#sttWhisperModelsBadge");
const sttWhisperModelCardsEl = document.querySelector("#sttWhisperModelCards");
const sttParakeetNoticeEl = document.querySelector("#sttParakeetNotice");
const sttParakeetCoverageTitleEl = document.querySelector("#sttParakeetCoverageTitle");
const sttParakeetCoverageTextEl = document.querySelector("#sttParakeetCoverageText");
const sttParakeetRuntimeTitleEl = document.querySelector("#sttParakeetRuntimeTitle");
const sttParakeetRuntimeTextEl = document.querySelector("#sttParakeetRuntimeText");
const sttParakeetModelsTitleEl = document.querySelector("#sttParakeetModelsTitle");
const sttParakeetModelsBadgeEl = document.querySelector("#sttParakeetModelsBadge");
const sttParakeetModelCardsEl = document.querySelector("#sttParakeetModelCards");
const llmEngineListTitleEl = document.querySelector("#llmEngineListTitle");
const llmOllamaEngineStatusEl = document.querySelector("#llmOllamaEngineStatus");
const llmOllamaEngineDescEl = document.querySelector("#llmOllamaEngineDesc");
const llmEngineDetailTitleEl = document.querySelector("#llmEngineDetailTitle");
const llmEngineDetailDescEl = document.querySelector("#llmEngineDetailDesc");
const llmEngineDetailBadgeEl = document.querySelector("#llmEngineDetailBadge");
const llmRuntimeSourceTitleEl = document.querySelector("#llmRuntimeSourceTitle");
const llmRuntimeSourceTextEl = document.querySelector("#llmRuntimeSourceText");
const llmModelStorageTitleEl = document.querySelector("#llmModelStorageTitle");
const llmModelStorageTextEl = document.querySelector("#llmModelStorageText");
const llmModelsBadgeEl = document.querySelector("#llmModelsBadge");
const llmModelCardsEl = document.querySelector("#llmModelCards");
const llmEngineSettingsEl = document.querySelector(".llm-engine-settings");
const ttsEngineListTitleEl = document.querySelector("#ttsEngineListTitle");
const ttsKokoroEngineStatusEl = document.querySelector("#ttsKokoroEngineStatus");
const ttsKokoroEngineDescEl = document.querySelector("#ttsKokoroEngineDesc");
const ttsEngineDetailTitleEl = document.querySelector("#ttsEngineDetailTitle");
const ttsEngineDetailDescEl = document.querySelector("#ttsEngineDetailDesc");
const ttsEngineDetailBadgeEl = document.querySelector("#ttsEngineDetailBadge");
const ttsRuntimeBackendTitleEl = document.querySelector("#ttsRuntimeBackendTitle");
const ttsRuntimeBackendTextEl = document.querySelector("#ttsRuntimeBackendText");
const ttsVoiceSetTitleEl = document.querySelector("#ttsVoiceSetTitle");
const ttsVoiceSetTextEl = document.querySelector("#ttsVoiceSetText");
const ttsModelsBadgeEl = document.querySelector("#ttsModelsBadge");
const ttsModelCardsEl = document.querySelector("#ttsModelCards");
const ttsEngineSettingsEl = document.querySelector(".tts-engine-settings");
const managedDataPathEl = document.querySelector("#managedDataPath");
const trashOverlay = document.querySelector("#trashOverlay");
const trashCloseBtn = document.querySelector("#trashCloseBtn");
const trashStatusEl = document.querySelector("#trashStatus");
const trashListEl = document.querySelector("#trashList");
const trashListCountEl = document.querySelector("#trashListCount");
const trashPreviewEl = document.querySelector("#trashPreview");

const hwCpuModelEl = document.querySelector("#hwCpuModel");
const hwCpuCoresEl = document.querySelector("#hwCpuCores");
const hwMemTotalEl = document.querySelector("#hwMemTotal");
const hwMemBarFillEl = document.querySelector("#hwMemBarFill");
const hwGpuNameEl = document.querySelector("#hwGpuName");
const hwGpuVramEl = document.querySelector("#hwGpuVram");
const hwAccelLabelEl = document.querySelector("#hwAccelLabel");
const hwCudaStatusEl = document.querySelector("#hwCudaStatus");
const hwCudaDetailEl = document.querySelector("#hwCudaDetail");
const hwCudaIconEl = document.querySelector("#hwCudaIcon");
const hwRecommendBadgeEl = document.querySelector("#hwRecommendBadge");
const hwRecommendationEl = document.querySelector("#hwRecommendation");

let audioContext = null;
let playbackAudioContext = null;
let mediaStream = null;
let sourceNode = null;
let processorNode = null;
let recordingBuffers = [];
let recordingSampleRate = 16000;
let recordingTimerId = null;
const SIDEBAR_STORAGE_KEY = "speakspace.sidebarCollapsed";
const TTS_AUTOPLAY_STORAGE_KEY = "speakspace.ttsAutoplay";
const TTS_SPEAKER_STORAGE_KEY = "speakspace.ttsSpeakerId";
let activeTtsReason = "";
let activeTtsSource = null;
let activeLocalTtsSourceNode = null;
let activeLocalTtsPlaybackResolve = null;
let ttsRequestSequence = 0;
let uiMessageSequence = 0;
const TTS_SEGMENT_MAX_LENGTH = 120;

function getStoredAppLanguage() {
  try {
    const value = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
    return LANGUAGE_OPTIONS.includes(value) ? value : DEFAULT_APP_LANGUAGE;
  } catch (_error) {
    return DEFAULT_APP_LANGUAGE;
  }
}

function initTheme() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggle(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
  const themeToggleBtn = document.querySelector("#themeToggleBtn");
  const themeIcon = document.querySelector("#themeIcon");
  const isLight = theme === "light";

  if (themeIcon) {
    themeIcon.innerHTML = isLight ? THEME_ICON_SVG.light : THEME_ICON_SVG.dark;
  }

  themeToggleBtn?.setAttribute("title", isLight ? "Light theme" : "Dark theme");
  themeToggleBtn?.setAttribute("aria-label", isLight ? "Light theme" : "Dark theme");
}
initTheme();

function persistAppLanguage(language) {
  try {
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
  } catch (_error) {
  }
}

function getStoredSettingsCategory() {
  try {
    const value = window.localStorage.getItem(SETTINGS_CATEGORY_STORAGE_KEY);
    return SETTINGS_CATEGORIES.includes(value) ? value : "general";
  } catch (_error) {
    return "general";
  }
}

function persistSettingsCategory(category) {
  try {
    window.localStorage.setItem(SETTINGS_CATEGORY_STORAGE_KEY, category);
  } catch (_error) {
  }
}

function ensureClientMessageId(message, prefix) {
  if (!message) return "";
  if (!message._uiId) {
    uiMessageSequence += 1;
    message._uiId = `${prefix}-${uiMessageSequence}`;
  }
  return message._uiId;
}

function getAssistantMessageSourceKey(message) {
  return `chat:${ensureClientMessageId(message, "chat")}`;
}

function getNoteQaMessageSourceKey(message) {
  return `noteqa:${ensureClientMessageId(message, "noteqa")}`;
}

function setInlineButtonLabel(button, label) {
  if (!button) return;

  const textNodes = [...button.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
  const labelNode = textNodes.find((node) => node.textContent.trim());

  textNodes.forEach((node) => {
    if (node !== labelNode) node.remove();
  });

  if (labelNode) {
    labelNode.textContent = ` ${label}`;
    return;
  }

  button.append(document.createTextNode(` ${label}`));
}

function applyLanguageUI() {
  document.documentElement.lang = state.uiLanguage === "zh-CN" ? "zh-CN" : "en";

  document.querySelector("#newSessionLabel").textContent = t("newSession");
  document.querySelector("#trashLabel").textContent = t("trash");
  trashOpenBtn.title = t("trash");
  trashOpenBtn.setAttribute("aria-label", t("trash"));
  document.querySelector("#notesLibraryTitle").textContent = t("notesLibrary");
  noteSearchInput.placeholder = t("searchNotes");
  statusChip.title = t("localEngineSettings");
  statusChip.querySelector(".status-chip-text").textContent = t("localEngineLabel");
  copyBtn.textContent = t("copyReply");
  saveAsNoteBtn.textContent = t("saveAsNote");
  pickFileBtn.title = t("importAudio");
  pickFileBtn.setAttribute("aria-label", t("importAudio"));
  recordToggleBtn.title = t("record");
  recordToggleBtn.setAttribute("aria-label", t("record"));
  updateMainComposerSttTooltips();
  noteQaPickFileBtn.title = t("importAudio");
  noteQaPickFileBtn.setAttribute("aria-label", t("importAudio"));
  noteQaRecordToggleBtn.title = t("record");
  noteQaRecordToggleBtn.setAttribute("aria-label", t("record"));
  promptInputEl.placeholder = t("promptPlaceholder");
  sendBtn.setAttribute("aria-label", t("send"));
  backToNotesBtn.textContent = t("backToAssistant");
  deleteNoteBtn.textContent = t("moveToTrash");
  noteQaInput.placeholder = t("noteQaPlaceholder");
  noteQaSendBtn.setAttribute("aria-label", t("ask"));
  document.querySelector("#noteQaTitle").textContent = t("askAboutNote");
  document.querySelector("#settingsSidebarLabel").textContent = t("localEngineLabel");
  document.querySelector("#settingsTitle").textContent = t("settingsTitle");
  settingsCloseBtn.setAttribute("aria-label", t("close"));
  document.querySelector("#settingsNavGeneral").textContent = t("settingsGeneral");
  document.querySelector("#settingsNavStt").textContent = t("sttTitle");
  document.querySelector("#settingsNavLlm").textContent = t("llmTitle");
  document.querySelector("#settingsNavTts").textContent = t("ttsTitle");
  document.querySelector("#settingsNavHardware").textContent = t("hardwareTitle");
  document.querySelector("#settingsNavStorage").textContent = t("settingsStorage");
  document.querySelector("#trashKicker").textContent = t("trashKicker");
  document.querySelector("#trashTitle").textContent = t("trash");
  document.querySelector("#trashListTitle").textContent = t("deletedNotes");
  trashCloseBtn.setAttribute("aria-label", t("close"));
  document.querySelector("#languageGroupTitle").textContent = t("language");
  document.querySelector("#languageLabel").textContent = t("interfaceLanguage");
  document.querySelector("#languageHelpText").textContent = t("languageHelp");
  document.querySelector("#sttGroupTitle").textContent = t("sttTitle");
  document.querySelector("#llmGroupTitle").textContent = t("llmTitle");
  document.querySelector("#llmModelLabel").textContent = t("llmModelsTitle");
  updateRuntimeDownloadButtons();
  document.querySelector("#ttsGroupTitle").textContent = t("ttsTitle");
  document.querySelector("#ttsAutoplayTitle").textContent = t("ttsAutoplayTitle");
  document.querySelector("#ttsAutoplayHelp").textContent = t("ttsAutoplayHelp");
  document.querySelector("#ttsModelLabel").textContent = t("ttsModelsTitle");
  document.querySelector("#ttsModelHelpText").textContent = t("ttsModelHelp");
  document.querySelector("#ttsVoiceLabel").textContent = t("ttsVoiceLabel");
  document.querySelector("#hardwarePanelTitle").textContent = t("hardwareTitle");
  document.querySelector("#storageGroupTitle").textContent = t("settingsStorage");
  document.querySelector("#managedDataTitle").textContent = t("managedDataDirectory");
  document.querySelector("#cleanAssetsTitle").textContent = t("cleanAssetsTitle");
  document.querySelector("#cleanAssetsHelpText").textContent = t("cleanAssetsHelp");
  if (managedDataPathEl && !managedDataPathEl.textContent.trim()) {
    managedDataPathEl.textContent = t("managedDataChecking");
  }
  document.querySelector("#hwCpuLabel").textContent = t("cpu");
  document.querySelector("#hwMemLabel").textContent = t("memory");
  document.querySelector("#hwGpuLabel").textContent = t("gpu");
  setInlineButtonLabel(document.querySelector("#refreshRuntimeBtn"), t("refreshStatus"));
  setInlineButtonLabel(document.querySelector("#cleanAllAssetsBtn"), t("cleanAllAssets"));

  [sidebarToggleBtn, sidebarToggleBtnDetail].forEach((button) => {
    button?.setAttribute("title", t("toggleSidebar"));
    button?.setAttribute("aria-label", t("toggleSidebar"));
  });

  if (document.body.classList.contains("sidebar-collapsed")) {
    sidebarCollapseBtn?.setAttribute("title", t("expandSidebar"));
    sidebarCollapseBtn?.setAttribute("aria-label", t("expandSidebar"));
  } else {
    sidebarCollapseBtn?.setAttribute("title", t("collapseSidebar"));
    sidebarCollapseBtn?.setAttribute("aria-label", t("collapseSidebar"));
  }

  populateDropdown(languageDropdownEl, LANGUAGE_OPTIONS, state.uiLanguage, "language");
  updateTTSUI();
  updateRuntimeHelpTexts();
  renderLLMEnginePanel();
  renderTTSEnginePanel();
  updateRecordingMeta();
  renderMessages();
  renderNotesList();
  renderTrashList();
  renderTrashPreview();
}

/* ========== View Navigation ========== */

function applySidebarState(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);

  [sidebarToggleBtn, sidebarToggleBtnDetail, sidebarCollapseBtn].forEach((button) => {
    if (!button) return;
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute("title", collapsed ? t("expandSidebar") : t("collapseSidebar"));
    button.setAttribute("aria-label", collapsed ? t("expandSidebar") : t("collapseSidebar"));
  });
}

function toggleSidebar(forceCollapsed) {
  const shouldCollapse =
    typeof forceCollapsed === "boolean"
      ? forceCollapsed
      : !document.body.classList.contains("sidebar-collapsed");

  applySidebarState(shouldCollapse);
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, shouldCollapse ? "1" : "0");
  } catch (_error) {
    // Ignore persistence issues; the UI still updates for the current session.
  }
}

function initSidebarState() {
  let collapsed = false;

  try {
    collapsed = window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  } catch (_error) {
    collapsed = false;
  }

  applySidebarState(collapsed);
}

function switchView(viewName) {
  state.currentView = viewName;
  viewAssistant.classList.toggle("view-active", viewName === "assistant");
  viewNoteDetail.classList.toggle("view-active", viewName === "detail");

  if (viewName === "assistant") {
    state.currentNoteId = null;
    highlightActiveNote();
  }

  updateSelectedFileMeta();
  updateRecordingMeta();
  updateButtons();
}

function startNewSession() {
  stopTTS();
  state.messages = [];
  state.lastTranscript = "";
  state.lastAudioPath = "";
  state.lastAssistantText = "";
  state.lastPerformance = null;
  state.selectedFile = "";
  renderMessages();
  updateSelectedFileMeta();
  setJobStatus("");
  updateButtons();
  switchView("assistant");
}

function renderSettingsCategory() {
  const activeCategory = SETTINGS_CATEGORIES.includes(state.settingsCategory)
    ? state.settingsCategory
    : "general";

  settingsNavEl?.querySelectorAll(".settings-nav-btn").forEach((button) => {
    const isActive = button.dataset.settingsCategory === activeCategory;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  document.querySelectorAll("[data-settings-section]").forEach((section) => {
    section.classList.toggle("active", section.dataset.settingsSection === activeCategory);
  });
}

function setSettingsCategory(category) {
  if (!SETTINGS_CATEGORIES.includes(category)) {
    return;
  }
  state.settingsCategory = category;
  persistSettingsCategory(category);
  renderSettingsCategory();
}

function openSettings() {
  renderSettingsCategory();
  settingsOverlay.classList.remove("hidden");
}

function closeSettings() {
  settingsOverlay.classList.add("hidden");
}

newSessionBtn.addEventListener("click", startNewSession);
trashOpenBtn.addEventListener("click", () => {
  openTrashOverlay();
});
statusChip.addEventListener("click", openSettings);
settingsCloseBtn.addEventListener("click", closeSettings);
trashCloseBtn.addEventListener("click", closeTrashOverlay);
settingsNavEl?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("[data-settings-category]");
  if (!button) return;
  setSettingsCategory(button.dataset.settingsCategory);
});
sttEngineNavEl?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("[data-stt-engine]");
  if (!button) return;
  void setSTTEngineView(button.dataset.sttEngine);
});
sttWhisperModelCardsEl?.addEventListener("click", handleWhisperModelCardClick);
sttWhisperModelCardsEl?.addEventListener("keydown", handleWhisperModelCardKeydown);
sttParakeetModelCardsEl?.addEventListener("click", handleParakeetModelCardClick);
sttParakeetModelCardsEl?.addEventListener("keydown", handleParakeetModelCardKeydown);
llmModelCardsEl?.addEventListener("click", handleLLMModelCardClick);
llmModelCardsEl?.addEventListener("keydown", handleLLMModelCardKeydown);
ttsModelCardsEl?.addEventListener("click", handleTTSModelCardClick);
ttsModelCardsEl?.addEventListener("keydown", handleTTSModelCardKeydown);
[sidebarToggleBtn, sidebarToggleBtnDetail, sidebarCollapseBtn].forEach((button) => {
  button?.addEventListener("click", () => toggleSidebar());
});
settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) {
    closeSettings();
  }
});
trashOverlay.addEventListener("click", (event) => {
  if (event.target === trashOverlay) {
    closeTrashOverlay();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const openDropdown = document.querySelector(".custom-dropdown.open");
    if (openDropdown) {
      closeAllDropdowns();
      return;
    }
    if (!trashOverlay.classList.contains("hidden")) {
      closeTrashOverlay();
      return;
    }
    if (!settingsOverlay.classList.contains("hidden")) {
      closeSettings();
    }
  }
});

/* ========== Particle System ========== */

const particles = [];
const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 140;
const PARTICLE_COLORS = [
  { r: 99, g: 102, b: 241 },
  { r: 6, g: 182, b: 212 },
  { r: 16, g: 185, b: 129 },
  { r: 139, g: 92, b: 246 },
  { r: 245, g: 158, b: 11 },
];

function initParticles() {
  const ctx = particleCanvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    const rect = particleCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    particleCanvas.width = rect.width * dpr;
    particleCanvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particleCanvas.style.width = rect.width + "px";
    particleCanvas.style.height = rect.height + "px";
  }

  resize();
  window.addEventListener("resize", resize);

  const w = () => particleCanvas.width / (window.devicePixelRatio || 1);
  const h = () => particleCanvas.height / (window.devicePixelRatio || 1);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    particles.push({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
      color,
      alpha: Math.random() * 0.4 + 0.1,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  function animate() {
    const cw = w();
    const ch = h();
    ctx.clearRect(0, 0, cw, ch);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = cw + 10;
      if (p.x > cw + 10) p.x = -10;
      if (p.y < -10) p.y = ch + 10;
      if (p.y > ch + 10) p.y = -10;

      p.pulsePhase += p.pulseSpeed;
      const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
      const currentAlpha = p.alpha * pulse;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
      ctx.fill();

      const glowRadius = p.radius * 3;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
      glow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha * 0.3})`);
      glow.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.08;
          const avgR = (particles[i].color.r + particles[j].color.r) / 2;
          const avgG = (particles[i].color.g + particles[j].color.g) / 2;
          const avgB = (particles[i].color.b + particles[j].color.b) / 2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${avgR}, ${avgG}, ${avgB}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ========== Status / Model UI ========== */

function setEngineStatus(kind, status, text) {
  const dots =
    kind === "stt"
      ? [sttStatusDotEl, sttStatusDotPanelEl]
      : [llmStatusDotEl, llmStatusDotPanelEl];
  dots.forEach((dot) => {
    if (dot) dot.className = `status-dot ${status}`;
  });

  const textEl = kind === "stt" ? sttStatusTextEl : llmStatusTextEl;
  if (textEl) {
    textEl.textContent =
      text ||
      (status === "pending" ? t("statusPending") : status === "ready" ? t("statusReady") : t("statusError"));
  }
}

function getTTSBackendLabel(backend) {
  if (backend === "sherpa-onnx-node") return "sherpa-onnx-node";
  if (backend === "sherpa-onnx-wasm") return "sherpa-onnx-wasm";
  return backend || "local";
}

function updateTTSAvailability() {
  state.tts.available = state.tts.localAvailable;
}

function getStoredTTSSpeakerId() {
  try {
    const value = window.localStorage.getItem(TTS_SPEAKER_STORAGE_KEY);
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function persistTTSSpeakerId(speakerId) {
  try {
    window.localStorage.setItem(TTS_SPEAKER_STORAGE_KEY, String(speakerId));
  } catch (_error) {
    // Ignore persistence issues; the current session still updates.
  }
}

function getSelectedTTSSpeaker() {
  return state.tts.speakers.find((speaker) => speaker.id === state.tts.localSpeakerId) || null;
}

function applyLLMRuntime(runtime = {}) {
  state.runtime.llmReady = Boolean(runtime.runtimeReady);
  state.runtime.llmOllamaExists = Boolean(runtime.ollamaExists);
  state.runtime.llmModelExists = Boolean(runtime.modelExists);
  state.runtime.llmRuntimeLocation = runtime.runtimeLocation || "";
  state.runtime.llmModelDir = runtime.modelDir || "";
  state.runtime.llmModelName = runtime.modelName || "";
  state.runtime.llmModels = Array.isArray(runtime.installedModels) ? runtime.installedModels : [];
}

function applyLocalTTSRuntime(runtime = {}) {
  state.tts.localAvailable = Boolean(runtime.runtimeReady);
  state.tts.backend = runtime.backend || "";
  state.tts.localModelName = runtime.modelName || "";
  state.tts.speakers = Array.isArray(runtime.speakers) ? runtime.speakers : [];
  const storedSpeakerId = getStoredTTSSpeakerId();
  const defaultSpeakerId = Number.isInteger(runtime.defaultSpeakerId) ? runtime.defaultSpeakerId : null;
  const currentSpeakerId = Number.isInteger(state.tts.localSpeakerId) ? state.tts.localSpeakerId : null;
  const preferredSpeakerId = [currentSpeakerId, storedSpeakerId, defaultSpeakerId].find((speakerId) =>
    state.tts.speakers.some((speaker) => speaker.id === speakerId)
  );
  state.tts.localSpeakerId =
    preferredSpeakerId ?? (state.tts.speakers[0] ? state.tts.speakers[0].id : defaultSpeakerId);
  state.tts.sampleRate = runtime.sampleRate || 0;
  state.tts.errorMessage = runtime.errorMessage || "";

  if (Number.isInteger(state.tts.localSpeakerId)) {
    persistTTSSpeakerId(state.tts.localSpeakerId);
  }

  updateTTSAvailability();
  updateTTSUI();
}

function updateTTSUI() {
  if (ttsStatusDotPanelEl) {
    ttsStatusDotPanelEl.className = `status-dot ${state.tts.available ? "ready" : "error"}`;
  }

  if (ttsStatusTextEl) {
    if (state.tts.localAvailable) {
      ttsStatusTextEl.textContent = getTTSBackendLabel(state.tts.backend);
    } else {
      ttsStatusTextEl.textContent = t("localModelNotReady");
    }
  }

  if (ttsAutoplayToggleBtn) {
    const enabled = state.tts.available && state.tts.autoplayEnabled;
    ttsAutoplayToggleBtn.disabled = !state.tts.available;
    ttsAutoplayToggleBtn.classList.toggle("is-on", enabled);
    ttsAutoplayToggleBtn.setAttribute("aria-checked", String(enabled));
  }

  if (ttsAutoplayLabelEl) {
    ttsAutoplayLabelEl.textContent =
      state.tts.available && state.tts.autoplayEnabled ? t("on") : t("off");
  }

  populateDropdown(
    ttsModelDropdownEl,
    getAllOptionsForKind("tts-model"),
    state.tts.localModelName || "kokoro-multi-lang-v1_0",
    "tts-model"
  );

  populateDropdown(
    ttsSpeakerDropdownEl,
    state.tts.speakers.map((speaker) => speaker.name),
    getSelectedTTSSpeaker()?.name || "",
    "tts"
  );

  if (ttsVoiceTextEl) {
    if (state.tts.localAvailable) {
      const selectedSpeaker = getSelectedTTSSpeaker();
      const parts = [
        `${t("currentEngine")}: ${getTTSBackendLabel(state.tts.backend)}`,
        `${t("model")} ${state.tts.localModelName || "kokoro"}`,
      ];
      if (selectedSpeaker?.label) {
        parts.push(`${t("voice")} ${selectedSpeaker.label.replace("（默认）", "").replace(" (Default)", "")}`);
      }
      if (state.tts.sampleRate) {
        parts.push(`${state.tts.sampleRate}Hz`);
      }
      ttsVoiceTextEl.textContent = parts.join(" · ");
    } else {
      ttsVoiceTextEl.textContent =
        state.tts.errorMessage ||
        t("ttsRuntimeMissing");
    }
  }

  renderTTSEnginePanel();
}

function createModelBadge(text, variant = "") {
  const badge = document.createElement("span");
  badge.className = `stt-model-badge${variant ? ` ${variant}` : ""}`;
  badge.textContent = text;
  return badge;
}

function formatModelStorage(sizeMB) {
  if (!Number.isFinite(sizeMB) || sizeMB <= 0) return "";
  if (sizeMB >= 1000) return `${(sizeMB / 1000).toFixed(1)} GB`;
  return `${sizeMB} MB`;
}

function createSTTModelCardShell(titleText, badges = []) {
  const card = document.createElement("article");
  card.className = "stt-model-card";

  const head = document.createElement("div");
  head.className = "stt-model-card-head";

  const titleGroup = document.createElement("div");
  titleGroup.className = "stt-model-card-title-group";

  const title = document.createElement("h4");
  title.textContent = titleText;

  const badgeRow = document.createElement("div");
  badgeRow.className = "stt-model-badge-row";
  for (const badge of badges) {
    badgeRow.append(createModelBadge(badge.text, badge.variant));
  }

  titleGroup.append(title, badgeRow);
  head.append(titleGroup);
  card.append(head);

  return { card, head };
}

function createModelMetricsElement(meta) {
  const metrics = document.createElement("div");
  metrics.className = "stt-model-card-metrics";
  metrics.innerHTML = `
    <div class="metric">
      <svg class="metric-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      <span class="metric-label">${t("speed")}</span>
      <span class="metric-dots">${createRatingDots(meta.speed, 5, "speed")}</span>
    </div>
    <div class="metric">
      <svg class="metric-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      <span class="metric-label">${t("quality")}</span>
      <span class="metric-dots">${createRatingDots(meta.quality, 5, "quality")}</span>
    </div>
  `;
  return metrics;
}

function renderWhisperModelCards() {
  if (!sttWhisperModelCardsEl) return;

  sttWhisperModelCardsEl.innerHTML = "";
  const options = getAllOptionsForKind("stt");
  const installedOptions = new Set(getInstalledModelsByKind("stt"));

  if (options.length === 0) {
    sttWhisperModelCardsEl.innerHTML = `<div class="dropdown-empty">${t("dropdownEmptyModel")}</div>`;
    return;
  }

  for (const name of options) {
    const meta = getModelMeta(name, "stt");
    const isActive = name === state.runtime.sttModelName;
    const isInstalled = installedOptions.has(name);
    const badges = [
      { text: isInstalled ? t("installed") : t("missingModel"), variant: isInstalled ? "" : "warning" },
    ];

    if (isActive) {
      badges.unshift({ text: t("currentModel"), variant: "active" });
    }
    if (meta.recommended) {
      badges.push({ text: t("recommended"), variant: "recommended" });
    }
    if (meta.sizeMB) {
      badges.push({ text: `${meta.sizeMB} MB`, variant: "muted" });
    }

    const { card, head } = createSTTModelCardShell(meta.label, badges);
    card.dataset.value = name;
    card.dataset.installed = isInstalled ? "true" : "false";
    card.classList.toggle("active", isActive);
    card.classList.toggle("missing", !isInstalled);
    if (isInstalled) {
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    const actionButtons = getModelActionButtonsHTML("stt", name, isInstalled, isActive);
    if (actionButtons) {
      const actions = document.createElement("div");
      actions.className = "stt-model-card-actions";
      actions.innerHTML = actionButtons;
      head.append(actions);
    }

    if (meta.desc) {
      const desc = document.createElement("p");
      desc.className = "settings-help-text";
      desc.textContent = meta.desc;
      card.append(desc);
    }

    card.append(createModelMetricsElement(meta));
    sttWhisperModelCardsEl.append(card);
  }
}

function renderParakeetModelCards() {
  if (!sttParakeetModelCardsEl) return;

  sttParakeetModelCardsEl.innerHTML = "";
  const options = getAllOptionsForKind("parakeet");
  const installedOptions = new Set(getInstalledModelsByKind("parakeet"));

  if (options.length === 0) {
    sttParakeetModelCardsEl.innerHTML = `<div class="dropdown-empty">${t("dropdownEmptyModel")}</div>`;
    return;
  }

  for (const name of options) {
    const meta = getModelMeta(name, "parakeet");
    const isActive = name === state.runtime.sttParakeetModelName;
    const isInstalled = installedOptions.has(name);
    const badges = [
      { text: isInstalled ? t("installed") : t("missingModel"), variant: isInstalled ? "" : "warning" },
    ];

    if (isActive) {
      badges.unshift({ text: t("currentModel"), variant: "active" });
    }
    if (meta.recommended) {
      badges.push({ text: t("recommended"), variant: "recommended" });
    }
    if (meta.sizeMB) {
      badges.push({ text: `${meta.sizeMB} MB`, variant: "muted" });
    }

    const { card, head } = createSTTModelCardShell(meta.label, badges);
    card.dataset.value = name;
    card.dataset.installed = isInstalled ? "true" : "false";
    card.classList.toggle("active", isActive);
    card.classList.toggle("missing", !isInstalled);
    if (isInstalled) {
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    const actionButtons = getModelActionButtonsHTML("parakeet", name, isInstalled, isActive);
    if (actionButtons) {
      const actions = document.createElement("div");
      actions.className = "stt-model-card-actions";
      actions.innerHTML = actionButtons;
      head.append(actions);
    }

    if (meta.desc) {
      const desc = document.createElement("p");
      desc.className = "settings-help-text";
      desc.textContent = meta.desc;
      card.append(desc);
    }

    card.append(createModelMetricsElement(meta));
    sttParakeetModelCardsEl.append(card);
  }
}

function renderModelCards(containerEl, kind, activeValue, options = {}) {
  if (!containerEl) return;

  containerEl.innerHTML = "";
  const modelOptions = getAllOptionsForKind(kind);
  const installedOptions = new Set(getInstalledModelsByKind(kind));

  if (modelOptions.length === 0) {
    containerEl.innerHTML = `<div class="dropdown-empty">${t("dropdownEmptyModel")}</div>`;
    return;
  }

  for (const name of modelOptions) {
    const meta = getModelMeta(name, kind);
    const isActive = name === activeValue;
    const isInstalled = installedOptions.has(name);
    const badges = [
      { text: isInstalled ? t("installed") : t("missingModel"), variant: isInstalled ? "" : "warning" },
    ];

    if (isActive) {
      badges.unshift({ text: t("currentModel"), variant: "active" });
    }
    if (meta.recommended) {
      badges.push({ text: t("recommended"), variant: "recommended" });
    }
    if (meta.sizeMB) {
      badges.push({
        text: kind === "llm" ? formatModelStorage(meta.sizeMB) : `${meta.sizeMB} MB`,
        variant: "muted",
      });
    }

    const { card, head } = createSTTModelCardShell(meta.label, badges);
    card.dataset.value = name;
    card.dataset.kind = kind;
    card.dataset.installed = isInstalled ? "true" : "false";
    card.classList.toggle("active", isActive);
    card.classList.toggle("missing", !isInstalled);
    if (isInstalled) {
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    const actionButtons = getModelActionButtonsHTML(kind, name, isInstalled, isActive);
    if (actionButtons) {
      const actions = document.createElement("div");
      actions.className = "stt-model-card-actions";
      actions.innerHTML = actionButtons;
      head.append(actions);
    }

    if (meta.desc) {
      const desc = document.createElement("p");
      desc.className = "settings-help-text";
      desc.textContent = meta.desc;
      card.append(desc);
    }

    if (options.showMetrics !== false) {
      card.append(createModelMetricsElement(meta));
    }

    containerEl.append(card);
  }
}

function renderLLMModelCards() {
  renderModelCards(llmModelCardsEl, "llm", state.runtime.llmModelName);
}

function renderTTSModelCards() {
  renderModelCards(ttsModelCardsEl, "tts-model", state.tts.localModelName || "kokoro-multi-lang-v1_0", {
    showMetrics: false,
  });
}

function renderLLMEnginePanel() {
  if (llmEngineListTitleEl) llmEngineListTitleEl.textContent = t("sttEngineListTitle");
  if (llmOllamaEngineDescEl) llmOllamaEngineDescEl.textContent = t("llmEngineOllamaDesc");
  if (llmEngineDetailTitleEl) llmEngineDetailTitleEl.textContent = "Ollama";
  if (llmEngineDetailDescEl) llmEngineDetailDescEl.textContent = t("llmEngineDetailDesc");
  if (llmRuntimeSourceTitleEl) llmRuntimeSourceTitleEl.textContent = t("llmRuntimeSourceTitle");
  if (llmModelStorageTitleEl) llmModelStorageTitleEl.textContent = t("llmModelStorageTitle");

  const runtimeReady = Boolean(state.runtime.llmReady);
  const runtimeExists = Boolean(state.runtime.llmOllamaExists);
  const statusText = runtimeReady
    ? t("sttEngineActive")
    : runtimeExists
    ? t("sttEngineAvailable")
    : t("sttEngineNotInstalled");

  if (llmOllamaEngineStatusEl) {
    llmOllamaEngineStatusEl.textContent = statusText;
    llmOllamaEngineStatusEl.classList.toggle("warning", !runtimeReady);
  }
  if (llmEngineDetailBadgeEl) {
    llmEngineDetailBadgeEl.textContent = statusText;
    llmEngineDetailBadgeEl.classList.toggle("warning", !runtimeReady);
  }
  if (llmRuntimeSourceTextEl) {
    if (!runtimeExists) {
      llmRuntimeSourceTextEl.textContent = t("llmRuntimeMissing");
    } else if (state.runtime.llmRuntimeLocation === "portable") {
      llmRuntimeSourceTextEl.textContent = t("llmRuntimeProject");
    } else {
      llmRuntimeSourceTextEl.textContent = t("llmRuntimeExternal");
    }
  }
  if (llmModelStorageTextEl) {
    if (runtimeReady) {
      llmModelStorageTextEl.textContent = t("llmModelStorageReady", {
        model: getModelMeta(state.runtime.llmModelName, "llm").label,
        path: state.runtime.llmModelDir || "~/.ollama/models",
      });
    } else {
      llmModelStorageTextEl.textContent = t("llmModelStorageMissing");
    }
  }
  if (llmModelsBadgeEl) {
    llmModelsBadgeEl.textContent = runtimeReady
      ? t("sttEngineActive")
      : runtimeExists
      ? t("selectDownloadModel")
      : t("sttEngineNotInstalled");
    llmModelsBadgeEl.classList.remove("hidden");
    llmModelsBadgeEl.classList.toggle("warning", !runtimeReady);
  }

  renderLLMModelCards();
}

function renderTTSEnginePanel() {
  if (ttsEngineListTitleEl) ttsEngineListTitleEl.textContent = t("sttEngineListTitle");
  if (ttsKokoroEngineDescEl) ttsKokoroEngineDescEl.textContent = t("ttsEngineKokoroDesc");
  if (ttsEngineDetailTitleEl) ttsEngineDetailTitleEl.textContent = "Kokoro";
  if (ttsEngineDetailDescEl) ttsEngineDetailDescEl.textContent = t("ttsEngineDetailDesc");
  if (ttsRuntimeBackendTitleEl) ttsRuntimeBackendTitleEl.textContent = t("ttsRuntimeBackendTitle");
  if (ttsVoiceSetTitleEl) ttsVoiceSetTitleEl.textContent = t("ttsVoiceSetTitle");

  const runtimeReady = Boolean(state.tts.localAvailable);
  const statusText = runtimeReady ? t("sttEngineActive") : t("sttEngineNotInstalled");

  if (ttsKokoroEngineStatusEl) {
    ttsKokoroEngineStatusEl.textContent = statusText;
    ttsKokoroEngineStatusEl.classList.toggle("warning", !runtimeReady);
  }
  if (ttsEngineDetailBadgeEl) {
    ttsEngineDetailBadgeEl.textContent = statusText;
    ttsEngineDetailBadgeEl.classList.toggle("warning", !runtimeReady);
  }
  if (ttsRuntimeBackendTextEl) {
    ttsRuntimeBackendTextEl.textContent = runtimeReady
      ? t("ttsRuntimeBackendReady", {
          backend: getTTSBackendLabel(state.tts.backend),
          sampleRate: state.tts.sampleRate || 0,
        })
      : state.tts.errorMessage || t("ttsRuntimeBackendMissing");
  }
  if (ttsVoiceSetTextEl) {
    const selectedSpeaker = getSelectedTTSSpeaker();
    ttsVoiceSetTextEl.textContent =
      runtimeReady && selectedSpeaker
        ? t("ttsVoiceSetReady", {
            count: state.tts.speakers.length,
            voice: getModelMeta(selectedSpeaker.name, "tts").label.replace("（默认）", "").replace(" (Default)", ""),
          })
        : t("ttsVoiceSetMissing");
  }
  if (ttsModelsBadgeEl) {
    ttsModelsBadgeEl.textContent = runtimeReady ? t("sttEngineActive") : t("sttEngineNotInstalled");
    ttsModelsBadgeEl.classList.toggle("warning", !runtimeReady);
  }

  renderTTSModelCards();
}

function renderSTTEnginePanel() {
  const activeEngine = STT_ENGINE_OPTIONS.includes(state.sttEngineView)
    ? state.sttEngineView
    : "whisper";
  const selectedEngine = state.runtime.sttEngineName || activeEngine;
  state.sttEngineView = activeEngine;

  sttEngineNavEl?.querySelectorAll("[data-stt-engine]").forEach((button) => {
    const isActive = button.dataset.sttEngine === activeEngine;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  document.querySelectorAll("[data-stt-engine-pane]").forEach((pane) => {
    pane.classList.toggle("active", pane.dataset.sttEnginePane === activeEngine);
  });

  if (sttEngineListTitleEl) sttEngineListTitleEl.textContent = t("sttEngineListTitle");
  if (sttWhisperEngineStatusEl) {
    sttWhisperEngineStatusEl.textContent =
      selectedEngine === "whisper" ? t("sttEngineActive") : t("sttEngineAvailable");
    sttWhisperEngineStatusEl.classList.toggle("warning", false);
  }
  if (sttParakeetEngineStatusEl) {
    sttParakeetEngineStatusEl.textContent =
      selectedEngine === "parakeet" ? t("sttEngineActive") : t("sttEngineAvailable");
    sttParakeetEngineStatusEl.classList.toggle("warning", false);
  }
  if (sttWhisperEngineDescEl) sttWhisperEngineDescEl.textContent = t("sttEngineWhisperDesc");
  if (sttParakeetEngineDescEl) sttParakeetEngineDescEl.textContent = t("sttEngineParakeetDesc");

  const isParakeet = activeEngine === "parakeet";
  if (sttEngineDetailTitleEl) {
    sttEngineDetailTitleEl.textContent = isParakeet ? "Parakeet" : "Whisper";
  }
  if (sttEngineDetailDescEl) {
    sttEngineDetailDescEl.textContent = t(
      isParakeet ? "sttParakeetDetailDesc" : "sttWhisperDetailDesc"
    );
  }
  if (sttEngineDetailBadgeEl) {
    sttEngineDetailBadgeEl.textContent = t(
      activeEngine === selectedEngine ? "sttEngineActive" : "sttEngineAvailable"
    );
    sttEngineDetailBadgeEl.classList.toggle("warning", activeEngine !== selectedEngine);
  }

  if (sttWhisperCoverageTitleEl) sttWhisperCoverageTitleEl.textContent = t("sttCapabilityCoverage");
  if (sttWhisperRuntimeTitleEl) sttWhisperRuntimeTitleEl.textContent = t("sttCapabilityRuntime");
  if (sttWhisperCoverageTextEl) sttWhisperCoverageTextEl.textContent = t("sttWhisperCoverage");
  if (sttWhisperRuntimeTextEl) sttWhisperRuntimeTextEl.textContent = t("sttWhisperRuntime");
  if (sttWhisperModelsTitleEl) sttWhisperModelsTitleEl.textContent = t("sttWhisperModelsTitle");
  if (sttWhisperModelsBadgeEl) {
    sttWhisperModelsBadgeEl.textContent =
      selectedEngine === "whisper" ? t("sttEngineActive") : t("sttEngineAvailable");
    sttWhisperModelsBadgeEl.classList.toggle("warning", selectedEngine !== "whisper");
  }
  if (sttParakeetNoticeEl) sttParakeetNoticeEl.textContent = t("sttParakeetNotice");
  if (sttParakeetCoverageTitleEl) sttParakeetCoverageTitleEl.textContent = t("sttCapabilityCoverage");
  if (sttParakeetRuntimeTitleEl) sttParakeetRuntimeTitleEl.textContent = t("sttCapabilityRuntime");
  if (sttParakeetCoverageTextEl) sttParakeetCoverageTextEl.textContent = t("sttParakeetCoverage");
  if (sttParakeetRuntimeTextEl) sttParakeetRuntimeTextEl.textContent = t("sttParakeetRuntime");
  if (sttParakeetModelsTitleEl) sttParakeetModelsTitleEl.textContent = t("sttParakeetModelsTitle");
  if (sttParakeetModelsBadgeEl) {
    sttParakeetModelsBadgeEl.textContent =
      selectedEngine === "parakeet" ? t("sttEngineActive") : t("sttEngineAvailable");
    sttParakeetModelsBadgeEl.classList.toggle("warning", false);
  }
  renderWhisperModelCards();
  renderParakeetModelCards();
}

async function setSTTEngineView(engine) {
  if (!STT_ENGINE_OPTIONS.includes(engine)) {
    return;
  }

  const previousEngine = state.runtime.sttEngineName || state.sttEngineView || "whisper";
  state.sttEngineView = engine;
  renderSTTEnginePanel();

  if (engine === state.runtime.sttEngineName) {
    return;
  }

  try {
    await window.desktopSTT.setSTTEngine(engine);
    state.runtime.sttEngineName = engine;
    await refreshRuntime();
  } catch (error) {
    state.sttEngineView = previousEngine;
    renderSTTEnginePanel();
    setJobStatus(t("switchSttEngineFailed", { message: error.message }), true);
  }
}

function handleWhisperModelCardClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const downloadBtn = target.closest(".dropdown-item-download");
  if (downloadBtn) {
    event.stopPropagation();
    if (downloadBtn.dataset.action === "cancel") {
      handleCancelModelDownload();
    } else {
      void handleModelDownload(downloadBtn.dataset.kind, downloadBtn.dataset.value);
    }
    return;
  }

  const deleteBtn = target.closest(".dropdown-item-delete");
  if (deleteBtn && !deleteBtn.disabled) {
    event.stopPropagation();
    void handleModelDelete(deleteBtn.dataset.kind, deleteBtn.dataset.value);
    return;
  }

  const card = target.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;
  void handleSTTModelChange(card.dataset.value);
}

function handleWhisperModelCardKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("button")) return;
  const card = target?.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;

  event.preventDefault();
  void handleSTTModelChange(card.dataset.value);
}

function handleParakeetModelCardClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const downloadBtn = target.closest(".dropdown-item-download");
  if (downloadBtn) {
    event.stopPropagation();
    if (downloadBtn.dataset.action === "cancel") {
      handleCancelModelDownload();
    } else {
      void handleModelDownload(downloadBtn.dataset.kind, downloadBtn.dataset.value);
    }
    return;
  }

  const deleteBtn = target.closest(".dropdown-item-delete");
  if (deleteBtn && !deleteBtn.disabled) {
    event.stopPropagation();
    void handleModelDelete(deleteBtn.dataset.kind, deleteBtn.dataset.value);
    return;
  }

  const card = target.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;
  void handleParakeetModelChange(card.dataset.value);
}

function handleParakeetModelCardKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("button")) return;
  const card = target?.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;

  event.preventDefault();
  void handleParakeetModelChange(card.dataset.value);
}

function handleLLMModelCardClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const downloadBtn = target.closest(".dropdown-item-download");
  if (downloadBtn) {
    event.stopPropagation();
    if (downloadBtn.dataset.action === "cancel") {
      handleCancelModelDownload();
    } else {
      void handleModelDownload(downloadBtn.dataset.kind, downloadBtn.dataset.value);
    }
    return;
  }

  const deleteBtn = target.closest(".dropdown-item-delete");
  if (deleteBtn && !deleteBtn.disabled) {
    event.stopPropagation();
    void handleModelDelete(deleteBtn.dataset.kind, deleteBtn.dataset.value);
    return;
  }

  const card = target.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;
  void handleLLMModelChange(card.dataset.value);
}

function handleLLMModelCardKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("button")) return;
  const card = target?.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;

  event.preventDefault();
  void handleLLMModelChange(card.dataset.value);
}

function handleTTSModelCardClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const downloadBtn = target.closest(".dropdown-item-download");
  if (downloadBtn) {
    event.stopPropagation();
    if (downloadBtn.dataset.action === "cancel") {
      handleCancelModelDownload();
    } else {
      void handleModelDownload(downloadBtn.dataset.kind, downloadBtn.dataset.value);
    }
    return;
  }

  const deleteBtn = target.closest(".dropdown-item-delete");
  if (deleteBtn && !deleteBtn.disabled) {
    event.stopPropagation();
    void handleModelDelete(deleteBtn.dataset.kind, deleteBtn.dataset.value);
    return;
  }

  const card = target.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;
  void handleTTSModelChange(card.dataset.value);
}

function handleTTSModelCardKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("button")) return;
  const card = target?.closest(".stt-model-card");
  if (!card || card.dataset.installed === "false") return;

  event.preventDefault();
  void handleTTSModelChange(card.dataset.value);
}

function updateRuntimeHelpTexts() {
  if (sttHelpTextEl) {
    const whisperReady = Boolean(state.runtime.sttWhisperCliExists && state.runtime.sttModelExists);
    if (whisperReady) {
      sttHelpTextEl.textContent = t(
        state.runtime.sttRuntimeLocation === "portable"
          ? "sttHelpReadyProject"
          : "sttHelpReadySystem",
        {
          model: getModelMeta(state.runtime.sttModelName, "stt").label,
        }
      );
    } else if (!state.runtime.sttWhisperCliExists) {
      sttHelpTextEl.textContent = t("sttSetupHint");
    } else if (!state.runtime.sttModelExists) {
      sttHelpTextEl.textContent = t(
        state.runtime.sttRuntimeLocation === "portable"
          ? "sttHelpMissingModelProject"
          : "sttHelpMissingModelSystem"
      );
    } else {
      sttHelpTextEl.textContent = t("sttSetupHint");
    }
  }

  if (llmHelpTextEl) {
    if (state.runtime.llmReady) {
      llmHelpTextEl.textContent = t(
        state.runtime.llmRuntimeLocation === "portable"
          ? "llmHelpReadyProject"
          : "llmHelpReadyExternal",
        {
          path: state.runtime.llmModelDir || "~/.ollama/models",
        }
      );
    } else if (!state.runtime.llmOllamaExists) {
      llmHelpTextEl.textContent = t("llmSetupHint");
    } else if (!state.runtime.llmModelExists) {
      llmHelpTextEl.textContent = t(
        state.runtime.llmRuntimeLocation === "portable"
          ? "llmHelpMissingModel"
          : "llmHelpMissingModelExternal"
      );
    } else {
      llmHelpTextEl.textContent = t("llmSetupHint");
    }
  }

  renderSTTEnginePanel();
  renderLLMEnginePanel();
  renderTTSEnginePanel();
}

function updateRuntimeDownloadButtons() {
  const isBusy =
    Boolean(state.assetCleanupInProgress) ||
    Boolean(state.runtimeDownloadTarget) ||
    Boolean(state.runtimeDeleteTarget) ||
    Boolean(state.modelDownloadTarget) ||
    Boolean(state.modelDeleteTarget);

  const sttNeedsRuntime = !state.runtime.sttWhisperCliExists;
  const sttCanDeleteRuntime = state.runtime.sttRuntimeLocation === "portable";
  const llmNeedsRuntime = state.runtime.llmRuntimeLocation !== "portable";
  const llmCanDeleteRuntime = state.runtime.llmRuntimeLocation === "portable";
  const ttsNeedsRuntime = !state.tts.localAvailable && !state.tts.available;
  const ttsCanDeleteRuntime = Boolean(state.tts.available || state.tts.localAvailable);

  if (sttDownloadBtn) {
    sttDownloadBtn.disabled = isBusy;
    const isSttDownloading = state.runtimeDownloadTarget === "stt";
    sttDownloadBtn.innerHTML = isSttDownloading
      ? `<span class="btn-spinner"></span> ${t("downloading")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"/></svg> ${t("downloadStt")}`;
    sttDownloadBtn.classList.toggle("runtime-needed", sttNeedsRuntime && !isSttDownloading);
    sttDownloadBtn.classList.toggle("runtime-downloading", isSttDownloading);
    sttDownloadBtn.classList.toggle("hidden", !sttNeedsRuntime && !isSttDownloading);
  }

  if (sttDeleteBtn) {
    sttDeleteBtn.disabled = isBusy;
    const isSttDeleting = state.runtimeDeleteTarget === "stt";
    sttDeleteBtn.innerHTML = isSttDeleting
      ? `<span class="btn-spinner"></span> ${t("deleting")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg> ${t("deleteSttRuntime")}`;
    sttDeleteBtn.classList.toggle("runtime-downloading", isSttDeleting);
    sttDeleteBtn.classList.toggle("hidden", !sttCanDeleteRuntime && !isSttDeleting);
  }

  if (sttEngineSettingsEl) {
    const hasVisibleRuntimeAction =
      (sttDownloadBtn && !sttDownloadBtn.classList.contains("hidden")) ||
      (sttDeleteBtn && !sttDeleteBtn.classList.contains("hidden"));
    sttEngineSettingsEl.classList.toggle("hidden", !hasVisibleRuntimeAction);
  }

  if (llmDownloadBtn) {
    llmDownloadBtn.disabled = isBusy;
    const isLlmDownloading = state.runtimeDownloadTarget === "llm";
    llmDownloadBtn.innerHTML = isLlmDownloading
      ? `<span class="btn-spinner"></span> ${t("downloading")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"/></svg> ${t("downloadLlm")}`;
    llmDownloadBtn.classList.toggle("runtime-needed", llmNeedsRuntime && !isLlmDownloading);
    llmDownloadBtn.classList.toggle("runtime-downloading", isLlmDownloading);
    llmDownloadBtn.classList.toggle("hidden", !llmNeedsRuntime && !isLlmDownloading);
  }

  if (llmDeleteBtn) {
    llmDeleteBtn.disabled = isBusy;
    const isLlmDeleting = state.runtimeDeleteTarget === "llm";
    llmDeleteBtn.innerHTML = isLlmDeleting
      ? `<span class="btn-spinner"></span> ${t("deleting")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg> ${t("deleteLlmRuntime")}`;
    llmDeleteBtn.classList.toggle("runtime-downloading", isLlmDeleting);
    llmDeleteBtn.classList.toggle("hidden", !llmCanDeleteRuntime && !isLlmDeleting);
  }

  if (llmEngineSettingsEl) {
    const hasVisibleRuntimeAction =
      (llmDownloadBtn && !llmDownloadBtn.classList.contains("hidden")) ||
      (llmDeleteBtn && !llmDeleteBtn.classList.contains("hidden"));
    llmEngineSettingsEl.classList.toggle("hidden", !hasVisibleRuntimeAction);
  }

  if (ttsDownloadBtn) {
    ttsDownloadBtn.disabled = isBusy;
    const isTtsDownloading = state.runtimeDownloadTarget === "tts";
    ttsDownloadBtn.innerHTML = isTtsDownloading
      ? `<span class="btn-spinner"></span> ${t("downloading")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"/></svg> ${t("downloadTts")}`;
    ttsDownloadBtn.classList.toggle("runtime-needed", ttsNeedsRuntime && !isTtsDownloading);
    ttsDownloadBtn.classList.toggle("runtime-downloading", isTtsDownloading);
    ttsDownloadBtn.classList.toggle("hidden", !ttsNeedsRuntime && !isTtsDownloading);
  }

  if (ttsDeleteBtn) {
    ttsDeleteBtn.disabled = isBusy;
    const isTtsDeleting = state.runtimeDeleteTarget === "tts";
    ttsDeleteBtn.innerHTML = isTtsDeleting
      ? `<span class="btn-spinner"></span> ${t("deleting")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg> ${t("deleteTtsRuntime")}`;
    ttsDeleteBtn.classList.toggle("runtime-downloading", isTtsDeleting);
    ttsDeleteBtn.classList.toggle("hidden", !ttsCanDeleteRuntime && !isTtsDeleting);
  }

  if (ttsEngineSettingsEl) {
    const hasVisibleRuntimeAction =
      (ttsDownloadBtn && !ttsDownloadBtn.classList.contains("hidden")) ||
      (ttsDeleteBtn && !ttsDeleteBtn.classList.contains("hidden"));
    ttsEngineSettingsEl.classList.toggle("hidden", !hasVisibleRuntimeAction);
  }

  if (cleanAllAssetsBtn) {
    cleanAllAssetsBtn.disabled = isBusy || state.isWorking || state.isRecording;
    cleanAllAssetsBtn.innerHTML = state.assetCleanupInProgress
      ? `<span class="btn-spinner"></span> ${t("cleaningAssets")}`
      : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg> ${t("cleanAllAssets")}`;
    cleanAllAssetsBtn.classList.toggle("runtime-downloading", state.assetCleanupInProgress);
  }
}

function clearTTSActiveState() {
  activeTtsReason = "";
  activeTtsSource = null;
}

function beginTTSActiveState(options = {}) {
  activeTtsReason = options.reason || "manual";
  activeTtsSource = options.source || null;
  updateTTSPlaybackButtons();
}

function endTTSActiveState() {
  clearTTSActiveState();
  updateTTSPlaybackButtons();
}

function ensurePlaybackAudioContext() {
  if (!playbackAudioContext || playbackAudioContext.state === "closed") {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error(t("webAudioUnsupported"));
    }
    playbackAudioContext = new AudioContextCtor();
  }

  return playbackAudioContext;
}

function stopLocalTTSPlayback() {
  if (activeLocalTtsSourceNode) {
    const resolvePlayback = activeLocalTtsPlaybackResolve;
    activeLocalTtsPlaybackResolve = null;
    activeLocalTtsSourceNode.onended = null;
    try {
      activeLocalTtsSourceNode.stop(0);
    } catch (_error) {
      // Ignore "already stopped" errors.
    }
    activeLocalTtsSourceNode.disconnect();
    activeLocalTtsSourceNode = null;
    resolvePlayback?.("stopped");
  }
}

function updateTTSPlaybackButtons() {
  document.querySelectorAll('.message-action-btn[data-action="play"]').forEach((button) => {
    const isPlaying = button.dataset.ttsSourceKey === activeTtsSource;
    button.parentElement?.classList.toggle("is-active-playback", isPlaying);
    button.classList.toggle("is-active", isPlaying);
    button.dataset.state = isPlaying ? "playing" : "idle";
    button.title = isPlaying ? t("stop") : t("play");
    button.setAttribute("aria-label", isPlaying ? t("stop") : t("play"));
    button.innerHTML = isPlaying
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.5v11l9-5.5-9-5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  });
}

function stopTTS(options = {}) {
  const { source = null } = options;
  if (source && activeTtsSource !== source) return;

  ttsRequestSequence += 1;
  stopLocalTTSPlayback();
  endTTSActiveState();
}

function normalizeSpeechText(text) {
  return String(text || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/(\*\*|__|~~|`)/g, "")
    .replace(/:[a-z0-9_+-]+:/gi, " ")
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D]/gu, " ")
    .replace(/\s*\n+\s*/g, "。 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function prepareSpeechSegmentText(segmentText) {
  return String(segmentText || "")
    .replace(/([A-Za-z0-9])([.,!?;:]+)(?=\s|$)/g, "$1 ")
    .replace(/(?<=^|\s)[.,!?;:]+(?=\s|$)/g, " ")
    .replace(/[()[\]{}<>|\\/=_*~#^"`]+/g, " ")
    .replace(/[，。！？；：、]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitLongSpeechSegment(segment, maxLength) {
  const trimmedSegment = String(segment || "").trim();
  if (!trimmedSegment) {
    return [];
  }

  if (trimmedSegment.length <= maxLength) {
    return [trimmedSegment];
  }

  const parts = [];
  let remaining = trimmedSegment;

  while (remaining.length > maxLength) {
    let splitIndex = remaining.lastIndexOf(" ", maxLength);

    if (splitIndex < Math.floor(maxLength * 0.6)) {
      const punctuationCandidates = [",", ";", ":", "，", "；", "："];
      splitIndex = -1;
      for (const mark of punctuationCandidates) {
        const candidate = remaining.lastIndexOf(mark, maxLength);
        if (candidate > splitIndex) {
          splitIndex = candidate + 1;
        }
      }
    }

    if (splitIndex < Math.floor(maxLength * 0.6)) {
      const tokenMatch = remaining.slice(0, maxLength + 1).match(/^(.{1,120}?)(?=[A-Z][a-z]|[a-zA-Z]{2,}$)/);
      if (tokenMatch && tokenMatch[1]?.length >= Math.floor(maxLength * 0.6)) {
        splitIndex = tokenMatch[1].length;
      }
    }

    if (splitIndex <= 0) {
      splitIndex = maxLength;
      while (
        splitIndex > 1 &&
        /[A-Za-z]/.test(remaining.charAt(splitIndex - 1)) &&
        /[A-Za-z]/.test(remaining.charAt(splitIndex))
      ) {
        splitIndex -= 1;
      }
    }

    parts.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts.filter(Boolean);
}

function splitSpeechTextIntoSegments(text) {
  const sentenceLikeParts = String(text || "")
    .replace(/\s+/g, " ")
    .match(/[^。！？!?；;：:\n]+[。！？!?；;：:\n]*/g);

  const units = (sentenceLikeParts && sentenceLikeParts.length > 0
    ? sentenceLikeParts
    : [String(text || "")])
    .map((item) => item.trim())
    .filter(Boolean);

  const segments = [];
  let currentSegment = "";

  for (const unit of units) {
    if (!currentSegment) {
      currentSegment = unit;
      continue;
    }

    if ((currentSegment + unit).length <= TTS_SEGMENT_MAX_LENGTH) {
      currentSegment += unit;
      continue;
    }

    segments.push(currentSegment);
    currentSegment = unit;
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments
    .flatMap((segment) => splitLongSpeechSegment(segment, TTS_SEGMENT_MAX_LENGTH))
    .filter(Boolean);
}

async function playLocalTTSAudio(samples, sampleRate, options = {}) {
  if (!samples?.length || !sampleRate) {
    return null;
  }

  stopLocalTTSPlayback();

  const floatSamples = samples instanceof Float32Array ? samples : new Float32Array(samples);
  const context = ensurePlaybackAudioContext();
  if (context.state === "suspended") {
    await context.resume();
  }

  const audioBuffer = context.createBuffer(1, floatSamples.length, sampleRate);
  audioBuffer.getChannelData(0).set(floatSamples);
  const sourceNode = context.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(context.destination);

  activeLocalTtsSourceNode = sourceNode;

  return new Promise((resolve) => {
    const finishPlayback = (reason) => {
      if (activeLocalTtsPlaybackResolve === finishPlayback) {
        activeLocalTtsPlaybackResolve = null;
      }
      resolve(reason);
    };

    activeLocalTtsPlaybackResolve = finishPlayback;
    sourceNode.onended = () => {
      if (activeLocalTtsSourceNode === sourceNode) {
        activeLocalTtsSourceNode = null;
      }
      finishPlayback("ended");
    };

    sourceNode.start();
  });
}

async function synthesizeTtsSegment(segmentText, requestId) {
  const preparedText = prepareSpeechSegmentText(segmentText);
  if (!preparedText) {
    return null;
  }

  const result = await window.desktopSTT.synthesizeTTS(preparedText, {
    speakerId: state.tts.localSpeakerId,
    speed: 1,
  });

  if (requestId !== ttsRequestSequence) {
    return null;
  }

  if (!result?.samples?.length || !result?.sampleRate) {
    throw new Error(t("localTtsPlaybackFailed"));
  }

  return result;
}

async function speakSingleText(text, requestId, options = {}) {
  const result = await synthesizeTtsSegment(text, requestId);
  if (!result) {
    return false;
  }

  const playbackCompletion = await playLocalTTSAudio(result.samples, result.sampleRate, options);
  if (!playbackCompletion) {
    throw new Error(t("localTtsPlaybackFailed"));
  }

  await playbackCompletion;
  return requestId === ttsRequestSequence;
}

async function speakLongTextInSegments(segments, requestId, options = {}) {
  let nextSegmentPromise = synthesizeTtsSegment(segments[0], requestId);

  for (let index = 0; index < segments.length; index += 1) {
    const result = await nextSegmentPromise;
    if (!result || requestId !== ttsRequestSequence) {
      return false;
    }

    if (index + 1 < segments.length) {
      nextSegmentPromise = synthesizeTtsSegment(segments[index + 1], requestId);
    } else {
      nextSegmentPromise = null;
    }

    const playbackCompletion = await playLocalTTSAudio(result.samples, result.sampleRate, options);
    if (!playbackCompletion) {
      throw new Error(t("localTtsPlaybackFailed"));
    }

    const playbackResult = await playbackCompletion;
    if (requestId !== ttsRequestSequence) {
      return false;
    }

    if (playbackResult !== "ended" && index < segments.length - 1) {
      return false;
    }
  }

  return true;
}

async function speakText(text, options = {}) {
  const speechText = normalizeSpeechText(text);
  if (!speechText) {
    return false;
  }

  if (!state.tts.localAvailable) {
    throw new Error(t("localTtsRequired"));
  }

  stopTTS();
  const requestId = ttsRequestSequence + 1;
  ttsRequestSequence = requestId;
  beginTTSActiveState(options);

  try {
    const segments = splitSpeechTextIntoSegments(speechText);
    if (segments.length <= 1) {
      const completed = await speakSingleText(speechText, requestId, options);
      if (completed && requestId === ttsRequestSequence) {
        endTTSActiveState();
      }
      return completed;
    }

    const completed = await speakLongTextInSegments(segments, requestId, options);
    if (completed && requestId === ttsRequestSequence) {
      endTTSActiveState();
    }
    return completed;
  } catch (error) {
    if (requestId === ttsRequestSequence) {
      endTTSActiveState();
    }
    throw new Error(error?.message || t("localTtsSynthesisFailed"));
  }
}

async function requestTTSPlayback(text, options = {}) {
  try {
    return await speakText(text, options);
  } catch (error) {
    setTemporaryJobStatus(
      options.reason === "autoplay"
        ? t("autoplayFailed", { message: error.message })
        : t("playFailed", { message: error.message }),
      true,
      3200
    );
    return false;
  }
}
function restoreTTSPrefs() {
  try {
    state.tts.autoplayEnabled = window.localStorage.getItem(TTS_AUTOPLAY_STORAGE_KEY) === "1";
  } catch (_error) {
    state.tts.autoplayEnabled = false;
  }

  state.tts.localSpeakerId = getStoredTTSSpeakerId();
}

function toggleTTSAutoplay() {
  if (!state.tts.available) return;

  state.tts.autoplayEnabled = !state.tts.autoplayEnabled;

  try {
    window.localStorage.setItem(
      TTS_AUTOPLAY_STORAGE_KEY,
      state.tts.autoplayEnabled ? "1" : "0"
    );
  } catch (_error) {
    // Ignore persistence issues; the current session still updates.
  }

  updateTTSUI();
}

function initLanguage() {
  state.uiLanguage = getStoredAppLanguage();
  applyLanguageUI();
}

function initTTS() {
  restoreTTSPrefs();
  ttsAutoplayToggleBtn?.addEventListener("click", toggleTTSAutoplay);
}

/* ========== Model Metadata ========== */

const STT_MODEL_META = {
  "ggml-large-v3-turbo-q5_0.bin": {
    label: "Large V3 Turbo Q5",
    speed: 4,
    quality: 4,
    ramMB: 817,
    sizeMB: 547,
    desc: "Best balance between speed and quality",
    recommended: true,
  },
  "ggml-large-v3-q5_0.bin": {
    label: "Large V3 Q5",
    speed: 2,
    quality: 5,
    ramMB: 2001,
    sizeMB: 1031,
    desc: "Highest transcription quality",
  },
  "ggml-large-v3-turbo-q8_0.bin": {
    label: "Large V3 Turbo Q8",
    speed: 4,
    quality: 4,
    ramMB: 1123,
    sizeMB: 834,
    desc: "High-accuracy Turbo quantization",
  },
  "ggml-small.bin": {
    label: "Small",
    speed: 5,
    quality: 2,
    ramMB: 824,
    sizeMB: 465,
    desc: "Fast, but with lower multilingual accuracy",
  },
  "ggml-small-q5_1.bin": {
    label: "Small Q5",
    speed: 5,
    quality: 2,
    ramMB: 493,
    sizeMB: 181,
    desc: "Lightest option for low-memory devices",
  },
  "ggml-medium-q5_0.bin": {
    label: "Medium Q5",
    speed: 3,
    quality: 3,
    ramMB: 1138,
    sizeMB: 514,
    desc: "Mid-sized option with balanced cost and quality",
  },
  "ggml-large-v3.bin": {
    label: "Large V3 (Full)",
    speed: 1,
    quality: 5,
    ramMB: 3966,
    sizeMB: 2952,
    desc: "Full precision, but the slowest",
  },
};

const PARAKEET_MODEL_META = {
  "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8": {
    label: "Parakeet TDT 0.6B v2",
    speed: 5,
    quality: 4,
    ramMB: 1800,
    sizeMB: 632,
    desc: "English-focused ONNX model with punctuation and casing support.",
    recommended: true,
  },
  "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8": {
    label: "Parakeet TDT 0.6B v3",
    speed: 4,
    quality: 4,
    ramMB: 1900,
    sizeMB: 640,
    desc: "Multilingual ONNX model for 25 European languages.",
  },
};

const LLM_MODEL_META = {
  "qwen3:4b-instruct": {
    label: "Qwen3 4B Instruct",
    speed: 4,
    quality: 4,
    sizeMB: 2500,
    desc: "Current default with the best overall balance",
    recommended: true,
  },
  "qwen2.5:3b-instruct": {
    label: "Qwen2.5 3B Instruct",
    speed: 5,
    quality: 3,
    sizeMB: 1900,
    desc: "Fast and suitable for lighter tasks",
  },
  "qwen2.5:1.5b-instruct": {
    label: "Qwen2.5 1.5B Instruct",
    speed: 5,
    quality: 2,
    sizeMB: 986,
    desc: "Ultra-lightweight for low-memory devices",
  },
  "phi4-mini": {
    label: "Phi-4 Mini",
    speed: 4,
    quality: 3,
    sizeMB: 2500,
    desc: "Microsoft Phi-4 mini variant",
  },
  "ministral-3:3b": {
    label: "Ministral 3B",
    speed: 5,
    quality: 3,
    sizeMB: 3000,
    desc: "Lightweight Mistral model",
  },
  "ibm/granite4:micro-h": {
    label: "Granite4 Micro-H",
    speed: 5,
    quality: 3,
    sizeMB: 1900,
    desc: "IBM Granite micro model",
  },
};

const TTS_MODEL_META = {
  "kokoro-multi-lang-v1_0": {
    label: "Kokoro Multi-Lang v1.0",
    desc: "Offline multilingual TTS model bundle with built-in voice set",
    recommended: true,
  },
};

const LANGUAGE_META = {
  en: {
    label: I18N.en.languageEnglish,
    desc: "Default interface language",
  },
  "zh-CN": {
    label: I18N.en.languageChinese,
    desc: "Simplified Chinese interface",
  },
};

const TTS_SPEAKER_META = {
  zf_xiaobei: { en: { label: "Chinese Female · Xiaobei" }, zh: { label: "中文女声 · 小贝" } },
  zf_xiaoni: { en: { label: "Chinese Female · Xiaoni" }, zh: { label: "中文女声 · 小妮" } },
  zf_xiaoxiao: { en: { label: "Chinese Female · Xiaoxiao" }, zh: { label: "中文女声 · 晓晓" } },
  zf_xiaoyi: { en: { label: "Chinese Female · Xiaoyi" }, zh: { label: "中文女声 · 小艺" } },
  zm_yunjian: { en: { label: "Chinese Male · Yunjian" }, zh: { label: "中文男声 · 云健" } },
  zm_yunxi: { en: { label: "Chinese Male · Yunxi" }, zh: { label: "中文男声 · 云熙" } },
  zm_yunxia: { en: { label: "Chinese Male · Yunxia" }, zh: { label: "中文男声 · 云夏" } },
  zm_yunyang: { en: { label: "Chinese Male · Yunyang" }, zh: { label: "中文男声 · 云阳" } },
};

const TTS_PREFIX_LABELS = {
  af: { en: "American Female", zh: "美式女声" },
  am: { en: "American Male", zh: "美式男声" },
  bf: { en: "British Female", zh: "英式女声" },
  bm: { en: "British Male", zh: "英式男声" },
  ef: { en: "Spanish Female", zh: "西语女声" },
  em: { en: "Spanish Male", zh: "西语男声" },
  ff: { en: "French Female", zh: "法语女声" },
  hf: { en: "Hindi Female", zh: "印地语女声" },
  hm: { en: "Hindi Male", zh: "印地语男声" },
  if: { en: "Italian Female", zh: "意大利语女声" },
  im: { en: "Italian Male", zh: "意大利语男声" },
  jf: { en: "Japanese Female", zh: "日语女声" },
  jm: { en: "Japanese Male", zh: "日语男声" },
  pf: { en: "Portuguese Female", zh: "葡语女声" },
  pm: { en: "Portuguese Male", zh: "葡语男声" },
  zf: { en: "Chinese Female", zh: "中文女声" },
  zm: { en: "Chinese Male", zh: "中文男声" },
};

function getTTSSpeakerMeta(name) {
  const langKey = state.uiLanguage === "zh-CN" ? "zh" : "en";
  if (TTS_SPEAKER_META[name]?.[langKey]) {
    return {
      label: TTS_SPEAKER_META[name][langKey].label,
      speed: 0,
      quality: 0,
      ramMB: 0,
      desc: "",
    };
  }

  const [prefix, suffix] = String(name || "").split("_");
  const prefixLabel = TTS_PREFIX_LABELS[prefix]?.[langKey] || prefix?.toUpperCase() || "Voice";
  const displaySuffix =
    langKey === "zh"
      ? suffix || name
      : (suffix || name || "").replace(/(^\w)/, (match) => match.toUpperCase());
  return {
    label: `${prefixLabel} · ${displaySuffix}`,
    speed: 0,
    quality: 0,
    ramMB: 0,
    desc: "",
  };
}

function getModelMeta(modelName, kind) {
  if (kind === "language") {
    return LANGUAGE_META[modelName] || { label: modelName, desc: "" };
  }
  if (kind === "tts") {
    return getTTSSpeakerMeta(modelName);
  }
  if (kind === "tts-model") {
    return TTS_MODEL_META[modelName] || {
      label: modelName || "Kokoro",
      desc: "Offline TTS model bundle",
      speed: 0,
      quality: 0,
      ramMB: 0,
    };
  }

  const catalog =
    kind === "stt"
      ? STT_MODEL_META
      : kind === "parakeet"
      ? PARAKEET_MODEL_META
      : kind === "llm"
      ? LLM_MODEL_META
      : TTS_SPEAKER_META;
  return catalog[modelName] || {
    label: String(modelName || "").replace(/\.bin$/, "").replace(/[-_]/g, " "),
    speed: 0,
    quality: 0,
    ramMB: 0,
    desc: "",
  };
}

function getInstalledModelsByKind(kind) {
  if (kind === "stt") {
    return state.runtime.sttModels || [];
  }
  if (kind === "parakeet") {
    return state.runtime.sttParakeetModels || [];
  }
  if (kind === "llm") {
    return state.runtime.llmModels || [];
  }
  if (kind === "tts-model") {
    return state.tts.localAvailable && state.tts.localModelName ? [state.tts.localModelName] : [];
  }
  return [];
}

function canDeleteInstalledModel(kind) {
  if (kind === "stt") {
    return true;
  }

  if (kind === "parakeet") {
    return true;
  }

  if (kind === "llm") {
    return state.runtime.llmRuntimeLocation === "portable";
  }

  if (kind === "tts-model") {
    return state.tts.localAvailable;
  }

  return false;
}

function getAllOptionsForKind(kind) {
  if (kind === "stt") {
    return [...new Set([...Object.keys(STT_MODEL_META), ...state.runtime.sttModels, state.runtime.sttModelName].filter(Boolean))];
  }

  if (kind === "parakeet") {
    return [...new Set([...Object.keys(PARAKEET_MODEL_META), ...state.runtime.sttParakeetModels, state.runtime.sttParakeetModelName].filter(Boolean))];
  }

  if (kind === "llm") {
    return [...new Set([...Object.keys(LLM_MODEL_META), ...state.runtime.llmModels, state.runtime.llmModelName].filter(Boolean))];
  }

  if (kind === "tts-model") {
    return [...new Set([...Object.keys(TTS_MODEL_META), state.tts.localModelName].filter(Boolean))];
  }

  return [];
}

/* ========== Custom Dropdown ========== */

function createRatingDots(value, maxDots, colorClass) {
  let html = "";
  for (let i = 0; i < maxDots; i++) {
    const filled = i < value;
    html += `<span class="rating-dot ${colorClass} ${filled ? "filled" : ""}"></span>`;
  }
  return html;
}

function getModelActionButtonsHTML(kind, name, isInstalled, isActive) {
  const isDownloading = state.modelDownloadKind === kind && state.modelDownloadTarget === name;
  const isDeleting = state.modelDeleteKind === kind && state.modelDeleteTarget === name;
  const canDelete = isInstalled && canDeleteInstalledModel(kind);

  if (isDownloading) {
    return `<button type="button" class="dropdown-item-download downloading" data-kind="${kind}" data-value="${name}" data-action="cancel" title="${t("cancelDownload")}" aria-label="${t("cancelDownload")}">
      <svg class="download-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"/><circle class="download-spinner-arc" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="50 13"/></svg>
      <svg class="download-cancel-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>`;
  }

  if (isDeleting) {
    return `<span class="dropdown-item-actions">
      <button type="button" class="dropdown-item-delete" disabled title="${t("deleting")}" aria-label="${t("deleting")}">
        <span class="btn-spinner"></span>
      </button>
    </span>`;
  }

  const actions = [];

  if (!isInstalled) {
    actions.push(`<button type="button" class="dropdown-item-download" data-kind="${kind}" data-value="${name}" title="${t("downloadModel")}" aria-label="${t("downloadModel")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`);
  }

  if (canDelete) {
    actions.push(`<button type="button" class="dropdown-item-delete" data-kind="${kind}" data-value="${name}" title="${t("deleteModel")}" aria-label="${t("deleteModel")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`);
  }

  if (isActive && isInstalled) {
    actions.push(`<span class="dropdown-item-check"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`);
  }

  return actions.length > 0 ? `<span class="dropdown-item-actions">${actions.join("")}</span>` : "";
}

function renderDropdownMenu(dropdownEl, options, activeValue, kind) {
  const menu = dropdownEl.querySelector(".custom-dropdown-menu");
  menu.innerHTML = "";
  const showsMetrics = kind === "stt" || kind === "llm";
  const showsDescription = kind !== "tts";
  const installedOptions = new Set(getInstalledModelsByKind(kind));

  if (options.length === 0) {
    menu.innerHTML = `<div class="dropdown-empty">${kind === "tts" ? t("dropdownEmptyVoice") : t("dropdownEmptyModel")}</div>`;
    return;
  }

  for (const name of options) {
    const meta = getModelMeta(name, kind);
    const isActive = name === activeValue;
    const isInstalled = kind === "stt" || kind === "llm" || kind === "tts-model" ? installedOptions.has(name) : true;

    const item = document.createElement("div");
    item.className = `dropdown-item ${isActive ? "active" : ""}`;
    item.dataset.value = name;
    item.dataset.installed = isInstalled ? "true" : "false";
    item.dataset.kind = kind;

    const statusBadge = isInstalled
      ? ""
      : `<span class="dropdown-item-badge warning">${t("missingModel")}</span>`;
    const recBadge = meta.recommended
      ? `<span class="dropdown-item-badge">${t("recommended")}</span>`
      : "";
    const actionButtons = getModelActionButtonsHTML(kind, name, isInstalled, isActive);

    item.innerHTML = `
      <div class="dropdown-item-main">
        <span class="dropdown-item-label">${meta.label}</span>
        ${statusBadge}
        ${recBadge}
        ${actionButtons}
      </div>
      ${showsDescription && meta.desc ? `<p class="dropdown-item-desc">${meta.desc}</p>` : ""}
      ${showsMetrics ? `<div class="dropdown-item-metrics">
        <div class="metric">
          <svg class="metric-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span class="metric-label">${t("speed")}</span>
          <span class="metric-dots">${createRatingDots(meta.speed, 5, "speed")}</span>
        </div>
        <div class="metric">
          <svg class="metric-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span class="metric-label">${t("quality")}</span>
          <span class="metric-dots">${createRatingDots(meta.quality, 5, "quality")}</span>
        </div>
      </div>` : ""}
    `;

    menu.append(item);
  }
}

function setDropdownValue(dropdownEl, value, kind) {
  const trigger = dropdownEl.querySelector(".custom-dropdown-trigger");
  const valueEl = trigger.querySelector(".custom-dropdown-value");
  const meta = getModelMeta(value, kind);
  valueEl.textContent = value ? meta.label : kind === "tts" ? t("dropdownEmptyVoice") : t("dropdownEmptyModel");
}

function setDropdownDisabled(dropdownEl, disabled) {
  const trigger = dropdownEl.querySelector(".custom-dropdown-trigger");
  trigger.disabled = disabled;
  dropdownEl.dataset.disabled = String(disabled);
}

function openDropdown(dropdownEl) {
  document.querySelectorAll(".custom-dropdown.open").forEach((el) => {
    if (el !== dropdownEl) el.classList.remove("open");
  });
  dropdownEl.classList.toggle("open");
}

function closeAllDropdowns() {
  document.querySelectorAll(".custom-dropdown.open").forEach((el) => {
    el.classList.remove("open");
  });
}

function initDropdown(dropdownEl, kind, onChange) {
  const trigger = dropdownEl.querySelector(".custom-dropdown-trigger");
  const menu = dropdownEl.querySelector(".custom-dropdown-menu");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (trigger.disabled) return;
    openDropdown(dropdownEl);
  });

  menu.addEventListener("click", (e) => {
    const downloadBtn = e.target.closest(".dropdown-item-download");
    if (downloadBtn) {
      e.stopPropagation();
      if (downloadBtn.dataset.action === "cancel") {
        handleCancelModelDownload();
      } else {
        void handleModelDownload(downloadBtn.dataset.kind, downloadBtn.dataset.value);
      }
      return;
    }

    const deleteBtn = e.target.closest(".dropdown-item-delete");
    if (deleteBtn && !deleteBtn.disabled) {
      e.stopPropagation();
      void handleModelDelete(deleteBtn.dataset.kind, deleteBtn.dataset.value);
      return;
    }

    const item = e.target.closest(".dropdown-item");
    if (!item) return;
    if (item.dataset.installed === "false") return;
    const value = item.dataset.value;
    closeAllDropdowns();
    if (onChange) onChange(value);
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    closeAllDropdowns();
  }
});

function populateDropdown(dropdownEl, options, activeValue, kind) {
  if (options.length === 0) {
    setDropdownValue(dropdownEl, "", kind);
    setDropdownDisabled(dropdownEl, true);
    renderDropdownMenu(dropdownEl, [], "", kind);
    return;
  }

  setDropdownValue(dropdownEl, activeValue, kind);
  setDropdownDisabled(dropdownEl, false);
  renderDropdownMenu(dropdownEl, options, activeValue, kind);
}

let modelDownloadAbortController = null;

function refreshDropdownForKind(kind) {
  if (kind === "stt") {
    renderWhisperModelCards();
  } else if (kind === "parakeet") {
    renderParakeetModelCards();
  } else if (kind === "llm") {
    renderDropdownMenu(llmModelDropdownEl, getAllOptionsForKind("llm"), state.runtime.llmModelName, "llm");
    renderLLMModelCards();
  } else if (kind === "tts-model") {
    renderDropdownMenu(ttsModelDropdownEl, getAllOptionsForKind("tts-model"), state.tts.localModelName, "tts-model");
    renderTTSModelCards();
  }
}

async function handleModelDownload(kind, modelName) {
  if (!kind || !modelName) return;
  if (state.modelDownloadTarget || state.modelDeleteTarget || state.runtimeDeleteTarget) return;

  const targetLabel = getModelMeta(modelName, kind).label;
  state.modelDownloadTarget = modelName;
  state.modelDownloadKind = kind;
  modelDownloadAbortController = new AbortController();
  refreshDropdownForKind(kind);
  updateRuntimeDownloadButtons();
  setJobStatus(t("downloadingTarget", { target: targetLabel }));

  try {
    await window.desktopSTT.downloadModel(kind, modelName);
    if (modelDownloadAbortController?.signal.aborted) return;
    await refreshRuntime();
    if (kind === "stt") {
      await handleSTTModelChange(modelName);
    } else if (kind === "parakeet") {
      await handleParakeetModelChange(modelName);
    } else if (kind === "llm") {
      await handleLLMModelChange(modelName);
    } else if (kind === "tts-model") {
      await handleTTSModelChange(modelName);
    }
    setJobStatus(t("downloadSucceeded", { target: targetLabel }));
  } catch (error) {
    if (modelDownloadAbortController?.signal.aborted) {
      setJobStatus(t("downloadCancelled"));
    } else {
      setJobStatus(t("downloadFailed", { target: targetLabel, message: error.message }), true);
    }
  } finally {
    state.modelDownloadTarget = "";
    state.modelDownloadKind = "";
    modelDownloadAbortController = null;
    refreshDropdownForKind(kind);
    updateRuntimeDownloadButtons();
  }
}

async function handleModelDelete(kind, modelName) {
  if (!kind || !modelName) return;
  if (state.modelDownloadTarget || state.modelDeleteTarget || state.runtimeDownloadTarget || state.runtimeDeleteTarget) return;

  const targetLabel = getModelMeta(modelName, kind).label;
  state.modelDeleteTarget = modelName;
  state.modelDeleteKind = kind;
  refreshDropdownForKind(kind);
  updateRuntimeDownloadButtons();
  setJobStatus(t("deletingTarget", { target: targetLabel }));

  try {
    stopTTS();
    await window.desktopSTT.deleteModel(kind, modelName);
    await refreshRuntime();
    if (kind === "tts-model") {
      await handleTTSModelChange("");
    }
    setJobStatus(t("deleteSucceeded", { target: targetLabel }));
  } catch (error) {
    setJobStatus(t("deleteFailed", { target: targetLabel, message: error.message }), true);
  } finally {
    state.modelDeleteTarget = "";
    state.modelDeleteKind = "";
    refreshDropdownForKind(kind);
    updateRuntimeDownloadButtons();
  }
}

function handleCancelModelDownload() {
  if (modelDownloadAbortController) {
    modelDownloadAbortController.abort();
  }
}

function setJobStatus(text, isError = false) {
  [jobStatusEl, noteJobStatusEl].forEach((element) => {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle("error", isError);
  });
}

function updateSelectedFileMeta() {
  [selectedFileMetaEl, noteSelectedFileMetaEl].forEach((element) => {
    if (!element) return;
    if (!state.selectedFile) {
      element.classList.add("hidden");
      element.textContent = "";
      return;
    }

    element.classList.remove("hidden");
    element.textContent = state.selectedFile.split(/[\\/]/).pop();
  });
}

function updateRecordingMeta() {
  [recordingMetaEl, noteRecordingMetaEl].forEach((element) => {
    if (!element) return;
    if (!state.isRecording) {
      element.classList.add("hidden");
      element.textContent = "";
      element.classList.remove("error");
      return;
    }

    element.classList.remove("hidden");
    element.classList.remove("error");
    element.textContent = `● ${formatDuration(state.recordingSeconds)}`;
  });
}

function updateMainComposerSttTooltips() {
  const showMissingSttTooltip =
    !state.runtime.sttReady &&
    !state.isWorking &&
    !state.isRecording &&
    !state.assetCleanupInProgress;
  const tooltipText = t("sttModelMissingTooltip");
  const entries = [
    { wrapper: pickFileTooltipEl, button: pickFileBtn, title: t("importAudio") },
    { wrapper: recordTooltipEl, button: recordToggleBtn, title: t("record") },
  ];

  for (const { wrapper, button, title } of entries) {
    if (!wrapper || !button) continue;

    wrapper.dataset.tooltipActive = showMissingSttTooltip ? "true" : "false";
    wrapper.dataset.tooltip = showMissingSttTooltip ? tooltipText : "";

    if (showMissingSttTooltip) {
      wrapper.tabIndex = 0;
      wrapper.setAttribute("aria-label", tooltipText);
      button.removeAttribute("title");
      continue;
    }

    wrapper.removeAttribute("tabindex");
    wrapper.removeAttribute("aria-label");
    button.title = title;
    button.setAttribute("aria-label", title);
  }
}

function updateButtons() {
  pickFileBtn.disabled =
    state.isWorking || state.isRecording || state.assetCleanupInProgress || !state.runtime.sttReady;
  if (noteQaPickFileBtn) {
    noteQaPickFileBtn.disabled =
      state.isWorking || state.isRecording || state.assetCleanupInProgress || !state.runtime.sttReady || !state.currentNoteId;
  }
  refreshRuntimeBtn.disabled = state.isWorking || state.isRecording || state.assetCleanupInProgress;
  recordToggleBtn.disabled = state.isWorking || state.assetCleanupInProgress || !state.runtime.sttReady;
  if (noteQaRecordToggleBtn) {
    noteQaRecordToggleBtn.disabled =
      state.isWorking || state.assetCleanupInProgress || !state.runtime.sttReady || !state.currentNoteId;
  }
  recordToggleBtn.classList.toggle("recording", state.isRecording);
  noteQaRecordToggleBtn?.classList.toggle("recording", state.isRecording);
  sendBtn.disabled =
    state.isWorking || state.isRecording || state.assetCleanupInProgress || !state.runtime.llmReady || !state.draft.trim();
  noteQaSendBtn.disabled =
    state.isWorking ||
    state.isRecording ||
    state.assetCleanupInProgress ||
    !state.runtime.llmReady ||
    !state.currentNoteId ||
    !noteQaInput.value.trim();
  copyBtn.disabled = !state.lastAssistantText;
  saveAsNoteBtn.disabled = !state.lastTranscript && !state.lastAssistantText;
  updateMainComposerSttTooltips();
  updateRuntimeDownloadButtons();
}

function autoResizePrompt() {
  promptInputEl.style.height = "0px";
  promptInputEl.style.height = `${Math.min(promptInputEl.scrollHeight, 180)}px`;
}

function autoResizeNoteQaInput() {
  noteQaInput.style.height = "0px";
  noteQaInput.style.height = `${Math.min(noteQaInput.scrollHeight, 180)}px`;
}

function setTemporaryJobStatus(text, isError = false, durationMs = 2000) {
  setJobStatus(text, isError);
  window.setTimeout(() => {
    if (jobStatusEl.textContent === text) {
      setJobStatus("");
    }
  }, durationMs);
}

async function copyTextToClipboard(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;

  await navigator.clipboard.writeText(cleanText);
  setTemporaryJobStatus(t("copied"));
}

function appendQuoteToActiveInput(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;

  const targetInput = state.currentView === "detail" ? noteQaInput : promptInputEl;
  if (!targetInput) return;

  const prefix = targetInput.value.trim() ? "\n\n" : "";
  const quoteText = `${prefix}${t("quotePrefix", { content: cleanText })}`;
  targetInput.value += quoteText;
  targetInput.focus();
  targetInput.setSelectionRange(targetInput.value.length, targetInput.value.length);

  if (targetInput === promptInputEl) {
    state.draft = targetInput.value;
    autoResizePrompt();
    updateButtons();
    return;
  }

  autoResizeNoteQaInput();
  updateButtons();
}

function createAssistantActionButton(type, title, svgMarkup, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "message-action-btn";
  button.dataset.action = type;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.innerHTML = svgMarkup;
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await onClick();
    } catch (error) {
      setTemporaryJobStatus(t("operationFailed", { message: error.message }), true, 2600);
    }
  });
  return button;
}

function createPlaybackActionButton(text, sourceKey) {
  const button = createAssistantActionButton(
    "play",
    t("play"),
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.5v11l9-5.5-9-5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    () => {
      if (activeTtsSource === sourceKey) {
        stopTTS({ source: sourceKey });
        return Promise.resolve();
      }
      return requestTTSPlayback(text, { reason: "manual", source: sourceKey });
    }
  );
  button.dataset.ttsSourceKey = sourceKey;
  return button;
}

function createAssistantActionBar(text, sourceKey) {
  const actions = document.createElement("div");
  actions.className = "message-actions";

  actions.append(
    createAssistantActionButton(
      "copy",
      t("copy"),
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V7a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      () => copyTextToClipboard(text)
    ),
    createPlaybackActionButton(text, sourceKey),
    createAssistantActionButton(
      "quote",
      t("quote"),
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v4l4-4V8a2 2 0 0 0-2-2zM18 6h-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      () => appendQuoteToActiveInput(text)
    )
  );

  return actions;
}

function createMessageElement(message) {
  ensureClientMessageId(message, "chat");
  const wrapper = document.createElement("article");
  wrapper.className = `message ${message.role}`;
  wrapper.dataset.messageId = message._uiId;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = message.role === "assistant" ? "AI" : "ME";

  const body = document.createElement("div");
  body.className = "message-body";

  const meta = document.createElement("p");
  meta.className = "message-meta";
  meta.textContent = message.meta;

  const content =
    message.role === "assistant"
      ? createRichTextContentElement("message-content", message.content)
      : document.createElement("p");
  if (message.role !== "assistant") {
    content.className = "message-content";
    content.textContent = message.content;
  }

  body.append(meta, content);
  if (message.role === "assistant") {
    wrapper.classList.add("has-actions");
    body.append(createAssistantActionBar(message.content, getAssistantMessageSourceKey(message)));
  }
  wrapper.append(avatar, body);

  return wrapper;
}

function renderMessages() {
  chatListEl.innerHTML = "";

  if (state.messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.innerHTML = `
      <div class="chat-empty-inner">
        <div class="chat-empty-orbs">
          <div class="orb"></div>
          <div class="orb"></div>
          <div class="orb"></div>
        </div>
        <h3>${t("chatEmptyTitle")}</h3>
        <p>${t("chatEmptyDesc").replace(/\n/g, "<br/>")}</p>
      </div>
    `;
    chatListEl.append(empty);
    return;
  }

  state.messages.forEach((message) => {
    chatListEl.append(createMessageElement(message));
  });

  updateTTSPlaybackButtons();
  chatListEl.scrollTop = chatListEl.scrollHeight;
}

function addMessage(role, content, meta) {
  const message = {
    role,
    content,
    meta,
  };
  ensureClientMessageId(message, "chat");
  state.messages.push(message);
  renderMessages();
  return message;
}

function buildConversationMessages() {
  const history = state.messages.slice(-10).map((message) => {
    if (
      message.role === "user" &&
      (message.meta.includes("转写") || message.meta.includes("Transcription"))
    ) {
      return {
        role: "user",
        content: t("transcribedUserPrefix") + message.content,
      };
    }

    return {
      role: message.role,
      content: message.content,
    };
  });

  return [
    {
      role: "system",
      content: getSystemPrompt(),
    },
    ...history,
  ];
}

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function formatMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function mergeFloat32Arrays(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return merged;
}

function floatTo16BitPCM(view, offset, input) {
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    view.setInt16(
      offset,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true
    );
    offset += 2;
  }
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return buffer;
}

/* ========== Hardware Info ========== */

function formatMemory(mb) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function isLikelyDiscreteGPU(name = "") {
  const normalized = name.toLowerCase();
  return [
    "nvidia",
    "geforce",
    "rtx",
    "gtx",
    "quadro",
    "tesla",
    "radeon",
    "rx ",
    "arc",
  ].some((keyword) => normalized.includes(keyword));
}

function pickPrimaryGPU(gpus = []) {
  if (!Array.isArray(gpus) || gpus.length === 0) return null;

  return (
    gpus.find((gpu) => isLikelyDiscreteGPU(gpu.name)) ||
    [...gpus].sort((a, b) => (b.vramMB || 0) - (a.vramMB || 0))[0]
  );
}

function getAccelerationInfo(hw) {
  if (hw.cuda?.available) {
    const dev = hw.cuda.devices?.[0];
    const parts = [];
    if (dev?.vramMB) parts.push(`${formatMemory(dev.vramMB)} VRAM`);
    if (dev?.computeCapability) parts.push(`SM ${dev.computeCapability}`);
    return {
      label: t("cudaAccel"),
      status: t("available"),
      detail: parts.join(" · "),
      available: true,
    };
  }

  if (hw.accelerators?.metal?.available) {
    const dev = hw.accelerators.metal.devices?.[0];
    const parts = [];
    if (dev?.name) parts.push(dev.name);
    if (dev?.featureSet) parts.push(dev.featureSet);
    return {
      label: t("metalAccel"),
      status: t("available"),
      detail: parts.join(" · "),
      available: true,
    };
  }

  if (hw.accelerators?.rocm?.available) {
    const dev = hw.accelerators.rocm.devices?.[0];
    return {
      label: t("rocmAccel"),
      status: t("available"),
      detail: dev?.name || "",
      available: true,
    };
  }

  return {
    label: t("inferenceAccel"),
    status: t("unavailable"),
    detail: "",
    available: false,
  };
}

function getRecommendationBadgeText(hw) {
  const backendLabel = hw.accelerators?.preferredBackendLabel || "GPU";

  if (hw.recommendation === "gpu") return backendLabel;
  if (hw.recommendation === "gpu-limited") return t("gpuLimited", { backend: backendLabel });
  if (hw.recommendation === "gpu-no-cuda") return t("needCuda");
  if (hw.recommendation === "gpu-no-rocm") return t("needRocm");
  return t("cpuBadge");
}

function getRecommendationDescription(hw) {
  if (hw.recommendation === "gpu") return t("recGpu");
  if (hw.recommendation === "gpu-limited") return t("recGpuLimited");
  if (hw.recommendation === "gpu-no-cuda") return t("recGpuNoCuda");
  if (hw.recommendation === "gpu-no-rocm") return t("recGpuNoRocm");
  return t("recCpu");
}

function shortenCpuModel(model) {
  return model
    .replace(/\(R\)/gi, "")
    .replace(/\(TM\)/gi, "")
    .replace(/CPU\s*/gi, "")
    .replace(/Processor/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ========== Auto Model Selection ========== */

function autoSelectSTTModel(hw, availableModels) {
  if (!availableModels || availableModels.length === 0) return null;

  const totalRAM = hw.memory.totalMB;
  const freeRAM = hw.memory.freeMB;
  const bestVram = hw.accelerators?.bestVramMB || 0;

  const priority = [
    { model: "ggml-large-v3-turbo-q5_0.bin", minRAM: 4096 },
    { model: "ggml-large-v3-turbo-q8_0.bin", minRAM: 5120 },
    { model: "ggml-large-v3-q5_0.bin", minRAM: 8192 },
    { model: "ggml-medium-q5_0.bin", minRAM: 4096 },
    { model: "ggml-small.bin", minRAM: 2048 },
    { model: "ggml-small-q5_1.bin", minRAM: 1024 },
  ];

  if (totalRAM >= 16384 && (bestVram >= 4096 || totalRAM >= 32768)) {
    const highQuality = availableModels.find((m) => m === "ggml-large-v3-turbo-q5_0.bin");
    if (highQuality) return highQuality;
  }

  for (const entry of priority) {
    if (freeRAM >= entry.minRAM && availableModels.includes(entry.model)) {
      return entry.model;
    }
  }

  return availableModels[0];
}

function autoSelectLLMModel(hw, availableModels) {
  if (!availableModels || availableModels.length === 0) return null;

  const totalRAM = hw.memory.totalMB;
  const freeRAM = hw.memory.freeMB;

  const priority = [
    { model: "qwen3:4b-instruct", minRAM: 6144 },
    { model: "qwen2.5:3b-instruct", minRAM: 4096 },
    { model: "phi4-mini", minRAM: 5120 },
    { model: "ministral-3:3b", minRAM: 4096 },
    { model: "ibm/granite4:micro-h", minRAM: 3072 },
    { model: "qwen2.5:1.5b-instruct", minRAM: 2048 },
  ];

  if (totalRAM >= 16384) {
    const best = availableModels.find((m) => m === "qwen3:4b-instruct");
    if (best) return best;
  }

  for (const entry of priority) {
    if (freeRAM >= entry.minRAM && availableModels.includes(entry.model)) {
      return entry.model;
    }
  }

  return availableModels[0];
}

async function loadHardwareInfo() {
  try {
    const hw = await window.desktopSTT.getHardwareInfo();

    hwCpuModelEl.textContent = shortenCpuModel(hw.cpu.model);
    hwCpuCoresEl.textContent = t("cpuCoresThreads", {
      cores: hw.cpu.physicalCores,
      threads: hw.cpu.threads,
    });

    const usedMB = hw.memory.totalMB - hw.memory.freeMB;
    const usedPct = Math.round((usedMB / hw.memory.totalMB) * 100);
    hwMemTotalEl.textContent = `${formatMemory(usedMB)} / ${formatMemory(hw.memory.totalMB)}`;
    hwMemBarFillEl.style.width = `${usedPct}%`;
    if (usedPct > 85) {
      hwMemBarFillEl.classList.add("high");
    } else {
      hwMemBarFillEl.classList.remove("high");
    }

    if (hw.gpus.length > 0) {
      const primary = pickPrimaryGPU(hw.gpus);
      hwGpuNameEl.textContent = primary.name;
      const meta = [];
      if (primary.vramMB && primary.vramMB > 0) {
        meta.push(`VRAM: ${formatMemory(primary.vramMB)}`);
      }
      if (hw.gpus.length > 1) meta.push(t("detectedGpuCount", { count: hw.gpus.length }));
      hwGpuVramEl.textContent = meta.join(" · ");
    } else {
      hwGpuNameEl.textContent = t("noGpuInfo");
      hwGpuVramEl.textContent = "";
    }

    const accel = getAccelerationInfo(hw);
    hwAccelLabelEl.textContent = accel.label;
    hwCudaStatusEl.textContent = accel.status;
    hwCudaDetailEl.textContent = accel.detail;
    hwCudaIconEl.classList.toggle("unavailable", !accel.available);

    hwRecommendBadgeEl.textContent = getRecommendationBadgeText(hw);
    hwRecommendBadgeEl.className = "hw-recommend-badge " + (
      hw.recommendation === "gpu" ? "gpu" :
      hw.recommendation === "cpu" ? "cpu" : "warning"
    );

    const useAcceleratorIcon =
      hw.recommendation === "gpu" || hw.recommendation === "gpu-limited";
    const recIconSvg =
      useAcceleratorIcon
        ? `<svg class="hw-recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
        : hw.recommendation === "cpu"
        ? `<svg class="hw-recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>`
        : `<svg class="hw-recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    hwRecommendationEl.innerHTML = recIconSvg + `<span>${getRecommendationDescription(hw)}</span>`;
    hwRecommendationEl.className = "hw-recommendation visible " + (
      useAcceleratorIcon ? "gpu" :
      hw.recommendation === "cpu" ? "cpu" : "warning"
    );

    if (state.runtime.sttModels.length > 0) {
      const bestSTT = autoSelectSTTModel(hw, state.runtime.sttModels);
      if (bestSTT && bestSTT !== state.runtime.sttModelName) {
        await handleSTTModelChange(bestSTT);
      }
    }

    if (state.runtime.llmModels.length > 0) {
      const bestLLM = autoSelectLLMModel(hw, state.runtime.llmModels);
      if (bestLLM && bestLLM !== state.runtime.llmModelName) {
        await handleLLMModelChange(bestLLM);
      }
    }
  } catch (error) {
    hwCpuModelEl.textContent = t("detectFailed");
    hwMemTotalEl.textContent = t("detectFailed");
    hwGpuNameEl.textContent = t("detectFailed");
    hwCudaStatusEl.textContent = t("detectFailed");
  }
}

/* ========== Runtime ========== */

async function refreshRuntime() {
  setEngineStatus("stt", "pending");
  setEngineStatus("llm", "pending");
  setDropdownDisabled(llmModelDropdownEl, true);
  setDropdownDisabled(ttsModelDropdownEl, true);
  setDropdownDisabled(ttsSpeakerDropdownEl, true);

  try {
    const runtime = await window.desktopSTT.getRuntimeInfo();
    const transcription = runtime.transcription || {};
    const whisper = transcription.whisper || transcription;
    const parakeet = transcription.parakeet || {};
    const activeSTTEngine = STT_ENGINE_OPTIONS.includes(transcription.engineName)
      ? transcription.engineName
      : "whisper";
    const llm = runtime.llm || {};
    const sttReady = Boolean(transcription.runtimeReady);
    const llmReady = Boolean(llm.runtimeReady);

    state.runtime.managedDataRoot = runtime.managedDataRoot || "";
    state.runtime.sttReady = sttReady;
    state.runtime.sttEngineName = activeSTTEngine;
    state.sttEngineView = activeSTTEngine;
    state.runtime.sttWhisperCliExists = Boolean(whisper.whisperCliExists);
    state.runtime.sttModelExists = Boolean(whisper.modelExists);
    state.runtime.sttRuntimeLocation = whisper.runtimeLocation || "";
    state.runtime.sttModelName = whisper.modelName || "";
    state.runtime.sttModels = whisper.availableModels || [];
    state.runtime.sttParakeetReady = Boolean(parakeet.runtimeReady);
    state.runtime.sttParakeetDependencyReady = Boolean(parakeet.dependencyReady);
    state.runtime.sttParakeetModelExists = Boolean(parakeet.modelExists);
    state.runtime.sttParakeetBackend = parakeet.backend || "";
    state.runtime.sttParakeetModelName = parakeet.modelName || "";
    state.runtime.sttParakeetModels = parakeet.availableModels || [];
    applyLLMRuntime(llm);
    applyLocalTTSRuntime(runtime.tts || {});
    if (managedDataPathEl) {
      managedDataPathEl.textContent = state.runtime.managedDataRoot || t("managedDataChecking");
    }

    let sttStatus = "error";
    let sttStatusLabel = t("statusError");
    if (activeSTTEngine === "parakeet") {
      if (state.runtime.sttParakeetReady) {
        sttStatus = "ready";
        sttStatusLabel = getModelMeta(state.runtime.sttParakeetModelName, "parakeet").label;
      } else if (state.runtime.sttParakeetDependencyReady) {
        sttStatus = "pending";
        sttStatusLabel = t("setupStepModel");
      }
    } else if (state.runtime.sttWhisperCliExists && state.runtime.sttModelExists) {
      sttStatus = state.runtime.sttRuntimeLocation === "portable" ? "ready" : "pending";
      sttStatusLabel =
        state.runtime.sttRuntimeLocation === "portable"
          ? getModelMeta(state.runtime.sttModelName, "stt").label
          : t("systemRuntime");
    } else if (state.runtime.sttWhisperCliExists) {
      sttStatus = "pending";
      sttStatusLabel =
        state.runtime.sttRuntimeLocation === "portable" ? t("projectRuntime") : t("systemRuntime");
    }

    setEngineStatus(
      "stt",
      sttStatus,
      sttStatusLabel
    );
    setEngineStatus(
      "llm",
      llmReady
        ? state.runtime.llmRuntimeLocation === "portable"
          ? "ready"
          : "pending"
        : "error",
      llmReady
        ? state.runtime.llmRuntimeLocation === "portable"
          ? getModelMeta(state.runtime.llmModelName, "llm").label
          : t("externalRuntime")
        : t("statusError")
    );

    renderWhisperModelCards();
    renderParakeetModelCards();
    populateDropdown(llmModelDropdownEl, getAllOptionsForKind("llm"), state.runtime.llmModelName, "llm");
    renderLLMEnginePanel();
    renderTTSEnginePanel();
  } catch (error) {
    state.runtime.sttReady = false;
    state.runtime.sttEngineName = "whisper";
    state.runtime.llmReady = false;
    state.runtime.sttWhisperCliExists = false;
    state.runtime.sttModelExists = false;
    state.runtime.sttRuntimeLocation = "";
    state.runtime.sttParakeetReady = false;
    state.runtime.sttParakeetDependencyReady = false;
    state.runtime.sttParakeetModelExists = false;
    state.runtime.sttParakeetBackend = "";
    state.runtime.sttParakeetModelName = "";
    state.runtime.sttParakeetModels = [];
    state.runtime.llmOllamaExists = false;
    state.runtime.llmModelExists = false;
    state.runtime.llmRuntimeLocation = "";
    state.runtime.llmModelDir = "";
    applyLocalTTSRuntime({ runtimeReady: false });
    setEngineStatus("stt", "error");
    setEngineStatus("llm", "error");
    setJobStatus(t("checkFailed", { message: error.message }), true);
  }

  updateRuntimeHelpTexts();
  updateRuntimeDownloadButtons();
  updateButtons();
}

async function handleCleanAllAssets() {
  if (
    state.assetCleanupInProgress ||
    state.runtimeDownloadTarget ||
    state.runtimeDeleteTarget ||
    state.modelDownloadTarget ||
    state.modelDeleteTarget
  ) {
    return;
  }

  const managedRoot = state.runtime.managedDataRoot || ".speakspace-data";
  const confirmed = window.confirm(
    t("cleanAllAssetsConfirm", {
      path: managedRoot,
    })
  );
  if (!confirmed) {
    return;
  }

  state.assetCleanupInProgress = true;
  updateRuntimeDownloadButtons();
  setJobStatus(t("cleaningAssetsTarget"));

  try {
    stopTTS();
    await window.desktopSTT.cleanAllAssets();
    await refreshRuntime();
    setJobStatus(t("cleanAllAssetsSuccess"));
  } catch (error) {
    setJobStatus(t("cleanAllAssetsFailed", { message: error.message }), true);
  } finally {
    state.assetCleanupInProgress = false;
    updateRuntimeDownloadButtons();
  }
}

async function handleRuntimeDownload(target) {
  if (!target || state.runtimeDownloadTarget || state.runtimeDeleteTarget || state.modelDeleteTarget) {
    return;
  }

  const targetLabel =
    target === "stt" ? t("sttTitle") : target === "llm" ? t("llmTitle") : t("ttsTitle");

  state.runtimeDownloadTarget = target;
  updateRuntimeDownloadButtons();
  setJobStatus(t("downloadingTarget", { target: targetLabel }));

  try {
    await window.desktopSTT.downloadRuntime(target);
    await refreshRuntime();
    setJobStatus(t("downloadSucceeded", { target: targetLabel }));
  } catch (error) {
    setJobStatus(t("downloadFailed", { target: targetLabel, message: error.message }), true);
  } finally {
    state.runtimeDownloadTarget = "";
    updateRuntimeDownloadButtons();
  }
}

async function handleRuntimeDelete(target) {
  if (!target || state.runtimeDownloadTarget || state.runtimeDeleteTarget || state.modelDownloadTarget || state.modelDeleteTarget) {
    return;
  }

  const targetLabel =
    target === "stt"
      ? t("deleteSttRuntime")
      : target === "llm"
      ? t("deleteLlmRuntime")
      : t("deleteTtsRuntime");

  state.runtimeDeleteTarget = target;
  updateRuntimeDownloadButtons();
  setJobStatus(t("deletingTarget", { target: targetLabel }));

  try {
    stopTTS();
    await window.desktopSTT.deleteRuntime(target);
    await refreshRuntime();
    setJobStatus(t("deleteSucceeded", { target: targetLabel }));
  } catch (error) {
    setJobStatus(t("deleteFailed", { target: targetLabel, message: error.message }), true);
  } finally {
    state.runtimeDeleteTarget = "";
    updateRuntimeDownloadButtons();
  }
}

async function handleSTTModelChange(modelName) {
  if (!modelName || modelName === state.runtime.sttModelName) return;

  try {
    await window.desktopSTT.setSTTModel("whisper", modelName);
    state.runtime.sttModelName = modelName;
    if (state.runtime.sttEngineName === "whisper") {
      setEngineStatus("stt", "ready", getModelMeta(modelName, "stt").label);
    }
    renderWhisperModelCards();
  } catch (error) {
    setJobStatus(t("switchSttFailed", { message: error.message }), true);
  }
}

async function handleParakeetModelChange(modelName) {
  if (!modelName || modelName === state.runtime.sttParakeetModelName) return;

  try {
    await window.desktopSTT.setSTTModel("parakeet", modelName);
    state.runtime.sttParakeetModelName = modelName;
    if (!state.runtime.sttParakeetModels.includes(modelName)) {
      state.runtime.sttParakeetModels = [...state.runtime.sttParakeetModels, modelName];
    }
    if (state.runtime.sttEngineName === "parakeet") {
      state.runtime.sttReady = true;
      state.runtime.sttParakeetReady = true;
      state.runtime.sttParakeetModelExists = true;
      setEngineStatus("stt", "ready", getModelMeta(modelName, "parakeet").label);
    }
    renderParakeetModelCards();
  } catch (error) {
    setJobStatus(t("switchSttFailed", { message: error.message }), true);
  }
}

async function handleLLMModelChange(modelName) {
  if (!modelName || modelName === state.runtime.llmModelName) return;

  try {
    const llm = await window.desktopSTT.setLLMModel(modelName);
    applyLLMRuntime(llm);
    setEngineStatus(
      "llm",
      state.runtime.llmReady
        ? state.runtime.llmRuntimeLocation === "portable"
          ? "ready"
          : "pending"
        : "error",
      state.runtime.llmReady
        ? state.runtime.llmRuntimeLocation === "portable"
          ? getModelMeta(state.runtime.llmModelName, "llm").label
          : t("externalRuntime")
        : t("statusError")
    );
    populateDropdown(llmModelDropdownEl, getAllOptionsForKind("llm"), state.runtime.llmModelName, "llm");
    renderLLMEnginePanel();
    updateRuntimeHelpTexts();
    updateButtons();
  } catch (error) {
    setJobStatus(t("switchLlmFailed", { message: error.message }), true);
  }
}

async function handleTTSModelChange(modelName) {
  if (!modelName) {
    populateDropdown(ttsModelDropdownEl, getAllOptionsForKind("tts-model"), "", "tts-model");
    updateTTSUI();
    return;
  }

  const targetModel = getAllOptionsForKind("tts-model").includes(modelName)
    ? modelName
    : state.tts.localModelName || "kokoro-multi-lang-v1_0";

  setDropdownValue(ttsModelDropdownEl, targetModel, "tts-model");
  renderDropdownMenu(ttsModelDropdownEl, getAllOptionsForKind("tts-model"), targetModel, "tts-model");
  renderTTSModelCards();
  updateTTSUI();
}

async function handleTTSSpeakerChange(speakerName) {
  if (!speakerName) return;

  const targetSpeaker = state.tts.speakers.find((speaker) => speaker.name === speakerName);
  if (!targetSpeaker || targetSpeaker.id === state.tts.localSpeakerId) return;

  state.tts.localSpeakerId = targetSpeaker.id;
  persistTTSSpeakerId(targetSpeaker.id);
  setDropdownValue(ttsSpeakerDropdownEl, targetSpeaker.name, "tts");
  renderDropdownMenu(
    ttsSpeakerDropdownEl,
    state.tts.speakers.map((speaker) => speaker.name),
    targetSpeaker.name,
    "tts"
  );
  updateTTSUI();
  setTemporaryJobStatus(
    t("switchedVoice", {
      voice: getModelMeta(targetSpeaker.name, "tts").label.replace("（默认）", "").replace(" (Default)", ""),
    }),
    false,
    1800
  );
}

async function handleLanguageChange(language) {
  if (!LANGUAGE_OPTIONS.includes(language) || language === state.uiLanguage) {
    return;
  }

  state.uiLanguage = language;
  persistAppLanguage(language);
  applyLanguageUI();

  if (state.currentNoteId) {
    try {
      const note = await window.desktopSTT.getNote(state.currentNoteId);
      state.noteQaMessages = note.conversations || [];
      renderNoteDetail(note);
    } catch (_error) {
      // Ignore detail refresh errors; the current view still updates globally.
    }
  }

  updateButtons();
}

/* ========== Assistant Chat ========== */

function maybeAutoplayAssistantMessage(text, sourceKey) {
  if (!state.tts.autoplayEnabled) {
    return;
  }

  void requestTTSPlayback(text, {
    reason: "autoplay",
    source: sourceKey,
  });
}

async function requestAssistantReply() {
  if (!state.runtime.llmReady) {
    throw new Error(t("llmNotReady"));
  }

  setJobStatus(t("thinking"));

  const result = await window.desktopSTT.chatWithLocalLLM(buildConversationMessages());
  state.lastAssistantText = result.content;

  const perfMeta = result.llmDurationMs
    ? `${result.modelName} · ${formatMs(result.llmDurationMs)}`
    : result.modelName;

  const assistantMessage = addMessage("assistant", result.content, perfMeta);
  setJobStatus("");

  maybeAutoplayAssistantMessage(result.content, getAssistantMessageSourceKey(assistantMessage));

  if (result.llmDurationMs) {
    state.lastPerformance = {
      ...state.lastPerformance,
      llmDurationMs: result.llmDurationMs,
      llmModel: result.modelName,
    };
  }
}

async function sendUserMessage(content, meta) {
  const cleanContent = content.trim();
  if (!cleanContent) {
    return;
  }

  stopTTS();
  state.isWorking = true;
  updateButtons();

  try {
    addMessage("user", cleanContent, meta);
    await requestAssistantReply();
  } catch (error) {
    setJobStatus(t("failed", { message: error.message }), true);
  } finally {
    state.isWorking = false;
    updateButtons();
  }
}

async function transcribeAudioInput(filePath, sourceLabel) {
  setJobStatus(t("transcribing"));
  const transcription = await window.desktopSTT.transcribeAudio(filePath);
  const transcript = (transcription.text || "").trim();

  if (!transcript) {
    throw new Error(t("transcriptionEmpty"));
  }

  state.selectedFile = filePath;
  state.lastTranscript = transcript;
  state.lastAudioPath = filePath;
  updateSelectedFileMeta();

  if (transcription.sttDurationMs) {
    state.lastPerformance = {
      ...state.lastPerformance,
      sttDurationMs: transcription.sttDurationMs,
      sttModel: transcription.modelName,
    };
  }

  const sttMeta = transcription.sttDurationMs
    ? `${sourceLabel} · ${t("transcribeTag")} · ${formatMs(transcription.sttDurationMs)}`
    : `${sourceLabel} · ${t("transcribeTag")}`;

  return {
    transcript,
    sttMeta,
    transcription,
  };
}

async function transcribeAndSend(filePath, sourceLabel) {
  if (!state.runtime.sttReady) {
    setJobStatus(t("sttNotReady"), true);
    return;
  }

  state.isWorking = true;
  updateButtons();

  try {
    const { transcript, sttMeta } = await transcribeAudioInput(filePath, sourceLabel);
    addMessage("user", transcript, sttMeta);
    await requestAssistantReply();
  } catch (error) {
    setJobStatus(t("failed", { message: error.message }), true);
  } finally {
    state.isWorking = false;
    updateButtons();
  }
}

async function handlePickFile() {
  const filePath = await window.desktopSTT.pickAudioFile();
  if (!filePath) {
    return;
  }

  if (state.currentView === "detail") {
    await transcribeAndAskAboutNote(filePath, t("importedFile"));
    return;
  }

  await transcribeAndSend(filePath, t("importedFile"));
}

async function handleSend() {
  const text = state.draft.trim();
  if (!text) {
    return;
  }

  state.draft = "";
  promptInputEl.value = "";
  state.lastTranscript = text;
  state.lastAudioPath = "";
  autoResizePrompt();
  await sendUserMessage(text, t("typedInput"));
}

/* ========== Save as Note ========== */

async function handleSaveAsNote() {
  if (!state.lastTranscript && !state.lastAssistantText) {
    return;
  }

  state.isWorking = true;
  updateButtons();
  setJobStatus(t("generatingNote"));

  try {
    const textToProcess = state.lastTranscript || state.lastAssistantText;
    const result = await window.desktopSTT.processStructured(textToProcess);

    const noteData = {
      title: result.structured.title,
      audioPath: state.lastAudioPath || null,
      transcript: state.lastTranscript || "",
      structured: result.structured,
      tags: result.structured.tags || [],
      folder: "default",
      performance: {
        ...state.lastPerformance,
        structuringDurationMs: result.llmDurationMs,
        structuringModel: result.modelName,
      },
      conversations: [],
    };

    const savedNote = await window.desktopSTT.createNote(noteData);
    setJobStatus(t("saved", { title: savedNote.title }));
    setTimeout(() => setJobStatus(""), 3000);
    await loadNotesList(noteSearchInput.value.trim());
  } catch (error) {
    setJobStatus(t("saveFailed", { message: error.message }), true);
  } finally {
    state.isWorking = false;
    updateButtons();
  }
}

/* ========== Recording ========== */

async function handleStartRecording() {
  if (state.isRecording || state.isWorking || !state.runtime.sttReady) {
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false,
    });

    audioContext = new AudioContext();
    recordingSampleRate = audioContext.sampleRate;
    recordingBuffers = [];
    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);

    processorNode.onaudioprocess = (event) => {
      if (!state.isRecording) {
        return;
      }

      recordingBuffers.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };

    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);

    state.isRecording = true;
    state.recordingSeconds = 0;
    updateRecordingMeta();
    setJobStatus(t("recording"));
    recordingTimerId = window.setInterval(() => {
      state.recordingSeconds += 1;
      updateRecordingMeta();
    }, 1000);
    updateButtons();
  } catch (error) {
    [recordingMetaEl, noteRecordingMetaEl].forEach((element) => {
      if (!element) return;
      element.classList.remove("hidden");
      element.classList.add("error");
      element.textContent = t("recordingStartFailed", { message: error.message });
    });
  }
}

async function cleanupRecording() {
  if (recordingTimerId) {
    window.clearInterval(recordingTimerId);
    recordingTimerId = null;
  }

  if (processorNode) {
    processorNode.disconnect();
    processorNode.onaudioprocess = null;
    processorNode = null;
  }

  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    await audioContext.close();
    audioContext = null;
  }
}

async function handleStopRecording() {
  if (!state.isRecording) {
    return;
  }

  state.isRecording = false;
  updateRecordingMeta();
  setJobStatus(t("processingRecording"));
  updateButtons();

  try {
    const samples = mergeFloat32Arrays(recordingBuffers);
    recordingBuffers = [];

    if (samples.length === 0) {
      throw new Error(t("recordingEmpty"));
    }

    const wavBuffer = encodeWav(samples, recordingSampleRate);
    await cleanupRecording();

    const savedRecording = await window.desktopSTT.saveRecording(wavBuffer);
    if (state.currentView === "detail") {
      await transcribeAndAskAboutNote(savedRecording.filePath, t("microphoneRecording"));
    } else {
      await transcribeAndSend(savedRecording.filePath, t("microphoneRecording"));
    }
  } catch (error) {
    await cleanupRecording();
    recordingBuffers = [];
    [recordingMetaEl, noteRecordingMetaEl].forEach((element) => {
      if (!element) return;
      element.classList.remove("hidden");
      element.classList.add("error");
      element.textContent = t("recordingFailed");
    });
    setJobStatus(t("recordingFailedDetail", { message: error.message }), true);
    updateButtons();
  }
}

async function handleRecordToggle() {
  if (state.isRecording) {
    await handleStopRecording();
    return;
  }

  await handleStartRecording();
}

async function handleCopy() {
  if (!state.lastAssistantText) {
    return;
  }

  await copyTextToClipboard(state.lastAssistantText);
}

/* ========== Notes Library ========== */

async function loadNotesList(searchQuery) {
  try {
    const filters = searchQuery ? { search: searchQuery } : {};
    state.notes = await window.desktopSTT.listNotes(filters);
    renderNotesList();
    await refreshTrashCount();
  } catch (error) {
    notesListEl.innerHTML = `<div class="notes-empty"><p>${escapeHtml(
      t("notesLoadFailed", { message: error.message })
    )}</p></div>`;
  }
}

function getLocale() {
  return state.uiLanguage === "zh-CN" ? "zh-CN" : "en-US";
}

function formatDateTime(value, options = {}) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(getLocale(), options);
}

function getNotePreviewText(note) {
  return note.structured?.summary || note.transcript?.slice(0, 160) || "";
}

function updateTrashCount(count) {
  const safeCount = Number.isFinite(count) ? count : 0;
  if (trashCountEl) {
    trashCountEl.textContent = String(safeCount);
  }
  if (trashListCountEl) {
    trashListCountEl.textContent = String(safeCount);
  }
}

async function refreshTrashCount() {
  try {
    const info = await window.desktopSTT.getStoreInfo();
    updateTrashCount(info.trashCount || 0);
  } catch (_error) {
    updateTrashCount(state.deletedNotes.length);
  }
}

function setTrashStatus(text, isError = false, durationMs = 0) {
  if (!trashStatusEl) return;
  trashStatusEl.textContent = text || "";
  trashStatusEl.classList.toggle("error", Boolean(isError));
  trashStatusEl.classList.toggle("visible", Boolean(text));

  if (durationMs > 0 && text) {
    window.setTimeout(() => {
      if (trashStatusEl.textContent === text) {
        trashStatusEl.textContent = "";
        trashStatusEl.classList.remove("visible", "error");
      }
    }, durationMs);
  }
}

async function loadTrashNotes() {
  try {
    state.deletedNotes = await window.desktopSTT.listDeletedNotes();
    updateTrashCount(state.deletedNotes.length);

    if (
      state.deletedNotes.length > 0 &&
      !state.deletedNotes.some((note) => note.id === state.currentTrashNoteId)
    ) {
      state.currentTrashNoteId = state.deletedNotes[0].id;
    }

    if (state.deletedNotes.length === 0) {
      state.currentTrashNoteId = null;
    }

    renderTrashList();
    renderTrashPreview();
  } catch (error) {
    setTrashStatus(t("trashLoadFailed", { message: error.message }), true);
  }
}

async function openTrashOverlay() {
  stopTTS();
  trashOverlay.classList.remove("hidden");
  setTrashStatus("");
  await loadTrashNotes();
}

function closeTrashOverlay() {
  trashOverlay.classList.add("hidden");
}

function renderTrashList() {
  if (!trashListEl) return;
  trashListEl.innerHTML = "";
  updateTrashCount(state.deletedNotes.length);

  if (state.deletedNotes.length === 0) {
    trashListEl.innerHTML = `
      <div class="notes-empty">
        <h3>${t("trashEmpty")}</h3>
        <p>${t("trashEmptyDesc")}</p>
      </div>
    `;
    return;
  }

  for (const note of state.deletedNotes) {
    const card = document.createElement("button");
    card.className = "trash-note-card";
    card.type = "button";
    if (note.id === state.currentTrashNoteId) {
      card.classList.add("active");
    }
    card.dataset.noteId = note.id;

    const title = document.createElement("h3");
    title.className = "note-card-title";
    title.textContent = note.title || "Untitled";

    const summary = document.createElement("p");
    summary.className = "note-card-summary";
    summary.textContent = getNotePreviewText(note);

    const deletedAt = document.createElement("span");
    deletedAt.className = "note-card-date";
    deletedAt.textContent = `${t("deletedAt")}: ${formatDateTime(note.deletedAt, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    card.append(title, summary, deletedAt);
    card.addEventListener("click", () => {
      state.currentTrashNoteId = note.id;
      renderTrashList();
      renderTrashPreview();
    });
    trashListEl.append(card);
  }
}

function renderTrashPreview() {
  if (!trashPreviewEl) return;
  const note = state.deletedNotes.find((item) => item.id === state.currentTrashNoteId);

  if (!note) {
    trashPreviewEl.innerHTML = `
      <div class="trash-preview-empty">
        <h3>${state.deletedNotes.length === 0 ? t("trashEmpty") : t("trashPreviewEmpty")}</h3>
        <p>${state.deletedNotes.length === 0 ? t("trashEmptyDesc") : ""}</p>
      </div>
    `;
    return;
  }

  const tags = Array.isArray(note.tags) ? note.tags : [];
  const perf = note.performance || {};
  const perfItems = [];
  if (perf.sttDurationMs) perfItems.push(`STT: ${formatMs(perf.sttDurationMs)}`);
  if (perf.llmDurationMs) perfItems.push(`LLM: ${formatMs(perf.llmDurationMs)}`);
  if (perf.structuringDurationMs) perfItems.push(`${t("structuring")}: ${formatMs(perf.structuringDurationMs)}`);

  trashPreviewEl.innerHTML = `
    <div class="trash-preview-header">
      <div>
        <h3>${escapeHtml(note.title || "Untitled")}</h3>
        <div class="note-meta-row">
          <span class="note-date">${t("deletedAt")}: ${escapeHtml(formatDateTime(note.deletedAt))}</span>
          <span class="note-date">${t("createdAt")}: ${escapeHtml(formatDateTime(note.createdAt))}</span>
          ${tags.map((tag) => `<span class="note-tag">#${escapeHtml(tag)}</span>`).join("")}
        </div>
        ${perfItems.length > 0 ? `<div class="note-perf">${perfItems.join(" · ")}</div>` : ""}
      </div>
      <div class="trash-preview-actions">
        <button id="trashRestoreBtn" class="ghost-btn accent-btn" type="button">${t("restoreNote")}</button>
        <button id="trashPermanentDeleteBtn" class="ghost-btn danger-btn" type="button">${t("deleteForever")}</button>
      </div>
    </div>

    ${note.structured?.summary ? `
      <div class="note-section">
        <h4>${t("summary")}</h4>
        <p>${escapeHtml(note.structured.summary)}</p>
      </div>
    ` : ""}

    ${note.structured?.keyPoints?.length > 0 ? `
      <div class="note-section">
        <h4>${t("keyPoints")}</h4>
        <ul>${note.structured.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </div>
    ` : ""}

    ${note.structured?.actionItems?.length > 0 ? `
      <div class="note-section">
        <h4>${t("actionItems")}</h4>
        <ul class="action-items">${note.structured.actionItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    ` : ""}

    ${note.transcript ? `
      <div class="note-section transcript-section">
        <h4>${t("originalTranscript")}</h4>
        <p class="transcript-text">${escapeHtml(note.transcript)}</p>
      </div>
    ` : ""}
  `;

  document.querySelector("#trashRestoreBtn")?.addEventListener("click", handleRestoreTrashNote);
  document
    .querySelector("#trashPermanentDeleteBtn")
    ?.addEventListener("click", handlePermanentDeleteTrashNote);
}

async function handleRestoreTrashNote() {
  if (!state.currentTrashNoteId) return;

  try {
    await window.desktopSTT.restoreNote(state.currentTrashNoteId);
    state.currentTrashNoteId = "";
    await loadTrashNotes();
    await loadNotesList(noteSearchInput.value.trim());
    setTrashStatus(t("noteRestored"), false, 2000);
  } catch (error) {
    setTrashStatus(t("operationFailed", { message: error.message }), true);
  }
}

async function handlePermanentDeleteTrashNote() {
  if (!state.currentTrashNoteId) return;
  if (!window.confirm(t("deleteForeverConfirm"))) return;

  try {
    await window.desktopSTT.permanentlyDeleteNote(state.currentTrashNoteId);
    state.currentTrashNoteId = "";
    await loadTrashNotes();
    await loadNotesList(noteSearchInput.value.trim());
    setTrashStatus(t("noteDeletedForever"), false, 2000);
  } catch (error) {
    setTrashStatus(t("operationFailed", { message: error.message }), true);
  }
}

function highlightActiveNote() {
  notesListEl.querySelectorAll(".note-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.noteId === state.currentNoteId);
  });
}

function renderNotesList() {
  notesListEl.innerHTML = "";
  notesCountEl.textContent = String(state.notes.length);

  if (state.notes.length === 0) {
    notesListEl.innerHTML = `
      <div class="notes-empty">
        <h3>${t("noNotes")}</h3>
        <p>${t("noNotesDesc").replace(/\n/g, "<br/>")}</p>
      </div>
    `;
    return;
  }

  for (const note of state.notes) {
    const card = document.createElement("div");
    card.className = "note-card";
    if (note.id === state.currentNoteId) {
      card.classList.add("active");
    }
    card.dataset.noteId = note.id;

    const title = document.createElement("h3");
    title.className = "note-card-title";
    title.textContent = note.title || "Untitled";

    const summary = document.createElement("p");
    summary.className = "note-card-summary";
    summary.textContent = note.structured?.summary || note.transcript?.slice(0, 100) || "";

    const footer = document.createElement("div");
    footer.className = "note-card-footer";

    const date = document.createElement("span");
    date.className = "note-card-date";
    date.textContent = new Date(note.createdAt).toLocaleString(state.uiLanguage === "zh-CN" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const tags = document.createElement("span");
    tags.className = "note-card-tags";
    tags.textContent = (note.tags || []).slice(0, 3).map((t) => `#${t}`).join(" ");

    footer.append(date, tags);
    card.append(title, summary, footer);
    notesListEl.append(card);

    card.addEventListener("click", () => openNoteDetail(note.id));
  }
}

async function openNoteDetail(noteId) {
  try {
    const note = await window.desktopSTT.getNote(noteId);
    state.currentNoteId = noteId;
    state.noteQaMessages = note.conversations || [];
    renderNoteDetail(note);
    switchView("detail");
    highlightActiveNote();
  } catch (error) {
    setJobStatus(t("openNoteFailed", { message: error.message }), true);
  }
}

function renderNoteDetail(note) {
  const perf = note.performance || {};
  const perfItems = [];
  if (perf.sttDurationMs) perfItems.push(`STT: ${formatMs(perf.sttDurationMs)}`);
  if (perf.llmDurationMs) perfItems.push(`LLM: ${formatMs(perf.llmDurationMs)}`);
  if (perf.structuringDurationMs) perfItems.push(`${t("structuring")}: ${formatMs(perf.structuringDurationMs)}`);

  noteDetailContent.innerHTML = `
    <div class="note-header">
      <h2 class="note-title">${escapeHtml(note.title)}</h2>
      <div class="note-meta-row">
        <span class="note-date">${new Date(note.createdAt).toLocaleString(state.uiLanguage === "zh-CN" ? "zh-CN" : "en-US")}</span>
        ${note.audioPath ? `<span class="note-audio-badge">${t("hasAudio")}</span>` : ""}
        ${note.tags.map((t) => `<span class="note-tag">#${escapeHtml(t)}</span>`).join("")}
      </div>
      ${perfItems.length > 0 ? `<div class="note-perf">${perfItems.join(" · ")}</div>` : ""}
    </div>

    ${note.structured ? `
      <div class="note-section">
        <h4>${t("summary")}</h4>
        <p>${escapeHtml(note.structured.summary)}</p>
      </div>

      ${note.structured.keyPoints?.length > 0 ? `
        <div class="note-section">
          <h4>${t("keyPoints")}</h4>
          <ul>${note.structured.keyPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        </div>
      ` : ""}

      ${note.structured.actionItems?.length > 0 ? `
        <div class="note-section">
          <h4>${t("actionItems")}</h4>
          <ul class="action-items">${note.structured.actionItems.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
        </div>
      ` : ""}
    ` : ""}

    ${note.transcript ? `
      <div class="note-section transcript-section">
        <h4>${t("originalTranscript")}</h4>
        <p class="transcript-text">${escapeHtml(note.transcript)}</p>
      </div>
    ` : ""}
  `;

  renderNoteQaMessages();
}

function renderNoteQaMessages() {
  noteQaMessages.innerHTML = "";

  for (let i = 0; i < state.noteQaMessages.length; i++) {
    const msg = state.noteQaMessages[i];
    ensureClientMessageId(msg, "noteqa");

    const wrapper = document.createElement("article");
    wrapper.className = `message ${msg.role}`;
    wrapper.dataset.messageId = msg._uiId;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = msg.role === "assistant" ? "AI" : "ME";

    const body = document.createElement("div");
    body.className = "message-body";

    if (msg.role === "assistant") {
      wrapper.classList.add("has-actions");
      const content = createRichTextContentElement("message-content", msg.content);
      body.append(content, createAssistantActionBar(msg.content, getNoteQaMessageSourceKey(msg)));
    } else {
      const content = document.createElement("p");
      content.className = "message-content";
      content.textContent = msg.content;
      body.append(content);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "qa-delete-btn";
      deleteBtn.type = "button";
      deleteBtn.title = t("deleteQaMessage");
      deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
      const msgIndex = i;
      deleteBtn.addEventListener("click", () => handleDeleteQaMessage(msgIndex));
      wrapper.append(deleteBtn);
    }

    wrapper.append(avatar, body);
    noteQaMessages.append(wrapper);
  }

  if (state.noteQaMessages.length > 0) {
    noteQaMessages.scrollTop = noteQaMessages.scrollHeight;
  }
  updateTTSPlaybackButtons();
}

async function handleNoteQaSend() {
  const question = noteQaInput.value.trim();
  if (!question || !state.currentNoteId) return;

  noteQaInput.value = "";
  autoResizeNoteQaInput();
  updateButtons();
  await sendNoteQaQuestion(question);
}

async function sendNoteQaQuestion(question) {
  const cleanQuestion = String(question || "").trim();
  if (!cleanQuestion || !state.currentNoteId) {
    return;
  }

  stopTTS();
  state.isWorking = true;
  updateButtons();

  const userMessage = { role: "user", content: cleanQuestion };
  ensureClientMessageId(userMessage, "noteqa");
  state.noteQaMessages.push(userMessage);
  renderNoteQaMessages();

  try {
    setJobStatus(t("thinking"));
    const result = await window.desktopSTT.askAboutNote(state.currentNoteId, cleanQuestion);
    const answer = result.answer;
    state.lastAssistantText = answer;

    const assistantMessage = { role: "assistant", content: answer };
    ensureClientMessageId(assistantMessage, "noteqa");
    state.noteQaMessages.push(assistantMessage);
    renderNoteQaMessages();
    setJobStatus("");

    maybeAutoplayAssistantMessage(answer, getNoteQaMessageSourceKey(assistantMessage));

    await window.desktopSTT.appendConversation(state.currentNoteId, {
      role: "user",
      content: cleanQuestion,
    });
    await window.desktopSTT.appendConversation(state.currentNoteId, {
      role: "assistant",
      content: answer,
    });
  } catch (error) {
    setJobStatus(t("failed", { message: error.message }), true);
    state.noteQaMessages.push({
      role: "assistant",
      content: t("errorPrefix", { message: error.message }),
    });
    renderNoteQaMessages();
  } finally {
    state.isWorking = false;
    updateButtons();
  }
}

async function transcribeAndAskAboutNote(filePath, sourceLabel) {
  if (!state.runtime.sttReady) {
    setJobStatus(t("sttNotReady"), true);
    return;
  }
  if (!state.currentNoteId) {
    return;
  }

  state.isWorking = true;
  updateButtons();

  try {
    const { transcript } = await transcribeAudioInput(filePath, sourceLabel);
    await sendNoteQaQuestion(transcript);
  } catch (error) {
    setJobStatus(t("failed", { message: error.message }), true);
    state.isWorking = false;
    updateButtons();
  }
}

async function handleDeleteQaMessage(index) {
  if (!state.currentNoteId) return;

  const msg = state.noteQaMessages[index];
  if (!msg || msg.role !== "user") return;

  const nextMsg = state.noteQaMessages[index + 1];
  const removeCount = nextMsg && nextMsg.role === "assistant" ? 2 : 1;

  state.noteQaMessages.splice(index, removeCount);
  renderNoteQaMessages();

  try {
    const remaining = state.noteQaMessages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date().toISOString(),
    }));
    await window.desktopSTT.updateNote(state.currentNoteId, { conversations: remaining });
  } catch (error) {
    setJobStatus(t("errorPrefix", { message: error.message }), true);
  }
}

async function handleDeleteNote() {
  if (!state.currentNoteId) return;

  try {
    await window.desktopSTT.moveNoteToTrash(state.currentNoteId);
    state.currentNoteId = null;
    state.noteQaMessages = [];
    switchView("assistant");
    await loadNotesList(noteSearchInput.value.trim());
    await refreshTrashCount();
    setTemporaryJobStatus(t("noteMovedToTrash"), false, 2000);
  } catch (error) {
    setJobStatus(t("deleteFailed", { message: error.message }), true);
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderInlineRichText(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>");
}

function renderRichTextToHtml(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let listType = "";
  let codeLines = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push(`<p>${renderInlineRichText(paragraphLines.join(" "))}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) return;
    blocks.push(`<${listType}>${listItems.join("")}</${listType}>`);
    listItems = [];
    listType = "";
  };

  const flushCodeBlock = () => {
    if (!codeLines.length) return;
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(headingMatch[1].length, 6);
      blocks.push(`<h${level}>${renderInlineRichText(headingMatch[2])}</h${level}>`);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${renderInlineRichText(quoteMatch[1])}</blockquote>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(`<li>${renderInlineRichText(orderedMatch[1])}</li>`);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(`<li>${renderInlineRichText(unorderedMatch[1])}</li>`);
      continue;
    }

    if (listType) {
      flushList();
    }

    paragraphLines.push(trimmed);
  }

  if (inCodeBlock) {
    flushCodeBlock();
  }
  flushParagraph();
  flushList();

  return blocks.join("");
}

function createRichTextContentElement(className, text) {
  const element = document.createElement("div");
  element.className = `${className} rich-text`;
  element.innerHTML = renderRichTextToHtml(text);
  return element;
}

/* ========== Event Listeners ========== */

promptInputEl.addEventListener("input", () => {
  state.draft = promptInputEl.value;
  autoResizePrompt();
  updateButtons();
});

textInputEvents.bindTextCompositionTracking(promptInputEl);
promptInputEl.addEventListener("keydown", async (event) => {
  const enterIntent = textInputEvents.getTextInputEnterIntent(event);
  if (enterIntent === "compose") {
    return;
  }

  if (enterIntent === "ignore") {
    event.preventDefault();
    return;
  }

  if (enterIntent === "submit") {
    event.preventDefault();
    await handleSend();
  }
});

pickFileBtn.addEventListener("click", handlePickFile);
recordToggleBtn.addEventListener("click", handleRecordToggle);
noteQaPickFileBtn.addEventListener("click", handlePickFile);
noteQaRecordToggleBtn.addEventListener("click", handleRecordToggle);
refreshRuntimeBtn.addEventListener("click", () => {
  refreshRuntime();
  loadHardwareInfo();
});
cleanAllAssetsBtn.addEventListener("click", () => {
  handleCleanAllAssets();
});
copyBtn.addEventListener("click", handleCopy);
saveAsNoteBtn.addEventListener("click", handleSaveAsNote);
sendBtn.addEventListener("click", handleSend);

initDropdown(llmModelDropdownEl, "llm", handleLLMModelChange);
initDropdown(ttsModelDropdownEl, "tts-model", handleTTSModelChange);
initDropdown(languageDropdownEl, "language", handleLanguageChange);
initDropdown(ttsSpeakerDropdownEl, "tts", handleTTSSpeakerChange);
sttDownloadBtn.addEventListener("click", () => handleRuntimeDownload("stt"));
sttDeleteBtn.addEventListener("click", () => handleRuntimeDelete("stt"));
llmDownloadBtn.addEventListener("click", () => handleRuntimeDownload("llm"));
llmDeleteBtn.addEventListener("click", () => handleRuntimeDelete("llm"));
ttsDownloadBtn.addEventListener("click", () => handleRuntimeDownload("tts"));
ttsDeleteBtn.addEventListener("click", () => handleRuntimeDelete("tts"));

noteSearchInput.addEventListener("input", () => {
  loadNotesList(noteSearchInput.value.trim());
});

backToNotesBtn.addEventListener("click", () => switchView("assistant"));
deleteNoteBtn.addEventListener("click", handleDeleteNote);
noteQaSendBtn.addEventListener("click", handleNoteQaSend);

noteQaInput.addEventListener("input", () => {
  autoResizeNoteQaInput();
  updateButtons();
});

document.querySelector("#themeToggleBtn").addEventListener("click", toggleTheme);

textInputEvents.bindTextCompositionTracking(noteQaInput);
noteQaInput.addEventListener("keydown", async (event) => {
  const enterIntent = textInputEvents.getTextInputEnterIntent(event);
  if (enterIntent === "compose") {
    return;
  }

  if (enterIntent === "ignore") {
    event.preventDefault();
    return;
  }

  if (enterIntent === "submit") {
    event.preventDefault();
    await handleNoteQaSend();
  }
});

/* ========== Init ========== */

initSidebarState();
state.settingsCategory = getStoredSettingsCategory();
renderSettingsCategory();
initLanguage();
initTTS();
initParticles();
autoResizePrompt();
autoResizeNoteQaInput();
refreshRuntime();
loadHardwareInfo();
loadNotesList();
updateSelectedFileMeta();
updateRecordingMeta();
updateButtons();
