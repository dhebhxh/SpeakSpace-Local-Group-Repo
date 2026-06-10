# title
title 1

SpeakSpace-Local: A Voice-First Office Productivity System Enabled by Local AI Inference

title 2

SpeakSpace-Local: A Local‑First Intelligence Prototype for Turning Voice into Structured, Actionable Knowledge

# abstract

As privacy requirements continue to rise and on‑device inference capabilities improve across desktop and mobile hardware, we set out to explore whether a speech‑driven, locally running AI assistant—capable of understanding voice input and organizing content automatically—can be built without relying on the cloud.

With this goal in mind, we developed SpeakSpace Local. The system adopts a modular architecture that separates model inference, data storage, and interface rendering, allowing flexible replacement of speech recognition, speech synthesis, and text‑understanding components. Building on this design, we implemented a complete workflow covering audio recording, transcription, summarization, translation, and structured output.

For evaluation, we focused on the practical performance of on‑device AI, examining latency, memory usage, model size, output quality, and cross‑device variability to determine which components can run reliably and which require further optimization.

Drawing on the workflow concepts of SpeakSpace, this project independently implements a locally prioritized speech‑processing system, providing empirical support for the feasibility of future on‑device voice productivity tools.

# 1 introduction

## 1.1 Project Objectives
This project aims to develop a desktop‑based local AI workflow prototype and evaluate the feasibility of running small models on mobile devices. The desktop system will implement a complete on‑device speech‑intelligence pipeline, including speech capture and transcription, summary and key‑point generation, cross‑lingual translation, note‑based question answering, task and action‑item extraction, local search, offline note‑library management, and TTS‑based audio playback. A performance visualization panel will also be provided to compare model latency and runtime characteristics, supporting research analysis and model evaluation.

# 1.2 Key Challenges 
First, limited device performance poses a fundamental constraint for running AI models locally. Many desktop and mobile devices cannot directly support modern model workloads, necessitating quantization, model reduction, and careful trade‑offs.
Second, tasks such as speech transcription and summarization require low latency and real‑time responsiveness, which is difficult to guarantee under constrained resources.
Third, significant differences between desktop and mobile environments—such as inference frameworks, hardware capabilities, system architectures, and packaging methods—further increase the complexity of cross‑platform adaptation.
Finally, managing all data locally requires appropriate data structures, local database solutions, and retrieval mechanisms, adding additional engineering complexity.

## 1.3 Project Scope
This project excludes cloud‑based APIs, production‑level features, and real user data. All work is confined to local prototyping, feasibility validation, and foundational research.

## 1.4 Motivation and Impact
With rising privacy demands, improving on‑device AI capabilities, and the increasing prevalence of offline work scenarios, locally executed speech‑intelligence systems are becoming increasingly important. Performing speech processing and content generation directly on user devices avoids privacy risks associated with cloud transmission and ensures usability in low‑connectivity environments.
The potential user base is broad, ranging from everyday users to professionals handling sensitive information in fields such as healthcare, law, finance, and government. Both individual users and professional practitioners can benefit from secure, offline, locally executed speech‑intelligence capabilities.


# 2 Related Works
Although existing research has made significant progress in areas such as speech understanding and edge inference, integrating multiple semantic capabilities—such as transcription, summarization, and task extraction—within a fully local environment, while maintaining consistent interaction and architectural design across desktop and mobile platforms, remains an unsolved challenge. This section reviews three major research directions and clarifies how they differ from the focus of this study.

## 2.1 Edge Inference and On‑Device Models
In recent years, the development of lightweight models and on‑device inference frameworks has led to growing interest in running AI models on everyday devices (e.g., laptops and smartphones) without relying on cloud servers. This direction is commonly referred to as edge inference or on‑device model inference. Its core objective is not to improve model accuracy, but to ensure that existing models can perform inference with acceptable speed and stability under resource‑constrained conditions, thereby supporting real‑world local execution scenarios.

To achieve this, researchers have proposed various technical approaches, including quantizing model parameters from 16‑bit to 4‑bit or 3‑bit to reduce model size and memory usage; using lightweight inference frameworks such as llama.cpp, whisper.cpp, and ONNX Runtime Mobile to run models on CPUs or mobile devices; and optimizing memory management and inference scheduling to reduce latency. These techniques collectively enable language models, speech recognition models, and speech synthesis models to be deployed on local devices, making it possible to perform certain intelligent tasks without cloud‑based GPUs.

