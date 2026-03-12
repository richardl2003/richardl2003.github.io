import {
  AIChatShellOptions,
  ChatMessage,
  ChatSessionState,
  LocalMockTransport,
  createEmptyChatSessionState,
  deserializeChatSessionState,
  getGreeting,
  getStarterPrompts,
  resetChatSessionState,
  serializeChatSessionState,
  serializeSelectedText,
} from "./aiChatData"

const desktopMediaQuery = "(min-width: 1200px)"
let messageCounter = 0

function createMessageId(prefix: ChatMessage["role"]) {
  messageCounter += 1
  return `${prefix}-${Date.now()}-${messageCounter}`
}

function readSessionState(storageKey: string): ChatSessionState {
  try {
    return deserializeChatSessionState(sessionStorage.getItem(storageKey))
  } catch {
    return createEmptyChatSessionState()
  }
}

function writeSessionState(storageKey: string, state: ChatSessionState) {
  try {
    sessionStorage.setItem(storageKey, serializeChatSessionState(state))
  } catch {}
}

function captureSelectedText() {
  return serializeSelectedText(window.getSelection?.()?.toString())
}

function setMobileScrollLock(isLocked: boolean) {
  if (window.matchMedia(desktopMediaQuery).matches) {
    document.body.style.overflow = ""
    document.documentElement.style.overflow = ""
    return
  }

  document.body.style.overflow = isLocked ? "hidden" : ""
  document.documentElement.style.overflow = isLocked ? "hidden" : ""
}

function createContextChip(selectedText: string) {
  const chip = document.createElement("div")
  chip.className = "ai-chat-context-chip"

  const text = document.createElement("p")
  text.textContent = selectedText
  chip.appendChild(text)

  const dismiss = document.createElement("button")
  dismiss.className = "ai-chat-context-dismiss"
  dismiss.type = "button"
  dismiss.setAttribute("aria-label", "Dismiss selected text")
  dismiss.textContent = "Dismiss"
  chip.appendChild(dismiss)

  return { chip, dismiss }
}

function createMessageNode(message: ChatMessage) {
  const wrapper = document.createElement("article")
  wrapper.className = `ai-chat-message ai-chat-message-${message.role}`

  if (message.contextQuote) {
    const quote = document.createElement("blockquote")
    quote.className = "ai-chat-message-context"
    quote.textContent = message.contextQuote
    wrapper.appendChild(quote)
  }

  const bubble = document.createElement("div")
  bubble.className = "ai-chat-message-bubble"

  const content = document.createElement("p")
  content.className = "ai-chat-message-content"
  content.textContent = message.content
  bubble.appendChild(content)

  wrapper.appendChild(bubble)
  return wrapper
}

function createTypingNode() {
  const wrapper = document.createElement("div")
  wrapper.className = "ai-chat-typing"

  for (let idx = 0; idx < 3; idx += 1) {
    const dot = document.createElement("span")
    dot.style.animationDelay = `${idx * 0.12}s`
    wrapper.appendChild(dot)
  }

  return wrapper
}

