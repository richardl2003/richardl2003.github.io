import SearchConstructor from "./Search"
import DarkmodeConstructor from "./Darkmode"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"

interface SiteHeaderLink {
  label: string
  href: string
}

interface SiteHeaderOptions {
  links: SiteHeaderLink[]
  compact?: boolean
}

export default ((opts?: SiteHeaderOptions) => {
  const Search = SearchConstructor()
  const Darkmode = DarkmodeConstructor()

  const SiteHeader: QuartzComponent = (props: QuartzComponentProps) => {
    const baseDir = pathToRoot(props.fileData.slug!)

    return (
      <div class={`site-header${opts?.compact ? " compact" : ""}`}>
        <a class="site-header__wordmark" href={baseDir}>
          {props.cfg.pageTitle}
        </a>
        <div class="site-header__nav-group">
          <nav class="site-header__nav" aria-label="Primary">
            {(opts?.links ?? []).map((link) => {
              const href = joinSegments(baseDir, link.href)
              return (
                <a href={href as FullSlug} class="site-header__nav-link">
                  {link.label}
                </a>
              )
            })}
          </nav>
          <div class="site-header__utilities">
            <Search {...props} />
            <Darkmode {...props} />
          </div>
        </div>
      </div>
    )
  }

  return SiteHeader
}) satisfies QuartzComponentConstructor<SiteHeaderOptions>
