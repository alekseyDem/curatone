import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { formatSlug } from '../lib/slug'

/**
 * The shared person record (spec §3.6) — links competitions, journal
 * and the future participant dashboard (Phase 2). Public artist pages
 * exist only for finalists of closed competitions or artists with a
 * published exhibition; that check happens in the frontend queries.
 */
export const Participants: CollectionConfig = {
  slug: 'participants',
  labels: { singular: 'Participant', plural: 'Participants' },
  admin: {
    useAsTitle: 'name',
    group: 'People',
    defaultColumns: ['name', 'email', 'country', 'role'],
    description:
      'One record per person. Created automatically by the entry and article forms; the same person is reused across competitions and the journal.',
  },
  access: {
    read: isAdminOrEditor, // public artist pages query via server code with overrideAccess
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Full name / artist name' },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'URL slug',
      admin: {
        position: 'sidebar',
        description: 'Address of the artist page, e.g. "anna-keller" → curatone.art/artists/anna-keller. Filled in automatically from the name.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => value || (data?.name ? formatSlug(data.name) : value),
        ],
      },
    },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'country', type: 'text', label: 'Country' },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: 'Portrait photo',
      admin: { description: 'Optional. Used on the public artist page.' },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Links (portfolio, social, website)',
      fields: [
        { name: 'label', type: 'text', label: 'Label', admin: { description: 'E.g. "Instagram", "Portfolio".' } },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'aboutArtist',
      type: 'richText',
      label: 'About the artist',
      admin: {
        description:
          'Awards, associations, achievements — written by the artist in the entry form. Shown publicly ONLY for finalists of published competitions.',
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'participant',
      options: [
        { label: 'Participant', value: 'participant' },
        { label: 'Jury', value: 'jury' },
        { label: 'Admin', value: 'admin' },
        { label: 'Member (reserved — not in use)', value: 'member' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'profilePublished',
      type: 'checkbox',
      defaultValue: false,
      label: 'Profile published (Phase 2 — not in use yet)',
      admin: {
        position: 'sidebar',
        description: 'Reserved for the future participant dashboard. Has no effect today.',
      },
    },
  ],
}
