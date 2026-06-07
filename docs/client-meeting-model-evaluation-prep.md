## Question 1: Which local model/runtime options will we test first for STT, LLM/SLM, and TTS?

### Recommended Answer

We will test a small ranked shortlist first, rather than trying many models superficially. The selection is based on local runtime maturity, expected multilingual capability, model size, desktop integration effort, and available evidence from the current repository.

### STT

Primary runtime: `whisper.cpp`.

Reasoning: the repository already contains desktop STT benchmark results using `whisper.cpp` on a Mac mini with Apple M4 and 16GB RAM.

Initial STT test order:

1. `whisper.cpp ggml-large-v3-turbo-q5_0`
   - Default candidate.
   - Best current balance in the existing report across speed, size, accuracy, and desktop integration.
2. `whisper.cpp ggml-large-v3-q5_0`
   - Higher-quality comparison.
   - Useful when transcription accuracy matters more than speed and memory.
3. `whisper.cpp ggml-small` / `whisper.cpp ggml-small-q5_1`
   - Low-resource fallback candidates.
   - Useful if some team laptops cannot comfortably run the larger models.

Secondary comparison only:

- `faster-whisper / CTranslate2`
  - Keep as a possible comparison route, especially for Python/CUDA/Windows experiments.
  - Do not make it the V1 desktop integration path unless `whisper.cpp` becomes unsuitable.

### LLM / SLM

Primary V1 runtime: `Ollama`.

Reasoning: Ollama gives fast local model switching, a simple local HTTP API, and streaming output, which makes it suitable for early benchmarking and prototype integration.

Future embedded/runtime path:

- `llama.cpp` / GGUF
  - Keep as the later packaging and embedded-runtime direction after we know which model family is worth keeping.

Initial LLM/SLM test order:

1. `qwen3:4b-instruct`
   - Main multilingual structured-output candidate.
   - Prioritise testing Hindi, Mandarin, summaries, key points, action items, and translation.
2. `llama3.2:3b`
   - Lightweight baseline.
   - Useful for measuring speed, stability, and minimum acceptable quality.
3. `gemma3:1b` or `gemma3:4b`
   - Resource comparison.
   - Use `gemma3:1b` if group hardware is weak or 8GB RAM devices are common.
   - Use `gemma3:4b` if 16GB RAM devices are available.

Stretch / quality ceiling:

- `qwen3:8b`
  - Test only if available group hardware can run it smoothly.
  - Do not make it the V1 default model.

Optional swap candidate:

- `phi4-mini`
  - Consider replacing `llama3.2:3b` if `llama3.2:3b` performs poorly on multilingual structured tasks.

### TTS

TTS is V2, not a V1 blocker.

Initial TTS runtime direction:

1. `sherpa-onnx`
   - Main V2 TTS candidate.
   - Useful because it has a local TTS path and may support broader device/runtime directions later.
2. Piper-style lightweight TTS
   - Fallback or baseline.
   - Useful for comparing speed, package size, and ease of local desktop use.

We will not commit to a fixed 1.5-second TTS response target in V1 because TTS is not part of the first core workflow.

## Question 2: How will we measure latency, quality, and device feasibility?

### Latency

We will measure both user-facing end-to-end latency and component-level latency.

End-to-end latency tells us what the user feels. Component-level timing tells us where the bottleneck is.

Metrics to record:

- `model_load_ms`
- `audio_preprocess_ms`
- `stt_first_token_ms` where available
- `stt_full_ms`
- `llm_ttft_ms`
- `llm_full_ms`
- `persist_ms`
- `end_to_end_ms`
- `peak_memory_mb`
- STT real-time factor, where `RTF` or `RTFx` is available
- LLM tokens per second

For V2 TTS:

- `tts_first_audio_ms`
- `tts_full_ms`
- TTS real-time factor

### Quality

STT quality:

- English and Hindi: WER
- Mandarin: CER
- Use existing STT benchmark data as the starting point.
- Add a small SpeakSpace-like test set if time allows, such as meeting notes, lectures, or spoken task descriptions.

LLM/SLM quality:

Use a small human rubric, because summaries, action items, and structured outputs cannot be judged by latency alone.

Suggested 1-5 scoring dimensions:

- Faithfulness: no hallucinated facts.
- Coverage: important points are included.
- Structure validity: summary, key points, and action items follow the expected format.
- Actionability: action items are concrete and useful.
- Language preservation: output stays in the input language.
- Translation adequacy: translation is accurate and natural for explicit translation tasks.

TTS quality for V2:

- Intelligibility
- Naturalness
- Pronunciation of names, numbers, and multilingual text
- First-audio latency
- Audio duration vs synthesis time

### Device Feasibility

We will keep desktop feasibility checks lightweight.

For each available group machine, record:

- OS
- CPU or chip
- RAM
- Whether the model can load
- Whether the workflow completes
- Approximate latency
- Approximate peak memory
- Whether the UI obviously freezes
- Model size / installation burden

We will not formally test mobile in V1.


## Client Questions To Confirm

1. What minimum desktop hardware should we target?
   - Recommended provisional answer: modern 16GB RAM laptop/desktop as the main target; 8GB devices only as degraded/fallback feasibility.

2. Are English, Mandarin, and Hindi the right first-class languages for V1?
   - Recommended answer: yes, because English is the baseline, Mandarin tests non-whitespace/CER behaviour, and Hindi is important to the client context.

3. Is same-language output the expected default?
   - Recommended answer: yes. Input language should be preserved throughout transcript, summary, key points, and action items.


## V1 Non-Goals

- No mobile app in V1.
- No TTS in the V1 core workflow.
- No AskAI / RAG over a note library in V1.
- No formal disconnected-network validation in V1.
- No 1.5-second TTS hard commitment.
- No production SpeakSpace API, production codebase, production database, or real customer data.
- No attempt to evaluate every possible language in the first round.
