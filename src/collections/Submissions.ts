import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, adminFieldOnly } from '../access'
import { CATEGORY_OPTIONS } from '../lib/categories'
import { publishFinalistImage } from '../hooks/publishFinalists'
import { formatSlug } from '../lib/slug'

/**
 * Works entered into competitions (spec §3.2). Never publicly readable
 * through the API — the frontend queries finalists of closed competitions
 * server-side. Images live in private storage until the competition is
 * closed; then finalist images are copied to public Media by a hook.
 */
export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: { singular: 'Competition Entry', plural: 'Competition Entries' },
  admin: {
    useAsTitle: 'title',
    group: 'Exhibitions',
    defaultColumns: ['title', 'competition', 'author', 'category', 'isFinalist', 'awardTier'],
    listSearchableFields: ['title'],
    description:
      'Works entered into competitions. To publish results: open a finished competition\'s entries, tick "Finalist" on the selected works (add award tier, score, citation), then set the competition status to "Closed". Non-finalist entries never become public.',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor, // the public entry form creates via server action (overrideAccess)
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (context?.skipPublishHook) return doc
        // If this entry is marked finalist while its competition is already
        // closed, publish its image immediately.
        if (doc.isFinalist && !previousDoc?.isFinalist) {
          await publishFinalistImage({ submission: doc, req })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'competition',
      type: 'relationship',
      relationTo: 'exhibitions',
      required: true,
      index: true,
      label: 'Competition',
      filterOptions: { type: { equals: 'competition' } },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'participants',
      required: true,
      index: true,
      label: 'Author',
      admin: { description: 'Always stored, even while names are hidden for blind judging.' },
    },
    { name: 'title', type: 'text', label: 'Work title' },
    {
      name: 'category',
      type: 'select',
      options: [...CATEGORY_OPTIONS],
      label: 'Category',
    },
    { name: 'medium', type: 'text', label: 'Medium', admin: { description: 'E.g. "Oil on canvas". Shown on the winner page.' } },
    { name: 'year', type: 'text', label: 'Year' },
    { name: 'dimensions', type: 'text', label: 'Dimensions', admin: { description: 'E.g. "80 × 60 cm". Optional.' } },
    { name: 'statement', type: 'textarea', label: 'Work statement', admin: { description: 'Optional text about this specific work.' } },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'private-media',
      label: 'Work image (private until results)',
      admin: { description: 'Stored privately. If this entry becomes a finalist, the image is copied to public storage automatically when results are published.' },
    },
    {
      name: 'publicImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Public image (filled automatically on publication)',
      admin: {
        description: 'Created automatically when results are published. Only edit to replace with a better-quality version.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isFinalist',
          type: 'checkbox',
          defaultValue: false,
          label: 'Finalist',
          admin: { description: 'Tick to include this work in the public results gallery once the competition is closed.' },
        },
        {
          name: 'awardTier',
          type: 'select',
          options: [
            { label: 'Platinum (9.0–10)', value: 'platinum' },
            { label: 'Gold (7.0–8.9)', value: 'gold' },
            { label: 'Silver (5.0–6.9)', value: 'silver' },
          ],
          label: 'Award tier',
          admin: { condition: (data) => Boolean(data?.isFinalist) },
        },
        {
          name: 'score',
          type: 'number',
          min: 0,
          max: 10,
          label: 'Jury score (0–10)',
          admin: { condition: (data) => Boolean(data?.isFinalist), step: 0.1 },
        },
      ],
    },
    {
      name: 'juryCitation',
      type: 'textarea',
      label: 'Jury citation',
      admin: {
        condition: (data) => Boolean(data?.isFinalist),
        description: 'A short jury comment shown on the winner page.',
      },
    },
    {
      name: 'certificateNumber',
      type: 'text',
      unique: true,
      label: 'Certificate number',
      admin: {
        condition: (data) => Boolean(data?.isFinalist),
        description: 'E.g. "CTA-2026-0147". Used by the public certificate verification page.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Winner page URL slug',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.isFinalist),
        description: 'Address of the winner page, e.g. curatone.art/winners/anna-keller-tidelines. Generated automatically.',
      },
      hooks: {
        beforeValidate: [
          async ({ value, data, req }) => {
            if (value || !data?.isFinalist) return value
            let authorName = ''
            if (data?.author) {
              try {
                const author = await req.payload.findByID({
                  collection: 'participants',
                  id: typeof data.author === 'object' ? data.author.id : data.author,
                })
                authorName = author?.name ?? ''
              } catch {
                /* author lookup is best-effort */
              }
            }
            const base = formatSlug([authorName, data?.title].filter(Boolean).join(' '))
            return base || undefined
          },
        ],
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted at',
      admin: { position: 'sidebar' },
    },
    // --- Payment tracking (owner only) ---
    {
      name: 'payment',
      type: 'group',
      label: 'Payment (owner only)',
      access: { read: adminFieldOnly, update: adminFieldOnly },
      fields: [
        { name: 'entryPaid', type: 'checkbox', defaultValue: false, label: 'Entry fee paid' },
        { name: 'finalistFeePaid', type: 'checkbox', defaultValue: false, label: 'Finalist fee paid' },
        { name: 'stripeSessionId', type: 'text', label: 'Stripe session ID' },
        {
          name: 'payToken',
          type: 'text',
          label: 'Payment link token',
          defaultValue: () => crypto.randomUUID(),
          admin: {
            description:
              'Secures the targeted finalist payment link. To request the finalist fee, email the artist this link: <site>/pay/finalist/<entry id>?t=<this token>',
          },
        },
      ],
    },
  ],
}
