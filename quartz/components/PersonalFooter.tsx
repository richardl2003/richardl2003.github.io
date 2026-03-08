import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { joinSegments, pathToRoot } from "../util/path"

interface FooterOptions {
  links: Record<string, string>
}

export default ((opts?: FooterOptions) => {
  const PersonalFooter: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const baseDir = pathToRoot(fileData.slug!)

    return (
      <footer class="site-footer">
        <div class="site-footer__inner">
          <p class="site-footer__copy">© {year} Richard Li</p>
          <ul class="site-footer__links">
            {Object.entries(opts?.links ?? {}).map(([label, href]) => (
              <li>
                <a href={href}>{label}</a>
              </li>
            ))}
            <li>
              <a href={joinSegments(baseDir, "index.xml")}>RSS</a>
            </li>
          </ul>
          <p class="site-footer__credit">
            Built with <a href="https://quartz.jzhao.xyz/">Quartz</a>
          </p>
        </div>
      </footer>
    )
  }

  return PersonalFooter
}) satisfies QuartzComponentConstructor<FooterOptions>
