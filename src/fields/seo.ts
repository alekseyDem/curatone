import type { Field } from 'payload'

/** Reusable per-page SEO fields (spec §8). */
export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    description: 'What Google shows in search results. Leave empty to use the title/description from above.',
  },
  fields: [
    {
      name: 'seoTitle',
      type: 'text',
      label: 'SEO title',
      admin: { description: 'Up to ~60 characters.' },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'SEO description',
      admin: { description: 'Up to ~155 characters.' },
    },
  ],
}
