import React from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/queries'
import { paymentsEnabled } from '@/lib/payments'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Publication certificate',
  robots: { index: false, follow: false },
}

/**
 * Targeted journal-certificate payment page (spec §7). The owner emails
 * the author a link of the form /pay/certificate/<article id>?t=<token>
 * after the article is published.
 */
export default async function CertificatePayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string; paid?: string; canceled?: string }>
}) {
  const { id } = await params
  const { t, paid, canceled } = await searchParams

  const payload = await getPayloadClient()
  const article = await payload
    .findByID({ collection: 'journal-articles', id, depth: 1, overrideAccess: true })
    .catch(() => null)
  if (!article || !t || article.certificate?.payToken !== t) notFound()

  const fee = article.certificate?.certificateFee ?? 30
  const alreadyPaid = Boolean(article.certificate?.certificatePaid)
  const authorLine = article.authorsDisplay || (typeof article.author === 'object' ? article.author?.name : '')

  async function beginPayment() {
    'use server'
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection: 'journal-articles', id, depth: 0, overrideAccess: true })
    if (!doc || doc.certificate?.payToken !== t || doc.certificate?.certificatePaid) return
    const amount = doc.certificate?.certificateFee ?? 30
    if (amount <= 0 || !paymentsEnabled()) return
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(amount * 100),
            product_data: { name: `Publication certificate — ${doc.title}` },
          },
        },
      ],
      metadata: { kind: 'certificate', articleId: String(id) },
      success_url: `${serverUrl}/pay/certificate/${id}?t=${t}&paid=1`,
      cancel_url: `${serverUrl}/pay/certificate/${id}?t=${t}&canceled=1`,
    })
    if (session.url) redirect(session.url)
  }

  return (
    <div className="gutter" style={{ paddingTop: 'var(--section-pad)', paddingBottom: 'var(--section-pad-lg)', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 560, width: '100%', padding: 'clamp(28px, 4.5vw, 48px)' }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          Publication certificate
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', lineHeight: 1.35 }}>{article.title}</h1>
        <div style={{ borderTop: '1px solid var(--gray-border)', marginTop: 26 }}>
          <div className="hairline-row">
            <span className="k">Author</span>
            <span className="v">{authorLine}</span>
          </div>
          {article.doi && (
            <div className="hairline-row">
              <span className="k">DOI</span>
              <span className="v mono" style={{ fontSize: 12.5 }}>
                {article.doi}
              </span>
            </div>
          )}
          <div className="hairline-row">
            <span className="k">Amount</span>
            <span className="v">{fee} EUR</span>
          </div>
        </div>
        {alreadyPaid || paid ? (
          <p style={{ marginTop: 28, fontSize: 14.5, color: 'var(--teal)', fontWeight: 600 }}>
            Payment received — thank you. Your numbered certificate will be issued and emailed to you.
          </p>
        ) : paymentsEnabled() ? (
          <form action={beginPayment} style={{ marginTop: 32 }}>
            {canceled && (
              <p style={{ fontSize: 13, color: 'var(--oxblood)', marginBottom: 14 }}>
                Payment was canceled — you can try again below.
              </p>
            )}
            <button type="submit" className="btn btn--primary btn--lg">
              Pay {fee} EUR via Stripe
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
