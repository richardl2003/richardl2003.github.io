import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.SiteHeader({
      links: [
        { label: "Posts", href: "posts" },
        { label: "Updates", href: "updates" },
        { label: "Resources", href: "resources" },
      ],
    }),
  ],
  afterBody: [
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) =>
        (page.fileData.slug !== "index" &&
          Boolean(page.fileData.slug?.startsWith("posts/")) &&
          !page.fileData.slug?.endsWith("index")) ||
        (Boolean(page.fileData.slug?.startsWith("updates/")) &&
          !page.fileData.slug?.endsWith("index")),
    }),
    Component.ConditionalRender({
      component: Component.ConnectionsPanel({
        showBacklinks: true,
        showGraph: true,
        graphCollapsedByDefault: true,
      }),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        (Boolean(page.fileData.slug?.startsWith("posts/")) ||
          Boolean(page.fileData.slug?.startsWith("updates/")) ||
          Boolean(page.fileData.slug?.startsWith("resources/"))),
    }),
  ],
  footer: Component.PersonalFooter({
    links: {
      GitHub: "https://github.com/richardl2003",
      LinkedIn: "https://www.linkedin.com/in/richardli2003/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.HomeIntro({
        eyebrow: "Writing on work, learning, and life",
        title: "Richard Li",
        dek: "I’m a software engineer writing weekly reflections on technology, habits, and the ideas shaping how I think.",
        subdek: "This is where I publish weekly updates, longer essays, and notes worth keeping.",
        primaryLink: { label: "Read the latest update", href: "__latest_update__" },
        secondaryLink: { label: "Browse all posts", href: "posts" },
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.WritingSection({
        title: "Latest Updates",
        prefix: "updates/",
        limit: 4,
        variant: "chronological",
        showExcerpt: true,
        moreLink: "updates/",
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.WritingSection({
        title: "Recent Posts",
        prefix: "posts/",
        limit: 3,
        variant: "editorial",
        showTags: true,
        showExcerpt: true,
        moreLink: "posts/",
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.FeaturedWriting({
        title: "Worth Starting With",
        slugs: ["posts/year-in-review-2025", "posts/family-day-2026"],
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.NewsletterPanel({
        title: "Newsletter",
        description: "Weekly reflections and occasional essays.",
        action: "https://buttondown.com/api/emails/embed-subscribe/richardliy03",
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta({
        showReadingTime: true,
        showComma: false,
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.TableOfContents(),
      condition: (page) =>
        !!page.fileData.slug?.startsWith("posts/") &&
        !page.fileData.slug?.endsWith("index") &&
        (page.fileData.toc?.length ?? 0) >= 3,
    }),
  ],
  left: [],
  right: [],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [],
  right: [],
}
