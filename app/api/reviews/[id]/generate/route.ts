import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateReviewResponse } from '@/lib/openai'
import { sendWhatsApp, buildReviewMessage } from '@/lib/twilio'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: review } = await service
    .from('reviews')
    .select('*, clients(*)')
    .eq('id', params.id)
    .single()

  if (!review) return NextResponse.json({ error: 'Review no encontrada' }, { status: 404 })

  const client = review.clients as Record<string, string>

  const draft = await generateReviewResponse(
    client.business_name,
    client.tone_instructions,
    review.author_name,
    review.rating,
    review.text ?? ''
  )

  await service.from('responses').delete().eq('review_id', params.id)

  const { data: responseRow } = await service
    .from('responses')
    .insert({ review_id: params.id, draft })
    .select()
    .single()

  if (!responseRow) return NextResponse.json({ error: 'Error creando respuesta' }, { status: 500 })

  await service
    .from('reviews')
    .update({ status: 'pending' })
    .eq('id', params.id)

  const body = buildReviewMessage(
    client.business_name,
    review.author_name,
    review.rating,
    review.text,
    draft
  )

  const sid = await sendWhatsApp(client.whatsapp_number, body)

  await service
    .from('responses')
    .update({ twilio_message_sid: sid })
    .eq('id', responseRow.id)

  return NextResponse.json({ ok: true, draft })
}
