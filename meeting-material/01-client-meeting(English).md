# What is the smallest useful user flow we can build first?

## Minimum useful flow
1. User records or imports audio, or enters text manually.  
2. Local STT converts speech into transcript text where audio is used.  
3. Local LLM/SLM generates a summary, key points, or a transformed version of the note.  
4. Optional translation is generated locally where feasible.  
5. Optional TTS converts selected output into spoken audio.  
6. The app stores the original note, transcript, and generated outputs locally.

---

# What desktop and mobile frameworks are we considering, and why?

## Desktop

### Packaging
Meaning: how our code is ultimately packaged into an installable desktop application.

- **Tauri**: only packages the Rust binary + frontend static files; smallest size  
- **Electron**: packages the entire Chrome runtime  
- **Flutter Desktop**: packages the Flutter rendering engine  
- **Python UI**: packages the Python interpreter and dependencies  
- **Native**: uses the OS’s native executable format; most natural

### Model runtime access
Meaning: how easily the framework can call local AI model inference libraries (Rust/Python/C++).

- **Tauri (Rust)**: strongest; Rust can directly call llama.cpp, GGUF loaders  
- **Electron (Node.js)**: requires C++/Rust extensions  
- **Flutter Desktop**: requires plugins to call C++/Rust  
- **Python UI**: Python can run models easily, but UI is weak  
- **Native (C++/Swift)**: best performance, highest development cost

### Performance
UI smoothness, memory usage, startup time, and whether model inference is slowed by the UI.

### Cross‑platform effort
Whether we need separate implementations for Windows, macOS, and Linux.

| Framework | Packaging | Model Runtime Access | Performance | Cross‑platform Effort |
|----------|-----------|----------------------|-------------|------------------------|
| Tauri | Small | Strong | High | Low |
| Electron | Large | Medium | Medium | Low |
| Flutter Desktop | Medium | Medium | High | Low |
| Native Desktop | High | Strongest | Highest | High |
| Python UI | High | Medium | Low–Medium | Medium |

---

# Mobile

## Flutter
- **On‑device model support**: Yes, via native plugins  
- **Simplifications needed**: small models (3B–7B), 4‑bit quantization, shorter context

## React Native
- **On‑device model support**: Yes, but more complex than Flutter  
- **Simplifications needed**: same as Flutter, plus native bindings

## Native Android (Kotlin/Java)
- **On‑device model support**: Yes; easiest and best performance  
- **Simplifications needed**: quantization, small models, memory optimization

## Native iOS (Swift)
- **On‑device model support**: Yes; best via CoreML  
- **Simplifications needed**: quantization, CoreML‑compatible structure, smaller model size

## Lightweight inference wrappers (MLC / llama.cpp mobile / gguf-lite)
- **On‑device model support**: Yes; most unified cross‑platform approach  
- **Simplifications needed**: quantized models, simple architectures, short context

| Framework | On‑device Model Support | Required Simplifications |
|----------|--------------------------|---------------------------|
| Flutter | Yes (via plugins) | Small models, 4‑bit, short context |
| React Native | Yes (more complex) | Small models, quantization, native bindings |
| Native Android | Easiest | Small models, quantization, memory optimization |
| Native iOS | Strong (CoreML) | Quantization, compatible structure, small size |
| MLC / llama.cpp mobile | Yes (cross‑platform) | Quantized, small, short context |

---

# What hardware do team members have available for testing?

## Desktop
1. Windows, AMD Ryzen 7 7435H, RTX 3050, 16GB  
2. Windows 11, R7‑5800H, RTX 3060, 32GB  
3. 3 × Mac, Apple M4, 16GB  
4. Mac, M2 Pro, 16GB  
5. Windows, Intel i7‑12700H, RTX 3050, 16GB  

## Mobile
1. Snapdragon 8 Gen 3, 12+6GB, 528GB, HyperOS 3.0.303.0  
2. Apple A18 Pro, 8GB, 512GB, iOS 26.6  
3. Snapdragon 8 Gen 3 for Galaxy, 12GB, 512GB, One UI 8.5  
4. Apple A17 Pro, 8GB, 256GB, iOS 26.3  

---

# What can be completed confidently by the mid‑project point?

## 1. Architecture and technical direction fully established
Including:
- Overall application architecture sketch  
- UI wireframes  
- Repository structure  
- Initial risk list  
- Tech stack decisions (Tauri/Electron/Flutter, etc.)  
- Desktop/mobile strategy  
- Model and inference runtime shortlist (llama.cpp / MLC / GGUF, etc.)

## 2. First runnable application flow
Including:
- Desktop or mobile UI shell  
- Text or audio input  
- Passing input to a local model  
- UI displaying the first version of generated summaries  

---

# What will we document from week one so the final handover is not rushed?

- Tech stack and architecture decisions  
- Architecture diagrams and module descriptions  
- UI wireframes and interaction flows  
- Model and inference runtime shortlist  
- Risk list and mitigation strategies  
- Weekly experiment results and technical validations  
- Repository structure and coding conventions  
