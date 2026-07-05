import { getPayload } from 'payload'
import config from '@payload-config'

import { getStripe } from '@/lib/stripe'

/**
 * Stripe webhook: marks payment status on the related records
 * (spec §7). Configure the endpoint in the Stripe dashboard:
 *   <site>/api/stripe/webhook — event: checkout.session.completed
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return new Response('Payments not configured', { status: 501 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const body = await req.text()
  let event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object
  const meta = session.metadata ?? {}
  const payload = await getPayload({ config })

  try {
    if (meta.kind === 'entry' && meta.submissionIds) {
      for (const id of meta.submissionIds.split(',')) {
        await payload.update({
          collection: 'submissions',
          id,
          data: { payment: { entryPaid: true, stripeSessionId: session.id } },
          context: { skipPublishHook: true },
        })
      }
    } else if (meta.kind === 'finalist' && meta.submissionId) {
      await payload.update({
        collection: 'submissions',
        id: meta.submissionId,
        data: { payment: { finalistFeePaid: true, stripeSessionId: session.id } },
        context: { skipPublishHook: true },
      })
    } else if (meta.kind === 'certificate' && meta.articleId) {
      await payload.update({
        collection: 'journal-articles',
        id: meta.articleId,
        data: { certificate: { certificatePaid: true, stripeSessionId: session.id } },
      })
    }
  } catch (err) {
    payload.logger.error(`Stripe webhook update failed: ${err instanceof Error ? err.message : err}`)
    return new Response('Update failed', { status: 500 })
  }

  return Response.json({ received: true })
}