function setupAIChat(root: HTMLElement) {
  const config = {
    ...JSON.parse(root.dataset.config ?? "{}"),
  } as AIChatShellOptions
  const title = root.dataset.title ?? "this page"
  const slug = root.dataset.slug ?? document.body.dataset.slug ?? "index"
  const transport = new LocalMockTransport(config.enableMockResponses)

  const mobileLauncher = root.querySelector(".ai-chat-mobile-launcher") as HTMLButtonElement | null
  const backdrop = root.querySelector(".ai-chat-backdrop") as HTMLDivElement | null
  const panel = root.querySelector(".ai-chat-panel") as HTMLElement | null
  const emptyState = root.querySelector(".ai-chat-empty-state") as HTMLElement | null
  const greeting = root.querySelector(".ai-chat-greeting") as HTMLParagraphElement | null
  const promptsContainer = root.querySelector(".ai-chat-suggestions") as HTMLElement | null
  const messages = root.querySelector(".ai-chat-messages") as HTMLElement | null
  const contextContainer = root.querySelector(".ai-chat-context") as HTMLElement | null
  const input = root.querySelector(".ai-chat-input") as HTMLTextAreaElement | null
  const sendButton = root.querySelector(".ai-chat-send-button") as HTMLButtonElement | null
  const closeButton = root.querySelector(".ai-chat-close-button") as HTMLButtonElement | null
  const resetButton = root.querySelector(".ai-chat-reset-button") as HTMLButtonElement | null
  const infoButton = root.querySelector(".ai-chat-info-button") as HTMLButtonElement | null
  const infoPopover = root.querySelector(".ai-chat-info-popover") as HTMLElement | null
  const externalTriggers = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-open-ai-chat]"),
  )

  if (
    !mobileLauncher ||
    !backdrop ||
    !panel ||
    !emptyState ||
    !greeting ||
    !promptsContainer ||
    !messages ||
    !contextContainer ||
    !input ||
    !sendButton ||
    !closeButton ||
    !resetButton ||
    !infoButton ||
    !infoPopover
  ) {
    return
  }

  const mobileLauncherEl = mobileLauncher
  const backdropEl = backdrop
  const panelEl = panel
  const emptyStateEl = emptyState
  const greetingEl = greeting
  const promptsContainerEl = promptsContainer
  const messagesEl = messages
  const contextContainerEl = contextContainer
  const inputEl = input
  const sendButtonEl = sendButton
  const closeButtonEl = closeButton
  const resetButtonEl = resetButton
  const infoButtonEl = infoButton
  const infoPopoverEl = infoPopover

  document.documentElement.style.setProperty(
    "--ai-chat-panel-width",
    `${config.desktopWidth ?? 384}px`,
  )

  let state = readSessionState(config.storageKey)
  let isThinking = false
  let infoOpen = false

  function saveState() {
    writeSessionState(config.storageKey, state)
  }

  function syncPromptContent() {
    greetingEl.textContent = getGreeting({ slug, title })
    const prompts = getStarterPrompts({ slug, title })
    promptsContainerEl.replaceChildren(
      ...prompts.map((prompt) => {
        const button = document.createElement("button")
        button.className = "ai-chat-prompt"
        button.type = "button"
        button.dataset.aiChatPrompt = prompt
        button.textContent = prompt
        button.addEventListener("click", () => {
          void handleSubmit(prompt)
        })
        return button
      }),
    )
  }

  function autoResizeInput() {
    inputEl.style.height = "auto"
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 160)}px`
  }

  function focusInput() {
    requestAnimationFrame(() => {
      inputEl.focus()
      const valueLength = inputEl.value.length
      inputEl.setSelectionRange(valueLength, valueLength)
    })
  }

  function scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight
    })
  }

  function setOpen(nextIsOpen: boolean) {
    state = { ...state, isOpen: nextIsOpen }
    document.body.classList.toggle("ai-chat-open", nextIsOpen)
    document.body.classList.toggle("ai-chat-has-thread", state.messages.length > 0)
    panelEl.setAttribute("aria-hidden", String(!nextIsOpen))
    mobileLauncherEl.setAttribute("aria-expanded", String(nextIsOpen))
    externalTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", String(nextIsOpen))
    })
    setMobileScrollLock(nextIsOpen)
    saveState()
    render()

    if (nextIsOpen) {
      focusInput()
    } else {
      infoOpen = false
      renderInfoPopover()
    }
  }

  function renderInfoPopover() {
    infoPopoverEl.hidden = !infoOpen
    infoButtonEl.setAttribute("aria-expanded", String(infoOpen))
  }

  function renderContextChip() {
    contextContainerEl.replaceChildren()

    if (!state.selectedText) {
      return
    }

    const { chip, dismiss } = createContextChip(state.selectedText)
    dismiss.addEventListener("click", () => {
      state = { ...state, selectedText: undefined }
      saveState()
      render()
    })
    contextContainerEl.appendChild(chip)
  }

  function renderMessages() {
    messagesEl.replaceChildren()
    messagesEl.append(...state.messages.map(createMessageNode))

    if (isThinking) {
      messagesEl.appendChild(createTypingNode())
    }

    emptyStateEl.hidden = state.messages.length > 0 || isThinking
    document.body.classList.toggle("ai-chat-has-thread", state.messages.length > 0)
    scrollMessagesToBottom()
  }

  function render() {
    root.dataset.chatState = state.isOpen ? "open" : "closed"
    inputEl.value = state.draft
    inputEl.placeholder = state.selectedText ? "Ask about this selection..." : config.placeholder
    sendButtonEl.disabled = state.draft.trim().length === 0 || isThinking
    renderContextChip()
    renderMessages()
    autoResizeInput()
  }

  function openFromSelection() {
    if (!config.enableSelectionContext) {
      setOpen(true)
      return
    }

    const selectedText = captureSelectedText()
    if (selectedText) {
      state = { ...state, selectedText }
      saveState()
    }

    setOpen(true)
  }

  async function handleSubmit(promptOverride?: string) {
    const prompt = (promptOverride ?? state.draft).trim()
    if (!prompt || isThinking) {
      return
    }

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
      contextQuote: state.selectedText,
      sourcePageSlug: slug,
    }

    state = {
      ...state,
      draft: "",
      selectedText: undefined,
      messages: [...state.messages, userMessage],
    }
    isThinking = true
    saveState()
    render()
    focusInput()

    await new Promise((resolve) => setTimeout(resolve, 480))
    const response = await transport.sendMessage({
      prompt,
      selectedText: userMessage.contextQuote,
      history: state.messages,
      slug,
      title,
    })

    isThinking = false
    state = { ...state, messages: [...state.messages, response.message] }
    saveState()
    render()
  }

  function handleInput() {
    state = { ...state, draft: inputEl.value }
    saveState()
    render()
  }

  function handleAskEvent(event: CustomEventMap["askAIChat"]) {
    const prompt = event.detail.prompt?.trim()
    const selectedText = serializeSelectedText(event.detail.selectedText)

    state = {
      ...state,
      isOpen: true,
      draft: prompt ?? state.draft,
      selectedText: selectedText ?? state.selectedText,
    }
    saveState()
    render()
    setOpen(true)
  }

  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null
    if (!target) {
      return
    }

    if (!infoPopoverEl.hidden && !infoPopoverEl.contains(target) && !infoButtonEl.contains(target)) {
      infoOpen = false
      renderInfoPopover()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && state.isOpen) {
      event.preventDefault()
      setOpen(false)
      return
    }

    if (event.key === "Enter" && !event.shiftKey && document.activeElement === inputEl) {
      event.preventDefault()
      void handleSubmit()
    }
  }

  const mobileLauncherHandler = () => {
    if (state.isOpen) {
      setOpen(false)
      return
    }

    openFromSelection()
  }

  const closeHandler = () => setOpen(false)
  const backdropHandler = () => setOpen(false)
  const resetHandler = () => {
    state = resetChatSessionState(state.isOpen)
    saveState()
    render()
    focusInput()
  }
  const infoHandler = () => {
    infoOpen = !infoOpen
    renderInfoPopover()
  }
  const inputHandler = () => handleInput()
  const openEventHandler = () => openFromSelection()
  const closeEventHandler = () => setOpen(false)
  const sendHandler = () => {
    void handleSubmit()
  }
  const externalTriggerHandlers = externalTriggers.map((trigger) => {
    const handler = (event: MouseEvent) => {
      event.preventDefault()
      if (state.isOpen) {
        setOpen(false)
        return
      }

      openFromSelection()
    }

    trigger.addEventListener("click", handler)
    return { trigger, handler }
  })

  syncPromptContent()
  render()
  renderInfoPopover()
  setOpen(state.isOpen)

  mobileLauncherEl.addEventListener("click", mobileLauncherHandler)
  closeButtonEl.addEventListener("click", closeHandler)
  backdropEl.addEventListener("click", backdropHandler)
  resetButtonEl.addEventListener("click", resetHandler)
  infoButtonEl.addEventListener("click", infoHandler)
  inputEl.addEventListener("input", inputHandler)
  sendButtonEl.addEventListener("click", sendHandler)
  document.addEventListener("click", handleDocumentClick)
  document.addEventListener("keydown", handleKeydown)
  document.addEventListener("openAIChat", openEventHandler)
  document.addEventListener("closeAIChat", closeEventHandler)
  document.addEventListener("askAIChat", handleAskEvent)

  window.addCleanup(() => {
    externalTriggerHandlers.forEach(({ trigger, handler }) => {
      trigger.removeEventListener("click", handler)
    })
  })
  window.addCleanup(() => mobileLauncherEl.removeEventListener("click", mobileLauncherHandler))
  window.addCleanup(() => closeButtonEl.removeEventListener("click", closeHandler))
  window.addCleanup(() => backdropEl.removeEventListener("click", backdropHandler))
  window.addCleanup(() => resetButtonEl.removeEventListener("click", resetHandler))
  window.addCleanup(() => infoButtonEl.removeEventListener("click", infoHandler))
  window.addCleanup(() => inputEl.removeEventListener("input", inputHandler))
  window.addCleanup(() => sendButtonEl.removeEventListener("click", sendHandler))
  window.addCleanup(() => document.removeEventListener("click", handleDocumentClick))
  window.addCleanup(() => document.removeEventListener("keydown", handleKeydown))
  window.addCleanup(() => document.removeEventListener("openAIChat", openEventHandler))
  window.addCleanup(() => document.removeEventListener("closeAIChat", closeEventHandler))
  window.addCleanup(() => document.removeEventListener("askAIChat", handleAskEvent))
  window.addCleanup(() => {
    setMobileScrollLock(false)
  })
}

document.addEventListener("nav", () => {
  const roots = document.querySelectorAll<HTMLElement>("[data-chat-root]")
  roots.forEach(setupAIChat)
})
