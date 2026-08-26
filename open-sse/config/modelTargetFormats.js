// Transport exceptions for dynamically fetched provider models.
export const PROVIDER_MODEL_TARGET_FORMATS = {
  oc: Object.fromEntries([
    ...[
      "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.5", "gpt-5.5-pro",
      "gpt-5.4", "gpt-5.4-pro", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.3-codex",
      "gpt-5.3-codex-spark", "gpt-5.2", "gpt-5.2-codex", "gpt-5.1", "gpt-5.1-codex",
      "gpt-5.1-codex-max", "gpt-5.1-codex-mini", "gpt-5", "gpt-5-codex", "gpt-5-nano",
      "grok-4.6", "grok-4.5", "grok-build-0.1", "muse-spark-1.2",
      "muse-spark-1.2-contributor-free",
    ].map(model => [model, "openai-responses"]),
    ...[
      "claude-fable-5", "claude-opus-5", "claude-opus-4-8", "claude-opus-4-7",
      "claude-opus-4-6", "claude-opus-4-5", "claude-sonnet-5", "claude-sonnet-4-6",
      "claude-sonnet-4-5", "claude-haiku-4-5", "qwen3.7-max", "qwen3.7-plus",
      "qwen3.6-plus", "qwen3.5-plus",
    ].map(model => [model, "claude"]),
    ...[
      "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash",
      "gemini-3.5-flash-lite", "gemini-3.1-pro", "gemini-3-flash",
    ].map(model => [model, "gemini"]),
  ]),
};
