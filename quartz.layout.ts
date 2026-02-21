import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// Extract recentNotes for reuse across desktop sidebar and mobile afterBody
const recentNotes = [
  Component.RecentNotes({
    title: "Weekly Updates",
    limit: 2,
    filter: (f) => (f.slug?.startsWith("updates/") && !f.slug?.endsWith("index")) ?? false,
    linkToMore: "updates/" as SimpleSlug,
    showTags: false,
  }),
  Component.RecentNotes({
    title: "Posts",
    limit: 2,
    filter: (f) => (f.slug?.startsWith("posts/") && !f.slug?.endsWith("index")) ?? false,
    linkToMore: "posts/" as SimpleSlug,
    showTags: false,
  }),
]

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [...recentNotes.map((c) => Component.MobileOnly(c))],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/richardl2003",
      LinkedIn: "https://www.linkedin.com/in/richardli2003/",
    },
  }),
}

// Shared left sidebar - extracted to avoid duplication
const left = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [
      {
        Component: Component.Search(),
        grow: true,
      },
      { Component: Component.Darkmode() },
      { Component: Component.ReaderMode() },
    ],
  }),
  ...recentNotes.map((c) => Component.DesktopOnly(c)),
]

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left,
  right: [
    Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left,
  right: [],
}
