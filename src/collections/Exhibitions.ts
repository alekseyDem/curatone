import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, anyone, adminFieldOnly } from '../access'
import { seoFields } from '../fields/seo'
import { CATEGORY_OPTIONS } from '../lib/categories'
import { publishFinalistsForCompetition } from '../hooks/publishFinalists'
import { formatSlug } from '../lib/slug'

/**
 * All "showings of work" (spec §3.1): competitions, personal shows,
 * group shows, featured artists — distinguished by `type`.
 */
export const Exhibitions: CollectionConfig = {
  slug: 'exhibitions',
  labels: { singular: 'Exhibition / Competition', plural: 'Exhibitions & Competitions' },
  admin: {
    useAsTitle: 'title',
    group: 'Exhibitions',
    defaultColumns: ['title', 'type', 'status', 'updatedAt'],
    description:
      'Competitions, personal and group exhibitions, and featured-artist showcases. The "Type" field controls which fields appear and how the public page behaves.',
  },
  access: {
    read: anyone, // drafts are excluded because versions.drafts is on
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // When a competition is closed (results published), copy finalist
        // images from private storage to public Media (spec §3.2).
        if (
          doc.type === 'competition' &&
          doc.status === 'closed' &&
          previousDoc?.status !== 'closed'
        ) {
          await publishFinalistsForCompetition({ competitionId: doc.id, req })
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL slug',
      admin: {
        position: 'sidebar',
        description: 'Page address, e.g. "open-call-colors" → curatone.art/exhibitions/open-call-colors',
      },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? formatSlug(data.title) : value)],
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'competition',
      options: [
        { label: 'Competition', value: 'competition' },
        { label: 'Personal exhibition', value: 'personal' },
        { label: 'Group exhibition', value: 'group' },
        { label: 'Featured artist', value: 'featured' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Competitions have an entry form and results. The other types are published manually.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'closed',
      options: [
        { label: 'Open — accepting entries', value: 'open' },
        { label: 'Judging — entries closed, results pending', value: 'judging' },
        { label: 'Closed — results published', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'For competitions: "Open" shows the entry form; "Judging" hides it; "Closed" publishes the finalist gallery. IMPORTANT: setting "Closed" makes all works marked as finalists publicly visible.',
      },
    },
    {
      name: 'theme',
      type: 'richText',
      label: 'Theme / description',
      admin: { description: 'The main text shown on the page: theme of the competition or about-text of the exhibition.' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover image',
    },
    {
      name: 'dates',
      type: 'group',
      label: 'Dates',
      fields: [
        { name: 'start', type: 'date', label: 'Start / opening date' },
        {
          name: 'earlyDeadline',
          type: 'date',
          label: 'Early entry deadline',
          admin: { description: 'Optional. Shown in the deadline schedule.', condition: (data) => data?.type === 'competition' },
        },
        {
          name: 'regularDeadline',
          type: 'date',
          label: 'Regular entry deadline',
          admin: { description: 'Optional. Shown in the deadline schedule.', condition: (data) => data?.type === 'competition' },
        },
        {
          name: 'deadline',
          type: 'date',
          label: 'Final deadline',
          admin: {
            description: 'The countdown on the site runs to this date.',
            condition: (data) => data?.type === 'competition',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'resultsDate',
          type: 'date',
          label: 'Results date',
          admin: { condition: (data) => data?.type === 'competition' },
        },
      ],
    },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      options: [...CATEGORY_OPTIONS],
      label: 'Categories',
      admin: {
        condition: (data) => data?.type === 'competition',
        description: 'Which categories this competition accepts. Shown on the page and used by the entry form.',
      },
    },
    {
      name: 'artist',
      type: 'relationship',
      relationTo: 'participants',
      label: 'Artist',
      admin: {
        condition: (data) => data?.type === 'personal' || data?.type === 'featured',
        description: 'The artist this exhibition presents. Their name appears in the page heading.',
      },
    },
    {
      name: 'works',
      type: 'array',
      label: 'Works (gallery)',
      admin: {
        condition: (data) => data?.type !== 'competition',
        description:
          'The works shown in this exhibition. For competitions this is not used — the results gallery is built from the competition\'s entries marked as finalists.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
          admin: { description: 'Upload before publishing — a striped placeholder is shown while empty.' },
        },
        { name: 'title', type: 'text', label: 'Work title' },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'participants',
          label: 'Author',
          admin: { description: 'For group exhibitions: shown under the work. For personal/featured: optional (the artist is already in the heading).' },
        },
        { name: 'year', type: 'text', label: 'Year' },
        { name: 'medium', type: 'text', label: 'Medium', admin: { description: 'E.g. "Oil on canvas".' } },
        { name: 'description', type: 'textarea', label: 'Caption / description' },
      ],
    },
    {
      name: 'interviewExcerpt',
      type: 'richText',
      label: 'Interview excerpt',
      admin: {
        condition: (data) => data?.type !== 'competition',
        description: 'Optional. A short interview fragment shown on the exhibition page.',
      },
    },
    {
      name: 'relatedCompetition',
      type: 'relationship',
      relationTo: 'exhibitions',
      label: 'Related competition',
      admin: {
        condition: (data) => data?.type === 'featured' || data?.type === 'personal' || data?.type === 'group',
        description: 'For featured artists: the competition the artist was recognised in.',
      },
    },
    {
      name: 'resultStats',
      type: 'group',
      label: 'Result statistics (shown on cards)',
      admin: {
        condition: (data) => data?.type === 'competition',
        description: 'Filled in manually after results, e.g. "214 works from 16 countries".',
      },
      fields: [
        { name: 'worksCount', type: 'number', label: 'Works submitted' },
        { name: 'countriesCount', type: 'number', label: 'Countries represented' },
      ],
    },
    {
      name: 'catalog',
      type: 'group',
      label: 'Exhibition catalog',
      admin: {
        description:
          'Optional catalog for this exhibition (mainly used for competitions). Shown on the public results / exhibition page as a page-flip viewer with download and buy links.',
      },
      fields: [
        {
          name: 'embedUrl',
          type: 'text',
          label: 'Flip-book embed URL',
          admin: {
            description:
              'The iframe/embed link from a flip-book host (Issuu, Heyzine, FlippingBook, etc.). If empty, the uploaded PDF below is shown in the browser\'s viewer instead.',
          },
        },
        {
          name: 'pdf',
          type: 'upload',
          relationTo: 'media',
          label: 'Catalog PDF (download)',
          admin: { description: 'The downloadable PDF. Also used as the viewer if no embed URL is set.' },
        },
        {
          name: 'amazonUrl',
          type: 'text',
          label: 'Amazon purchase URL',
          admin: { description: 'Link to buy the printed catalog on Amazon.' },
        },
      ],
    },
    {
      name: 'feeNote',
      type: 'text',
      label: 'Entry fee — displayed text',
      admin: {
        condition: (data) => data?.type === 'competition',
        description: 'Marketing display only, e.g. "$15 – $25 per work". The actual charged amount is set below in "Payments".',
      },
    },
    {
      name: 'awardsNote',
      type: 'text',
      label: 'Awards — displayed text',
      admin: {
        condition: (data) => data?.type === 'competition',
        description: 'E.g. "Platinum · Gold · Silver + $100 prize".',
      },
    },
    // --- Payments (owner only, spec §4/§7/§10) ---
    {
      name: 'payments',
      type: 'group',
      label: 'Payments (owner only)',
      access: {
        read: adminFieldOnly,
        update: adminFieldOnly,
      },
      admin: {
        condition: (data) => data?.type === 'competition',
        description: 'Entry pricing. Not visible to editors.',
      },
      fields: [
        {
          name: 'entryFee',
          type: 'number',
          defaultValue: 0,
          label: 'Entry fee',
          admin: { description: '0 = free entry. If greater than 0, Stripe payment is required before an entry is accepted.' },
        },
        {
          name: 'finalistFee',
          type: 'number',
          defaultValue: 0,
          label: 'Finalist fee',
          admin: {
            description:
              '0 = none (all selected finalists publish on Close). If greater than 0, a finalist is published only after "Finalist fee paid" is ticked on their entry — so you publish only selected finalists who paid.',
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'usd',
          options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
          ],
          label: 'Currency',
        },
        {
          name: 'judgingToken',
          type: 'text',
          defaultValue: () => crypto.randomUUID(),
          label: 'Judging image-link token',
          admin: {
            description:
              'Secures the image links inside the judging CSV exports so jurors can view entries without accounts. Generated automatically; changing it invalidates previously exported links.',
          },
        },
      ],
    },
    {
      name: 'judgingExports',
      type: 'ui',
      admin: {
        condition: (data) => data?.type === 'competition',
        components: {
          Field: '/components/admin/ExportButtons#ExportButtons',
        },
      },
    },
    {
      name: 'certificateGenerator',
      type: 'ui',
      admin: {
        condition: (data) => data?.type === 'competition',
        components: {
          Field: '/components/admin/CertificateButtons#CertificateButtons',
        },
      },
    },
    {
      name: 'hideAuthorsUntilResults',
      type: 'checkbox',
      defaultValue: true,
      label: 'Blind judging — hide author names until results',
      admin: {
        condition: (data) => data?.type === 'competition',
        description: 'While the competition is open or judging, author identities are never shown publicly.',
      },
    },
    seoFields,
  ],
}
