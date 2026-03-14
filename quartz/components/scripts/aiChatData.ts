import { FullSlug } from "../../util/path"

export interface AIChatShellOptions {
  label: string
  placeholder: string
  desktopWidth: number
  desktopMinWidth: number
  desktopMaxWidth: number
  storageKey: string
  uiOpenStorageKey: string
  uiWidthStorageKey: string
  enableMockResponses: boolean
  enableSelectionContext: boolean
}

export const desktopAIChatBreakpoint = 1200

export type ChatRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
  contextQuote?: string
  sourcePageSlug?: string
}

export interface ChatSessionState {
  isOpen: boolean
  draft: string
  selectedText?: string
  messages: ChatMessage[]
}

export interface PageContext {
  slug?: FullSlug | string
  title?: string
}

export interface ChatTransportRequest extends PageContext {
  prompt: string
  selectedText?: string
  history: ChatMessage[]
}

export interface ChatTransportResponse {
  message: ChatMessage
}

export interface ChatTransport {
  sendMessage(request: ChatTransportRequest): Promise<ChatTransportResponse>
}

export const defaultAIChatShellOptions: AIChatShellOptions = {
  label: "Ask Richard",
  placeholder: "Ask a question...",
  desktopWidth: 384,
  desktopMinWidth: 368,
  desktopMaxWidth: 576,
  storageKey: "ai-chat-shell:v1",
  uiOpenStorageKey: "ai-chat-shell:ui-open:v1",
  uiWidthStorageKey: "ai-chat-shell:ui-width:v1",
  enableMockResponses: true,
  enableSelectionContext: true,
}

export function clampAIChatWidth(
  width: number | null | undefined,
  config: Pick<AIChatShellOptions, "desktopWidth" | "desktopMinWidth" | "desktopMaxWidth">,
) {
  const fallback = config.desktopWidth
  const candidate = Number.isFinite(width) ? Number(width) : fallback

  return Math.min(config.desktopMaxWidth, Math.max(config.desktopMinWidth, candidate))
}

type PageSection = "home" | "posts" | "updates" | "resources" | "generic"

function normalizeSlug(slug?: FullSlug | string): string {
  return slug?.replace(/^\/+|\/+$/g, "") ?? ""
}

export function getPageSection(slug?: FullSlug | string): PageSection {
  const normalizedSlug = normalizeSlug(slug)

  if (normalizedSlug.length === 0 || normalizedSlug === "index") {
    return "home"
  }

  if (normalizedSlug.startsWith("posts/")) {
    return "posts"
  }

  if (normalizedSlug.startsWith("updates/")) {
    return "updates"
  }

  if (normalizedSlug.startsWith("resources/")) {
    return "resources"
  }

  return "generic"
}

export function getStarterPrompts(context: PageContext): string[] {
  switch (getPageSection(context.slug)) {
    case "home":
      return [
        "What should I read first on this site?",
        "How do design and engineering show up in your work?",
        "What are the best recent updates to start with?",
        "Which resources influenced how you build things?",
      ]
    case "posts":
      return [
        `What is the core idea in ${context.title ?? "this post"}?`,
        "What are the main takeaways here?",
        "How does this post connect to your recent work?",
        "What should I read after this article?",
      ]
    case "updates":
      return [
        `What changed in ${context.title ?? "this update"}?`,
        "What are the most important progress points here?",
        "What are you experimenting with right now?",
        "What should I watch for in the next update?",
      ]
    case "resources":
      return [
        `Why does ${context.title ?? "this resource"} matter to you?`,
        "What lesson did you pull from this resource?",
        "How does this resource affect how you build?",
        "What related resources should I explore next?",
      ]
    default:
      return [
        "What is this page about?",
        "How does this fit into the rest of the site?",
        "What should I look at next?",
        "What is the key takeaway here?",
      ]
  }
}

export function getGreeting(context: PageContext): string {
  switch (getPageSection(context.slug)) {
    case "home":
      return "Ask about recent posts, weekly updates, or how design and engineering overlap in the work on this site."
    case "posts":
      return `Use the shell to unpack ${context.title ?? "this post"}, pull out the key ideas, or decide what to read next.`
    case "updates":
      return `Use the shell to summarize ${context.title ?? "this update"} or trace what changed across recent work.`
    case "resources":
      return `Use the shell to understand why ${context.title ?? "this resource"} was saved and how it connects to the rest of the site.`
    default:
      return "Use the shell to explore this page, pull in selected text, and prototype the future assistant workflow."
  }
}

export function serializeSelectedText(text?: string | null, maxLength: number = 220) {
  const normalizedText = text?.replace(/\s+/g, " ").trim()
  if (!normalizedText) {
    return undefined
  }

  if (normalizedText.length <= maxLength) {
    return normalizedText
  }

  return `${normalizedText.slice(0, maxLength - 1).trimEnd()}…`
}

