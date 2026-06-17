# SpeakSpace 本地模型基准测试汇总增强报告

本报告用于总报告汇总。内容只使用当前工作区里能追溯到的真实数据：

- `model-benchmark-report.md` 原始汇总数据：测试环境、测试范围、STT/LLM 汇总指标、推荐结论、风险说明。
- `desktop-stt-model-summary-report.md`：STT 模型文件大小。

当前工作区没有保留 `benchmarks/results/*.json`、`benchmarks/generated-audio/manifest.json` 和逐样本输出，因此本报告不补写逐样本转写、逐任务 LLM 输出、逐样本 WER/CER、音频时长、总耗时或失败明细。

## 1. 摘要

| 项目 | 内容 |
|---|---|
| 测试范围 | 本地 STT 模型和本地 Ollama LLM 模型 |
| STT 候选模型 | 7 个 Whisper/ggml 模型 |
| LLM 候选模型 | 6 个 Ollama 模型 |
| 测试语言 | 英语、中文、Hindi |
| STT 样本数量 | 每个模型 15 条三语音频样本 |
| LLM 任务数量 | 每个模型 9 个三语任务 |
| 当前 STT 推荐模型 | `ggml-large-v3-turbo-q5_0.bin` |
| 当前 LLM 推荐模型 | `qwen3:4b-instruct` |
| 主要结论 | 当前推荐配置仍是本轮汇总数据中的最佳默认配置 |

## 2. 数据来源与可信度

| 数据项 | 本报告是否包含 | 来源 | 当前原始产物可用性 |
|---|---|---|---|
| 测试机器和系统 | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| 候选模型列表 | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| STT 模型文件大小 | 是 | `desktop-stt-model-summary-report.md` | 报告中可见 |
| STT 综合/分语言准确率 | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| STT Realtime Factor | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| STT Peak RSS | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| LLM 综合/分语言得分 | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| LLM 平均 tokens/s | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| LLM Peak RSS | 是 | 原始 `model-benchmark-report.md` | 报告中可见 |
| STT 逐条音频转写结果 | 否 | 需要 `benchmarks/results/*.json` | 当前工作区不可用 |
| STT 逐条音频 WER/CER | 否 | 需要原始 benchmark 结果文件 | 当前工作区不可用 |
| LLM 逐任务原始输出 | 否 | 需要原始 benchmark 结果文件 | 当前工作区不可用 |
| 音频时长列表 | 否 | 需要音频 manifest 或音频文件 | 当前工作区不可用 |
| 总测试耗时 | 否 | 需要原始计时日志/结果文件 | 当前工作区不可用 |

> 证据：
> - 来源：`model-benchmark-report.md`、`desktop-stt-model-summary-report.md`
> - 方法：只复制两份报告中明确存在的数值；不新增 score gap、memory delta、speed ratio、error rate、RTFx 换算、跨语言差距等派生列。
> - 置信度：中。表中数值可以追溯到现有报告，但当前缺少原始 benchmark JSON 和音频产物，无法重新计算验证。

## 3. 测试环境

| 参数 | 数值 |
|---|---|
| 设备 | Mac mini |
| 芯片 | Apple M4 |
| CPU/GPU | 10 CPU cores / 10 GPU cores |
| 内存 | 16GB unified memory |
| 加速能力 | Apple Metal available |
| 操作系统 | macOS 26.5.1 |
| Git 分支 | `LF-c-patch-1` |

## 4. 测试过程中的磁盘事件

| 参数 | 数值 |
|---|---|
| 发现的问题 | 仓库 `.git/objects/pack` 内存在 Git 中断打包留下的 `tmp_pack_*` 垃圾文件 |
| 垃圾文件数量 | 151 |
| 报告的垃圾文件大小 | `46.15 GiB`，来自 `git count-objects -vH` |
| 清理前可用磁盘空间 | 约 `1GB` |
| 清理后可用磁盘空间 | 约 `47GB` |
| 原始报告记录的测试影响 | 清理后完成全部 STT 大模型测试 |

## 5. STT 测试设计

