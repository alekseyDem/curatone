import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { seoFields } from '../fields/seo'
import { formatSlug } from '../lib/slug'

/** SEO / editorial content (spec §3.4). */
export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Blog Post', plural: 'Blog Posts' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'publishedDate', '_status'],
    description: 'Editorial articles and news. Use "Save draft" while writing; only published posts appear on the site.',
  },
  versions: { drafts: true },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
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
      admin: { position: 'sidebar', description: 'curatone.art/blog/<slug>' },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? formatSlug(data.title) : value)],
      },
    },
    { name: 'authorName', type: 'text', label: 'Author', admin: { description: 'Displayed byline, e.g. "Curatone Editorial".' } },
    { name: 'excerpt', type: 'textarea', label: 'Excerpt', admin: { description: 'Short summary shown on the blog index.' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Cover image' },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: { description: 'Used as filter chips on the blog page, e.g. "For artists", "Competitions".' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    { name: 'body', type: 'richText', label: 'Body' },
    { name: 'publishedDate', type: 'date', label: 'Published date', admin: { position: 'sidebar' } },
    {
      name: 'showOpenCallCta',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show "open call" banner inside the post',
      admin: { position: 'sidebar', description: 'Inserts a banner inviting readers to the current open competition.' },
    },
    seoFields,
  ],
}
