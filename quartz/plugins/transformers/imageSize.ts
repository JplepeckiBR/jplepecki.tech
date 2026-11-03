import { QuartzTransformerPlugin } from "../types"
import { Root, Image } from "mdast"
import { visit } from "unist-util-visit"

// Obsidian lets standard markdown images carry a size in the alt text:
//   ![alt|250](url)      -> width 250
//   ![alt|250x100](url)  -> width 250, height 100
// Quartz only honours this for ![[wikilink]] embeds, so apply it here too.
const sizeRegex = /^(?<alt>.*?)\s*\|\s*(?<width>\d+)(?:x(?<height>\d+))?\s*$/

export const ObsidianImageSize: QuartzTransformerPlugin = () => {
  return {
    name: "ObsidianImageSize",
    markdownPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "image", (node: Image) => {
            const match = node.alt?.match(sizeRegex)
            if (!match?.groups) return
            const { alt, width, height } = match.groups
            node.alt = alt
            node.data = node.data ?? {}
            node.data.hProperties = {
              ...(node.data.hProperties ?? {}),
              width,
              ...(height ? { height } : {}),
            }
          })
        },
      ]
    },
  }
}
