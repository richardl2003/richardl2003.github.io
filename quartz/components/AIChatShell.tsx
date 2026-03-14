import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import beforeScript from "./scripts/aiChat.before.inline"
// @ts-ignore
import script from "./scripts/aiChat.inline"
import style from "./styles/aiChat.scss"
import { classNames } from "../util/lang"
import {
  AIChatShellOptions,
  defaultAIChatShellOptions,
  getGreeting,
  getStarterPrompts,
} from "./scripts/aiChatData"

function SparkIcon() {
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true">
      <path d="M14.523 29.276c-1.855-6.705-7.094-11.944-13.799-13.799-.483-.134-.483-.82 0-.954C7.43 12.668 12.668 7.43 14.523.724c.134-.484.82-.484.954 0 1.855 6.705 7.094 11.944 13.799 13.799.484.134.484.82 0 .954-6.705 1.855-11.944 7.094-13.799 13.799-.134.484-.82.484-.954 0Z" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}

export default ((userOpts?: Partial<AIChatShellOptions>) => {
  const AIChatShell: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    const opts = { ...defaultAIChatShellOptions, ...userOpts }
    const slug = fileData.slug ?? "index"
    const title = fileData.frontmatter?.title ?? fileData.slug ?? "this page"
    const prompts = getStarterPrompts({ slug, title })
    const greeting = getGreeting({ slug, title })

    return (
      <div
        class={classNames(displayClass, "ai-chat-shell")}
        data-chat-root=""
        data-slug={slug}
        data-title={title}
        data-config={JSON.stringify(opts)}
      >
        <button
          class="ai-chat-mobile-launcher"
          aria-label={`${opts.label} launcher`}
          aria-controls="ai-chat-panel"
          aria-expanded="false"
        >
          <span class="ai-chat-launcher-icon">
            <SparkIcon />
          </span>
        </button>

        <div class="ai-chat-backdrop"></div>

        <div class="ai-chat-rail">
          <div class="ai-chat-resize-handle" aria-hidden="true"></div>

          <section
            class="ai-chat-panel"
            id="ai-chat-panel"
            aria-hidden="true"
            aria-label={opts.label}
          >
            <div class="ai-chat-panel-inner">
              <header class="ai-chat-header">
                <div class="ai-chat-header-left">
                  <SparkIcon />
                  <span class="ai-chat-header-title">{opts.label}</span>
                </div>
                <div class="ai-chat-header-actions">
                  <button class="ai-chat-expand-button" aria-label="Expand chat" type="button">
                    <ExpandIcon />
                  </button>
                  <button class="ai-chat-close-button" aria-label="Close chat" type="button">
                    <CloseIcon />
                  </button>
                </div>
              </header>

              <p class="ai-chat-disclaimer">
                Responses are generated using AI and may contain mistakes.
              </p>

              <div class="ai-chat-body">
                <div class="ai-chat-empty-state">
                  <p class="ai-chat-greeting">{greeting}</p>
                  <div class="ai-chat-suggestions">
                    {prompts.map((prompt) => (
                      <button class="ai-chat-prompt" data-ai-chat-prompt={prompt} type="button">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div class="ai-chat-messages" role="log" aria-live="polite"></div>
              </div>

              <footer class="ai-chat-footer">
                <div class="ai-chat-context"></div>
                <div class="ai-chat-input-container">
                  <textarea
                    class="ai-chat-input"
                    rows={1}
                    placeholder={opts.placeholder}
                    aria-label={opts.placeholder}
                  />
                  <div class="ai-chat-input-actions">
                    <button class="ai-chat-attach-button" type="button" aria-label="Attach file">
                      <PaperclipIcon />
                    </button>
                    <button class="ai-chat-send-button" type="button" aria-label="Send message">
                      <ArrowUpIcon />
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </section>
        </div>
      </div>
    )
  }

  AIChatShell.css = style
  AIChatShell.beforeDOMLoaded = beforeScript
  AIChatShell.afterDOMLoaded = script

  return AIChatShell
}) satisfies QuartzComponentConstructor<Partial<AIChatShellOptions> | undefined>
