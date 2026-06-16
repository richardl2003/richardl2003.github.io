import test, { describe } from "node:test"
import assert from "node:assert"

import {
  buildMockAssistantContent,
  createEmptyChatSessionState,
  deserializeChatSessionState,
  getStarterPrompts,
  resetChatSessionState,
  serializeChatSessionState,
  serializeSelectedText,
} from "./aiChatData"

describe("ai chat data", () => {
  test("selects prompt sets by slug", () => {
    assert.match(getStarterPrompts({ slug: "index" })[0], /read first/i)
    assert.match(getStarterPrompts({ slug: "posts/example-post", title: "Example Post" })[0], /Example Post/)
    assert.match(getStarterPrompts({ slug: "updates/weekly-update-1" })[0], /changed/i)
    assert.match(getStarterPrompts({ slug: "resources/books/example-book" })[0], /matter/i)
  })

  test("mock response mapping is deterministic and page aware", () => {
    const postReply = buildMockAssistantContent({
      prompt: "What should I read next?",
      history: [],
      slug: "posts/year-in-review-2025",
      title: "Year in Review 2025",
    })
    assert.match(postReply, /Year in Review 2025/)
    assert.match(postReply, /follow-on resource/i)

    const quoteReply = buildMockAssistantContent({
      prompt: "Explain this quote",
      history: [],
      slug: "resources/books/the-courage-to-be-disliked",
      title: "The Courage to be Disliked",
      selectedText: "Separation of tasks matters.",
    })
    assert.match(quoteReply, /selected passage/i)
    assert.match(quoteReply, /Separation of tasks matters/)
  })

  test("serializes selected text into a compact chip-safe string", () => {
    assert.strictEqual(serializeSelectedText("  hello \n\n world  "), "hello world")
    assert.strictEqual(serializeSelectedText("   "), undefined)
    assert.strictEqual(serializeSelectedText("a".repeat(240), 20), `${"a".repeat(19)}…`)
  })

  test("session state round-trips through serialization", () => {
    const state = createEmptyChatSessionState({
      isOpen: true,
      draft: "Draft question",
      selectedText: "Selected text",
      messages: [
        {
          id: "user-1",
          role: "user",
          content: "Hello",
          timestamp: "2026-03-12T10:00:00.000Z",
          sourcePageSlug: "index",
        },
      ],
    })

    const restored = deserializeChatSessionState(serializeChatSessionState(state))
    assert.deepStrictEqual(restored, state)
  })

  test("reset and invalid restore both fall back safely", () => {
    assert.deepStrictEqual(resetChatSessionState(true), {
      isOpen: true,
      draft: "",
      messages: [],
      selectedText: undefined,
    })

    assert.deepStrictEqual(deserializeChatSessionState("{invalid json"), {
      isOpen: false,
      draft: "",
      messages: [],
      selectedText: undefined,
    })
  })
})
