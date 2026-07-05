/** Competition categories (spec §9). Shared by Exhibitions and Submissions. */
export const CATEGORY_OPTIONS = [
  { label: 'Painting', value: 'painting' },
  { label: 'Drawing', value: 'drawing' },
  { label: 'Photography', value: 'photography' },
  { label: 'Digital Art', value: 'digital-art' },
  { label: 'Mixed Media', value: 'mixed-media' },
  { label: 'Illustration', value: 'illustration' },
  { label: 'Modern Art', value: 'modern-art' },
  { label: 'Sculpture', value: 'sculpture' },
  { label: 'Ceramics', value: 'ceramics' },
] as const

export const categoryLabel = (value?: string | null): string =>
  CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value ?? ''
