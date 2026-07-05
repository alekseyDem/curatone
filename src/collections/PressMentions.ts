import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, anyone } from '../access'

/** External articles about Curatone (spec §3.7) — outbound links only. */
export const PressMentions: CollectionConfig = {
  slug: 'press-mentions',
  labels: { singular: 'Press Mention', plural: 'Press Mentions' },
  admin: {
    useAsTitle: 'articleTitle',
    group: 'Content',
    defaultColumns: ['publication', 'articleTitle', 'date'],
    description: 'External articles about Curatone. Shown as a logo strip on the homepage and listed on the Press page. Links go to the external site.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'publication', type: 'text', required: true, label: 'Publication name', admin: { description: 'E.g. "ArtDaily".' } },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Publication logo', admin: { description: 'Optional. If empty, the publication name is shown as styled text.' } },
    { name: 'articleTitle', type: 'text', label: 'Article title' },
    { name: 'date', type: 'date', label: 'Publication date' },
    { name: 'url', type: 'text', required: true, label: 'Article URL (external)' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: 'Display order',
      admin: { position: 'sidebar', description: 'Lower numbers appear first in the homepage strip.' },
    },
  ],
}