| 参数 | 数值 |
|---|---|
| 模型类型 | Whisper / ggml models |
| 候选模型数量 | 7 |
| 每个模型的音频样本数量 | 15 |
| 测试语言 | 英语、中文、Hindi |
| 英语样本数 | 5 |
| 中文样本数 | 5 |
| Hindi 样本数 | 5 |
| 样本覆盖类型 | 短句、日期/数字、产品笔记、离线隐私、模型推荐 |
| 音频生成方式 | 本地 TTS 生成 |
| 噪声覆盖 | 原始报告说明包含少量噪声样本 |
| 原始报告记录的音频路径 | `benchmarks/generated-audio/` |

## 6. STT 指标定义

| 指标 | 原始报告中的定义 | 方向 |
|---|---|---|
| 英语准确率 | 基于 WER 转换为 accuracy | 越高越好 |
| Hindi 准确率 | 基于 WER 转换为 accuracy | 越高越好 |
| 中文准确率 | 基于 CER 转换为 accuracy | 越高越好 |
| Realtime Factor | 转写耗时 / 音频时长 | 越低越快 |
| Peak RSS | `whisper-cli` 进程峰值内存采样 | 越低表示内存占用越低 |

## 7. STT 候选模型清单

| 模型 | 模型文件大小 | 报告中的角色/备注 |
|---|---:|---|
| `ggml-large-v3-turbo-q5_0.bin` | 547.4 MiB | 当前默认推荐；原始报告标记为“最佳默认” |
| `ggml-large-v3-turbo-q8_0.bin` | 833.7 MiB | Turbo 高精度对照；原始报告说明内存更高 |
| `ggml-large-v3.bin` | 2951.7 MiB | Full large-v3 参考模型；原始报告说明太慢、占用高 |
| `ggml-large-v3-q5_0.bin` | 1031.1 MiB | Large q5 候选模型；原始报告说明慢于 Turbo |
| `ggml-medium-q5_0.bin` | 514.2 MiB | Medium q5 对照模型；原始报告说明中文不稳定 |
| `ggml-small-q5_1.bin` | 181.3 MiB | 超轻量 fallback；原始报告说明只适合低内存/非 Hindi |
| `ggml-small.bin` | 465.0 MiB | Small fallback；原始报告说明不建议默认 |

## 8. STT 基准测试汇总

| 模型 | 模型文件大小 | 样本数 | 综合准确率 | 英语准确率 | 中文准确率 | Hindi 准确率 | Realtime Factor | Peak RSS | 原始报告结论 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `ggml-large-v3-turbo-q5_0.bin` | 547.4 MiB | 15 | 91.5% | 100.0% | 93.2% | 81.2% | 0.74x | 807MB | 最佳默认 |
| `ggml-large-v3-turbo-q8_0.bin` | 833.7 MiB | 15 | 89.1% | 100.0% | 93.2% | 74.1% | 0.72x | 1116MB | 不如 Q5，内存更高 |
| `ggml-large-v3.bin` | 2951.7 MiB | 15 | 88.0% | 98.5% | 92.7% | 72.8% | 1.70x | 3843MB | 太慢，占用高 |
| `ggml-large-v3-q5_0.bin` | 1031.1 MiB | 15 | 87.5% | 98.5% | 92.7% | 71.3% | 1.15x | 1998MB | 慢于 Turbo，质量不占优 |
| `ggml-medium-q5_0.bin` | 514.2 MiB | 15 | 82.7% | 98.5% | 81.1% | 68.5% | 0.89x | 1133MB | 中文不稳定 |
| `ggml-small-q5_1.bin` | 181.3 MiB | 15 | 78.3% | 98.5% | 93.4% | 43.0% | 0.34x | 487MB | 只适合低内存/非 Hindi |
| `ggml-small.bin` | 465.0 MiB | 15 | 76.3% | 94.8% | 91.0% | 43.0% | 0.41x | 819MB | 不建议默认 |

## 9. STT 原始报告结论摘录

