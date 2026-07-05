import type { GlobalConfig } from 'payload'

import { isAdminOrEditor, anyone } from '../access'

/**
 * Homepage content that changes over time: hero copy, stats band,
 * testimonials, FAQ. Competitions, awards, exhibitions, jury and
 * journal sections are pulled automatically from their collections.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    group: 'Content',
    description:
      'Texts and numbers on the homepage. The open calls, recent awards, exhibitions, jury and journal sections update automatically from their collections.',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero (top of the page)',
      fields: [
        { name: 'eyebrow', type: 'text', label: 'Small line above the heading', defaultValue: 'International curatorial platform · Berlin' },
        { name: 'title', type: 'text', label: 'Main heading', defaultValue: 'Juried competitions. Peer-reviewed publication. Documented recognition.' },
        {
          name: 'lede',
          type: 'textarea',
          label: 'Paragraph under the heading',
          defaultValue:
            'Curatone runs curated international art competitions every seven weeks, publishes a peer-reviewed journal with DOI-registered articles, and maintains a jury of credentialed art professionals. Every result becomes part of a public, verifiable record.',
        },
        {
          name: 'featuredCompetition',
          type: 'relationship',
          relationTo: 'exhibitions',
          filterOptions: { type: { equals: 'competition' } },
          label: 'Featured competition',
          admin: { description: 'The competition shown in the hero card and the featured open-call block. If empty, the open competition with the nearest deadline is used.' },
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistics band',
      admin: { description: 'The row of numbers under the hero, e.g. "5+ / Competitions concluded".' },
      fields: [
        { name: 'value', type: 'text', required: true, label: 'Value', admin: { description: 'E.g. "5+", "850+".' } },
        { name: 'label', type: 'text', required: true, label: 'Label', admin: { description: 'E.g. "Competitions concluded".' } },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      admin: { description: 'Quotes from winners, shown under "Recent awards". The first two are displayed.' },
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: 'Quote' },
        { name: 'name', type: 'text', required: true, label: 'Name' },
        { name: 'attribution', type: 'text', label: 'Attribution line', admin: { description: 'E.g. "Winner, Colors 2025".' } },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Frequently asked questions',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Question' },
        { name: 'answer', type: 'textarea', required: true, label: 'Answer' },
      ],
    },
  ],
}
