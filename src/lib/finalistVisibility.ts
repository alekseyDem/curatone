/**
 * Single source of truth for when a finalist submission is public.
 *
 * A finalist becomes public only when the finalist fee is satisfied:
 * either the competition charges no finalist fee (finalistFee <= 0), or
 * the owner has ticked "Finalist fee paid" on the submission (the owner
 * reconciles Stripe payments by email and ticks the box, or the webhook
 * ticks it after a targeted payment link).
 *
 * Used by the publish hook, every public query, the winner page, the
 * verify page and the sitemap so the rule stays consistent everywhere.
 */

type SubmissionLike = {
  isFinalist?: boolean | null
  payment?: { finalistFeePaid?: boolean | null } | null
}

type CompetitionLike = {
  status?: string | null
  payments?: { finalistFee?: number | null } | null
} | null | undefined

/** True if the finalist fee is not owed, or has been marked paid. */
export function finalistFeeSatisfied(submission: SubmissionLike, competition: CompetitionLike): boolean {
  const fee = competition?.payments?.finalistFee ?? 0
  if (fee <= 0) return true
  return Boolean(submission.payment?.finalistFeePaid)
}

/** Full public-visibility gate for a finalist submission. */
export function finalistIsPublic(submission: SubmissionLike, competition: CompetitionLike): boolean {
  if (!submission.isFinalist) return false
  if (competition?.status !== 'closed') return false
  return finalistFeeSatisfied(submission, competition)
}
