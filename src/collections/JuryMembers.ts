import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, anyone, adminFieldOnly } from '../access'
import { formatSlug } from '../lib/slug'

/**
 * Public jury roster (spec §3.5) + membership tracking.
 *
 * Display rule (deliberate — do not change): the public jury page shows
 * two sections from this one collection, split by `active`:
 *   1. "Current jury" — active members, full cards.
 *   2. A complete honor-roll of ALL members (active and inactive together),
 *      with NO "former/expired/past" labels of any kind. Jurors cite their
 *      service in professional records; a public downgrade marker would
 *      devalue it. The growing full roster signals scale, not lapse.
 *
 * Membership dates/tier are informational storage only — managed manually
 * by the owner (tracked off-platform). No renewal logic, no auto-expiry,
 * no reminders, no payment tracking.
 */
export const JuryMembers: CollectionConfig = {
  slug: 'jury-members',
  labels: { singular: 'Jury Member', plural: 'Jury Members' },
  admin: {
    useAsTitle: 'name',
    group: 'People',
    defaultColumns: ['name', 'role', 'country', 'order'],
    description: 'The public jury roster. "Display order" controls sorting — lower numbers appear first.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Name' },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'URL slug',
      admin: { position: 'sidebar', description: 'curatone.art/jury/<slug>' },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.name ? formatSlug(data.name) : value)],
      },
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Portrait photo', admin: { description: 'Aspect ratio 3:4 works best.' } },
    { name: 'role', type: 'text', label: 'Title / role', admin: { description: 'E.g. "Creative director", "Oil painter".' } },
    { name: 'country', type: 'text', label: 'Country / city', admin: { description: 'E.g. "China" or "Miami, USA".' } },
    {
      name: 'shortCredential',
      type: 'textarea',
      label: 'Short credential line',
      admin: { description: 'One or two sentences shown on jury cards, e.g. "Fifteen years in visual design; recipient of nearly 100 international design awards."' },
    },
    { name: 'bio', type: 'richText', label: 'Full bio / credentials' },
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      fields: [
        { name: 'label', type: 'text', label: 'Label' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'judgingRecord',
      type: 'relationship',
      relationTo: 'exhibitions',
      hasMany: true,
      label: 'Judging record',
      filterOptions: { type: { equals: 'competition' } },
      admin: { description: 'Competitions this juror served on. Shown as a table on the juror page.' },
    },
    { name: 'memberSince', type: 'date', label: 'Member since', admin: { position: 'sidebar' } },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active member of the current panel',
      admin: {
        position: 'sidebar',
        description:
          'Ticked = shown in the prominent "Current jury" section. Unticked members still appear in the full roster with no change to how they are presented — this flag controls the current panel only, never seniority or validity.',
      },
    },
    {
      name: 'membership',
      type: 'group',
      label: 'Membership (owner only)',
      access: {
        read: adminFieldOnly,
        update: adminFieldOnly,
      },
      admin: {
        description:
          'Internal membership record. Informational storage only — dates are tracked manually by the owner (off-platform). Not visible to editors and never shown on the public site.',
      },
      fields: [
        {
          name: 'tier',
          type: 'select',
          options: [
            { label: 'Jury', value: 'jury' },
            { label: 'Expert', value: 'expert' },
          ],
          label: 'Membership tier',
        },
        { name: 'start', type: 'date', label: 'Membership start' },
        { name: 'end', type: 'date', label: 'Membership end' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: 'Display order',
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show on homepage',
      admin: { position: 'sidebar', description: 'The homepage jury band shows the first four jurors with this ticked.' },
    },
    {
      name: 'onEditorialBoard',
      type: 'checkbox',
      defaultValue: false,
      label: 'Member of the journal editorial board',
      admin: { position: 'sidebar', description: 'Ticked members also appear on the Editorial Board page of the journal.' },
    },
    {
      name: 'affiliation',
      type: 'text',
      label: 'Affiliation (for the editorial board page)',
      admin: { description: 'Institution shown on the editorial board list, e.g. "Berlin University of the Arts".' },
    },
  ],
}
