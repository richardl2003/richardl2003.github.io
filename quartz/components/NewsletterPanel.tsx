import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { isHomeSlug } from "./pageUtils"

interface NewsletterPanelOptions {
  title: string
  description: string
  action: string
}

export default ((opts: NewsletterPanelOptions) => {
  const NewsletterPanel: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    if (!isHomeSlug(fileData.slug)) {
      return null
    }

    return (
      <section class="newsletter-panel">
        <div class="newsletter-panel__copy">
          <p class="section-label">{opts.title}</p>
          <p class="newsletter-panel__description">{opts.description}</p>
        </div>
        <form
          class="newsletter-panel__form"
          action={opts.action}
          method="post"
          target="popupwindow"
        >
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            aria-label="Email address"
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </section>
    )
  }

  return NewsletterPanel
}) satisfies QuartzComponentConstructor<NewsletterPanelOptions>
