import type { Access, FieldAccess } from 'payload'

/** Full access — owner only. */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

/** Owner or assistant. */
export const isAdminOrEditor: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'editor'

/** Public. */
export const anyone: Access = () => true

/** Field-level: payment / pricing data — owner only (per spec §4, §10). */
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => user?.role === 'admin'
