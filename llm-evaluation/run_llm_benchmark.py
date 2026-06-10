#!/usr/bin/env python3
"""Run a small reproducible local LLM benchmark through Ollama.

The benchmark is scoped to SpeakSpace Local's post-transcription use case:
meeting-like transcript summarization, action item extraction, multilingual
handling, and structured JSON output.
"""

from __future__ import annotations

import csv
import datetime as dt
import json
import math
import re
import statistics
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"
RESULTS_ROOT = Path(__file__).resolve().parent / "results"

MODELS = [
    {
        "label": "Qwen2.5-3B-Instruct",
        "ollama": "qwen2.5:3b-instruct",
    },
    {
        "label": "Qwen2.5-1.5B-Instruct",
        "ollama": "qwen2.5:1.5b-instruct",
    },
    {
        "label": "Phi-4-mini-instruct",
        "ollama": "phi4-mini:latest",
    },
    {
        "label": "Ministral-3-3B-Instruct",
        "ollama": "ministral-3:3b-instruct-2512-q4_K_M",
    },
    {
        "label": "Granite-4.0-Micro-H",
        "ollama": "granite4:micro-h",
    },
]

TASKS = [
    {
        "id": "en_summary_actions",
        "language": "English",
        "expected_script": "latin",
        "section_terms": ["summary", "decisions", "action", "risk"],
        "anchors": [
            r"16\s*GB",
            r"STT",
            r"LLM",
            r"Hindi",
            r"Friday",
            r"Ravi",
            r"JSON",
        ],
        "prompt": """You are analyzing a local meeting transcript for SpeakSpace Local.
Keep the output in English. Produce exactly these sections:
1. Summary: two concise sentences.
2. Decisions: bullet list.
3. Action Items: bullet list with owner and due date if mentioned.
4. Risks: bullet list.

Transcript:
Alex: The desktop prototype records meeting audio locally and sends the transcript to a small local model. We need it to work on 16GB laptops.
Mei: For the first milestone, keep STT and LLM separate so we can swap models.
Ravi: Hindi support is required for customer demos, but quality can be marked as experimental if the model is slow.
Alex: Let's test Qwen, Phi, Ministral, and Granite with English, Chinese, and Hindi notes.
Mei: The report should include memory, load time, tokens per second, and whether JSON output is stable.
Ravi: I will prepare UI copy after the model shortlist is done.
Alex: Please finish the shortlist by Friday, then we can freeze the V1 default.""",
    },
    {
        "id": "zh_summary_actions",
        "language": "Chinese",
        "expected_script": "cjk",
        "section_terms": ["摘要", "决定", "行动", "风险"],
        "anchors": [
            r"16\s*GB",
            r"本地",
            r"STT",
            r"LLM",
            r"印地语",
            r"周五",
            r"内存",
        ],
        "prompt": """你正在分析 SpeakSpace Local 的本地会议转写文本。
请用中文输出，并严格包含这些小节：
1. 摘要：两句话。
2. 已定事项：项目符号列表。
3. 行动项：项目符号列表，包含负责人和截止时间（如果文本中提到）。
4. 风险：项目符号列表。

转写文本：
林：桌面端原型必须保证音频、转写文本和模型分析都留在本地，不能依赖云端。
陈：第一版重点是英语、中文和印地语，不要同时扩展太多语言。
王：如果用户电脑是 16GB 内存，我们可以默认推荐一个 3B 左右的模型；如果更低配置，就需要降级模型。
林：STT 和 LLM 要保持解耦，后面才能替换 whisper.cpp 或 Ollama 里的模型。
陈：报告里要写清楚模型大小、加载时间、tokens per second、内存占用和结构化输出是否稳定。
王：我负责整理测试表格，周五前给出候选模型排序。""",
    },
    {
        "id": "hi_summary_actions",
        "language": "Hindi",
        "expected_script": "devanagari",
        "section_terms": ["सारांश", "निर्णय", "कार्य", "जोखिम"],
        "anchors": [
            r"16\s*GB",
            r"स्थानीय|लोकल",
            r"STT",
            r"LLM",
            r"हिंदी",
            r"शुक्रवार",
            r"मेमोरी",
        ],
        "prompt": """आप SpeakSpace Local के लिए एक स्थानीय मीटिंग ट्रांसक्रिप्ट का विश्लेषण कर रहे हैं।
कृपया पूरा उत्तर हिंदी में दें और ये अनुभाग रखें:
1. सारांश: दो छोटे वाक्य।
2. निर्णय: बुलेट सूची।
3. कार्य आइटम: बुलेट सूची, मालिक और समय सीमा के साथ यदि दिया गया हो।
4. जोखिम: बुलेट सूची।

ट्रांसक्रिप्ट:
आशा: SpeakSpace Local में ऑडियो, ट्रांसक्रिप्ट और विश्लेषण डिवाइस पर ही रहना चाहिए।
नेहा: पहले चरण में अंग्रेजी, चीनी और हिंदी को ही टेस्ट करें, ताकि स्कोप नियंत्रित रहे।
राहुल: 16GB मेमोरी वाले डेस्कटॉप पर 3B के आसपास का LLM ठीक हो सकता है, लेकिन धीमे डिवाइस के लिए छोटा मॉडल चाहिए।
आशा: STT और LLM को अलग रखना जरूरी है, क्योंकि बाद में whisper.cpp या Ollama मॉडल बदले जा सकते हैं।
नेहा: रिपोर्ट में मॉडल साइज, लोड समय, tokens per second, मेमोरी उपयोग और JSON स्थिरता लिखनी होगी।
राहुल: मैं शुक्रवार तक टेस्ट टेबल और शुरुआती रैंकिंग तैयार करूंगा।""",
    },
    {
        "id": "mixed_json_extraction",
        "language": "Mixed",
        "expected_script": "json",
        "section_terms": [],
        "anchors": [
            r"qwen",
            r"phi",
            r"ministral",
            r"granite",
            r"Friday|周五|शुक्रवार",
            r"16\s*GB",
        ],
        "required_json_keys": [
            "project",
            "languages",
            "models_to_test",
            "hardware_limit",
            "metrics",
            "deadline",
            "open_risks",
        ],
        "prompt": """Extract structured information from the transcript.
Return valid JSON only. Do not wrap it in Markdown. Use these keys:
project, languages, models_to_test, hardware_limit, metrics, deadline, open_risks.

Transcript:
The team is evaluating SpeakSpace Local after speech-to-text. V1 languages are English, 中文, and हिंदी. The desktop test limit is 16GB RAM. Models to test are Qwen2.5 3B, Qwen2.5 1.5B, Phi-4-mini, Ministral-3 3B, and Granite 4 Micro. Metrics must include model load time, total latency, output tokens per second, memory use, whether the task completed, and whether JSON is valid. The shortlist should be ready by Friday / 周五 / शुक्रवार. Main risks are weak Hindi output, unstable JSON formatting, and models that are too slow on mid-range machines.""",
    },
    {
        "id": "faithfulness_missing_info",
        "language": "English",
        "expected_script": "latin",
        "section_terms": ["answer", "not mentioned"],
        "anchors": [
            r"not mentioned",
            r"Ollama",
            r"Friday",
            r"16\s*GB",
        ],
        "prompt": """Answer the questions using only the transcript. If the transcript does not contain the answer, write "not mentioned".

Transcript:
Maya: For the LLM experiment, use Ollama on the desktop machine and test with a 16GB memory ceiling.
Chen: The three required languages are English, Chinese, and Hindi.
Ravi: We need the report by Friday. Please include whether each model starts successfully and whether the model can produce structured output.

Questions:
1. Which runtime should be used?
2. What is the memory ceiling?
3. Which three languages are required?
4. What is the deadline?
5. Which cloud provider should host the model?""",
    },
]

