import { describe, it, expect } from "vitest";
import { ollamaToOpenAIResponse } from "../../open-sse/translator/response/ollama-to-openai.js";

describe("ollamaToOpenAIResponse", () => {
  it("translates a content chunk and updates state", () => {
    const state = {};
    const chunk = {
      model: "test-model",
      message: {
        role: "assistant",
        content: "hello"
      },
      done: false
    };

    const out = ollamaToOpenAIResponse(chunk, state);
    expect(out).not.toBeNull();
    expect(out.choices[0].delta.content).toBe("hello");
    expect(out.choices[0].finish_reason).toBeNull();
    expect(state.accumulatedContent).toBe("hello");
  });

  it("translates a final done chunk without content", () => {
    const state = {
      ollama: {
        id: "chatcmpl-12345",
        created: 1234567,
        model: "test-model"
      }
    };
    const chunk = {
      done: true,
      done_reason: "stop",
      prompt_eval_count: 5,
      eval_count: 10
    };

    const out = ollamaToOpenAIResponse(chunk, state);
    expect(out).not.toBeNull();
    expect(out.choices[0].delta).toEqual({});
    expect(out.choices[0].finish_reason).toBe("stop");
    expect(out.usage).toEqual({
      prompt_tokens: 5,
      completion_tokens: 10,
      total_tokens: 15
    });
  });

  it("translates a final done chunk WITH content without dropping it", () => {
    const state = {
      ollama: {
        id: "chatcmpl-12345",
        created: 1234567,
        model: "test-model"
      }
    };
    const chunk = {
      done: true,
      done_reason: "stop",
      message: {
        role: "assistant",
        content: "!"
      },
      prompt_eval_count: 5,
      eval_count: 10
    };

    const out = ollamaToOpenAIResponse(chunk, state);
    expect(out).not.toBeNull();
    expect(out.choices[0].delta.content).toBe("!");
    expect(out.choices[0].finish_reason).toBe("stop");
    expect(state.accumulatedContent).toBe("!");
    expect(out.usage).toEqual({
      prompt_tokens: 5,
      completion_tokens: 10,
      total_tokens: 15
    });
  });
});
