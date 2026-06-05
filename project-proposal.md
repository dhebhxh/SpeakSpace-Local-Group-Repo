# title

标题 1
SpeakSpace‑Local：一个由本地 AI 推理驱动的语音优先办公生产力系统

SpeakSpace-Local: A Voice-First Office Productivity System Enabled by Local AI Inference

标题 2
SpeakSpace‑Local：一个将语音转化为结构化可用知识的本地优先智能原型

SpeakSpace-Local: A Local‑First Intelligence Prototype for Turning Voice into Structured, Actionable Knowledge

# abstract

随着隐私要求越来越高，以及桌面和移动设备的本地推理能力不断提升，我们希望探索：不依赖云端，我们能不能在设备上做出一个能听懂语音、自动整理内容的本地AI助手。

基于这一目标，我们构建了 SpeakSpace Local。整个系统采用模块化设计，把模型推理、数据存储和界面展示分成独立部分，便于灵活替换不同的语音识别、语音合成和文本理解模型。在此基础上，我们实现了从语音录制、转录，到总结、翻译，最后结构化输出的完整流程。

在评估部分，我们重点测试了本地 AI 的实际表现，包括延迟、内存占用、模型体积、输出质量以及不同设备的运行差异，以判断哪些部分能稳定落地，哪些部分需要优化。

本项目借鉴 SpeakSpace 的语音智能工作流理念，独立实现了一个本地优先的语音处理系统，为本地语音生产力工具的可行性提供了支持。

## 英文版
As privacy requirements continue to rise and on‑device inference capabilities improve across desktop and mobile hardware, we set out to explore whether a speech‑driven, locally running AI assistant—capable of understanding voice input and organizing content automatically—can be built without relying on the cloud.

With this goal in mind, we developed SpeakSpace Local. The system adopts a modular architecture that separates model inference, data storage, and interface rendering, allowing flexible replacement of speech recognition, speech synthesis, and text‑understanding components. Building on this design, we implemented a complete workflow covering audio recording, transcription, summarization, translation, and structured output.

For evaluation, we focused on the practical performance of on‑device AI, examining latency, memory usage, model size, output quality, and cross‑device variability to determine which components can run reliably and which require further optimization.

Drawing on the workflow concepts of SpeakSpace, this project independently implements a locally prioritized speech‑processing system, providing empirical support for the feasibility of future on‑device voice productivity tools.

# introduction

1. 项目目标

本项目将构建一个桌面端的本地 AI 工作流原型，并在移动端测试小模型的运行表现。桌面端将实现一个完整的本地语音智能流程，包括：
- 语音捕获与转录
- 摘要与关键要点生成
- 跨语言翻译
- 基于笔记的问答
- 任务与行动项提取
- 本地搜索
- 离线笔记库管理
- 以及通过 TTS 播放生成内容
同时，我们还将提供一个性能可视化面板，用于对比不同模型的延迟和运行表现，以支持研究分析。

2. 主要挑战
- 设备性能有限
许多用户的桌面设备和移动设备计算能力有限，难以直接运行当代 AI 模型。因此需要通过模型量化、模型缩减和合理取舍来降低资源需求，使模型能够在普通硬件上正常运行。

- 实时性要求高
语音转录、摘要生成等功能对响应速度有较高要求，需要在有限的计算资源下仍保持较好的实时性和交互体验，这对模型选择和系统优化提出了挑战。

- 跨平台差异显著
桌面端与移动端在推理框架、硬件性能、系统架构和打包方式上存在明显差异。同一模型在不同平台上需要分别适配和优化，增加了开发与调试的复杂度。

- 本地数据管理复杂
所有数据（转录、摘要、任务、笔记等）都需要在本地进行存储、组织与检索。这要求设计合适的数据结构、本地数据库方案和检索机制。

3. 项目范围
本项目不涉及云端 API、生产级功能实现、真实用户数据，所有工作均限定在本地原型、可行性验证与基础研究范围内。

4. 项目动机与影响
随着数据隐私需求的不断提升、边缘 AI 技术的快速成熟以及离线工作场景的日益增多，本地运行的语音智能系统正变得越来越重要。
这类工具的潜在用户范围非常广泛：从日常记录和学习的普通用户，到需要处理敏感信息的专业群体，例如医疗、法律、金融、政府机构等。无论是个人用户还是专业从业者，都可以从安全、离线、可本地运行的语音智能能力中受益。

## 英文版:
1. Project Objectives
This project aims to develop a desktop‑based local AI workflow prototype and evaluate the feasibility of running small models on mobile devices. The desktop system will implement a complete on‑device speech‑intelligence pipeline, including speech capture and transcription, summary and key‑point generation, cross‑lingual translation, note‑based question answering, task and action‑item extraction, local search, offline note‑library management, and TTS‑based audio playback. A performance visualization panel will also be provided to compare model latency and runtime characteristics, supporting research analysis and model evaluation.

2. Key Challenges 
First, limited device performance poses a fundamental constraint for running AI models locally. Many desktop and mobile devices cannot directly support modern model workloads, necessitating quantization, model reduction, and careful trade‑offs.
Second, tasks such as speech transcription and summarization require low latency and real‑time responsiveness, which is difficult to guarantee under constrained resources.
Third, significant differences between desktop and mobile environments—such as inference frameworks, hardware capabilities, system architectures, and packaging methods—further increase the complexity of cross‑platform adaptation.
Finally, managing all data locally requires appropriate data structures, local database solutions, and retrieval mechanisms, adding additional engineering complexity.

3. Project Scope
This project excludes cloud‑based APIs, production‑level features, and real user data. All work is confined to local prototyping, feasibility validation, and foundational research.

4. Motivation and Impact
With rising privacy demands, improving on‑device AI capabilities, and the increasing prevalence of offline work scenarios, locally executed speech‑intelligence systems are becoming increasingly important. Performing speech processing and content generation directly on user devices avoids privacy risks associated with cloud transmission and ensures usability in low‑connectivity environments.
The potential user base is broad, ranging from everyday users to professionals handling sensitive information in fields such as healthcare, law, finance, and government. Both individual users and professional practitioners can benefit from secure, offline, locally executed speech‑intelligence capabilities.

# Related Work