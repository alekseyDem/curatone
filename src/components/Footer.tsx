import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Exhibitions',
    links: [
      { label: 'Open contests', href: '/competitions' },
      { label: 'Rules', href: '/rules' },
      { label: 'Archive', href: '/exhibitions' },
    ],
  },
  {
    heading: 'Journal',
    links: [
      { label: 'Current issue', href: '/journal' },
      { label: 'Editorial board', href: '/journal/editorial-board' },
      { label: 'Submit an article', href: '/journal/submit' },
    ],
  },
  {
    heading: 'Curatone',
    links: [
      { label: 'Jury list', href: '/jury' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--ink)',
        color: 'var(--footer-text)',
        padding: 'clamp(32px, 5vw, 56px) var(--gutter)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 28, alignItems: 'flex-start' }}>
        <div>
          <Image
            src="/logo.png"
            alt="Curatone.art"
            width={144}
            height={36}
            style={{ height: 36, width: 'auto', display: 'block', filter: 'invert(1)' }}
          />
          <div style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.7, maxWidth: 360 }}>
            Curatone Art &amp; Research Journal · ISSN 3054-6621
            <br />
            Published by Curatone.art, Germany. Ongoing research initiative: the impact of contemporary art and design
            on global social structures.
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(36px, 7vw, 72px)', fontSize: 13, lineHeight: 2.1 }}>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 6 }}>{col.heading}</div>
              {col.links.map((l) => (
                <React.Fragment key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                  <br />
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          borderTop: '1px solid var(--footer-divider)',
          marginTop: 44,
          paddingTop: 20,
          fontSize: 11.5,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 8,
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
