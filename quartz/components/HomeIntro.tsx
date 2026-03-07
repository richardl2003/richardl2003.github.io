import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { getEntriesByPrefix, isHomeSlug } from "./pageUtils"
import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"

interface LinkConfig {
  label: string
  href: string
}

interface HomeIntroOptions {
  eyebrow: string
  title: string
  dek: string
  subdek?: string
  primaryLink: LinkConfig
  secondaryLink: LinkConfig
}

function resolveLink(props: QuartzComponentProps, href: string): string {
  if (href === "__latest_update__") {
    const latest = getEntriesByPrefix(props.cfg, props.allFiles, "updates/").at(0)
    if (latest?.slug) {
      return resolveRelative(props.fileData.slug!, latest.slug)
    }
  }

  const baseDir = pathToRoot(props.fileData.slug!)
  return joinSegments(baseDir, href)
}

export default ((opts: HomeIntroOptions) => {
  const HomeIntro: QuartzComponent = (props: QuartzComponentProps) => {
    if (!isHomeSlug(props.fileData.slug)) {
      return null
    }

    return (
      <section class="home-intro">
        <p class="home-intro__eyebrow">{opts.eyebrow}</p>
        <h1 class="home-intro__title">{opts.title}</h1>
        <p class="home-intro__dek">{opts.dek}</p>
        {opts.subdek && <p class="home-intro__subdek">{opts.subdek}</p>}
        <div class="home-intro__links">
          <a href={resolveLink(props, opts.primaryLink.href) as FullSlug}>
            {opts.primaryLink.label}
          </a>
          <a href={resolveLink(props, opts.secondaryLink.href) as FullSlug}>
            {opts.secondaryLink.label}
          </a>
        </div>
      </section>
    )
  }

  return HomeIntro
}) satisfies QuartzComponentConstructor<HomeIntroOptions>
