import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Unified sitemap (design_update §3): headingless link columns, one address.
const COLUMNS: { label: string; href: string }[][] = [
  [
    { label: 'Open calls', href: '/competitions' },
    { label: 'Enter a competition', href: '/competitions' },
    { label: 'Results', href: '/competitions' },
    { label: 'Winners', href: '/featured-artists' },
  ],
  [
    { label: 'Exhibitions archive', href: '/exhibitions' },
    { label: 'Online exhibitions', href: '/exhibitions' },
    { label: 'Personal exhibition', href: '/personal-exhibition' },
    { label: 'Featured artists', href: '/featured-artists' },
  ],
  [
    { label: 'Journal', href: '/journal' },
    { label: 'About the journal', href: '/journal/about' },
    { label: 'Editorial board', href: '/journal/editorial-board' },
    { label: 'Submission guidelines', href: '/journal/guidelines' },
    { label: 'Submit an article', href: '/journal/submit' },
  ],
  [
    { label: 'Jury list', href: '/jury' },
    { label: 'Become a jury', href: '/become-a-jury' },
    { label: 'Certificate examples', href: '/certificate-example' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Press', href: '/press' },
  ],
]

export function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--footer-text)', padding: 'clamp(44px, 6vw, 60px) var(--gutter) 0' }}>
      <div
        className="m-c2 m-s640"
        style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 40 }}
      >
        <div>
          <Link href="/" style={{ display: 'inline-block' }}>
            <Image
              src="/logo.png"
              alt="Curatone.art"
              width={120}
              height={30}
              style={{ height: 30, width: 'auto', display: 'block', filter: 'invert(1)' }}
            />
          </Link>
          <div style={{ fontSize: 12.5, color: '#8B9096', lineHeight: 1.7, marginTop: 16, maxWidth: 230 }}>
            International juried art competitions, online exhibitions, and a peer-reviewed journal. Berlin · ISSN
            3054-6621.
          </div>
          <div>
            <a
              href="mailto:info@curatone.art"
              className="footer-email"
              style={{ display: 'inline-block', color: '#fff', fontSize: 13, fontWeight: 600, marginTop: 16, transition: 'color 0.15s' }}
            >
              info@curatone.art
            </a>
          </div>
        </div>
        {COLUMNS.map((col, i) => (
          <div key={i}>
            {col.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="footer-link"
                style={{ display: 'block', color: 'var(--footer-text)', fontSize: 13, padding: '5px 0' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: '1px solid var(--footer-divider)',
          marginTop: 'clamp(32px, 5vw, 48px)',
          padding: '22px 0',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
          fontSize: 11.5,
          color: 'var(--footer-text)',
        }}
      >
        <span>© {new Date().getFullYear()} Curatone.art. All rights reserved.</span>
        <span>
          <Link href="/impressum" className="footer-link">
            Impressum
          </Link>
          {' · '}
          <Link href="/datenschutz" className="footer-link">
            Datenschutzerklärung
          </Link>
          {' · '}
          <Link href="/agb" className="footer-link">
            AGB
          </Link>
        </span>
      </div>
    </footer>
  )
}