However, several challenges remain. Model compression inevitably leads to performance degradation, making on‑device models weaker than cloud‑based large models in complex semantic tasks. Mobile hardware limitations also result in significantly higher inference latency compared to desktop or cloud environments. Moreover, most existing studies focus on the performance of individual models on local devices, with limited discussion on whether a system can maintain acceptable speed, memory usage, and user experience when multiple models (e.g., STT, LLM, and TTS) must run sequentially or concurrently on the same device.

Against this background, this study investigates the feasibility of running STT, LLM, and TTS collaboratively on real devices, and evaluates latency, memory usage, and user experience across a complete speech workflow, providing engineering‑oriented insights for building local speech‑intelligent systems that operate on both desktop and mobile platforms.

## 2.2 AI‑Driven Structured Productivity Systems
AI’s role in productivity tools has expanded from performing single tasks (e.g., summarization, translation, or question answering) to supporting more complete multi‑step workflows. This research direction focuses on transforming unstructured input into structured, retrievable, and actionable productivity outputs, including summarization, key point extraction, task extraction, action‑item identification, semantic segmentation, and entity extraction.

Current AI‑driven structured productivity systems still face notable limitations. Voice assistants (e.g., Siri, Google Assistant) primarily execute command‑level tasks and lack deep understanding or structural processing of long speech content. Transcription tools (e.g., Otter, Notion AI) typically stop at text transcription or shallow summarization, without identifying tasks, action items, or semantic segments. LLM tools (e.g., ChatGPT, Claude) can generate structured content but struggle to integrate with a user’s local knowledge base or project spaces. More importantly, existing systems generally lack the ability to structurally organize raw input, making it difficult to convert speech into clear and comprehensible structured segments suitable for real‑world workflows.

In this context, SpeakSpace Local combines local STT, LLM, and TTS with workspace semantics, offering a new perspective for structured productivity research. The prototype not only focuses on transcription and understanding of speech content, but also emphasizes generating summaries, key points, and tasks from speech, and organizing them into appropriate projects or workspaces based on semantic meaning, forming a more complete speech‑driven structured productivity workflow.

## 2.3 Local‑First Applications and Privacy‑Preserving Design
Local‑first applications represent a software architecture philosophy that emphasizes data control and privacy protection. Its core principles include storing data on the user’s device by default, making synchronization optional, ensuring functionality in offline scenarios, and minimizing reliance on cloud services. Unlike cloud‑dependent applications, local‑first systems aim to keep sensitive data on the user’s device rather than uploading it to external servers during processing.

This principle is particularly important in speech‑based applications, as speech content often contains highly sensitive information such as personal identity details, work‑related content, or internal organizational discussions. Once speech data is uploaded to the cloud—even solely for transcription—it may introduce potential privacy risks. Existing research on local data management, offline availability, and privacy protection has made progress, but primarily focuses on data storage, synchronization, and access control. Much less attention has been given to how speech‑based applications can reduce cloud involvement throughout the processing pipeline to minimize the risk of exposing sensitive information.

In this context, SpeakSpace Local adopts a local‑first system architecture in which speech content remains on the user’s device throughout capture, storage, and processing, preventing sensitive audio data from being exposed to third‑party services during transmission or computation.

Overall, existing research has advanced speech‑intelligent systems from the perspectives of model inference efficiency, semantic structuring capabilities, and privacy‑preserving system design. However, these directions are largely pursued independently: edge inference focuses on whether models can run efficiently on local devices; structured productivity research emphasizes extracting actionable semantic elements from speech; and local‑first applications prioritize data security and user control. A unified speech workflow that simultaneously satisfies local inference, structured semantic processing, and privacy protection remains underexplored. This study addresses this gap by developing a local speech‑intelligent prototype capable of running consistently across desktop and mobile environments.


# Implementation

### 1. System Overview: What We Plan to Build

This project aims to implement a **local‑first voice intelligence prototype** that mirrors the core workflow of SpeakSpace while avoiding reliance on cloud APIs. As stated in the onboarding document, the goal is to “build a fresh desktop and mobile R&D prototype inspired by SpeakSpace, using local models for speech‑to‑text, language intelligence, translation, and text‑to‑speech experiments”.

Based on this direction, the implementation will focus on constructing:

- A **desktop application** providing the primary user workflow.
- A **non‑published mobile prototype** demonstrating feasibility on constrained devices.
- A **local AI pipeline** consisting of:
  - Speech‑to‑Text (STT)
  - Local LLM/SLM for summarisation, translation, and structured outputs
  - Optional Text‑to‑Speech (TTS)
- A **local storage layer** for notes, transcripts, summaries, and generated outputs.
- A **modular architecture** enabling model replacement without rewriting the application.

The smallest useful flow aligns with the document’s “minimum useful flow”:
1) audio/text input → 2) local STT → 3) local summarisation → 4) optional translation → 5) optional TTS → 6) local storage.

This flow forms the backbone of the implementation.

---

## 2. Implementation Plan: How We Will Build It

### 2.1 Architecture

The system will follow a **modular, pipeline‑oriented architecture**, reflecting the document’s guidance that “the architecture should be modular enough that future models or capabilities can be added without rewriting the whole application”.

The architecture consists of:

- **Frontend layer**
  - Desktop UI (Tauri/Electron)
  - Mobile UI (Flutter/React Native)
  - Note capture, transcript view, summary panel, and workspace navigation.

- **Local AI Runtime Layer**
  - STT engine (Whisper.cpp or ONNX‑based STT)
  - LLM/SLM runtime (Ollama, llama.cpp, or ONNX Runtime)
  - TTS engine (lightweight local TTS)

- **Data Layer**
  - SQLite for structured storage
  - Local file system for audio and generated outputs
  - Optional embedded vector search for Ask‑style retrieval

- **Integration Layer**
  - Model loading and lifecycle management
  - Prompt construction and response parsing
  - Latency measurement and fallback logic

This layered design ensures separation of concerns and supports experimentation with different model runtimes.

---

### 2.2 Desktop Implementation

The desktop application will serve as the primary environment for development and testing. Candidate frameworks include:

- **Tauri**
  - Pros: lightweight, Rust backend, strong performance, easy model runtime integration.
  - Cons: less mature ecosystem compared to Electron.

- **Electron**
  - Pros: stable, large ecosystem, easier UI development.
  - Cons: heavier memory footprint, slower startup.

Given the project’s emphasis on performance and local model execution, **Tauri** is likely the preferred choice.

---

### 2.3 Mobile Implementation

The onboarding document requires that “each team should attempt a non‑published mobile application experience”.

Candidate frameworks:

- **Flutter**
  - Pros: strong cross‑platform consistency, good performance, easier UI reuse.
  - Cons: integrating native model runtimes may require custom plugins.

- **React Native**
  - Pros: flexible, large ecosystem, easier integration with native inference libraries.
  - Cons: more fragmentation, more manual optimisation.

Given the need to test local inference on mobile, **React Native** may offer better access to native runtimes (e.g., ONNX Runtime Mobile).

---

### 2.4 Local AI Pipeline Implementation

#### Speech‑to‑Text (STT)

Options: Whisper.cpp, ONNX‑based STT.  
The document highlights STT evaluation criteria: “accuracy, latency, memory use, language support”.

Implementation steps:

- Integrate Whisper.cpp for desktop (CPU/GPU).
- Test ONNX Runtime Mobile for mobile feasibility.
- Provide streaming transcription where possible.

#### LLM/SLM Intelligence

Options:
- Ollama (desktop)
- llama.cpp (desktop/mobile)
- ONNX Runtime (mobile‑friendly)

The document emphasises measuring “output quality, speed, token cost locally, model size”.

Implementation tasks:

- Build prompt templates for summarisation, translation, and task extraction.
- Implement fallback to smaller models on mobile.
- Log latency and memory usage for comparison.

#### TTS

Lightweight TTS engines will be evaluated for feasibility. The document notes that TTS should be assessed for “voice quality, latency, package size, device support”.

---

### 2.5 Local Storage

SQLite will be used to store:

- Notes
- Transcripts
- Summaries
- Generated outputs
- Workspace/project metadata

This aligns with the document’s emphasis on “offline‑first persistence” and “data model clarity”.

---

## 3. Technology Options: Pros and Cons