function normalizeMessage(message: unknown): ChatMessage | null {
  if (!message || typeof message !== "object") {
    return null
  }

  const candidate = message as Partial<ChatMessage>
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.role !== "string" ||
    typeof candidate.content !== "string" ||
    typeof candidate.timestamp !== "string"
  ) {
    return null
  }

  const normalizedMessage: ChatMessage = {
    id: candidate.id,
    role: candidate.role === "assistant" || candidate.role === "system" ? candidate.role : "user",
    content: candidate.content,
    timestamp: candidate.timestamp,
  }

  const contextQuote =
    typeof candidate.contextQuote === "string"
      ? serializeSelectedText(candidate.contextQuote)
      : undefined
  if (contextQuote) {
    normalizedMessage.contextQuote = contextQuote
  }

  if (typeof candidate.sourcePageSlug === "string") {
    normalizedMessage.sourcePageSlug = candidate.sourcePageSlug
  }

  return normalizedMessage
}

export function createEmptyChatSessionState(
  overrides: Partial<ChatSessionState> = {},
): ChatSessionState {
  return {
    isOpen: false,
    draft: "",
    messages: [],
    ...overrides,
    selectedText: serializeSelectedText(overrides.selectedText),
  }
}

export function resetChatSessionState(isOpen: boolean = false): ChatSessionState {
  return createEmptyChatSessionState({ isOpen })
}

export function serializeChatSessionState(state: ChatSessionState): string {
  return JSON.stringify({
    isOpen: state.isOpen,
    draft: state.draft,
    selectedText: serializeSelectedText(state.selectedText),
    messages: state.messages,
  })
}

export function deserializeChatSessionState(raw: string | null | undefined): ChatSessionState {
  if (!raw) {
    return createEmptyChatSessionState()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ChatSessionState>
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages
          .map(normalizeMessage)
          .filter((message): message is ChatMessage => message !== null)
      : []

    return createEmptyChatSessionState({
      isOpen: parsed.isOpen === true,
      draft: typeof parsed.draft === "string" ? parsed.draft : "",
      selectedText:
        typeof parsed.selectedText === "string"
          ? serializeSelectedText(parsed.selectedText)
          : undefined,
      messages,
    })
  } catch {
    return createEmptyChatSessionState()
  }
}

function getPageSummary(context: PageContext): string {
  switch (getPageSection(context.slug)) {
    case "home":
      return "The homepage version should steer visitors toward the strongest entry points across posts, updates, and saved resources."
    case "posts":
      return `This page is a post${context.title ? ` titled "${context.title}"` : ""}, so the assistant should summarize the argument, highlight the takeaways, and connect it to nearby writing.`
    case "updates":
      return `This page is a progress update${context.title ? ` titled "${context.title}"` : ""}, so the assistant should focus on what changed, what shipped, and what is next.`
    case "resources":
      return `This page is a resource note${context.title ? ` for "${context.title}"` : ""}, so the assistant should explain why it matters and what it influenced.`
    default:
      return "This page should be treated as a contextual stop in the site, with the assistant helping visitors figure out why it matters and where to go next."
  }
}

export function buildMockAssistantContent(request: ChatTransportRequest): string {
  const prompt = request.prompt.trim()
  const lowerPrompt = prompt.toLowerCase()
  const pageSummary = getPageSummary(request)

  if (request.selectedText) {
    return `You are asking about a selected passage from ${request.title ?? "this page"}: "${request.selectedText}". ${pageSummary} In a live version, this quote would be attached to the retrieval context before the assistant answers.`
  }

  if (lowerPrompt.includes("next") || lowerPrompt.includes("read")) {
    return `${pageSummary} For this prototype, the assistant would next suggest adjacent pages, recent writing, and the strongest follow-on resource based on the current page type.`
  }

  if (lowerPrompt.includes("update") || lowerPrompt.includes("working")) {
    return `${pageSummary} The update-oriented path should emphasize recent experiments, momentum, and what changed since the last checkpoint.`
  }

  if (lowerPrompt.includes("resource") || lowerPrompt.includes("book")) {
    return `${pageSummary} The resource-oriented path should focus on why the reference was saved and how it changes the way you think or build.`
  }

  if (lowerPrompt.includes("design") || lowerPrompt.includes("engineering")) {
    return `${pageSummary} A real assistant here should bridge the design and engineering angles instead of answering from only one discipline.`
  }

  return `${pageSummary} This is a deterministic mock response for the UI shell, so no live model is running yet, but the message shape is ready for a real transport.`
}

function createMockAssistantMessage(request: ChatTransportRequest): ChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: buildMockAssistantContent(request),
    timestamp: new Date().toISOString(),
    sourcePageSlug: normalizeSlug(request.slug),
  }
}

export class LocalMockTransport implements ChatTransport {
  enabled: boolean

  constructor(enabled: boolean = true) {
    this.enabled = enabled
  }

  async sendMessage(request: ChatTransportRequest): Promise<ChatTransportResponse> {
    if (!this.enabled) {
      return {
        message: {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "The shell is ready for a real chat transport, but mock responses are currently disabled.",
          timestamp: new Date().toISOString(),
          sourcePageSlug: normalizeSlug(request.slug),
        },
      }
    }

    return { message: createMockAssistantMessage(request) }
  }
}
