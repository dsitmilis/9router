import { describe, it, expect } from "vitest";
import { claudeToOpenAIResponse } from "../../open-sse/translator/response/claude-to-openai.js";

describe("claudeToOpenAIResponse with thinking off", () => {
  it("strips thinking block and tags when state.isThinkingOff is true", () => {
    const state = {
      messageId: "12345",
      model: "MiniMax-M3",
      isThinkingOff: true
    };

    // 1. message_start
    const resStart = claudeToOpenAIResponse({ type: "message_start", message: { id: "msg-1", model: "MiniMax-M3" } }, state);
    expect(resStart).not.toBeNull();

    // 2. content_block_start for thinking
    const chunkStart = {
      type: "content_block_start",
      index: 0,
      content_block: {
        type: "thinking"
      }
    };
    const resBlockStart = claudeToOpenAIResponse(chunkStart, state);
    // Should not return <think> chunk
    expect(resBlockStart).toBeNull();

    // 3. content_block_delta for thinking_delta
    const chunkDelta = {
      type: "content_block_delta",
      index: 0,
      delta: {
        type: "thinking_delta",
        thinking: "Let me think..."
      }
    };
    const resBlockDelta = claudeToOpenAIResponse(chunkDelta, state);
    // Should not return reasoning_content chunk
    expect(resBlockDelta).toBeNull();

    // 4. content_block_stop
    const chunkStop = {
      type: "content_block_stop",
      index: 0
    };
    const resBlockStop = claudeToOpenAIResponse(chunkStop, state);
    // Should not return </think> chunk
    expect(resBlockStop).toBeNull();
  });

  it("keeps thinking block and tags when state.isThinkingOff is false", () => {
    const state = {
      messageId: "12345",
      model: "MiniMax-M3",
      isThinkingOff: false
    };

    // 1. message_start
    claudeToOpenAIResponse({ type: "message_start", message: { id: "msg-1", model: "MiniMax-M3" } }, state);

    // 2. content_block_start for thinking
    const chunkStart = {
      type: "content_block_start",
      index: 0,
      content_block: {
        type: "thinking"
      }
    };
    const resBlockStart = claudeToOpenAIResponse(chunkStart, state);
    expect(resBlockStart[0].choices[0].delta.content).toBe("<think>");

    // 3. content_block_delta for thinking_delta
    const chunkDelta = {
      type: "content_block_delta",
      index: 0,
      delta: {
        type: "thinking_delta",
        thinking: "Let me think..."
      }
    };
    const resBlockDelta = claudeToOpenAIResponse(chunkDelta, state);
    expect(resBlockDelta[0].choices[0].delta.reasoning_content).toBe("Let me think...");

    // 4. content_block_stop
    const chunkStop = {
      type: "content_block_stop",
      index: 0
    };
    const resBlockStop = claudeToOpenAIResponse(chunkStop, state);
    expect(resBlockStop[0].choices[0].delta.content).toBe("</think>");
  });
});
