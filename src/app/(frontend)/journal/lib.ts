import type { JournalArticle } from '@/payload-types'

export const JOURNAL_TITLE = 'Curatone Art & Research Journal'
export const JOURNAL_ISSN = '3054-6621'

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  research: 'Research article',
  'expert-insight': 'Expert insight',
  'visual-essay': 'Visual essay',
  interview: 'Interview',
}

/** Human label for the CMS article type, e.g. "expert-insight" → "Expert insight". */
export function articleTypeLabel(type?: JournalArticle['articleType']): string {
  if (!type) return ''
  return ARTICLE_TYPE_LABELS[type] ?? type
}

/** Author line shown on the site: authorsDisplay override, else the linked person's name. */
export function articleAuthors(article: JournalArticle): string {
  if (article.authorsDisplay) return article.authorsDisplay
  return typeof article.author === 'object' && article.author ? (article.author.name ?? '') : ''
}

/** Trim an abstract to a listing snippet at a word boundary. */
export function abstractSnippet(text: string, max = 280): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 0))}…`
}

export type IssueGroup = {
  key: string
  volume: string | null
  issue: string | null
  /** "Vol. 2 · Issue 3" */
  label: string
  articles: JournalArticle[]
}

/**
 * Group published articles by volume + issue. Articles arrive newest-first
 * (sorted by -publishedDate), so groups come out ordered by their most
 * recent article — the first group is the current issue.
 */
export function groupByIssue(articles: JournalArticle[]): IssueGroup[] {
  const map = new Map<string, IssueGroup>()
  for (const article of articles) {
    const volume = article.volume ?? null
    const issue = article.issue ?? null
    const key = `${volume ?? ''}|${issue ?? ''}`
    let group = map.get(key)
    if (!group) {
      const label =
        [volume && `Vol. ${volume}`, issue && `Issue ${issue}`].filter(Boolean).join(' · ') ||
        'Latest articles'
      group = { key, volume, issue, label, articles: [] }
      map.set(key, group)
    }
    group.articles.push(article)
  }
  return [...map.values()]
}
