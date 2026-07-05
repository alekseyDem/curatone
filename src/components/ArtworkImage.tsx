import React from 'react'
import Image from 'next/image'

import type { Media } from '@/payload-types'

type Props = {
  media?: Media | number | string | null
  /** CSS aspect-ratio, e.g. "4/5" for works, "4/3" for exhibition views, "3/4" for portraits */
  aspect?: string
  /** Caption shown inside the striped placeholder when no image exists */
  placeholderLabel?: string
  dark?: boolean
  sizes?: string
  border?: boolean
  priority?: boolean
}

/**
 * Renders a CMS image at a fixed aspect ratio via next/image, or the
 * design's striped placeholder block when no image is set.
 */
export function ArtworkImage({
  media,
  aspect = '4/5',
  placeholderLabel = 'Artwork',
  dark = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw',
  border = false,
  priority = false,
}: Props) {
  const doc = media && typeof media === 'object' ? media : null
  const style: React.CSSProperties = {
    aspectRatio: aspect,
    position: 'relative',
    overflow: 'hidden',
    ...(border ? { border: '1px solid var(--gray-border)' } : {}),
  }

  if (doc?.url) {
    return (
      <div style={style}>
        <Image
          src={doc.url}
          alt={doc.alt || placeholderLabel}
          fill
          sizes={sizes}
          style={{ objectFit: 'cover' }}
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div className={`placeholder${dark ? ' placeholder--dark' : ''}`} style={style}>
      <span className="placeholder__caption">{placeholderLabel}</span>
    </div>
  )
}
