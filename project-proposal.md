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

As privacy requirements continue to rise and on‑device inference capabilities improve across desktop and mobile hardware, we set out to explore whether a speech‑driven, locally running AI assistant—capable of understanding voice input and organizing content automatically—can be built without relying on the cloud.

With this goal in mind, we developed SpeakSpace Local. The system adopts a modular architecture that separates model inference, data storage, and interface rendering, allowing flexible replacement of speech recognition, speech synthesis, and text‑understanding components. Building on this design, we implemented a complete workflow covering audio recording, transcription, summarization, translation, and structured output.

For evaluation, we focused on the practical performance of on‑device AI, examining latency, memory usage, model size, output quality, and cross‑device variability to determine which components can run reliably and which require further optimization.

Drawing on the workflow concepts of SpeakSpace, this project independently implements a locally prioritized speech‑processing system, providing empirical support for the feasibility of future on‑device voice productivity tools.

# introduction
