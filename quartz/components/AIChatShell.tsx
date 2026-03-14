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
                <div class="ai-chat-header-copy">
                  <p class="ai-chat-kicker">Prototype mode</p>
                  <h3>{opts.label}</h3>
                </div>
                <div class="ai-chat-header-actions">
                  <div class="ai-chat-info-wrap">
                    <button
                      class="ai-chat-info-button"
                      aria-label="Chat shell information"
                      type="button"
                    >
                      i
                    </button>
                    <div class="ai-chat-info-popover" hidden>
                      <p>
                        This is a UI-first assistant shell. Messages stay in this session and no
                        live model is connected yet.
                      </p>
                    </div>
                  </div>
                  <button class="ai-chat-reset-button" aria-label="Reset chat" type="button">
                    Reset
                  </button>
                  <button class="ai-chat-close-button" aria-label="Close chat" type="button">
                    Close
                  </button>
                </div>
              </header>

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
                <div class="ai-chat-input-row">
                  <textarea
                    class="ai-chat-input"
                    rows={1}
                    placeholder={opts.placeholder}
                    aria-label={opts.placeholder}
                  />
                  <button class="ai-chat-send-button" type="button" aria-label="Send message">
                    Send
                  </button>
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
