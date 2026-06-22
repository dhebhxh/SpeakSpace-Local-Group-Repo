const assert = require("node:assert/strict");
const test = require("node:test");

const {
  appendAgentConversationTurn,
  hasSaveableAgentConversation,
  resetAgentConversationState,
  shouldResetOnlyAgentForNewSession,
} = require("../src/renderer/agent-conversation-state");

test("agent turns become readable saveable note text with bounded tool summaries", () => {
  const state = appendAgentConversationTurn(resetAgentConversationState(), {
    instruction: "Find my CRM launch note and summarize the date.",
    result: {
      finalText: "The CRM launch is planned for July 12.",
      steps: [
        {
          type: "tool_result",
          tool: "search_notes",
          args: { query: "CRM launch" },
          ok: true,
          result: "Matched note n1. ".repeat(80),
          data: { notes: [{ id: "n1", raw: "not intended for note text" }] },
        },
      ],
    },
  });

  assert.equal(hasSaveableAgentConversation(state), true);
  assert.match(state.noteText, /Agent Mode Conversation/);
  assert.match(state.noteText, /User:\nFind my CRM launch note/);
  assert.match(state.noteText, /Tool: search_notes/);
  assert.match(state.noteText, /"query": "CRM launch"/);
  assert.match(state.noteText, /\.\.\.\[truncated\]/);
  assert.doesNotMatch(state.noteText, /not intended for note text/);
  assert.match(state.noteText, /Assistant:\nThe CRM launch is planned for July 12\./);
});

test("reset agent conversation state removes saveable note content", () => {
  const state = appendAgentConversationTurn(resetAgentConversationState(), {
    instruction: "Summarize this.",
    result: { finalText: "Summary." },
  });

  assert.equal(hasSaveableAgentConversation(state), true);

  const reset = resetAgentConversationState();

  assert.equal(hasSaveableAgentConversation(reset), false);
  assert.deepEqual(reset.turns, []);
  assert.equal(reset.noteText, "");
});

test("new session only resets agent in-place while the assistant agent view is active", () => {
  assert.equal(
    shouldResetOnlyAgentForNewSession({ agentMode: true, currentView: "assistant" }),
    true
  );
  assert.equal(
    shouldResetOnlyAgentForNewSession({ agentMode: true, currentView: "detail" }),
    false
  );
  assert.equal(
    shouldResetOnlyAgentForNewSession({ agentMode: true, currentView: "meeting-review" }),
    false
  );
  assert.equal(
    shouldResetOnlyAgentForNewSession({ agentMode: false, currentView: "assistant" }),
    false
  );
});
