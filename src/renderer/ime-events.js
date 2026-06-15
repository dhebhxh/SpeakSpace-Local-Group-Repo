(function attachImeEvents(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.SpeakSpaceIme = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createImeEvents() {
  const COMPOSITION_END_SUPPRESS_MS = 80;
  const textCompositionState = new WeakMap();

  function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }

    return Date.now();
  }

  function getEventTarget(event) {
    return event?.currentTarget || event?.target || null;
  }

  function getState(target) {
    if (!target || (typeof target !== "object" && typeof target !== "function")) {
      return null;
    }

    let state = textCompositionState.get(target);
    if (!state) {
      state = {
        isComposing: false,
        lastCompositionEndAt: 0,
      };
      textCompositionState.set(target, state);
    }

    return state;
  }

  function markTextCompositionStart(event) {
    const state = getState(getEventTarget(event));
    if (!state) return;

    state.isComposing = true;
    state.lastCompositionEndAt = 0;
  }

  function markTextCompositionEnd(event) {
    const state = getState(getEventTarget(event));
    if (!state) return;

    state.isComposing = false;
    state.lastCompositionEndAt = nowMs();
  }

  function isLegacyImeKeyEvent(event) {
    return event?.keyCode === 229 || event?.which === 229 || event?.key === "Process";
  }

  function isTextComposing(event) {
    const state = getState(getEventTarget(event));
    return Boolean(event?.isComposing || isLegacyImeKeyEvent(event) || state?.isComposing);
  }

  function didTextCompositionJustEnd(event) {
    const state = getState(getEventTarget(event));
    if (!state?.lastCompositionEndAt) return false;

    return nowMs() - state.lastCompositionEndAt < COMPOSITION_END_SUPPRESS_MS;
  }

  function getTextInputEnterIntent(event) {
    if (event?.key !== "Enter" || event?.shiftKey) {
      return "none";
    }

    if (isTextComposing(event)) {
      return "compose";
    }

    if (didTextCompositionJustEnd(event)) {
      return "ignore";
    }

    return "submit";
  }

  function bindTextCompositionTracking(input) {
    if (!input?.addEventListener) {
      return () => {};
    }

    input.addEventListener("compositionstart", markTextCompositionStart);
    input.addEventListener("compositionend", markTextCompositionEnd);

    return () => {
      input.removeEventListener("compositionstart", markTextCompositionStart);
      input.removeEventListener("compositionend", markTextCompositionEnd);
    };
  }

  return {
    bindTextCompositionTracking,
    getTextInputEnterIntent,
    markTextCompositionEnd,
    markTextCompositionStart,
  };
});
