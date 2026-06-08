# What is the smallest useful user flow we can build first?
Minimum useful flow 
1. User records or imports audio, or enters text manually. 
2. Local STT converts speech into transcript text where audio is used. 
3. Local LLM/SLM generates a summary, key points, or transformed version of the note. 
4. Optional translation is generated locally where feasible. 
5. Optional TTS converts selected output into spoken audio. 
6. The app stores the original note, transcript, and generated outputs locally.


# What desktop and mobile frameworks are we considering, and why? 
### 桌面端
#### Packaging（打包方式）
含义：  
指“我们写的代码，最终怎么变成一个能安装的桌面软件”。
不同框架需要打包的东西不一样，所以难度差别很大。

Tauri：只需要打包 Rust 程序 + 前端静态文件，内容少

Electron：需要把整个 Chrome 浏览器一起打包进去

Flutter Desktop：需要把 Flutter 的渲染引擎一起打包

Python UI：需要把 Python 解释器和依赖一起打包

Native：系统本来就支持原生可执行文件，最自然

#### Model runtime access（本地模型接入能力）
含义：  
指“这个框架能不能方便地调用本地 AI 模型的底层推理库（Rust/Python/C++）”。

Tauri（Rust）：Rust 能直接调 llama.cpp、GGUF loader，本地模型接入最顺

Electron（Node.js）：JS 不能直接跑模型，需要写 C++ 或 Rust 扩展

Flutter Desktop：Dart 不能跑模型，需要写 plugin 调 C++/Rust

Python UI：Python 本身就能跑模型（llama-cpp-python），但 UI 弱

Native（C++/Swift）：直接调 C++ 模型库，性能最强，但开发成本高

#### Performance（性能）
含义：  
指 UI 是否流畅、内存占用是否高、启动是否快、模型推理是否会被 UI 拖慢。

#### Cross‑platform effort（跨平台成本）
含义：  
指“要不要为 Windows、macOS、Linux 写三套代码”。

有的框架“一套代码跑三端”

有的框架“每个平台都要单独适配”

| 框架 | Packaging（打包方式） | Model Runtime Access（本地模型接入能力） | Performance（性能） | Cross‑platform Effort（跨平台成本） |
|------|------------------------|-------------------------------------------|----------------------|--------------------------------------|
| Tauri | 打包内容少，体积小 | 强（Rust 能直接调模型库） | 高（轻量、启动快） | 低（一套代码跑三端） |
| Electron | 打包内容多，体积大 | 中（需要写扩展才能调模型） | 中（内存占用高） | 低（跨平台成熟） |
| Flutter Desktop | 中等（需要带引擎） | 中（要写 plugin） | 高（UI 流畅） | 低（天然跨平台） |
| Native Desktop | 每个平台都不同 | 最强（直接调 C++ 模型库） | 最高 | 高（要写多套） |
| Python UI | 打包麻烦 | 中（模型好接但 UI 弱） | 低到中等 | 中（跨平台但坑多） |


## 移动端
#### Flutter
能否本地跑模型
可以，但 Flutter 本身不能直接跑 AI 模型。
它需要通过“原生插件”去调用底层的 C++ 或 Rust 推理库，比如：

MLC（一个专门让模型在手机上跑的框架）

llama.cpp 的移动端版本

自己写的 C++/Rust 模型加载器

原理：  
Flutter 负责 UI，模型推理由原生代码负责。

需要简化什么
为了让模型在手机上跑，需要：

模型变小：一般 3B–7B 的模型才跑得动

量化（quantization）：把模型从原来的 16bit/32bit 压缩成 4bit

上下文长度变短：比如从 8k 降到 1k–2k

#### React Native
能否本地跑模型
可以，但比 Flutter 更麻烦。
原因是 React Native 的 JS 不能直接跑模型，需要：

写 Android/iOS 原生模块

或者用 MLC 提供的 RN binding（JS 和原生代码之间的桥梁）

原理：  
JS 只负责 UI，模型推理必须交给原生代码。

需要简化什么
和 Flutter 一样：

模型必须变小

必须量化

必须写原生 binding 才能调用模型

#### Native Android（Kotlin/Java）
能否本地跑模型
可以，而且是所有移动端方案里最容易、性能最好的之一。
因为 Android 有：

NNAPI（Neural Networks API）- Android 官方提供的“硬件加速接口”，让模型跑得更快

MLC Android runtime - 一个专门让 LLM 在手机上跑的库

llama.cpp 的 Android 版本 - 最常用的本地模型推理库，也支持 Android

需要简化什么
模型必须量化（4bit）

模型大小要控制在 1GB 左右

内存占用要优化（KV cache 不能太大）

