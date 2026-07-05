import React from 'react'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/** Renders Payload Lexical rich text with the site's typography. */
export function RichText({
  data,
  className,
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null
  return <LexicalRichText data={data} className={`rich-text${className ? ` ${className}` : ''}`} />
}
