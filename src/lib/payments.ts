import type { Exhibition } from '@/payload-types'

/**
 * Stripe Checkout integration (spec §7). All flows degrade gracefully:
 * when STRIPE_SECRET_KEY is not configured, paid steps are skipped and
 * records are created with payment pending.
 */

export function paymentsEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export type EntryCheckoutArgs = {
  competition: Exhibition
  submissionIds: (string | number)[]
  customerEmail: string
}

/**
 * Begin Stripe Checkout for a competition entry fee.
 * Returns the Checkout URL to redirect to, or null when no payment is
 * required (fee 0) or payments are not configured.
 */
export async function beginEntryCheckout(args: EntryCheckoutArgs): Promise<string | null> {
  const { competition, submissionIds, customerEmail } = args
  const fee = competition.payments?.entryFee ?? 0
  if (fee <= 0 || !paymentsEnabled()) return null

  const { getStripe } = await import('./stripe')
  const stripe = getStripe()
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        quantity: submissionIds.length,
        price_data: {
          currency: competition.payments?.currency || 'usd',
          unit_amount: Math.round(fee * 100),
          product_data: {
            name: `Entry fee — ${competition.title}`,
          },
        },
      },
    ],
    metadata: {
      kind: 'entry',
      submissionIds: submissionIds.join(','),
      competitionId: String(competition.id),
    },
    success_url: `${serverUrl}/exhibitions/${competition.slug}/enter?paid=1`,
    cancel_url: `${serverUrl}/exhibitions/${competition.slug}/enter?canceled=1`,
  })

  return session.url
}
