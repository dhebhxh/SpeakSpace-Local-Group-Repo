# title

SpeakSpace-Local: A Voice-First Office Productivity System Enabled by Local AI Inference
SpeakSpace-Local: A Local‑First Intelligence Prototype for Turning Voice into Structured, Actionable Knowledge

# abstract

SpeakSpace Local 项目旨在验证“语音到结构化知识”这一核心工作流在完全本地化条件下的可行性。随着隐私需求上升与边缘设备推理能力增强，本项目探索如何在桌面与移动设备上重建一个无需云端依赖的语音智能原型系统。

本原型采用模块化架构，将模型加载、推理、数据存储与 UI 交互解耦，使不同 STT、LLM/SLM 与 TTS 模型能够灵活替换与扩展。系统实现了从语音捕获、转录、摘要、翻译到结构化输出的完整链路，并在真实设备上集成本地 SST、轻量级 LLM/SLM、TTS 以及本地存储组件。

为了评估本地 AI 的可行性，本项目从延迟、内存占用、模型大小、输出质量、设备差异等维度进行系统性测量，分析哪些能力可以在边缘设备上稳定运行，哪些需要进一步优化或简化。

本研究首次将 SpeakSpace 的语音智能工作流以“local‑first”方式重构，为未来的本地语音生产力工具提供了关键的技术基线、架构参考与可行性洞察。

# introduction
