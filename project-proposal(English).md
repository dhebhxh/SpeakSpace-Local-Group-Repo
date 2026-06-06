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