(function exposeAgentConversationState(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.agentConversationState = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  const DEFAULT_MAX_TOOL_TEXT_CHARS = 1200;
  const DEFAULT_MAX_TOOL_ARGS_CHARS = 600;

  function cleanText(value) {
    return String(value ?? "").replace(/\r\n/g, "\n").trim();
  }

  function clipText(value, maxChars) {
    const text = cleanText(value);
    if (!Number.isFinite(maxChars) || maxChars <= 0 || text.length <= maxChars) {
      return text;
    }
    return `${text.slice(0, maxChars).trimEnd()}...[truncated]`;
  }

  function stringifyValue(value, maxChars) {
    if (value == null) return "";
    try {
      return clipText(JSON.stringify(value, null, 2), maxChars);
    } catch (_error) {
      return clipText(value, maxChars);
    }
  }

  function normalizeToolStep(step, options = {}) {
    if (!step || step.type !== "tool_result") return null;
    const tool = cleanText(step.tool);
    const args = stringifyValue(step.args, options.maxToolArgsChars ?? DEFAULT_MAX_TOOL_ARGS_CHARS);
    const resultText = step.ok === false ? step.error || step.result : step.result;
    const result = clipText(resultText, options.maxToolTextChars ?? DEFAULT_MAX_TOOL_TEXT_CHARS);
    if (!tool && !args && !result) return null;
    return {
      tool,
      args,
      ok: step.ok !== false,
      result,
    };
  }

  function normalizeTurn(turn = {}, options = {}) {
    const result = turn.result || {};
    const steps = Array.isArray(turn.steps)
      ? turn.steps
      : Array.isArray(result.steps)
      ? result.steps
      : [];
    const toolSteps = Array.isArray(turn.toolSteps)
      ? turn.toolSteps
          .map((step) => ({
            tool: cleanText(step.tool),
            args: clipText(step.args, options.maxToolArgsChars ?? DEFAULT_MAX_TOOL_ARGS_CHARS),
            ok: step.ok !== false,
            result: clipText(step.result, options.maxToolTextChars ?? DEFAULT_MAX_TOOL_TEXT_CHARS),
          }))
          .filter((step) => step.tool || step.args || step.result)
      : steps.map((step) => normalizeToolStep(step, options)).filter(Boolean);
    const finalStep = steps.find((step) => step && step.type === "final");

    return {
      userText: cleanText(turn.userText ?? turn.instruction),
      assistantText: cleanText(turn.assistantText ?? result.finalText ?? finalStep?.text),
      toolSteps,
    };
  }

  function hasSaveableTurn(turn) {
    return Boolean(turn?.userText || turn?.assistantText || (Array.isArray(turn?.toolSteps) && turn.toolSteps.length > 0));
  }

  function normalizeTurns(turns, options = {}) {
    return (Array.isArray(turns) ? turns : [])
      .map((turn) => normalizeTurn(turn, options))
      .filter(hasSaveableTurn);
  }

  function formatAgentConversationForNote(turns, options = {}) {
    const normalizedTurns = normalizeTurns(turns, options);
    if (normalizedTurns.length === 0) return "";

    const lines = ["Agent Mode Conversation"];
    normalizedTurns.forEach((turn, index) => {
      lines.push("", `Turn ${index + 1}`);
      if (turn.userText) {
        lines.push("User:", turn.userText);
      }
      if (turn.toolSteps.length > 0) {
        lines.push("", "Tool activity:");
        turn.toolSteps.forEach((step) => {
          lines.push(`- Tool: ${step.tool || "unknown"} (${step.ok ? "ok" : "error"})`);
          if (step.args) {
            lines.push("  Args:", indentBlock(step.args, "  "));
          }
          if (step.result) {
            lines.push("  Result:", indentBlock(step.result, "  "));
          }
        });
      }
      if (turn.assistantText) {
        lines.push("", "Assistant:", turn.assistantText);
      }
    });

    return lines.join("\n").trim();
  }

  function indentBlock(text, prefix) {
    return cleanText(text)
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
  }

  function createAgentConversationState(turns = [], options = {}) {
    const normalizedTurns = normalizeTurns(turns, options);
    return {
      turns: normalizedTurns,
      noteText: formatAgentConversationForNote(normalizedTurns, options),
    };
  }

  function resetAgentConversationState() {
    return {
      turns: [],
      noteText: "",
    };
  }

  function appendAgentConversationTurn(conversationState, turn, options = {}) {
    const currentTurns = Array.isArray(conversationState?.turns)
      ? conversationState.turns
      : Array.isArray(conversationState)
      ? conversationState
      : [];
    const nextTurn = normalizeTurn(turn, options);
    const nextTurns = hasSaveableTurn(nextTurn) ? [...currentTurns, nextTurn] : [...currentTurns];
    return createAgentConversationState(nextTurns, options);
  }

  function hasSaveableAgentConversation(conversationState) {
    if (!conversationState) return false;
    if (typeof conversationState.noteText === "string" && conversationState.noteText.trim()) return true;
    const turns = Array.isArray(conversationState?.turns) ? conversationState.turns : conversationState;
    return normalizeTurns(turns).length > 0;
  }

  function shouldResetOnlyAgentForNewSession({ agentMode, currentView } = {}) {
    return Boolean(agentMode) && currentView === "assistant";
  }

  return {
    appendAgentConversationTurn,
    createAgentConversationState,
    formatAgentConversationForNote,
    hasSaveableAgentConversation,
    resetAgentConversationState,
    shouldResetOnlyAgentForNewSession,
  };
});
