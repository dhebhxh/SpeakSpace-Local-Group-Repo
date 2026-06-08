# What is the smallest useful user flow we can build first?
Minimum useful flow 
1. User records or imports audio, or enters text manually. 
2. Local STT converts speech into transcript text where audio is used. 
3. Local LLM/SLM generates a summary, key points, or transformed version of the note. 
4. Optional translation is generated locally where feasible. 
5. Optional TTS converts selected output into spoken audio. 
6. The app stores the original note, transcript, and generated outputs locally.


# What desktop and mobile frameworks are we considering, and why? 
### Desktop
#### Packaging
Meaning:  
How the code we write is ultimately turned into an installable desktop application.  
Different frameworks require bundling different components, so the difficulty varies.

Tauri: Only needs to bundle a Rust program + frontend static files, very small.

Electron: Needs to bundle the entire Chrome browser.

Flutter Desktop: Needs to bundle the Flutter rendering engine.

Python UI: Needs to bundle the Python interpreter and dependencies.

Native: The OS already supports native executables, the most natural.

#### Model runtime access
Meaning:  
Whether the framework can easily call local AI model inference libraries (Rust/Python/C++).

Tauri (Rust): Rust can directly call llama.cpp, GGUF loaders — best local model access.

Electron (Node.js): JS cannot run models directly; requires C++ or Rust extensions.

Flutter Desktop: Dart cannot run models directly; needs plugins to call C++/Rust.

Python UI: Python can run models (llama-cpp-python), but UI is weak.

Native (C++/Swift): Directly calls C++ model libraries, best performance but high dev cost.

#### Performance
Meaning:  
Whether the UI is smooth, memory usage is low, startup is fast, and model inference is not slowed by the UI.

#### Cross‑platform effort
Meaning:  
Whether we need to write three separate versions for Windows, macOS, and Linux.

Some frameworks run all three with one codebase; others require per‑platform adaptation.

| Framework | Packaging | Model Runtime Access | Performance | Cross‑platform Effort |
|-----------|-----------|----------------------|-------------|------------------------|
| Tauri | Small bundle | Strong (Rust direct access) | High | Low |
| Electron | Large bundle | Medium (needs extensions) | Medium | Low |
| Flutter Desktop | Medium | Medium (needs plugin) | High | Low |
| Native Desktop | Different per platform | Strongest | Highest | High |
| Python UI | Difficult | Medium | Low–Medium | Medium |


## Mobile
#### Flutter
Can it run models locally?  
Yes, but Flutter itself cannot run AI models directly.  
It must call native C++/Rust inference libraries via plugins, such as:

- MLC (a framework for running models on mobile)
- llama.cpp mobile version
- Custom C++/Rust model loaders

Flutter handles UI; native code handles inference.

What needs to be simplified:
- Smaller models (3B–7B)
- Quantization (4-bit)
- Shorter context length (1k–2k)

#### React Native
Can it run models locally?  
Yes, but more difficult than Flutter.  
JS cannot run models; requires:

- Android/iOS native modules  
- Or MLC’s RN bindings

Same principle: JS for UI, native for inference.

What needs to be simplified:
- Small models
- Quantization
- Native bindings

#### Native Android (Kotlin/Java)
Can it run models locally?  
Yes, and one of the easiest + best performing.

Android supports:
- NNAPI (hardware acceleration)
- MLC Android runtime
- llama.cpp Android builds

What needs to be simplified:
- 4-bit quantization
- Model size ~1GB
- Memory optimization

#### Native iOS (Swift)
Can it run models locally?  
Yes, and Apple devices are strong at local inference.

Best approach:
- Convert models to CoreML (Apple’s optimized format)

Or use:
- MLC iOS runtime (runs GGUF)

What needs to be simplified:
- Quantization
- CoreML-compatible model structure
- Smaller model size

#### Lightweight inference wrappers
(MLC / llama.cpp mobile / gguf-lite)

Can they run models locally?  
Yes, and they provide the most unified cross‑platform approach.

Same GGUF model can run on:
- Android
- iOS
- Desktop
- Web (WebGPU)

What needs to be simplified:
- 4-bit quantization
- Simple model structure (no MoE)
- Short context length

| Framework | Can run on-device? | What needs simplification? |
|-----------|---------------------|-----------------------------|
| Flutter | Yes (via native plugins) | Small models, 4-bit, short context |
| React Native | Yes (harder) | Same as Flutter |
| Native Android | Yes (best support) | Quantization, small model, memory |
| Native iOS | Yes (CoreML best) | Quantization, CoreML compatibility |
| Lightweight wrappers | Yes (most unified) | 4-bit, simple structure, short context |


# What hardware do team members have available for testing?
1. windows AMD Ryzen 7 7435H 3050
2. Mac mini, Apple M4, 16GB RAM

# What can be completed confidently by the mid-project point? 
1. All foundational architecture and technical decisions finalized  
From Week 1–2 outcomes:

- Overall app architecture sketch  
- UI wireframes  
- Repository structure  
- Initial risk list  
- Tech stack decisions (Tauri/Electron/Flutter etc.)  
- Desktop/mobile strategy  
- Model + inference runtime shortlist (llama.cpp / MLC / GGUF etc.)

Meaning:  
All directional decisions are locked; no major pivots later.

2. First runnable end-to-end flow  
From Week 3–4 goals:

- Desktop or mobile app shell  
- Ability to input text or audio  
- Ability to pass input to a local model  
- UI displays first version of summary output  

Meaning:  
The app runs, the model runs, and they connect.


# What will we document from week one so the final handover is not rushed?

- Tech stack and architecture decisions  
- App architecture diagrams and module descriptions  
- UI wireframes and interaction flows  
- Model + inference runtime shortlist and evaluations  
- Risk list and mitigation strategies  
- Weekly experiment results and technical validations  
- Code structure and development conventions  
