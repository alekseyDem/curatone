'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Competitions', href: '/competitions' },
  { label: 'Exhibitions', href: '/exhibitions' },
  { label: 'Journal', href: '/journal' },
  { label: 'Jury', href: '/jury' },
  { label: 'About', href: '/about' },
]

export function Header({ enterHref }: { enterHref: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-header__link${isActive(item.href) ? ' site-header__link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
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
            <Link
              key={item.href}
              href={item.href}
              className={`site-header__drawer-link${isActive(item.href) ? ' site-header__link--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
