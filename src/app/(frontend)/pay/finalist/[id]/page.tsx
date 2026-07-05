import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'

import { getPayloadClient, authorName, competitionOf } from '@/lib/queries'
import { paymentsEnabled } from '@/lib/payments'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Finalist fee',
  robots: { index: false, follow: false },
}

/**
 * Targeted finalist-fee payment page (spec §7). Not public — the owner
 * emails the finalist a link of the form /pay/finalist/<id>?t=<token>.
 */
export default async function FinalistPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string; paid?: string; canceled?: string }>
}) {
  const { id } = await params
  const { t, paid, canceled } = await searchParams

  const payload = await getPayloadClient()
  const submission = await payload
    .findByID({ collection: 'submissions', id, depth: 2, overrideAccess: true })
    .catch(() => null)
  if (!submission || !t || submission.payment?.payToken !== t) notFound()

  const competition = competitionOf(submission)
  const fee = competition?.payments?.finalistFee ?? 0
  const currency = (competition?.payments?.currency || 'usd').toUpperCase()
  const alreadyPaid = Boolean(submission.payment?.finalistFeePaid)

  async function beginPayment() {
    'use server'
    const payload = await getPayloadClient()
    const sub = await payload.findByID({ collection: 'submissions', id, depth: 2, overrideAccess: true })
    if (!sub || sub.payment?.payToken !== t || sub.payment?.finalistFeePaid) return
    const comp = typeof sub.competition === 'object' ? sub.competition : null
    const amount = comp?.payments?.finalistFee ?? 0
    if (amount <= 0 || !paymentsEnabled()) return
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: comp?.payments?.currency || 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: { name: `Finalist fee — ${comp?.title ?? 'competition'}` },
          },
        },
      ],
      metadata: { kind: 'finalist', submissionId: String(id) },
      success_url: `${serverUrl}/pay/finalist/${id}?t=${t}&paid=1`,
      cancel_url: `${serverUrl}/pay/finalist/${id}?t=${t}&canceled=1`,
    })
    if (session.url) redirect(session.url)
  }

  return (
    <div className="gutter" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad-lg)', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 560, width: '100%', padding: 'clamp(28px, 4.5vw, 48px)' }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          Finalist fee
        </div>
        <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)' }}>{competition?.title}</h1>
        <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 26 }}>
          <div className="hairline-row">
            <span className="k">Work</span>
            <span className="v">{submission.title || 'Untitled'}</span>
          </div>
          <div className="hairline-row">
            <span className="k">Artist</span>
            <span className="v">{authorName(submission)}</span>
          </div>
          <div className="hairline-row">
            <span className="k">Amount</span>
            <span className="v">
              {fee} {currency}
            </span>
          </div>
        </div>
        {alreadyPaid || paid ? (
          <p style={{ marginTop: 28, fontSize: 14.5, color: 'var(--teal)', fontWeight: 600 }}>
            Payment received — thank you. Your finalist place is confirmed.
          </p>
        ) : fee <= 0 ? (
          <p style={{ marginTop: 28, fontSize: 14, color: 'var(--body-muted)' }}>No fee is due for this competition.</p>
        ) : paymentsEnabled() ? (
          <form action={beginPayment} style={{ marginTop: 32 }}>
            {canceled && (
              <p style={{ fontSize: 13, color: 'var(--oxblood)', marginBottom: 14 }}>
                Payment was canceled — you can try again below.
              </p>
            )}
            <button type="submit" className="btn btn--primary btn--lg">
              Pay {fee} {currency} via Stripe
            </button>
            <p className="field-hint" style={{ marginTop: 12 }}>
              Secure checkout by Stripe. You will be returned to this page after payment.
            </p>
          </form>
        ) : (
          <p style={{ marginTop: 28, fontSize: 14, color: 'var(--body-muted)' }}>
            Online payment is temporarily unavailable — please reply to the email you received and we
            will send an alternative payment link.
          </p>
        )}
      </div>
    </div>
  )
}