| Component | Options | Pros | Cons |
|----------|---------|------|------|
| Desktop Framework | Tauri | Fast, lightweight, Rust backend | Smaller ecosystem |
| | Electron | Mature, easy UI | Heavy, slower |
| Mobile Framework | Flutter | Consistent UI, fast | Harder native integration |
| | React Native | Strong native access | More fragmentation |
| STT | Whisper.cpp | High accuracy, local | Heavy on mobile |
| | ONNX STT | Mobile‑friendly | Lower accuracy |
| LLM/SLM | Ollama | Easy desktop integration | Desktop only |
| | llama.cpp | Cross‑platform | Requires tuning |
| | ONNX Runtime | Mobile‑optimised | Limited model variety |
| TTS | Lightweight TTS engines | Small footprint | Lower quality |

These trade‑offs will guide iterative selection during development.

---

## 4. Related Work and Lessons Learned

### 4.1 Whisper.cpp and Local STT Projects

Many open‑source projects implement offline transcription using Whisper.cpp. They demonstrate:

- The feasibility of CPU‑only transcription
- The importance of quantisation for mobile
- The need for audio preprocessing to reduce latency

These insights inform our STT pipeline design.

### 4.2 Local LLM Applications (Ollama, llama.cpp)

Recent local‑first applications show:

- Small instruction‑tuned models (3B–7B) can perform summarisation reliably
- Quantised GGUF models significantly reduce memory usage
- Desktop performance is acceptable, but mobile requires aggressive optimisation

This supports our decision to separate desktop and mobile model configurations.

### 4.3 Note‑Taking and Voice Productivity Tools

Existing tools such as Obsidian plugins, Whisper‑based note apps, and local summarisation utilities show:

- Users value structured outputs (key points, tasks)
- Latency is a critical UX factor
- Local storage must be transparent and reliable

These lessons directly influence our UX and data model design.

---

# Final Remarks

This Implementation section establishes:

- **What** will be built: a local‑first voice intelligence prototype.
- **How** it will be built: modular architecture, local AI pipeline, cross‑platform apps.
- **Which technologies** will be used and why.
- **What related work** teaches us about feasibility and design choices.

# 4 Evaluation

The goal of this evaluation is to verify the feasibility of a local-first speech intelligence workflow on real devices and to assess whether users can smoothly complete the core tasks from speech input to structured output. The evaluation focuses on usability, performance, comprehension, and overall experience, supporting the project objective of building a functional, understandable, and extensible local speech intelligence prototype.

To achieve this, the project will adopt **user‑centred usability testing (HCI Usability Testing)** as the primary method, supplemented by **performance measurement (Latency & Memory Profiling)** and **task‑based evaluation**. This combined approach covers both user experience and technical feasibility, aligning with the project document’s emphasis on “latency, quality, memory, package size, and user‑experience trade‑offs.”

Participants in the usability study will come from two groups:  
1. **General users**, to test whether the basic workflow is understandable and easy to complete.  
2. **Technically experienced users**, to evaluate model latency, error handling, and comprehension of structured outputs.  

The evaluation will follow the minimum useful workflow described in the project document: “record/import → STT → summary → translation → TTS → local storage.” Participants will be asked to complete tasks such as recording speech and reviewing the generated summary, or retrieving previously generated content from the note library. The goal is to identify difficulties in understanding the interface, waiting for model responses, or interpreting structured outputs, and to determine whether local model latency is acceptable.

Performance evaluation will run throughout the development cycle, focusing on latency, memory usage, and device differences for STT, LLM/SLM, and TTS components (“What to measure: accuracy, latency, memory use, model size.”). These measurements will help determine which models are suitable for desktop, which require lightweight alternatives for mobile, and will provide quantitative evidence for the final report.

The project’s hypothesis is:  
**On typical desktop hardware, local STT and small LLMs can complete the full speech workflow within acceptable latency; on mobile devices, quantised small models can support basic summarisation and translation, but performance will be significantly constrained.**  
Evaluation results will validate this hypothesis and guide future model selection and architectural optimisation.

Data analysis will combine qualitative and quantitative methods:  
- User interviews and observation notes for usability insights  
- Task completion rates and error rates for workflow smoothness  
- Latency, memory, and model quality metrics for technical feasibility  

Limitations include a small participant pool, restricted mobile model options, device variability, and prototype‑level stability. Future work may include larger‑scale user studies, cross‑device comparisons, and more extensive evaluation of structured task extraction.

---

# 5 Time Plan

This project runs from early June to early September, following the staged structure suggested in the project document (“Week 1–2 discovery… Week 3–4 first working flow… Week 5–7 core intelligence… Week 8–10 TTS & performance… Week 11–13 integration & demo.”). Based on this structure, and considering development rhythm, evaluation needs, and deliverables, the following time plan is proposed.

