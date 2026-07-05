'use client'

import React, { useEffect, useState } from 'react'

type Parts = { d: number; h: number; m: number; pct: number }

function calc(deadline: string, start?: string | null): Parts {
  const end = new Date(deadline).getTime()
  const now = Date.now()
  const ms = Math.max(0, end - now)
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  let pct = 0
  if (start) {
    const s = new Date(start).getTime()
    pct = Math.min(100, Math.max(0, ((now - s) / (end - s)) * 100))
  }
  return { d, h, m, pct }
}

function useCountdown(deadline?: string | null, start?: string | null): Parts | null {
  const [parts, setParts] = useState<Parts | null>(null)
  useEffect(() => {
    if (!deadline) return
    const tick = () => setParts(calc(deadline, start))
    tick()
    const timer = setInterval(tick, 30000)
    return () => clearInterval(timer)
  }, [deadline, start])
  return deadline ? parts : null
}

/** Hero card: large D / H / M mono digits + 3px oxblood progress bar. */
export function CountdownDigits({ deadline, start }: { deadline: string; start?: string | null }) {
  const p = useCountdown(deadline, start)
  return (
    <>
      <div className="mono" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
        {(['d', 'h', 'm'] as const).map((unit) => (
          <span key={unit} style={{ fontSize: 21, color: 'var(--ink)' }}>
            {p ? (unit === 'd' ? String(p[unit]) : String(p[unit]).padStart(2, '0')) : '—'}
            <span style={{ fontSize: 10, color: 'var(--faint)' }}> {unit.toUpperCase()}</span>
          </span>
        ))}
      </div>
      <div style={{ height: 3, background: 'var(--gray-border)', marginTop: 12 }}>
        <div style={{ height: 3, background: 'var(--oxblood)', width: `${p?.pct ?? 0}%` }} />
      </div>
    </>
  )
}

/** Featured block: "TIME REMAINING {d}d : {h}h : {m}m" strip with teal bar. */
export function CountdownInline({ deadline, start }: { deadline: string; start?: string | null }) {
  const p = useCountdown(deadline, start)
  return (
    <div
      className="card"
      style={{ padding: '15px 22px', maxWidth: 560, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 20px' }}
    >
      <span className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', color: 'var(--oxblood)', flex: 'none' }}>
        TIME REMAINING
      </span>
      <span className="mono" style={{ fontSize: 14.5, color: 'var(--ink)', flex: 'none' }}>
        {p ? `${p.d}d : ${String(p.h).padStart(2, '0')}h : ${String(p.m).padStart(2, '0')}m` : '—'}
      </span>
      <div style={{ flex: 1, minWidth: 90, height: 3, background: 'var(--gray-border)' }}>
        <div style={{ height: 3, background: 'var(--teal)', width: `${p?.pct ?? 0}%` }} />
      </div>
    </div>
  )
}

/** Plain number of days remaining (deadline schedule, open-call rows). */
export function DaysRemaining({ deadline, suffix }: { deadline: string; suffix?: string }) {
  const p = useCountdown(deadline)
  return (
    <>
      {p ? p.d : '—'}
      {suffix}
    </>
  )
}
