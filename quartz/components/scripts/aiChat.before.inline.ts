import {
  AIChatShellOptions,
  clampAIChatWidth,
  defaultAIChatShellOptions,
  desktopAIChatBreakpoint,
} from "./aiChatData"

const desktopMediaQuery = `(min-width: ${desktopAIChatBreakpoint}px)`

function readStoredJSON<T>(key: string): T | null {
  try {
    const rawValue = localStorage.getItem(key)
    return rawValue === null ? null : (JSON.parse(rawValue) as T)
  } catch {
    return null
  }
}

function getAIChatConfig(root: HTMLElement): AIChatShellOptions {
  try {
    return { ...defaultAIChatShellOptions, ...JSON.parse(root.dataset.config ?? "{}") }
  } catch {
    return defaultAIChatShellOptions
  }
}

function applyInitialAIChatUIState() {
  const root = document.querySelector<HTMLElement>("[data-chat-root]")
  const html = document.documentElement

  if (!root) {
    html.dataset.aiChatState = "closed"
    html.style.setProperty("--ai-chat-panel-width", "0px")
    return
  }

  const config = getAIChatConfig(root)
  const isDesktop = window.matchMedia(desktopMediaQuery).matches

  if (!isDesktop) {
    html.dataset.aiChatState = "closed"
    html.style.setProperty("--ai-chat-panel-width", "0px")
    return
  }

  const isOpen = readStoredJSON<boolean>(config.uiOpenStorageKey) === true
  const storedWidth = readStoredJSON<number>(config.uiWidthStorageKey)
  const clampedWidth = clampAIChatWidth(storedWidth, config)

  html.dataset.aiChatState = isOpen ? "open" : "closed"
  html.style.setProperty("--ai-chat-panel-width", isOpen ? `${clampedWidth}px` : "0px")
}

applyInitialAIChatUIState()
document.addEventListener("nav", applyInitialAIChatUIState)
