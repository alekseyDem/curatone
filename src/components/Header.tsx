'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type NavItem = {
  label: string
  href: string
  /** section prefixes that mark this item active */
  match?: string[]
  children?: { label: string; href: string }[]
}

const NAV: NavItem[] = [
  { label: 'Competitions', href: '/competitions' },
  { label: 'Exhibitions', href: '/exhibitions', match: ['/exhibitions', '/winners', '/artists'] },
  {
    label: 'Journal',
    href: '/journal',
    children: [
      { label: 'Journal overview', href: '/journal' },
      { label: 'About the Journal', href: '/journal/about' },
      { label: 'Editorial Board', href: '/journal/editorial-board' },
      { label: 'Submission Guidelines', href: '/journal/guidelines' },
    ],
  },
  {
    label: 'Jury',
    href: '/jury',
    children: [
      { label: 'Jury list', href: '/jury' },
      { label: 'Become a jury', href: '/become-a-jury' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    match: ['/about', '/contact', '/certificate-example', '/press', '/personal-exhibition'],
    children: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Certificate examples', href: '/certificate-example' },
      { label: 'Press', href: '/press' },
    ],
  },
]

export function Header({ enterHref }: { enterHref: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (item: NavItem) => {
    const prefixes = item.match ?? [item.href]
    return prefixes.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)))
  }

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <Link href="/" aria-label="Curatone.art — home">
          <Image src="/logo.png" alt="Curatone.art" width={160} height={40} className="site-header__logo" priority />
        </Link>
        <span className="site-header__tag">Berlin · ISSN 3054-6621</span>
      </div>
      <div className="site-header__right">
        <nav className="site-header__nav" aria-label="Main">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.href} className="nav-dd">
                <Link href={item.href} className={`site-header__link${isActive(item) ? ' site-header__link--active' : ''}`}>
                  {item.label} <span className="nav-dd__caret" aria-hidden>▾</span>
                </Link>
                <div className="nav-dd__menu" role="menu">
                  <div className="nav-dd__panel">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} className="nav-dd__item" role="menuitem">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`site-header__link${isActive(item) ? ' site-header__link--active' : ''}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <Link href={enterHref} className="btn btn--primary site-header__cta">
          Enter a competition
        </Link>
        <button
          type="button"
          className="site-header__burger"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="mono">{open ? '×' : '≡'}</span>
        </button>
      </div>
      {open && (
        <nav className="site-header__drawer" aria-label="Mobile">
          {NAV.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`site-header__drawer-link${isActive(item) ? ' site-header__link--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="site-header__drawer-sub">
                  {item.children
                    .filter((c) => c.href !== item.href)
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="site-header__drawer-sublink"
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  )
}
