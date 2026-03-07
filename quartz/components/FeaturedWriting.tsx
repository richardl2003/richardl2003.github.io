import { resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { getExcerpt, isHomeSlug } from "./pageUtils"

interface FeaturedWritingOptions {
  slugs: string[]
  title?: string
}

export default ((opts: FeaturedWritingOptions) => {
  const FeaturedWriting: QuartzComponent = (props: QuartzComponentProps) => {
    if (!isHomeSlug(props.fileData.slug)) {
      return null
    }

    const entries = opts.slugs
      .map((slug) => props.allFiles.find((file) => file.slug === slug))
      .filter((file) => file !== undefined)

    if (entries.length === 0) {
      return null
    }

    return (
      <section class="featured-writing">
        <div class="featured-writing__heading">
          <p class="section-label">{opts.title ?? "Worth Starting With"}</p>
        </div>
        <div class="featured-writing__list">
          {entries.map((entry) => (
            <article class="featured-writing__item">
              <a
                class="featured-writing__title"
                href={resolveRelative(props.fileData.slug!, entry.slug!)}
              >
                {entry.frontmatter?.title}
              </a>
              <p class="featured-writing__excerpt">
                {getExcerpt(entry, { maxLength: 210, sentences: 2 })}
              </p>
              <a
                class="featured-writing__link"
                href={resolveRelative(props.fileData.slug!, entry.slug!)}
              >
                Read essay
              </a>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return FeaturedWriting
}) satisfies QuartzComponentConstructor<FeaturedWritingOptions>
