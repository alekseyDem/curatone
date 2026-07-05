'use client'

import React, { useState } from 'react'

type Item = { question: string; answer: string }

/** Two-column FAQ accordion; first item expanded by default (design). */
export function FaqAccordion({ items }: { items: Item[] }) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]))

  const toggle = (i: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const mid = Math.ceil(items.length / 2)
  const columns = [items.slice(0, mid), items.slice(mid)]
  let indexOffset = 0

  return (
    <div className="m-s900" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 var(--gutter)' }}>
      {columns.map((col, c) => {
        const offset = c === 0 ? 0 : mid
        indexOffset = offset
        return (
          <div key={c}>
            {col.map((item, i) => {
              const idx = offset + i
              const open = openSet.has(idx)
              return (
                <div key={idx} style={{ borderBottom: '1px solid var(--gray-border)', padding: '22px 0' }}>
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    aria-expanded={open}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 24,
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      font: 'inherit',
                      color: 'inherit',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{item.question}</span>
                    <span className="mono" style={{ fontSize: 14, color: 'var(--teal)', flex: 'none' }}>
                      {open ? '−' : '+'}
                    </span>
                  </button>
                  {open && (
                    <p style={{ fontSize: 13.5, color: 'var(--body-muted)', lineHeight: 1.7, margin: '12px 0 0', maxWidth: 560 }}>
                      {item.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
