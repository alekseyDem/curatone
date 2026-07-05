import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'

/**
 * Private files: competition submission images before results,
 * journal manuscript files (.docx / .pdf). Only admin-panel users
 * can read these — they are never publicly reachable or indexable
 * (spec §6). When a finalist is published, their image is copied
 * into the public Media collection by a hook (see Submissions).
 */
export const PrivateMedia: CollectionConfig = {
  slug: 'private-media',
  labels: { singular: 'File (private)', plural: 'Files (private)' },
  admin: {
    group: 'Media',
    description:
      'Private storage: competition entries during the entry/judging period and journal manuscript files. NOT visible to the public. Finalist images are copied to public Images automatically when results are published.',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor, // forms create these via server actions (overrideAccess)
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Description',
      admin: { description: 'Optional note about the file.' },
    },
  ],
  upload: {
    staticDir: 'private-media',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    // no imageSizes — originals only; files are copied to Media on publish
  },
}
