import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, anyone } from '../access'

/**
 * Public images: covers, published works, portraits, logos.
 * Anything uploaded here is publicly reachable — never upload
 * competition submissions here before results are published.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image (public)', plural: 'Images (public)' },
  admin: {
    group: 'Media',
    description:
      'Public images: covers, published works, portraits, press logos. Everything here is visible to the whole internet. Competition entries are stored separately (privately) until results are published.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
      admin: {
        description: 'Short description of the image for screen readers and SEO, e.g. "Oil painting of a coastal landscape".',
      },
    },
  ],
  upload: {
    staticDir: 'media',
    // images plus public documents (e.g. downloadable exhibition catalog PDFs)
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 480, withoutEnlargement: true },
      { name: 'card', width: 1000, withoutEnlargement: true },
      { name: 'large', width: 1800, withoutEnlargement: true },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
}
