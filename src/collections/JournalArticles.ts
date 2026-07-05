import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, adminFieldOnly } from '../access'
import { seoFields } from '../fields/seo'
import { formatSlug } from '../lib/slug'

/**
 * Peer-reviewed journal (spec §3.3). Peer review itself happens
 * off-platform (Google Forms); this collection receives submissions
 * and tracks status. The owner/assistant updates status manually.
 */
export const JournalArticles: CollectionConfig = {
  slug: 'journal-articles',
  labels: { singular: 'Journal Article', plural: 'Journal Articles' },
  admin: {
    useAsTitle: 'title',
    group: 'Journal',
    defaultColumns: ['title', 'author', 'articleType', 'status', 'issue'],
    description:
      'Articles of the Curatone Art & Research Journal (ISSN 3054-6621). New submissions from the site arrive with status "Submitted". After off-platform peer review, set the status manually. Only "Published" articles appear on the site.',
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'published' } }),
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
      admin: { position: 'sidebar', description: 'curatone.art/journal/<slug>' },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? formatSlug(data.title) : value)],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'submitted',
      options: [
        { label: 'Submitted — awaiting review', value: 'submitted' },
        { label: 'Under review', value: 'under-review' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Published — visible on the site', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Peer review happens off-platform. Set "Published" only for reviewed, approved articles.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'participants',
      required: true,
      label: 'Author',
      admin: { description: 'The same person record used for competitions.' },
    },
    {
      name: 'authorsDisplay',
      type: 'text',
      label: 'Authors — displayed line',
      admin: {
        description: 'How the author line appears on the site, e.g. "M. Keller, A. Osei". Leave empty to use the author\'s name.',
      },
    },
    { name: 'affiliation', type: 'text', label: 'Affiliation (institution)' },
    { name: 'orcid', type: 'text', label: 'ORCID', admin: { description: 'Optional, e.g. 0000-0002-1825-0097.' } },
    {
      name: 'articleType',
      type: 'select',
      options: [
        { label: 'Research article', value: 'research' },
        { label: 'Expert insight', value: 'expert-insight' },
        { label: 'Visual essay', value: 'visual-essay' },
        { label: 'Interview', value: 'interview' },
      ],
      label: 'Article type',
    },
    { name: 'abstract', type: 'textarea', label: 'Abstract' },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords',
      fields: [{ name: 'keyword', type: 'text', required: true }],
    },
    { name: 'fullText', type: 'richText', label: 'Full text' },
    {
      name: 'references',
      type: 'array',
      label: 'References',
      admin: { description: 'One reference per row; numbered automatically on the page.' },
      fields: [{ name: 'reference', type: 'textarea', required: true }],
    },
    {
      name: 'uploadedFile',
      type: 'upload',
      relationTo: 'private-media',
      label: 'Submitted manuscript (.docx / .pdf — private)',
      admin: { description: 'The file the author submitted. Never public.' },
    },
    {
      name: 'publishedPdf',
      type: 'upload',
      relationTo: 'media',
      label: 'Published PDF (public download)',
      admin: { description: 'Optional. The final typeset PDF offered for download on the article page.' },
    },
    { name: 'coverLetter', type: 'textarea', label: 'Cover letter (from the author)' },
    {
      type: 'row',
      fields: [
        { name: 'doi', type: 'text', label: 'DOI', admin: { description: 'E.g. 10.63653/CTAR.2026.14' } },
        { name: 'volume', type: 'text', label: 'Volume' },
        { name: 'issue', type: 'text', label: 'Issue' },
      ],
    },
    { name: 'publishedDate', type: 'date', label: 'Published date', admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        {
          name: 'licenseAgreed',
          type: 'checkbox',
          label: 'Author agreed to CC BY-NC-SA 4.0',
        },
        {
          name: 'originalityConfirmed',
          type: 'checkbox',
          label: 'Originality confirmed (not submitted elsewhere)',
        },
      ],
    },
    // --- Certificate / payment (owner only) ---
    {
      name: 'certificate',
      type: 'group',
      label: 'Publication certificate (owner only)',
      access: { read: adminFieldOnly, update: adminFieldOnly },
      fields: [
        { name: 'certificateIssued', type: 'checkbox', defaultValue: false, label: 'Certificate issued' },
        { name: 'certificatePaid', type: 'checkbox', defaultValue: false, label: 'Certificate paid' },
        {
          name: 'certificateFee',
          type: 'number',
          defaultValue: 30,
          label: 'Certificate fee',
          admin: { description: 'Price of the publication certificate for this article.' },
        },
        { name: 'stripeSessionId', type: 'text', label: 'Stripe session ID' },
        {
          name: 'payToken',
          type: 'text',
          label: 'Payment link token',
          defaultValue: () => crypto.randomUUID(),
          admin: {
            description:
              'To offer the paid certificate, email the author this link: <site>/pay/certificate/<article id>?t=<this token>',
          },
        },
      ],
    },
    seoFields,
  ],
}
