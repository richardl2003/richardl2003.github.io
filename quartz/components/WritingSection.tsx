import { FullSlug, resolveRelative } from "../util/path"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { getEntriesByPrefix, getExcerpt, isHomeSlug } from "./pageUtils"

interface WritingSectionOptions {
  title: string
  prefix: "posts/" | "updates/"
  limit: number
  variant: "editorial" | "chronological"
  showTags?: boolean
  showExcerpt?: boolean
  moreLink: string
}

export default ((opts: WritingSectionOptions) => {
  const WritingSection: QuartzComponent = (props: QuartzComponentProps) => {
    if (!isHomeSlug(props.fileData.slug)) {
      return null
    }

    const entries = getEntriesByPrefix(props.cfg, props.allFiles, opts.prefix).slice(0, opts.limit)

    return (
      <section class={`writing-section writing-section--${opts.variant}`}>
        <div class="writing-section__heading">
          <div>
            <p class="section-label">{opts.title}</p>
          </div>
          <a href={resolveRelative(props.fileData.slug!, `${opts.moreLink}index` as FullSlug)}>
            View all
          </a>
        </div>
        <ul class="writing-section__list">
          {entries.map((entry) => {
            const excerpt = opts.showExcerpt
              ? getExcerpt(entry, {
                  maxLength: opts.variant === "editorial" ? 200 : 140,
                  sentences: opts.variant === "editorial" ? 2 : 1,
                })
              : ""
            const tags = opts.showTags ? (entry.frontmatter?.tags ?? []) : []

            return (
              <li class="writing-section__item">
                <a
                  class="writing-section__title"
                  href={resolveRelative(props.fileData.slug!, entry.slug!)}
                >
                  {entry.frontmatter?.title}
                </a>
                <div class="writing-section__meta">
                  {entry.dates && (
                    <Date date={getDate(props.cfg, entry)!} locale={props.cfg.locale} />
                  )}
                  {tags.length > 0 && (
                    <ul class="writing-section__tags">
                      {tags.slice(0, 3).map((tag) => (
                        <li>{tag}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {excerpt && <p class="writing-section__excerpt">{excerpt}</p>}
              </li>
            )
          })}
        </ul>
      </section>
    )
  }

  return WritingSection
}) satisfies QuartzComponentConstructor<WritingSectionOptions>