| 结论 | 报告中的支撑数据 |
|---|---|
| `ggml-large-v3-turbo-q5_0.bin` 是最佳综合模型 | 综合准确率 `91.5%`；英语 `100.0%`；中文 `93.2%`；Hindi `81.2%`；Realtime Factor `0.74x`；Peak RSS `807MB` |
| `ggml-large-v3-turbo-q8_0.bin` 没有替代 Q5 | 综合准确率 `89.1%`；Hindi `74.1%`；Peak RSS `1116MB` |
| `ggml-large-v3.bin` 不适合作为默认模型 | 综合准确率 `88.0%`；Realtime Factor `1.70x`；Peak RSS `3843MB` |
| `ggml-large-v3-q5_0.bin` 不适合作为默认模型 | 综合准确率 `87.5%`；Realtime Factor `1.15x`；Peak RSS `1998MB` |
| small 系列不能用于三语默认推荐 | `ggml-small-q5_1.bin` Hindi `43.0%`；`ggml-small.bin` Hindi `43.0%` |

## 10. LLM 测试设计

| 参数 | 数值 |
|---|---|
| 运行时 | Ollama |
| 候选模型数量 | 6 |
| 每个模型的任务数量 | 9 |
| 测试语言 | 英语、中文、Hindi |
| 英语任务数 | 3 |
| 中文任务数 | 3 |
| Hindi 任务数 | 3 |
| 任务覆盖类型 | JSON 抽取、计数/严格输出、本地 AI 场景解释 |

## 11. LLM 指标定义

| 指标 | 原始报告中的定义 | 方向 |
|---|---|---|
| JSON 任务得分 | 按字段匹配计分 | 越高越好 |
| 严格数字输出 | 完全只输出正确数字得 `1.0`；最终答案正确但格式不符合得 `0.5`；错误得 `0` | 越高越好 |
| 文本任务得分 | 按必须包含的关键词计分 | 越高越好 |
| Avg tokens/s | Ollama 返回的 `evalTokensPerSec` | 越高越快 |
| Peak RSS | Ollama / llama-server 相关进程总 RSS 采样 | 越低表示内存占用越低 |

## 12. LLM 候选模型清单

| 模型 | 原始报告中的角色/备注 |
|---|---|
| `qwen3:4b-instruct` | 当前默认推荐；原始报告标记为“最佳默认” |
| `phi4-mini` | 原始报告说明质量不够稳 |
| `qwen2.5:3b-instruct` | 原始报告说明较快但质量弱 |
| `qwen2.5:1.5b-instruct` | 原始报告说明极速/低内存 fallback |
| `ministral-3:3b` | 原始报告说明不建议默认 |
| `ibm/granite4:micro-h` | 原始报告说明不建议默认 |

## 13. LLM 基准测试汇总

| 模型 | 任务数 | 综合得分 | 英语得分 | 中文得分 | Hindi 得分 | Avg tokens/s | Peak RSS | 原始报告结论 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `qwen3:4b-instruct` | 9 | 83.3% | 83.3% | 66.7% | 100.0% | 27.8 | 3172MB | 最佳默认 |
| `phi4-mini` | 9 | 60.2% | 55.6% | 66.7% | 58.3% | 33.4 | 3102MB | 质量不够稳 |
| `qwen2.5:3b-instruct` | 9 | 53.7% | 55.6% | 47.2% | 58.3% | 45.9 | 2152MB | 较快但质量弱 |
| `qwen2.5:1.5b-instruct` | 9 | 52.8% | 44.4% | 38.9% | 75.0% | 72.2 | 1215MB | 极速/低内存 fallback |
| `ministral-3:3b` | 9 | 51.9% | 47.2% | 50.0% | 58.3% | 32.3 | 3502MB | 不建议默认 |
| `ibm/granite4:micro-h` | 9 | 45.4% | 47.2% | 41.7% | 47.2% | 29.0 | 2785MB | 不建议默认 |

## 14. LLM 原始报告结论摘录

| 结论 | 报告中的支撑数据 |
|---|---|
| `qwen3:4b-instruct` 是质量最稳的默认模型 | 综合得分 `83.3%`；英语 `83.3%`；中文 `66.7%`；Hindi `100.0%` |
| `qwen2.5:1.5b-instruct` 只适合作为低内存 fallback | 综合得分 `52.8%`；Avg tokens/s `72.2`；Peak RSS `1215MB` |
| `phi4-mini` 不建议替代默认模型 | 综合得分 `60.2%`；英语 `55.6%`；中文 `66.7%`；Hindi `58.3%` |
| `qwen2.5:3b-instruct` 速度更高但质量不足 | 综合得分 `53.7%`；Avg tokens/s `45.9`；Peak RSS `2152MB` |

