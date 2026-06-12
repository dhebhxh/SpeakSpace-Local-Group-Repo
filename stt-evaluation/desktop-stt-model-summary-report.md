# SpeakSpace Local Desktop Speech Transcription Model Summary Report

- Test machine: Mac mini, Apple M4, 16GB RAM
- Operating system: macOS 26.5.1

## 1. Recommendation Ranking

| Recommendation Rank | Model | Role | Recommendation Summary |
|---:|---|---|---|
| 1 | `whisper.cpp ggml-large-v3-turbo-q5_0` | Default choice | The best current default model for the desktop app, with the strongest overall balance across speed, size, accuracy, and cross-platform integration. |
| 2 | `whisper.cpp ggml-large-v3-q5_0` | High-accuracy candidate | Suitable when higher transcription quality is required, and also useful as a quality benchmark. |
| 3 | `whisper.cpp ggml-large-v3-turbo-q8_0` | Higher-precision Turbo quantized candidate | Useful as a higher-precision comparison against Turbo q5, but not recommended as the default replacement for q5. |
| 4 | `whisper.cpp ggml-small` | Low-resource fallback | Suitable for mid-range or lower-end desktop devices. It is fast, but multilingual accuracy is lower than the Turbo and Large series. |
| 5 | `whisper.cpp ggml-small-q5_1` | Ultra-light fallback | The smallest and fastest option, suitable when package size or memory usage is highly constrained. |
| 6 | `whisper.cpp ggml-large-v3` | Accuracy ceiling reference | Suitable for offline quality comparison, but not recommended as the default desktop model. |
| 7 | `deepdml/faster-whisper-large-v3-turbo-ct2` | CTranslate2 route candidate | Suitable for further evaluation if the project uses a Python / CTranslate2 backend or a Windows CUDA environment. |
| 8 | `whisper.cpp ggml-medium-q5_0` | Mid-tier comparison model | This model did not show a clear advantage in the current tests, so it has the lowest priority. |

## 2. Benchmark Summary

### Metric Notes

- `WER`: Word Error Rate. Lower is better. Mainly used for English and other whitespace-separated languages.
- `CER`: Character Error Rate. Lower is better. Chinese and Japanese are mainly evaluated with CER.
- `RTFx`: Real-time factor, calculated as `audio duration / processing time`. Higher means faster.
- `Peak RSS`: The maximum resident set size reported by `/usr/bin/time -l`, representing peak memory usage for the test process.
- Note: English, Hindi, Spanish, French, and Arabic use WER. Chinese, Japanese, and Korean use CER. `whisper.cpp` models were tested through the GGML / Metal path. `faster-whisper-large-v3-turbo-ct2` was tested through faster-whisper / CTranslate2 / CPU int8, so its speed and memory results are not directly comparable with the `whisper.cpp` Metal results.

- Test set: Google FLEURS dev human speech samples, 40 samples total: 5 English, 5 Chinese, 5 Japanese, 5 Hindi, 5 Korean, 5 Spanish, 5 French, and 5 Arabic samples. Total audio duration is approximately 181.98 seconds.

