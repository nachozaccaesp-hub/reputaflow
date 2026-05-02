import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchReviews, STAR_MAP } from '@/lib/google'
import { generateReviewResponse } from '@/lib/openai'
import { sendWhatsApp, buildReviewMessage } from '@/lib/twilio'
import { isDemoClient, DEMO_REVIEWS } from '@/lib/demo-reviews'

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const xHeader = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  return xHeader === cronSecret || authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: clients, error: clientsErr } = await supabase
    .from('clients')
    .select('*')
    .eq('active', true)

  if (clientsErr) {
    return NextResponse.json({ error: clientsErr.message }, { status: 500 })
  }

  const results: Record<string, { fetched: number; inserted: number; errors: string[] }> = {}

  for (const client of clients ?? []) {
    const clientResult = { fetched: 0, inserted: 0, errors: [] as string[] }
    results[client.id] = clientResult

    const demo = isDemoClient(client.google_place_id)

    if (!demo && !client.google_access_token) continue

    try {
      const reviews = demo
        ? DEMO_REVIEWS
        : await fetchReviews(
            client.google_access_token,
            client.google_refresh_token,
            client.google_place_id,
            client.id
          )

      clientResult.fetched = reviews.length

      for (const review of reviews) {
        const { error: upsertErr } = await supabase
          .from('reviews')
          .upsert(
            {
              client_id: client.id,
              google_review_id: review.reviewId,
              author_name: review.reviewer.displayName,
              rating: STAR_MAP[review.starRating] ?? 3,
              text: review.comment ?? null,
              published_at: review.createTime,
              status: 'pending',
            },
            { onConflict: 'google_review_id', ignoreDuplicates: true }
          )

        if (upsertErr) {
          clientResult.errors.push(`upsert ${review.reviewId}: ${upsertErr.message}`)
          continue
        }

        clientResult.inserted++

        const { data: insertedReview } = await supabase
          .from('reviews')
          .select('id, status')
          .eq('google_review_id', review.reviewId)
          .single()

        if (!insertedReview || insertedReview.status !== 'pending') continue

        try {
          const draft = await generateReviewResponse(
            client.business_name,
            client.tone_instructions,
            review.reviewer.displayName,
            STAR_MAP[review.starRating] ?? 3,
            review.comment ?? ''
          )

          const { data: responseRow } = await supabase
            .from('responses')
            .insert({ review_id: insertedReview.id, draft })
            .select('id')
            .single()

          if (!responseRow) continue

          const body = buildReviewMessage(
            client.business_name,
            review.reviewer.displayName,
            STAR_MAP[review.starRating] ?? 3,
            review.comment ?? null,
            draft
          )

          const sid = await sendWhatsApp(client.whatsapp_number, body)

          await supabase
            .from('responses')
            .update({ twilio_message_sid: sid })
            .eq('id', responseRow.id)
        } catch (aiErr: unknown) {
          clientResult.errors.push(`AI/WA for ${review.reviewId}: ${String(aiErr)}`)
        }
      }
    } catch (err: unknown) {
      clientResult.errors.push(`fetch: ${String(err)}`)
    }
  }

  return NextResponse.json({ ok: true, results })
}
