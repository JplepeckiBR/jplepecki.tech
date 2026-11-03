import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FilePath, FullSlug, isAbsoluteURL, resolveRelative, slugifyFilePath } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { classNames } from "../util/lang"
import style from "./styles/postCards.scss"

interface Options {
  title: string
  limit: number
  filter: (f: QuartzPluginData) => boolean
}

// Thumbnails are opt-in: only the frontmatter `thumbnail` field is used.
function thumbnailFor(page: QuartzPluginData, currentSlug: FullSlug): string | undefined {
  const raw = page.frontmatter?.thumbnail
  if (typeof raw !== "string" || !raw.trim()) return undefined
  if (isAbsoluteURL(raw)) return raw
  // local file in the vault, e.g. "Pasted image 2026-11-02.png" or "[[Pasted image.png]]"
  const file = raw.replace(/^!?\[\[|\]\]$/g, "").split("|")[0].trim()
  return resolveRelative(currentSlug, slugifyFilePath(file as FilePath))
}

export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { title: "Posts", limit: 20, filter: () => true, ...userOpts }

  const PostCards: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const pages = allFiles.filter(opts.filter).sort(byDateAndAlphabetical(cfg))
    return (
      <div class={classNames(displayClass, "post-cards")}>
        <h2>{opts.title}</h2>
        <ul>
          {pages.slice(0, opts.limit).map((page) => {
            const href = resolveRelative(fileData.slug!, page.slug!)
            const thumb = thumbnailFor(page, fileData.slug!)
            const title = page.frontmatter?.title ?? page.slug
            return (
              <li>
                <a href={href} class="internal post-card">
                  {thumb && <img src={thumb} alt="" loading="lazy" />}
                  <div class="body">
                    <h3>{title}</h3>
                    {page.dates && (
                      <p class="meta">
                        <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                      </p>
                    )}
                    {page.frontmatter?.description && (
                      <p class="desc">{page.frontmatter.description}</p>
                    )}
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  PostCards.css = style
  return PostCards
}) satisfies QuartzComponentConstructor