| Recommendation Rank | Model | Model File Size | Samples | Total Time | Avg Time per Sample | RTFx | Peak RSS | English WER | Chinese CER | Japanese CER | Hindi WER | Korean CER | Spanish WER | French WER | Arabic WER | All-Sample CER | Failures |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `whisper.cpp ggml-large-v3-turbo-q5_0` | 547.4 MiB | 40 | 85.72s | 2.14s | 2.12 | 817 MiB | 11.2% | 8.3% | 7.9% | 28.6% | 9.4% | 7.2% | 13.8% | 24.6% | 7.6% | 0 |
| 2 | `whisper.cpp ggml-large-v3-q5_0` | 1031.1 MiB | 40 | 138.09s | 3.45s | 1.32 | 2001 MiB | 7.5% | 8.3% | 4.9% | 29.6% | 5.7% | 7.2% | 20.0% | 22.8% | 6.9% | 0 |
| 3 | `whisper.cpp ggml-large-v3-turbo-q8_0` | 833.7 MiB | 40 | 86.30s | 2.16s | 2.11 | 1123 MiB | 11.2% | 8.3% | 6.9% | 32.6% | 9.4% | 7.2% | 13.8% | 22.4% | 8.1% | 0 |
| 4 | `whisper.cpp ggml-small` | 465.0 MiB | 40 | 45.55s | 1.14s | 4.00 | 824 MiB | 16.0% | 29.2% | 15.1% | 49.1% | 13.2% | 9.4% | 24.2% | 47.7% | 15.4% | 0 |
| 5 | `whisper.cpp ggml-small-q5_1` | 181.3 MiB | 40 | 40.29s | 1.01s | 4.52 | 493 MiB | 16.0% | 30.6% | 9.5% | 51.2% | 10.3% | 9.4% | 28.2% | 58.7% | 15.6% | 0 |
| 6 | `whisper.cpp ggml-large-v3` | 2951.7 MiB | 40 | 184.27s | 4.61s | 0.99 | 3966 MiB | 7.5% | 8.3% | 4.9% | 22.2% | 5.7% | 7.2% | 20.0% | 24.6% | 6.6% | 0 |
| 7 | `deepdml/faster-whisper-large-v3-turbo-ct2` | 1546.5 MiB | 40 | 169.68s | 4.24s | 1.07 | 2184 MiB | 11.2% | 8.3% | 5.8% | 31.9% | 7.5% | 13.5% | 17.8% | 22.8% | 8.1% | 0 |
| 8 | `whisper.cpp ggml-medium-q5_0` | 514.2 MiB | 40 | 73.54s | 1.84s | 2.47 | 1138 MiB | 7.5% | 20.6% | 12.2% | 36.8% | 5.5% | 9.4% | 20.9% | 33.8% | 10.5% | 0 |

## 3. Long-Audio Benchmark Summary

Test set: Google FLEURS dev human speech samples, 16 samples total: 2 English, 2 Chinese, 2 Japanese, 2 Hindi, 2 Korean, 2 Spanish, 2 French, and 2 Arabic samples. Total audio duration is approximately 437.24 seconds.

| Recommendation Rank | Model | Model File Size | Samples | Total Time | Avg Time per Sample | RTFx | Peak RSS | English WER | Chinese CER | Japanese CER | Hindi WER | Korean CER | Spanish WER | French WER | Arabic WER | All-Sample CER | Failures |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `whisper.cpp ggml-large-v3-turbo-q5_0` | 547.4 MiB | 16 | 63.32s | 3.96s | 6.91 | 822 MiB | 10.9% | 14.8% | 2.4% | 24.7% | 2.4% | 6.6% | 2.2% | 22.7% | 7.5% | 0 |
| 2 | `whisper.cpp ggml-large-v3-q5_0` | 1031.1 MiB | 16 | 186.95s | 11.68s | 2.34 | 2001 MiB | 15.4% | 14.1% | 3.4% | 31.6% | 2.0% | 8.9% | 1.4% | 25.0% | 8.5% | 0 |
| 3 | `whisper.cpp ggml-large-v3-turbo-q8_0` | 833.7 MiB | 16 | 57.81s | 3.61s | 7.56 | 1125 MiB | 12.1% | 16.0% | 2.4% | 25.3% | 2.0% | 8.9% | 2.2% | 25.0% | 8.2% | 0 |
| 4 | `whisper.cpp ggml-small` | 465.0 MiB | 16 | 49.93s | 3.12s | 8.76 | 827 MiB | 15.6% | 29.6% | 14.4% | 50.9% | 3.9% | 10.1% | 10.8% | 56.8% | 16.7% | 0 |
| 5 | `whisper.cpp ggml-small-q5_1` | 181.3 MiB | 16 | 47.66s | 2.98s | 9.17 | 496 MiB | 10.9% | 30.2% | 14.9% | 60.2% | 3.8% | 8.9% | 8.6% | 52.3% | 17.4% | 0 |
| 6 | `whisper.cpp ggml-large-v3` | 2951.7 MiB | 16 | 214.42s | 13.40s | 2.04 | 3958 MiB | 15.4% | 14.1% | 3.4% | 30.1% | 1.0% | 8.9% | 1.4% | 26.1% | 8.4% | 0 |
| 7 | `deepdml/faster-whisper-large-v3-turbo-ct2` | 1546.5 MiB | 16 | 119.68s | 7.48s | 3.65 | 2235 MiB | 42.5% | 15.3% | 3.8% | 20.9% | 1.9% | 9.3% | 3.6% | 18.2% | 11.5% | 0 |
| 8 | `whisper.cpp ggml-medium-q5_0` | 514.2 MiB | 16 | 111.84s | 6.99s | 3.91 | 1141 MiB | 12.2% | 16.1% | 10.4% | 51.3% | 3.4% | 9.4% | 2.9% | 34.1% | 12.2% | 0 |

