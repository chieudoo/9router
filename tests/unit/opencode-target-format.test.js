import { describe, expect, it } from "vitest";

import { PROVIDER_MODEL_TARGET_FORMATS } from "../../open-sse/config/modelTargetFormats.js";
import { getModelTargetFormat } from "../../open-sse/config/providerModels.js";
import { OpenCodeExecutor } from "../../open-sse/executors/opencode.js";

describe("OpenCode model target formats", () => {
  it("routes every documented non-Chat model to its endpoint", () => {
    const executor = new OpenCodeExecutor();
    for (const [model, format] of Object.entries(PROVIDER_MODEL_TARGET_FORMATS.oc)) {
      expect(getModelTargetFormat("oc", model)).toBe(format);
      const url = executor.buildUrl(model, true);
      if (format === "openai-responses") expect(url).toBe("https://opencode.ai/zen/v1/responses");
      if (format === "claude") expect(url).toBe("https://opencode.ai/zen/v1/messages");
      if (format === "gemini") expect(url).toBe(`https://opencode.ai/zen/v1/models/${model}:streamGenerateContent?alt=sse`);
    }
  });

  it("keeps models without an official endpoint declaration on Chat Completions", () => {
    expect(new OpenCodeExecutor().buildUrl("deepseek-v4-flash-free"))
      .toBe("https://opencode.ai/zen/v1/chat/completions");
  });
});
