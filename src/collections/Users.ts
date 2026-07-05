import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin User', plural: 'Admin Users' },
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
    description:
      'People who can log into this admin panel. "Admin" has full access; "Editor" can manage content but not payments, pricing, users, or deletion.',
  },
  auth: true,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin (owner — full access)', value: 'admin' },
        { label: 'Editor (assistant — content only)', value: 'editor' },
      ],
      admin: {
        description: 'Editors cannot see payment data, change prices, manage users, or delete records.',
      },
    },
  ],
  versions: false,
}