#### Native iOS（Swift）
能否本地跑模型
可以，而且苹果设备的本地推理性能很强。
但 iOS 有一个特殊点：

最好的方式是把模型转成 CoreML（苹果专用的“模型格式”，能用苹果的 NPU 加速）

也可以用 MLC iOS runtime 跑 GGUF（GPT‑Generated Unified Format） 模型

需要简化什么
模型必须量化

模型结构必须“CoreML 能理解”，不是所有模型结构都能转成 CoreML

模型体积必须更小（iOS 内存限制更严格）

#### Lightweight inference wrappers
（MLC / llama.cpp mobile / gguf-lite）

能否本地跑模型
可以，而且是跨平台最统一的方式。
同一个模型文件（GGUF）可以跑在：

Android

iOS

桌面

Web（WebGPU）

MLC 是什么？

一个让 LLM 在各种设备上跑的框架

支持 GPU/NPU 加速

支持 GGUF 模型

llama.cpp mobile 是什么？

llama.cpp 的移动端版本

专门为手机优化过

需要简化什么
模型必须为移动端量化（4bit）

模型结构必须简单（不能用 MoE）

上下文长度必须短（否则手机直接崩）

| 框架 | Can the model run on-device?（能否本地跑模型） | What needs to be simplified?（需要简化什么） |
|------|-----------------------------------------------|----------------------------------------------|
| Flutter | 可以，但需要写原生插件调用 C++/Rust/MLC | 模型要变小（3B–7B）、4bit 量化、上下文变短 |
| React Native | 可以，但比 Flutter 更麻烦，需要写原生模块 | 同 Flutter：小模型、量化、写原生 binding |
| Native Android | 可以，支持最好（NNAPI/MLC） | 模型量化、小模型、优化内存占用 |
| Native iOS | 可以，但最好转成 CoreML | 模型要量化、结构要兼容 CoreML、体积更小 |
| Lightweight inference wrappers（MLC/llama.cpp mobile） | 可以，跨平台最统一 | 模型必须为移动端量化、结构简单、上下文短 |

# What hardware do team members have available for testing?

### 桌面端
1. Windows 系统，AMD Ryzen 7 7435H 处理器，RTX 3050 显卡，16GB 内存

2. Windows 11，AMD R7‑5800H 处理器，RTX 3060 显卡，32GB 内存

3. 3 台 Mac，Apple M4 芯片，16GB 内存

4. Mac，Apple M2 Pro 芯片，16GB 内存

5. Windows 系统，Intel Core i7‑12700H 处理器，RTX 3050 显卡，16GB 内存

### 移动端
1. 处理器：Snapdragon 8 Gen 3
内存：12 + 6 GB（含扩展内存）
存储：528GB
系统：Xiaomi HyperOS 3.0.303.0

2. 处理器：Apple A18 Pro
内存：8GB
存储：512GB
系统：iOS 26.6

3. 处理器：Snapdragon 8 Gen 3 for Galaxy
内存：12GB
存储：512GB
系统：Android / One UI 8.5

4. 处理器：Apple A17 Pro
内存：8GB
存储：256GB
系统：iOS 26.3

# What can be completed confidently by the mid-project point? 
1. 基础架构与技术路线全部确定
来自 Week 1–2 的成果包括：

应用整体架构草图

UI 线框图

仓库结构

初步风险清单

技术栈决定（Tauri/Electron/Flutter 等）

桌面/移动端路线决定

模型与推理库的候选列表（llama.cpp / MLC / GGUF 等）

也就是说：
方向性决策全部敲定，项目不会再大改路线。

2. 第一个可运行的应用流程
来自 Week 3–4 的目标：

桌面端或移动端的基础外壳（UI Shell）

能输入文本或语音

能把输入传给本地模型

UI 能显示第一版总结输出

也就是说：
应用能跑、模型能跑、两者能连起来。
# What will we document from week one so the final handover is not rushed?

技术栈与架构决策  
每次关于技术路线、模型选择、桌面/移动端方案的决定都会记录下来，包括为什么选、为什么不选。

应用架构草图与模块说明  
包括整体架构图、模块职责、数据流、模型调用流程等。

UI 线框图与交互流程  
从最早的 wireframe 开始就记录，后续迭代也会保留版本。

模型与推理库的 shortlist  
哪些模型试过、效果如何、为什么保留或淘汰。

风险清单与缓解策略  
包括性能、跨平台、模型大小、移动端可行性等风险。

每周的实验结果与技术验证  
比如 STT 测试、模型速度、延迟、内存占用、TTS 可行性等。

代码结构与开发规范  
包括仓库结构、命名规范、模块边界、如何接入模型 runtime。