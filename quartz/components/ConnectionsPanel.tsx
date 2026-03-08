import BacklinksConstructor from "./Backlinks"
import GraphConstructor from "./Graph"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { isHomeSlug, isPostSlug, isResourceSlug, isUpdateSlug } from "./pageUtils"
import { simplifySlug } from "../util/path"

interface ConnectionsPanelOptions {
  showBacklinks: boolean
  showGraph: boolean
  graphCollapsedByDefault: boolean
}

export default ((opts: ConnectionsPanelOptions) => {
  const Backlinks = BacklinksConstructor({ hideWhenEmpty: true })
  const Graph = GraphConstructor({
    localGraph: {
      depth: 1,
      scale: 0.9,
      linkDistance: 26,
      fontSize: 0.55,
      showTags: false,
      focusOnHover: true,
    },
  })

  const ConnectionsPanel: QuartzComponent = (props: QuartzComponentProps) => {
    const slug = props.fileData.slug
    if (!slug || isHomeSlug(slug)) {
      return null
    }

    const simplifiedSlug = simplifySlug(slug)
    const allowGraph = opts.showGraph && (isPostSlug(slug) || isResourceSlug(slug))
    const backlinks = props.allFiles.filter((file) => file.links?.includes(simplifiedSlug))
    const hasBacklinks = opts.showBacklinks && backlinks.length > 0
    const isEligible = isPostSlug(slug) || isUpdateSlug(slug) || isResourceSlug(slug)

    if (!isEligible || (!hasBacklinks && !allowGraph)) {
      return null
    }

    return (
      <section class="connections-panel">
        <div class="connections-panel__header">
          <p class="section-label">Connections</p>
        </div>
        {hasBacklinks && (
          <div class="connections-panel__backlinks">
            <Backlinks {...props} />
          </div>
        )}
        {allowGraph && (
          <details class="connections-panel__graph" open={!opts.graphCollapsedByDefault}>
            <summary>Local graph</summary>
            <Graph {...props} />
          </details>
        )}
      </section>
    )
  }

  ConnectionsPanel.css = [Backlinks.css, Graph.css].filter(Boolean).join("\n")
  ConnectionsPanel.afterDOMLoaded = [Backlinks.afterDOMLoaded, Graph.afterDOMLoaded]
    .filter(Boolean)
    .join("\n")

  return ConnectionsPanel
}) satisfies QuartzComponentConstructor<ConnectionsPanelOptions>
