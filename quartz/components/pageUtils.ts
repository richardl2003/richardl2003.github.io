import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import { getDate } from "./Date"

export function isHomeSlug(slug?: string): boolean {
  return slug === "index"
}

export function isPostsIndexSlug(slug?: string): boolean {
  return slug === "posts/index"
}

export function isUpdatesIndexSlug(slug?: string): boolean {
  return slug === "updates/index"
}

export function isResourcesIndexSlug(slug?: string): boolean {
  return slug === "resources/index" || slug === "resources"
}

export function isPostSlug(slug?: string): boolean {
  return !!slug && slug.startsWith("posts/") && !slug.endsWith("index")
}

export function isUpdateSlug(slug?: string): boolean {
  return !!slug && slug.startsWith("updates/") && !slug.endsWith("index")
}

export function isResourceSlug(slug?: string): boolean {
  return !!slug && slug.startsWith("resources/") && !slug.endsWith("index")
}

export function isWritingSlug(slug?: string): boolean {
  return isPostSlug(slug) || isUpdateSlug(slug)
}

export function hasLongToc(file: QuartzPluginData, minimumHeadings = 3): boolean {
  return (file.toc?.length ?? 0) >= minimumHeadings
}

export function compareByDateDesc(cfg: GlobalConfiguration) {
  return (a: QuartzPluginData, b: QuartzPluginData) => {
    const aDate = getDate(cfg, a)
    const bDate = getDate(cfg, b)

    if (aDate && bDate) {
      return bDate.getTime() - aDate.getTime()
    }

    if (aDate) return -1
    if (bDate) return 1

    return (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "")
  }
}

export function getEntriesByPrefix(
  cfg: GlobalConfiguration,
  allFiles: QuartzPluginData[],
  prefix: string,
) {
  return allFiles
    .filter((file) => {
      const slug = file.slug
      return !!slug && slug.startsWith(prefix) && !slug.endsWith("index")
    })
    .sort(compareByDateDesc(cfg))
}

export function getExcerpt(
  file: QuartzPluginData,
  opts?: {
    maxLength?: number
    sentences?: number
  },
): string {
  const maxLength = opts?.maxLength ?? 180
  const sentenceLimit = opts?.sentences ?? 2
  const source = (file.description ?? file.text ?? "").replace(/\s+/g, " ").trim()
  if (source.length === 0) {
    return ""
  }

  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean)
  const excerpt = sentences.slice(0, sentenceLimit).join(" ").trim()
  const normalized = excerpt.length > 0 ? excerpt : source

  if (normalized.length <= maxLength) {
    return normalized
  }

  return normalized.slice(0, maxLength).trimEnd() + "..."
}
