# What is the smallest useful user flow we can build first?

## Minimum useful flow
1. User records or imports audio, or enters text manually.  
2. Local STT converts speech into transcript text where audio is used.  
3. Local LLM/SLM generates a summary, key points, or transformed version of the note.  
4. Optional translation is generated locally where feasible.  
5. Optional TTS converts selected output into spoken audio.  
6. The app stores the original note, transcript, and generated outputs locally.

---

# What desktop and mobile frameworks are we considering, and why?

## 桌面端（Desktop）

### Packaging（打包方式）
含义：指“我们写的代码，最终怎么变成一个能安装的桌面软件”。

- **Tauri**：只需要打包 Rust 程序 + 前端静态文件，体积最小  
- **Electron**：需要把整个 Chrome 浏览器一起打包  
- **Flutter Desktop**：需要把 Flutter 的渲染引擎一起打包  
- **Python UI**：需要把 Python 解释器和依赖一起打包  
- **Native**：系统本身支持原生可执行文件，最自然

### Model runtime access（本地模型接入能力）
含义：框架能否方便地调用本地 AI 模型的底层推理库（Rust/Python/C++）。

- **Tauri（Rust）**：最强，Rust 能直接调 llama.cpp、GGUF loader  
- **Electron（Node.js）**：需要写 C++/Rust 扩展  
- **Flutter Desktop**：需要写 plugin 调 C++/Rust  
- **Python UI**：Python 能跑模型，但 UI 弱  
- **Native（C++/Swift）**：性能最强，但开发成本高

### Performance（性能）
UI 流畅度、内存占用、启动速度、模型推理是否被 UI 拖慢。

### Cross‑platform effort（跨平台成本）
是否需要为 Windows、macOS、Linux 写多套代码。

| 框架 | Packaging | Model Runtime Access | Performance | Cross‑platform Effort |
|------|-----------|----------------------|-------------|------------------------|
| Tauri | 小 | 强 | 高 | 低 |
| Electron | 大 | 中 | 中 | 低 |
| Flutter Desktop | 中 | 中 | 高 | 低 |
| Native Desktop | 高 | 最强 | 最高 | 高 |
| Python UI | 高 | 中 | 低–中 | 中 |

---

# 移动端（Mobile）

## Flutter
- **能否本地跑模型**：可以，但需要原生插件  
- **需要简化**：模型变小（3B–7B）、4bit 量化、上下文缩短

## React Native
- **能否本地跑模型**：可以，但比 Flutter 更麻烦  
- **需要简化**：同 Flutter，且必须写原生 binding

## Native Android（Kotlin/Java）
- **能否本地跑模型**：可以，最容易、性能最好  
- **需要简化**：模型量化、小模型、优化内存

## Native iOS（Swift）
- **能否本地跑模型**：可以，最好转成 CoreML  
- **需要简化**：模型量化、结构兼容 CoreML、体积更小

## Lightweight inference wrappers（MLC / llama.cpp mobile / gguf-lite）
- **能否本地跑模型**：可以，跨平台最统一  
- **需要简化**：模型必须量化、结构简单、上下文短

| 框架 | 能否本地跑模型 | 需要简化 |
|------|----------------|-----------|
| Flutter | 可以（需插件） | 小模型、4bit、短上下文 |
| React Native | 可以（更麻烦） | 小模型、量化、原生 binding |
| Native Android | 最容易 | 小模型、量化、优化内存 |
| Native iOS | 强（CoreML） | 量化、兼容结构、体积小 |
| MLC / llama.cpp mobile | 可以（跨平台） | 量化、小模型、短上下文 |

---

# What hardware do team members have available for testing?

## 桌面端
1. Windows，AMD Ryzen 7 7435H，RTX 3050，16GB  
2. Windows 11，R7‑5800H，RTX 3060，32GB  
3. 3 × Mac，Apple M4，16GB  
4. Mac，M2 Pro，16GB  
5. Windows，Intel i7‑12700H，RTX 3050，16GB  

## 移动端
1. Snapdragon 8 Gen 3，12+6GB，528GB，HyperOS 3.0.303.0  
2. Apple A18 Pro，8GB，512GB，iOS 26.6  
3. Snapdragon 8 Gen 3 for Galaxy，12GB，512GB，One UI 8.5  
4. Apple A17 Pro，8GB，256GB，iOS 26.3  

---

# What can be completed confidently by the mid-project point?

## 1. 基础架构与技术路线全部确定
包括：
- 应用整体架构草图  
- UI 线框图  
- 仓库结构  
- 初步风险清单  
- 技术栈决定（Tauri/Electron/Flutter 等）  
- 桌面/移动端路线决定  
- 模型与推理库候选列表（llama.cpp / MLC / GGUF 等）

## 2. 第一个可运行的应用流程
包括：
- 桌面端或移动端的基础 UI Shell  
- 能输入文本或语音  
- 能把输入传给本地模型  
- UI 能显示第一版总结输出  

---

# What will we document from week one so the final handover is not rushed?

- 技术栈与架构决策  
- 应用架构草图与模块说明  
- UI 线框图与交互流程  
- 模型与推理库 shortlist  
- 风险清单与缓解策略  
- 每周实验结果与技术验证  
- 代码结构与开发规范  