The initial phase (first two weeks of June) focuses on background research, architecture design, and model selection, including literature review, model testing, system architecture sketches, and UI wireframes. The goal is to define the technical direction, choose desktop and mobile frameworks, and establish the repository structure. As the document emphasises “Discovery, architecture, model/runtime shortlist, UI direction,” this phase ensures that all key decisions are made early.

From late June to early July, the project enters the first prototype phase, building the basic desktop workflow including audio input, text input, initial local inference calls, and UI rendering. The goal is to produce a functional end‑to‑end flow that can be expanded and refined in later stages.

From mid‑July to early August, the focus shifts to core local intelligence capabilities, including Whisper.cpp integration, local summarisation and translation models, SQLite storage, and workspace semantics. Latency and memory data collection will also begin during this phase.

August is dedicated to performance optimisation and mobile feasibility testing. This includes evaluating ONNX Runtime Mobile, testing small models on mobile devices, and implementing basic TTS. Preparations for usability testing will also take place, including participant recruitment, task script design, and test environment setup.

From late August to early September, the focus will be on integration, stability improvements, documentation, and final presentation preparation. Usability testing will be conducted during this period, and results will be incorporated into the final report and demo. All technical documentation, setup instructions, and future work recommendations will also be completed.

The project will follow a two‑week sprint cycle, with each cycle including goal setting, development, testing, and review. Potential risks include insufficient model performance, mobile inference limitations, or time constraints. Mitigation strategies include using smaller models, reducing mobile feature scope, or prioritising desktop completeness.

Overall, this time plan ensures that a functional, evaluable, and demonstrable local speech intelligence prototype is completed by early September, meeting all core objectives outlined in the project document.

---

# 6 References

This project spans speech recognition, local inference, and structured productivity systems. Before building the SpeakSpace Local prototype, we reviewed several academic and industrial projects closely aligned with our research direction. These works provide the technical foundation for local speech intelligence and inform our architectural decisions, model choices, and feasibility analysis.

The most directly relevant work is OpenAI Whisper and its local inference implementation Whisper.cpp. Whisper demonstrates robust multilingual speech recognition through large‑scale weak supervision, while Whisper.cpp shows how quantisation and CPU optimisation enable the model to run on typical desktop hardware. This aligns closely with the project’s goal of achieving local speech‑to‑text without cloud dependency, and provides practical insights into latency, memory usage, and model compression.

We also examined EdgeSpeechNets (ACM SIGKDD), which proposes efficient speech recognition networks for mobile devices. Through structured pruning, distillation, and lightweight design, EdgeSpeechNets achieves real‑time performance on mobile hardware. This directly informs the mobile feasibility component of our project, particularly regarding model selection and performance expectations under device constraints.

Additionally, we reviewed Local‑first Software (ACM CSCW), which outlines design principles for local‑first applications, including offline availability, data ownership, and minimal cloud reliance. These principles align with the core philosophy of SpeakSpace Local, especially the requirement that “the core prototype should not depend on active SpeakSpace APIs or cloud‑only intelligence.” This work provides theoretical grounding for our data structures, storage strategy, and privacy considerations.

Together, these projects form the foundation of our research: Whisper provides local STT feasibility, EdgeSpeechNets demonstrates mobile inference potential, and Local‑first Software offers an architectural framework. Based on these works, we can more systematically analyse the capability boundaries of local speech intelligence systems and design the technical direction for SpeakSpace Local.

---

## Initial Reference List

1. Radford, A., et al. “Robust Speech Recognition via Large‑Scale Weak Supervision.” OpenAI, 2022.

2. Gerganov, G. “whisper.cpp: High‑performance CPU inference of Whisper models.” GitHub, 2023.

3. Lin, J., Rao, Y., Lu, J., Zhou, J., & Zheng, N. “EdgeSpeechNets: Highly Efficient Deep Neural Networks for Speech Recognition on the Edge.” *Proceedings of the ACM SIGKDD*, 2020.

4. Kleppmann, M., & Beresford, A. R. “Local‑first Software: You Own Your Data, in spite of the Cloud.” *Proceedings of the ACM on Human‑Computer Interaction (CSCW)*, 2020.

5. ONNX Runtime Mobile Documentation. Microsoft, 2024.

6. llama.cpp Documentation. GGML Project, 2024.
