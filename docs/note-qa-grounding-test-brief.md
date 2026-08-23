# Ask AI grounded note Q&A progress brief

_Last updated: 2026-06-26_

This is a lightweight progress note for the group report writer. It summarises the current Ask AI / note Q&A change, why we changed it, and what should be tested next.

## Short summary

We changed the note-level Ask AI feature so that it is guided mainly by prompt constraints instead of a heavy post-response validator.

The goal is to let users ask natural questions about a saved note while keeping answers grounded in the current note/transcript. The app now tells the local model to use only the current note/transcript as the factual source, while still allowing natural reasoning such as summarising, translating, and correcting false assumptions when the note supports it.

The change is currently on the testing branch:

```text
fix/note-qa-grounded-ai-jack
```

It has not been merged into `Jack` yet.

## What changed

### 1. Prompt-only grounding for Ask AI

The Ask AI system prompt now explicitly says:

- the current note/transcript is the factual source;
- user-confirmed structured content should be preferred;
- the transcript can be used as supporting evidence;
- Recent Q&A is only conversation context, not a factual source;
- the model should not use external/world knowledge;
- if the note does not contain enough information, the model should say that in the user's language;
- the model may infer, translate, summarise, and correct false premises when the current note supports it.

This is implemented in:

```text
src/main/structured-processor.js
```

### 2. Removed heavy post-response validation

An earlier version added code-side checks for evidence, target entities, relations, numeric values, negation, and similar grounding cases. In testing, this became too restrictive: valid questions were often turned into fallback responses such as "The note does not contain that information."

The current branch removes that heavy validator. The code no longer decides whether `Evidence` is valid enough to allow an answer. The model answer is returned after light cleanup.

### 3. Clean user-facing output

Even though the prompt asks for a user-facing answer, local models may still output labels such as:

```text
Answer: Alice.
Evidence: "Alice owns Project Y."
```

The app strips these labels before showing the answer to the user. Inline evidence labels are also removed, for example:

```text
Alice. Evidence: "Alice owns Project Y."
Alice.Evidence: "Alice owns Project Y."
```

This keeps the UI clean without using Evidence as a hard validator.

### 4. Longer transcript excerpt

The transcript excerpt passed into Ask AI was increased from `2200` to `8000` characters.

This gives the local model more of the original transcript when answering follow-up questions about medium-length voice notes, lectures, or meeting notes.

Approximate coverage depends heavily on speaking speed and language:

| Transcript character limit | English speech, rough coverage | Chinese speech, rough coverage | Mixed meeting/class notes, rough coverage |
|---:|---:|---:|---:|
| 2,200 | 2.2–3.1 min | 7.9–12.2 min | 2.9–6.3 min |
| 4,000 | 4.0–5.7 min | 14.3–22.2 min | 5.3–11.4 min |
| 6,000 | 6.0–8.6 min | 21.4–33.3 min | 8.0–17.1 min |
| 8,000 | 8.0–11.4 min | 28.6–44.4 min | 10.7–22.9 min |
| 10,000 | 10.0–14.3 min | 35.7–55.6 min | 13.3–28.6 min |

For this project, `8000` is a practical default: it gives noticeably more context than `2200`, while avoiding very large prompts that may slow down smaller local models.

## Why this approach

The stricter validator was safer in theory, but it made the feature feel unusable in practice because many reasonable model answers were blocked. The current approach favours a more usable local-first experience:

- grounding is handled mainly by prompt design;
- the model remains flexible enough for cross-language questions and natural reasoning;
- the app avoids exposing internal `Evidence` labels;
- the transcript excerpt is long enough for most short-to-medium notes.

This is a trade-off: prompt-only grounding is less formally strict than a validator, but it currently gives better user experience with the selected local model family.

## Suggested testing focus

When teammates test this branch, useful test cases include:

1. **Basic grounded Q&A**
   - Save a note with a clear fact, then ask about that fact.
   - Expected: the model answers directly.

2. **Unsupported question**
   - Ask about something not in the note.
   - Expected: the model says the note does not contain that information, rather than inventing details.

3. **Cross-language Q&A**
   - Use an English transcript and ask in Chinese, or the opposite.
   - Expected: the model answers in the user's question language if the note supports it.

4. **False-premise correction**
   - Example: note says the total score is 100; ask whether it is 120.
   - Expected: the model corrects the premise using the note.

5. **Medium-length transcripts**
   - Use a longer meeting/class note where the relevant information appears after the opening section.
   - Expected: the `8000` character excerpt gives enough context for more follow-up questions than before.

6. **Recent Q&A contamination**
   - Ask a misleading question in one turn, then ask again.
   - Expected: previous chat turns should not become factual evidence if the current note does not support them.

## Files changed

Main implementation:

```text
src/main/structured-processor.js
```

Tests:

```text
tests/note-qa-context.test.js
```

Documentation:

```text
README.md
docs/note-qa-grounding-test-brief.md
```

## Verification run locally

The branch has been checked locally with:

```text
node --test tests/note-qa-context.test.js
npm test
npm run verify:local
git -c core.whitespace=cr-at-eol diff --check
```

All passed at the time this brief was written.

## Current status

Ready for teammate testing on the branch. Not merged into `Jack` yet.