SYSTEM_MESSAGE = (
    "You are a careful local transcript analysis model. "
    "Follow the user's requested language and format. "
    "Do not invent facts that are not present in the transcript."
)

MODEL_OPTIONS = {
    "temperature": 0.2,
    "top_p": 0.9,
    "num_ctx": 4096,
    "num_predict": 650,
}


def run_cmd(args: list[str], timeout: int = 30) -> dict[str, Any]:
    started = time.perf_counter()
    try:
        proc = subprocess.run(
            args,
            text=True,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
        return {
            "args": args,
            "returncode": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
        }
    except Exception as exc:
        return {
            "args": args,
            "returncode": -1,
            "stdout": "",
            "stderr": repr(exc),
            "elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
        }


def ns_to_ms(value: Any) -> float | None:
    if not isinstance(value, (int, float)):
        return None
    return round(value / 1_000_000, 2)


def tokens_per_second(count: Any, duration_ns: Any) -> float | None:
    if not isinstance(count, (int, float)) or not isinstance(duration_ns, (int, float)):
        return None
    if duration_ns <= 0:
        return None
    return round(float(count) / (duration_ns / 1_000_000_000), 2)


def post_chat(model: str, prompt: str, keep_alive: str = "5m", timeout: int = 240) -> dict[str, Any]:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "keep_alive": keep_alive,
        "options": MODEL_OPTIONS,
    }
    request = urllib.request.Request(
        OLLAMA_CHAT_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode("utf-8")
        data = json.loads(body)
        data["client_elapsed_ms"] = round((time.perf_counter() - started) * 1000, 2)
        return data
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return {
            "error": repr(exc),
            "client_elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
        }


def stop_model(model: str) -> dict[str, Any]:
    return run_cmd(["ollama", "stop", model], timeout=60)


def get_ollama_process_snapshot() -> dict[str, Any]:
    pgrep = run_cmd(["pgrep", "-f", "ollama"], timeout=10)
    pids = [line.strip() for line in pgrep["stdout"].splitlines() if line.strip().isdigit()]
    if not pids:
        return {"pids": [], "total_rss_mb": None, "ps": ""}
    ps = run_cmd(["ps", "-o", "pid=", "-o", "rss=", "-o", "comm=", "-p", ",".join(pids)], timeout=10)
    total_kb = 0
    for line in ps["stdout"].splitlines():
        parts = line.split(None, 2)
        if len(parts) >= 2 and parts[1].isdigit():
            total_kb += int(parts[1])
    return {
        "pids": pids,
        "total_rss_mb": round(total_kb / 1024, 1) if total_kb else None,
        "ps": ps["stdout"],
    }


def parse_ollama_list(raw: str) -> dict[str, str]:
    sizes: dict[str, str] = {}
    for line in raw.splitlines()[1:]:
        parts = re.split(r"\s{2,}", line.strip())
        if len(parts) >= 3:
            sizes[parts[0]] = parts[2]
    return sizes


def parse_ollama_ps_for_model(raw: str, model: str) -> dict[str, str] | None:
    for line in raw.splitlines()[1:]:
        parts = re.split(r"\s{2,}", line.strip())
        if len(parts) >= 4 and parts[0] == model:
            return {
                "name": parts[0],
                "id": parts[1],
                "size": parts[2],
                "processor": parts[3],
                "until": parts[4] if len(parts) >= 5 else "",
            }
    return None


def extract_json(text: str) -> Any | None:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped, flags=re.IGNORECASE)
        stripped = re.sub(r"\s*```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    first = stripped.find("{")
    last = stripped.rfind("}")
    if first >= 0 and last > first:
        try:
            return json.loads(stripped[first : last + 1])
        except json.JSONDecodeError:
            return None
    return None


def script_ok(text: str, expected_script: str) -> bool:
    if not text.strip():
        return False
    if expected_script == "cjk":
        return len(re.findall(r"[\u4e00-\u9fff]", text)) >= 20
    if expected_script == "devanagari":
        return len(re.findall(r"[\u0900-\u097f]", text)) >= 20
    if expected_script == "latin":
        cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
        devanagari = len(re.findall(r"[\u0900-\u097f]", text))
        latin = len(re.findall(r"[A-Za-z]", text))
        return latin >= 40 and cjk < 10 and devanagari < 10
    if expected_script == "json":
        return extract_json(text) is not None
    return True


def score_output(task: dict[str, Any], text: str, error: str | None) -> dict[str, Any]:
    if error:
        return {
            "score": 0,
            "response_present": False,
            "language_ok": False,
            "structure_ok": False,
            "anchor_hits": 0,
            "anchor_total": len(task.get("anchors", [])),
            "json_valid": False,
            "required_json_keys_present": 0,
            "notes": f"error: {error}",
        }

    response_present = bool(text.strip())
    language_ok = script_ok(text, task["expected_script"])
    lowered = text.lower()

    parsed_json = extract_json(text)
    json_valid = parsed_json is not None
    required_keys = task.get("required_json_keys", [])
    required_present = 0
    if isinstance(parsed_json, dict):
        required_present = sum(1 for key in required_keys if key in parsed_json)

    if task["expected_script"] == "json":
        structure_ok = json_valid and required_present == len(required_keys)
    else:
        section_terms = task.get("section_terms", [])
        section_hits = sum(1 for term in section_terms if term.lower() in lowered)
        bulletish = bool(re.search(r"(^|\n)\s*([-*•]|\d+[.)])\s+", text))
        structure_ok = section_hits >= max(1, math.ceil(len(section_terms) / 2)) or bulletish

    anchor_hits = 0
    for pattern in task.get("anchors", []):
        if re.search(pattern, text, flags=re.IGNORECASE):
            anchor_hits += 1
    anchor_total = len(task.get("anchors", []))
    anchor_ratio = anchor_hits / anchor_total if anchor_total else 1.0

    score = 0
    if response_present:
        score += 1
    if language_ok:
        score += 1
    if structure_ok:
        score += 1
    if anchor_ratio >= 0.75:
        score += 2
    elif anchor_ratio >= 0.45:
        score += 1

    return {
        "score": score,
        "response_present": response_present,
        "language_ok": language_ok,
        "structure_ok": structure_ok,
        "anchor_hits": anchor_hits,
        "anchor_total": anchor_total,
        "json_valid": json_valid,
        "required_json_keys_present": required_present,
        "notes": "",
    }


def summarize_model(rows: list[dict[str, Any]]) -> dict[str, Any]:
    ok_rows = [row for row in rows if not row.get("error")]

    def avg(field: str) -> float | None:
        values = [row.get(field) for row in ok_rows if isinstance(row.get(field), (int, float))]
        return round(statistics.mean(values), 2) if values else None

    def median(field: str) -> float | None:
        values = [row.get(field) for row in ok_rows if isinstance(row.get(field), (int, float))]
        return round(statistics.median(values), 2) if values else None

    return {
        "label": rows[0]["model_label"],
        "ollama": rows[0]["model"],
        "disk_size": rows[0].get("disk_size"),
        "runtime_size": rows[0].get("runtime_size"),
        "processor": rows[0].get("processor"),
        "warmup_total_ms": rows[0].get("warmup_total_ms"),
        "warmup_load_ms": rows[0].get("warmup_load_ms"),
        "ollama_rss_after_warmup_mb": rows[0].get("ollama_rss_after_warmup_mb"),
        "tasks": len(rows),
        "failures": sum(1 for row in rows if row.get("error")),
        "avg_total_ms": avg("total_ms"),
        "median_total_ms": median("total_ms"),
        "avg_client_elapsed_ms": avg("client_elapsed_ms"),
        "avg_eval_tokens_per_sec": avg("eval_tokens_per_sec"),
        "avg_prompt_tokens_per_sec": avg("prompt_tokens_per_sec"),
        "avg_output_tokens": avg("eval_count"),
        "avg_quality_score": avg("quality_score"),
        "language_ok_tasks": sum(1 for row in rows if row.get("language_ok")),
        "structure_ok_tasks": sum(1 for row in rows if row.get("structure_ok")),
        "json_valid": next((row["json_valid"] for row in rows if row["task_id"] == "mixed_json_extraction"), False),
    }


def write_outputs_markdown(path: Path, rows: list[dict[str, Any]]) -> None:
    lines = [
        "# Raw Model Outputs",
        "",
        "These are unedited outputs captured from Ollama during the local benchmark.",
        "",
    ]
    for row in rows:
        lines.append(f"## {row['model_label']} / {row['task_id']}")
        lines.append("")
        lines.append(
            f"- Total: {row.get('total_ms')} ms; output speed: {row.get('eval_tokens_per_sec')} tok/s; quality score: {row.get('quality_score')}/5"
        )
        if row.get("error"):
            lines.append(f"- Error: `{row['error']}`")
        lines.append("")
        lines.append("```text")
        lines.append(row.get("response", "").strip())
        lines.append("```")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    run_id = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    result_dir = RESULTS_ROOT / run_id
    result_dir.mkdir(parents=True, exist_ok=True)

    environment = {
        "run_id": run_id,
        "timestamp": dt.datetime.now().isoformat(timespec="seconds"),
        "ollama_version": run_cmd(["ollama", "--version"]),
        "ollama_list": run_cmd(["ollama", "list"]),
        "ollama_api_version": run_cmd(["curl", "-s", "http://127.0.0.1:11434/api/version"]),
        "hardware_model": run_cmd(["sysctl", "-n", "hw.model"]),
        "hardware_memory_bytes": run_cmd(["sysctl", "-n", "hw.memsize"]),
        "cpu_brand": run_cmd(["sysctl", "-n", "machdep.cpu.brand_string"]),
        "macos": run_cmd(["sw_vers"]),
        "disk": run_cmd(["df", "-h", "."]),
        "model_options": MODEL_OPTIONS,
        "tasks": TASKS,
    }
    (result_dir / "environment.json").write_text(
        json.dumps(environment, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    disk_sizes = parse_ollama_list(environment["ollama_list"]["stdout"])

    raw_rows: list[dict[str, Any]] = []

    for model_info in MODELS:
        model = model_info["ollama"]
        label = model_info["label"]
        print(f"\n=== {label} ({model}) ===", flush=True)
        stop_model(model)
        time.sleep(1.0)

        warmup = post_chat(model, "Reply with exactly: OK", keep_alive="5m", timeout=240)
        warmup_text = warmup.get("message", {}).get("content", "")
        print(f"warmup: {warmup_text.strip()[:80]}", flush=True)

        ps_after_warmup = run_cmd(["ollama", "ps"])
        ps_info = parse_ollama_ps_for_model(ps_after_warmup["stdout"], model) or {}
        rss_after_warmup = get_ollama_process_snapshot()

        for task in TASKS:
            print(f"- task: {task['id']}", flush=True)
            before_rss = get_ollama_process_snapshot()
            response = post_chat(model, task["prompt"], keep_alive="5m", timeout=300)
            after_rss = get_ollama_process_snapshot()

            error = response.get("error")
            content = response.get("message", {}).get("content", "") if not error else ""
            score = score_output(task, content, error)

            row = {
                "run_id": run_id,
                "model_label": label,
                "model": model,
                "disk_size": disk_sizes.get(model),
                "runtime_size": ps_info.get("size"),
                "processor": ps_info.get("processor"),
                "task_id": task["id"],
                "task_language": task["language"],
                "error": error,
                "response": content,
                "client_elapsed_ms": response.get("client_elapsed_ms"),
                "total_ms": ns_to_ms(response.get("total_duration")),
                "load_ms": ns_to_ms(response.get("load_duration")),
                "prompt_eval_ms": ns_to_ms(response.get("prompt_eval_duration")),
                "eval_ms": ns_to_ms(response.get("eval_duration")),
                "prompt_eval_count": response.get("prompt_eval_count"),
                "eval_count": response.get("eval_count"),
                "prompt_tokens_per_sec": tokens_per_second(
                    response.get("prompt_eval_count"),
                    response.get("prompt_eval_duration"),
                ),
                "eval_tokens_per_sec": tokens_per_second(
                    response.get("eval_count"),
                    response.get("eval_duration"),
                ),
                "quality_score": score["score"],
                "response_present": score["response_present"],
                "language_ok": score["language_ok"],
                "structure_ok": score["structure_ok"],
                "anchor_hits": score["anchor_hits"],
                "anchor_total": score["anchor_total"],
                "json_valid": score["json_valid"],
                "required_json_keys_present": score["required_json_keys_present"],
                "warmup_total_ms": ns_to_ms(warmup.get("total_duration")),
                "warmup_load_ms": ns_to_ms(warmup.get("load_duration")),
                "warmup_client_elapsed_ms": warmup.get("client_elapsed_ms"),
                "ollama_ps_after_warmup": ps_after_warmup["stdout"],
                "ollama_rss_before_mb": before_rss.get("total_rss_mb"),
                "ollama_rss_after_mb": after_rss.get("total_rss_mb"),
                "ollama_rss_after_warmup_mb": rss_after_warmup.get("total_rss_mb"),
                "ollama_processes_after_warmup": rss_after_warmup.get("ps"),
            }
            raw_rows.append(row)
            print(
                f"  total={row['total_ms']}ms, out={row['eval_tokens_per_sec']} tok/s, score={row['quality_score']}/5",
                flush=True,
            )

        stop_model(model)
        time.sleep(1.0)

    raw_jsonl = result_dir / "raw_results.jsonl"
    with raw_jsonl.open("w", encoding="utf-8") as handle:
        for row in raw_rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    detailed_csv = result_dir / "detailed_results.csv"
    detail_fields = [
        "run_id",
        "model_label",
        "model",
        "disk_size",
        "runtime_size",
        "processor",
        "task_id",
        "task_language",
        "error",
        "client_elapsed_ms",
        "total_ms",
        "load_ms",
        "prompt_eval_ms",
        "eval_ms",
        "prompt_eval_count",
        "eval_count",
        "prompt_tokens_per_sec",
        "eval_tokens_per_sec",
        "quality_score",
        "response_present",
        "language_ok",
        "structure_ok",
        "anchor_hits",
        "anchor_total",
        "json_valid",
        "required_json_keys_present",
        "ollama_rss_before_mb",
        "ollama_rss_after_mb",
    ]
    with detailed_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=detail_fields)
        writer.writeheader()
        for row in raw_rows:
            writer.writerow({field: row.get(field) for field in detail_fields})

    summary_rows = []
    for model_info in MODELS:
        model_rows = [row for row in raw_rows if row["model"] == model_info["ollama"]]
        summary_rows.append(summarize_model(model_rows))

    summary_json = result_dir / "summary.json"
    summary_json.write_text(json.dumps(summary_rows, indent=2, ensure_ascii=False), encoding="utf-8")

    summary_csv = result_dir / "summary.csv"
    summary_fields = list(summary_rows[0].keys())
    with summary_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=summary_fields)
        writer.writeheader()
        writer.writerows(summary_rows)

    write_outputs_markdown(result_dir / "raw_outputs.md", raw_rows)

    print(f"\nResults written to: {result_dir}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