## 15. 推荐配置

| 能力 | 当前推荐模型 | 原始报告判断 | 建议 |
|---|---|---|---|
| STT | `ggml-large-v3-turbo-q5_0.bin` | 是否最佳：是 | 保持默认 |
| Local LLM | `qwen3:4b-instruct` | 是否最佳：是 | 保持默认 |

## 16. 原始报告中的部署建议

| 设备条件 | STT 推荐 | LLM 推荐 |
|---|---|---|
| Apple Silicon / 16GB+ / 需要中英 Hindi | `ggml-large-v3-turbo-q5_0.bin` | `qwen3:4b-instruct` |
| 8GB-12GB / 仍需多语言 | 优先尝试 `ggml-large-v3-turbo-q5_0.bin`，如果内存压力高再降级 | `qwen2.5:3b-instruct` |
| 低内存 / 只需英文和中文粗转写 | `ggml-small-q5_1.bin` | `qwen2.5:1.5b-instruct` |
| Hindi-heavy 场景 | 不建议 small 系列 | 优先 `qwen3:4b-instruct` |

## 17. 已知限制

| 限制 | 说明 |
|---|---|
| STT 样本为合成音频 | 原始报告说明音频是合成样本，不等价于真实人声、远场会议、多人重叠说话 |
| Hindi STT 需要更多覆盖 | 原始报告说明 Hindi 错误集中在发音相近词、变音符号和专业词上，建议增加真实 Hindi 样本 |
| LLM 测试是微基准 | 原始报告说明任务覆盖抽取、计数和短解释，不覆盖长会议纪要生成质量 |
| 严格输出仍是产品问题 | 原始报告说明即使 Qwen3 质量最好，也会在部分计数/格式约束题上失败 |
| 当前缺少原始 benchmark 产物 | 当前工作区没有 `benchmarks/results/*.json`，无法逐样本复核 |

## 18. 原始报告记录的证据路径

这些路径是原始报告记录的证据路径；当前工作区没有这些文件，因此只作为历史记录保留。

| 证据类型 | 记录路径 |
|---|---|
| 测试脚本 | `benchmarks/model-benchmark.js` |
| 音频 manifest | `benchmarks/generated-audio/manifest.json` |
| 音频文件 | `benchmarks/generated-audio/*.wav` |
| STT 结果 | `benchmarks/results/stt-results-1781228330027.json` |
| STT 结果 | `benchmarks/results/stt-results-1781229392414.json` |
| STT 结果 | `benchmarks/results/stt-results-1781229859877.json` |
| STT 结果 | `benchmarks/results/stt-results-1781229953904.json` |
| STT 结果 | `benchmarks/results/stt-results-1781230142758.json` |
| LLM 结果 | `benchmarks/results/llm-results-1781228803279.json` |
| LLM 结果 | `benchmarks/results/llm-results-1781228902363.json` |
| LLM 结果 | `benchmarks/results/llm-results-1781228956932.json` |
| LLM 结果 | `benchmarks/results/llm-results-1781229060828.json` |
| LLM 结果 | `benchmarks/results/llm-results-1781229186803.json` |
| LLM 结果 | `benchmarks/results/llm-results-1781229285008.json` |

## 19. 后续动作

| 优先级 | 动作 |
|---:|---|
| 1 | 把真实录音加入新数据集，例如 `benchmarks/real-audio/` |
| 2 | 增加 Hindi-heavy 专项测试，避免小模型在 Hindi 场景被误推荐 |
| 3 | 给 LLM 结构化任务增加 schema 校验，失败时自动重试或要求模型只输出 JSON |
| 4 | 在 app 推荐逻辑里明确区分“默认推荐”和“低内存 fallback” |
| 5 | 后续复测时保留 `benchmarks/results/*.json`、逐样本转写文本和音频 manifest，方便总报告复核 |
