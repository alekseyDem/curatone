/** Extract plain text from a Payload Lexical rich-text value (for CSV exports). */
export function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''

  const walk = (nodes: unknown[]): string[] =>
    nodes.flatMap((node) => {
      if (!node || typeof node !== 'object') return []
      const n = node as { type?: string; text?: string; children?: unknown[] }
      if (typeof n.text === 'string') return [n.text]
      if (Array.isArray(n.children)) {
        const inner = walk(n.children).join('')
        return n.type === 'paragraph' || n.type === 'heading' ? [`${inner}\n`] : [inner]
      }
      return []
    })

  return walk(root.children).join('').trim()
}
