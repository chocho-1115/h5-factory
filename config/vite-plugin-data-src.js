import fs from 'node:fs'
import path from 'node:path'
function findHtmlFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...findHtmlFiles(fullPath))
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}
const dataSrcImagesPlugin = () => {
  let root = process.cwd()
  const htmlImageRefs = new Map()
  return {
    name: 'vite-plugin-data-src-images',
    enforce: 'post',
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      const absPathToRef = new Map()
      const htmlFiles = findHtmlFiles(root)
      for (const htmlFile of htmlFiles) {
        const content = fs.readFileSync(htmlFile, 'utf-8')
        const htmlDir = path.dirname(htmlFile)
        const regex = /data-src=["']([^"']+?)["']/g
        let match
        const refs = []
        htmlImageRefs.set(htmlFile, refs)
        while ((match = regex.exec(content)) !== null) {
          const raw = match[1].trim()
          if (!raw) continue
          const [pathPart, queryString] = raw.split('?')
          const cleanPath = pathPart.split('#')[0]
          if (!cleanPath) continue
          const resolved = path.resolve(htmlDir, cleanPath)
          if (!fs.existsSync(resolved)) continue
          let refId = absPathToRef.get(resolved)
          if (!refId) {
            refId = this.emitFile({
              type: 'asset',
              name: path.basename(cleanPath),
              source: fs.readFileSync(resolved),
            })
            absPathToRef.set(resolved, refId)
          }
          refs.push({
            raw,
            query: queryString ? '?' + queryString : '',
            refId,
          })
        }
      }
    },
    generateBundle(options, bundle) {
      for (const [htmlFile, refs] of htmlImageRefs) {
        const htmlRelPath = path.relative(root, htmlFile)
        const chunk = bundle[htmlRelPath]
        if (!chunk || chunk.type !== 'asset') continue
        let source = typeof chunk.source === 'string'
          ? chunk.source
          : new TextDecoder().decode(chunk.source)
        for (const { raw, query, refId } of refs) {
          const hashPath = this.getFileName(refId)
          source = source.replaceAll(raw, hashPath + query)
        }
        chunk.source = source
      }
    },
  }
}
export default dataSrcImagesPlugin