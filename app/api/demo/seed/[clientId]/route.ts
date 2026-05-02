import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isDemoClient, DEMO_SEED_DATA } from '@/lib/demo-reviews'

export async function POST(
  _request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: client } = await service
    .from('clients')
    .select('id, google_place_id')
    .eq('id', params.clientId)
    .single()

  if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  if (!isDemoClient(client.google_place_id)) {
    return NextResponse.json({ error: 'Este cliente no está en modo demo' }, { status: 400 })
  }

  // Delete existing reviews for this client (responses cascade automatically)
  await service.from('reviews').delete().eq('client_id', params.clientId)

  const prefix = `DEMO_${params.clientId.slice(0, 8)}`
  const now = new Date().toISOString()

  for (const item of DEMO_SEED_DATA) {
    const reviewId = `${prefix}_${item.slot}`

    const { data: review, error: reviewErr } = await service
      .from('reviews')
      .insert({
        client_id: params.clientId,
        google_review_id: reviewId,
        author_name: item.authorName,
        rating: item.rating,
        text: item.text,
        published_at: item.publishedAt,
        status: item.status,
      })
      .select('id')
      .single()

    if (reviewErr || !review) continue

    const isPublished = item.status === 'published'

    await service.from('responses').insert({
      review_id: review.id,
      draft: item.draft,
      final: item.final ?? null,
      approved_at: isPublished ? now : null,
      published_at: isPublished ? now : null,
    })
  }

  return NextResponse.json({ ok: true, seeded: DEMO_SEED_DATA.length })
}
