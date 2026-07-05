import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { seoFields } from '../fields/seo'
import { formatSlug } from '../lib/slug'

/**
 * Static / unique pages (spec §3.8): About, Rules, Contact,
 * legal pages (Impressum, AGB, Widerruf, Datenschutz), etc.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', '_status'],
    description: 'Static pages: About, Rules, Contact, legal pages. The page address is curatone.art/<slug>.',
  },
  versions: { drafts: true },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Page title' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL slug',
      admin: { position: 'sidebar', description: 'curatone.art/<slug>, e.g. "about", "impressum". Never use the word "visa" in slugs or content.' },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? formatSlug(data.title) : value)],
      },
    },
    { name: 'intro', type: 'textarea', label: 'Intro / lede', admin: { description: 'Optional lead paragraph under the heading.' } },
    {
      name: 'sections',
      type: 'array',
      label: 'Content sections',
      admin: { description: 'The page body, split into sections. Each section can have an optional heading.' },
      fields: [
        { name: 'heading', type: 'text', label: 'Section heading (optional)' },
        { name: 'body', type: 'richText', label: 'Section text' },
      ],
    },
    seoFields,
  ],
}