## 4. Test Audio Duration List

| Short-Audio Test Duration List | | | Long-Audio Test Duration List | | |
|---|---|---|---|---|---|
| Sample | Language | Duration | Sample | Language | Duration |
| `en_us_1` | English | 2.70s | `en_us_long_1` | English | 31.74s |
| `en_us_2` | English | 3.60s | `en_us_long_2` | English | 29.10s |
| `en_us_3` | English | 3.60s | `cmn_hans_cn_long_1` | Chinese Simplified | 27.72s |
| `en_us_4` | English | 3.84s | `cmn_hans_cn_long_2` | Chinese Simplified | 27.62s |
| `en_us_5` | English | 3.96s | `ja_jp_long_1` | Japanese | 29.52s |
| `cmn_hans_cn_1` | Chinese Simplified | 3.30s | `ja_jp_long_2` | Japanese | 25.20s |
| `cmn_hans_cn_2` | Chinese Simplified | 3.66s | `hi_in_long_1` | Hindi | 26.34s |
| `cmn_hans_cn_3` | Chinese Simplified | 3.90s | `hi_in_long_2` | Hindi | 26.28s |
| `cmn_hans_cn_4` | Chinese Simplified | 4.02s | `ko_kr_long_1` | Korean | 29.76s |
| `cmn_hans_cn_5` | Chinese Simplified | 4.14s | `ko_kr_long_2` | Korean | 24.72s |
| `ja_jp_1` | Japanese | 6.60s | `es_419_long_1` | Spanish | 30.60s |
| `ja_jp_2` | Japanese | 6.72s | `es_419_long_2` | Spanish | 24.96s |
| `ja_jp_3` | Japanese | 6.72s | `fr_fr_long_1` | French | 23.28s |
| `ja_jp_4` | Japanese | 7.32s | `fr_fr_long_2` | French | 20.28s |
| `ja_jp_5` | Japanese | 7.44s | `ar_eg_long_1` | Arabic | 32.52s |
| `hi_in_1` | Hindi | 3.60s | `ar_eg_long_2` | Arabic | 27.60s |
| `hi_in_2` | Hindi | 3.66s | | | |
| `hi_in_3` | Hindi | 3.96s | | | |
| `hi_in_4` | Hindi | 4.56s | | | |
| `hi_in_5` | Hindi | 4.80s | | | |
| `ko_kr_1` | Korean | 3.72s | | | |
| `ko_kr_2` | Korean | 4.08s | | | |
| `ko_kr_3` | Korean | 4.68s | | | |
| `ko_kr_4` | Korean | 4.80s | | | |
| `ko_kr_5` | Korean | 5.04s | | | |
| `es_419_1` | Spanish | 4.20s | | | |
| `es_419_2` | Spanish | 5.28s | | | |
| `es_419_3` | Spanish | 5.64s | | | |
| `es_419_4` | Spanish | 5.70s | | | |
| `es_419_5` | Spanish | 5.76s | | | |
| `fr_fr_1` | French | 3.96s | | | |
| `fr_fr_2` | French | 3.96s | | | |
| `fr_fr_3` | French | 3.96s | | | |
| `fr_fr_4` | French | 4.14s | | | |
| `fr_fr_5` | French | 4.32s | | | |
| `ar_eg_1` | Arabic | 3.90s | | | |
| `ar_eg_2` | Arabic | 3.90s | | | |
| `ar_eg_3` | Arabic | 3.96s | | | |
| `ar_eg_4` | Arabic | 4.44s | | | |
| `ar_eg_5` | Arabic | 4.44s | | | |
